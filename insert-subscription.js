const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const subscription = await prisma.subscription.create({
      data: {
        userId: 'cml1tznno0000ju04c4ac9gmg',
        stripeSubscriptionId: 'test_sub_0001',
        stripeCustomerId: 'test_cus_0001',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planId: 'monthly',
        priceId: 'price_test_monthly',
        currency: 'usd',
      },
    });
    console.log('Subscription created successfully:', subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
