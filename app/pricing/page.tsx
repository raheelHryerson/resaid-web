'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Basic features for getting started',
    features: [
      'Upload 1 resume',
      '5 job applications per month',
      'Basic AI assistance',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    description: 'Full access for active job seekers',
    features: [
      'Unlimited resumes',
      'Unlimited applications',
      'Advanced AI responses',
      'Priority support',
    ],
  },
  {
    id: 'quarterly',
    name: '3 Months',
    price: '$24.99',
    description: 'Save with quarterly billing',
    features: [
      'All monthly features',
      '10% discount vs monthly',
      'Extended support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$69.99',
    description: 'Best value for long-term use',
    features: [
      'All monthly features',
      '40% discount vs monthly',
      'Premium support',
    ],
  },
];

export default function PricingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/dashboard?plan=free';
      return;
    }

    // Set loading state for this specific plan
    setLoading(planId);

    try {
      console.log('Creating checkout session for plan:', planId);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Checkout session created:', data);

      if (data.url) {
        console.log('Redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your Stripe configuration.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background dark:from-background dark:via-primary/10 dark:to-background">
      <nav className="sticky top-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <img src="/icons/ResAid_logo.png" alt="ResAid Logo" className="h-8" />
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground pb-1 hover:border-b-2 hover:border-primary/50 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-foreground border-b-2 border-primary pb-1"
              >
                Pricing
              </Link>
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="w-full px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-10">
          Choose your plan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">{plan.price}</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className="w-full"
                  variant={plan.id === 'free' ? 'outline' : 'default'}
                >
                  {loading === plan.id ? 'Loading...' : plan.id === 'free' ? 'Get Started Free' : 'Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}