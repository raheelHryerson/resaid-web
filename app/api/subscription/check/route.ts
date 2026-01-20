import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey, isActive: true },
      include: { user: { include: { subscriptions: { where: { status: 'active' } } } } },
    });

    if (!apiKeyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const subscription = apiKeyRecord.user.subscriptions[0];
    if (!subscription) {
      return NextResponse.json({ status: 'free' });
    }

    return NextResponse.json({
      status: subscription.status,
      planId: subscription.planId,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}