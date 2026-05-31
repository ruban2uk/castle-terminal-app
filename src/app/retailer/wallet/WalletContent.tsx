'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StripeCheckout } from '@/components/payment/StripeCheckout';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  reference: string | null;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
  holdAmount: number;
  currency: string;
  ledger: LedgerEntry[];
}

export function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWallet();
    
    // Check for Stripe redirect
    const stripeSuccess = searchParams.get('success');
    const stripeCanceled = searchParams.get('canceled');
    
    if (stripeSuccess === 'true') {
      setSuccess('Payment successful! Your wallet has been topped up.');
      // Clear URL params
      router.replace('/retailer/wallet');
    } else if (stripeCanceled === 'true') {
      setError('Payment was canceled. Please try again.');
      router.replace('/retailer/wallet');
    }
  }, [searchParams, router]);

  const fetchWallet = async () => {
    try {
      const response = await fetch('/api/wallet?retailerId=demo-retailer');
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerId: 'demo-retailer',
          amount,
          paymentMethod: 'card',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully topped up £${amount.toFixed(2)}`);
        setTopUpAmount('');
        fetchWallet();
      } else {
        setError(data.error || 'Failed to process top-up');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'RELEASE':
        return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
      case 'DEBIT':
      case 'HOLD':
      case 'CAPTURE':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
      case 'RELEASE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DEBIT':
      case 'HOLD':
      case 'CAPTURE':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-zinc-950 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Available Balance</p>
                  <p className="text-4xl font-bold mt-1">
                    £{wallet?.balance.toFixed(2) || '0.00'}
                  </p>
                </div>
                <Wallet className="w-10 h-10 text-zinc-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-500 text-sm">On Hold</p>
                  <p className="text-4xl font-bold mt-1">
                    £{wallet?.holdAmount.toFixed(2) || '0.00'}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-zinc-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Up Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Top Up Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="text-lg"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2 mt-4">
              {[50, 100, 250, 500].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopUpAmount(amount.toString())}
                >
                  £{amount}
                </Button>
              ))}
            </div>

            {/* Stripe Payment */}
            <div className="mt-6">
              <StripeCheckout
                amount={parseFloat(topUpAmount) || 0}
                retailerId="demo-retailer"
                onSuccess={() => {
                  setSuccess('Payment successful! Your wallet has been topped up.');
                  setTopUpAmount('');
                  fetchWallet();
                }}
                onError={(err: string) => setError(err)}
              />
            </div>

            {/* Legacy Direct Top Up (optional) */}
            <div className="mt-4">
              <Button
                onClick={handleTopUp}
                disabled={isProcessing}
                variant="outline"
                className="w-full"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? 'Processing...' : 'Direct Top Up (Internal)'}
              </Button>
            </div>

            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
            {success && (
              <p className="text-emerald-600 text-sm mt-4 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ledger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {wallet?.ledger && wallet.ledger.length > 0 ? (
              <div className="space-y-3">
                {wallet.ledger.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(entry.type)}`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entry.type}</p>
                        <p className="text-xs text-zinc-500">
                          {entry.reference || 'No reference'}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(entry.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        entry.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {entry.amount >= 0 ? '+' : ''}£{Math.abs(entry.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Bal: £{entry.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
