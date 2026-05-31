'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  ShoppingCart, 
  Store,
  Receipt,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

interface RetailerData {
  id: string;
  businessName: string;
  status: string;
  createdAt: string;
  wallet?: { balance: number; holdAmount: number } | null;
  outlets: any[];
  transactions: any[];
}

export default function RetailerDashboardPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [retailer, setRetailer] = useState<RetailerData | null>(null);
  const [pendingRetailer, setPendingRetailer] = useState<any>(null);
  const [rejectedRetailer, setRejectedRetailer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const sessionResult = await authClient.getSession() as any;
        const session = sessionResult?.data;

        if (cancelled) return;

        if (!session?.user) {
          window.location.href = '/auth/sign-in';
          return;
        }

        setSessionUser(session.user);

        // Fetch retailer data
        try {
          const res = await fetch(`/api/retailer/by-email?email=${encodeURIComponent(session.user.email)}`);
          const data = await res.json();
          if (cancelled) return;

          if (data.approved) {
            setRetailer(data.approved);
          } else if (data.pending) {
            setPendingRetailer(data.pending);
          } else if (data.rejected) {
            setRejectedRetailer(data.rejected);
          }
        } catch (fetchErr: any) {
          if (!cancelled) setError('Failed to load retailer data');
        }
      } catch (sessionErr: any) {
        if (!cancelled) {
          setError('Failed to verify session');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.href = '/auth/sign-in'}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application Pending
  if (pendingRetailer && !retailer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Application Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 mb-2">
              Your retailer application for <strong>{pendingRetailer.businessName}</strong> has been submitted and is awaiting admin approval.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 font-medium">Status: Pending Approval</p>
              <p className="text-xs text-amber-600 mt-1">
                Submitted on {new Date(pendingRetailer.createdAt).toLocaleDateString('en-GB')}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application Rejected
  if (rejectedRetailer && !retailer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl text-red-700">Application Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 mb-4">
              Your retailer application for <strong>{rejectedRetailer.businessName}</strong> was not approved.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/retailer/onboard">
                <Button>Apply Again</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No retailer
  if (!retailer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">No Retailer Account Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 mb-4">
              You don&apos;t have a retailer account yet. Apply now to start selling digital value products.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/retailer/onboard">
                <Button>Apply as Retailer</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Approved retailer - show full dashboard
  const totalSales = retailer.transactions?.reduce((sum: number, t: any) => sum + Number(t.totalAmount), 0) || 0;
  const totalMargin = retailer.transactions?.reduce((sum: number, t: any) => sum + Number(t.retailerMargin), 0) || 0;
  const todaySales = retailer.transactions
    ?.filter((t: any) => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum: number, t: any) => sum + Number(t.totalAmount), 0) || 0;

  const stats = [
    {
      title: 'Wallet Balance',
      value: `£${Number(retailer.wallet?.balance || 0).toFixed(2)}`,
      icon: Wallet,
      trend: 'Available for sales',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Sales',
      value: `£${totalSales.toFixed(2)}`,
      icon: ShoppingCart,
      trend: 'All time sales',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Today Sales',
      value: `£${todaySales.toFixed(2)}`,
      icon: TrendingUp,
      trend: 'Today\'s revenue',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Total Margin',
      value: `£${totalMargin.toFixed(2)}`,
      icon: Receipt,
      trend: 'Your earnings',
      color: 'bg-purple-50 text-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{retailer.businessName}</h1>
            <p className="text-zinc-600 mt-1">Retailer Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approved
            </Badge>
            <Link href="/terminal">
              <Button className="bg-zinc-950 hover:bg-zinc-800">
                <Store className="w-4 h-4 mr-2" />
                Open Terminal
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-zinc-500 mt-2">{stat.trend}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Outlets & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="w-5 h-5" />
                Outlets ({retailer.outlets?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {retailer.outlets?.length > 0 ? (
                <div className="space-y-3">
                  {retailer.outlets.map((outlet: any) => (
                    <div key={outlet.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-medium">{outlet.name}</p>
                        <p className="text-sm text-zinc-500">{outlet.city}, {outlet.postcode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No outlets configured yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {retailer.transactions?.length > 0 ? (
                <div className="space-y-3">
                  {retailer.transactions.map((txn: any) => (
                    <div key={txn.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{txn.reference}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(txn.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">£{Number(txn.totalAmount).toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">{txn.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/terminal">
                <Button variant="outline" className="gap-2">
                  <Store className="w-4 h-4" /> Open POS Terminal
                </Button>
              </Link>
              <Link href="/retailer/wallet">
                <Button variant="outline" className="gap-2">
                  <Wallet className="w-4 h-4" /> Top Up Wallet
                </Button>
              </Link>
              <Link href="/retailer/transactions">
                <Button variant="outline" className="gap-2">
                  <Receipt className="w-4 h-4" /> View All Transactions
                </Button>
              </Link>
              <Link href="/retailer/staff">
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" /> Manage Staff
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
