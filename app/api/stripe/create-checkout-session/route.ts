import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  quarterly: process.env.STRIPE_PRICE_QUARTERLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
};

export async function POST(request: NextRequest) {
  try {
    console.log('Starting checkout session creation...');

    const { userId } = await auth();
    console.log('Auth result:', { userId: userId ? 'present' : 'missing' });

    if (!userId) {
      console.error('No user ID from auth');
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;
    console.log('Request body:', { plan });

    if (!plan || !PRICE_IDS[plan as keyof typeof PRICE_IDS]) {
      console.error('Invalid plan:', plan, 'Available plans:', Object.keys(PRICE_IDS));
      return NextResponse.json({
        error: `Invalid plan: ${plan}. Available: ${Object.keys(PRICE_IDS).join(', ')}`
      }, { status: 400 });
    }

    console.log('Looking up user in database...');
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      console.error('User not found in database for clerkId:', userId);
      return NextResponse.json({ error: 'User not found - Please complete your profile' }, { status: 404 });
    }

    console.log('Checking for existing subscription...');
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'active' },
    });

    if (existingSub) {
      console.log('User already has active subscription');
      return NextResponse.json({ error: 'Already subscribed to a plan' }, { status: 400 });
    }

    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
    console.log('Creating Stripe checkout session with price:', priceId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan,
      },
    });

    console.log('Checkout session created successfully:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Detailed error creating checkout session:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        return NextResponse.json({ error: 'Stripe authentication failed - Check STRIPE_SECRET_KEY' }, { status: 500 });
      }
      if (error.message.includes('price')) {
        return NextResponse.json({ error: 'Invalid price ID - Check STRIPE_PRICE_* environment variables' }, { status: 500 });
      }
      if (error.message.includes('database') || error.message.includes('prisma')) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}