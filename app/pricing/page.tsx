'use client';

import React from 'react';
import Script from 'next/script';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

// Declare the Stripe pricing table custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
        'client-reference-id'?: string;
        'data-success-url'?: string;
        'data-cancel-url'?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

export default function PricingPage() {
  const { user } = useUser();

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

        <div className="w-full max-w-none">
          <Script async src="https://js.stripe.com/v3/pricing-table.js" />
          {React.createElement('stripe-pricing-table', {
            'pricing-table-id': "prctbl_1SrTPVCAXcwBPgIqFGsPiFyW",
            'publishable-key': "pk_test_51SNGyHCAXcwBPgIqIrj4wuq3njKfNnYMp26cIYS8cbwj9I7vYsi4j8mqooFTkUy3cGf7tIujg2vHqCcCMC0gnhKb00PL0AtBtY",
            'client-reference-id': user?.id,
            'data-success-url': "http://localhost:3000/dashboard?success=true",
            'data-cancel-url': "http://localhost:3000/pricing?canceled=true",
            style: { width: '100%' }
          })}
        </div>
      </div>
    </div>
  );
}