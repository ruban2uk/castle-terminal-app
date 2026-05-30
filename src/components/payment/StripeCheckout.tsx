'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

interface StripeCheckoutProps {
  amount: number;
  retailerId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripeCheckout({ amount, retailerId, onSuccess, onError }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (amount <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          retailerId,
          successUrl: `${window.location.origin}/retailer/wallet?success=true`,
          cancelUrl: `${window.location.origin}/retailer/wallet?canceled=true`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        onError?.(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      onError?.('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full h-12 bg-[#635BFF] hover:bg-[#4f48cc] text-white"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Processing...' : `Pay £${amount.toFixed(2)} with Stripe`}
    </Button>
  );
}
