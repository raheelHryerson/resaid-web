'use client';

import { useState } from 'react';
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

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return; // Free plan doesn't need payment

    setLoading(planId);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            >
              {loading === plan.id ? 'Loading...' : plan.id === 'free' ? 'Get Started' : 'Subscribe'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}