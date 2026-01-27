import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET() {
  try {
    // Test basic Stripe connection
    const balance = await stripe.balance.retrieve();

    // Test price retrieval
    const prices = await stripe.prices.list({ limit: 10 });

    return NextResponse.json({
      status: 'success',
      stripeConnected: true,
      balance: balance.available[0]?.amount || 0,
      pricesCount: prices.data.length,
      environment: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasMonthlyPrice: !!process.env.STRIPE_PRICE_MONTHLY,
        hasQuarterlyPrice: !!process.env.STRIPE_PRICE_QUARTERLY,
        hasYearlyPrice: !!process.env.STRIPE_PRICE_YEARLY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      }
    });
  } catch (error) {
    console.error('Stripe test failed:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasMonthlyPrice: !!process.env.STRIPE_PRICE_MONTHLY,
        hasQuarterlyPrice: !!process.env.STRIPE_PRICE_QUARTERLY,
        hasYearlyPrice: !!process.env.STRIPE_PRICE_YEARLY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      }
    }, { status: 500 });
  }
}