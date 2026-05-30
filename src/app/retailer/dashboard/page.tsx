import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  TrendingUp, 
  ShoppingCart, 
  Store,
  Receipt,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RetailerDashboardPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  // Find retailer by user email
  const retailer = await prisma.retailer.findFirst({
    where: { 
      email: session.user.email,
      status: 'APPROVED'
    },
    include: {
      wallet: true,
      outlets: {
        include: {
          staff: true,
          terminals: true,
        }
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    }
  });

  if (!retailer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">No Approved Retailer Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 mb-4">
              You don't have an approved retailer account yet.
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

  // Calculate stats
  const totalSales = retailer.transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0);
  const totalMargin = retailer.transactions.reduce((sum, t) => sum + Number(t.retailerMargin), 0);
  const todaySales = retailer.transactions
    .filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + Number(t.totalAmount), 0);

  const stats = [
    {
      title: 'Wallet Balance',
      value: `£${Number(retailer.wallet?.balance || 0).toFixed(2)}`,
      icon: Wallet,
      trend: 'Available for sales',
      trendUp: true,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Total Sales',
      value: `£${totalSales.toFixed(2)}`,
      icon: ShoppingCart,
      trend: 'All time sales',
      trendUp: true,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Today Sales',
      value: `£${todaySales.toFixed(2)}`,
      icon: TrendingUp,
      trend: 'Today\'s revenue',
      trendUp: todaySales > 0,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Total Margin',
      value: `£${totalMargin.toFixed(2)}`,
      icon: Receipt,
      trend: 'Your earnings',
      trendUp: true,
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
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
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
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        {stat.trendUp ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-zinc-400" />
                        )}
                        <span className={stat.trendUp ? 'text-emerald-600' : 'text-zinc-500'}>
                          {stat.trend}
                        </span>
                      </div>
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

        {/* Outlets & Staff */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="w-5 h-5" />
                Outlets ({retailer.outlets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {retailer.outlets.length > 0 ? (
                <div className="space-y-3">
                  {retailer.outlets.map((outlet) => (
                    <div key={outlet.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-medium">{outlet.name}</p>
                        <p className="text-sm text-zinc-500">{outlet.city}, {outlet.postcode}</p>
                      </div>
                      <div className="flex gap-2 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {outlet.staff.length}
                        </span>
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
              {retailer.transactions.length > 0 ? (
                <div className="space-y-3">
                  {retailer.transactions.map((txn) => (
                    <div key={txn.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{txn.reference}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(txn.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">£{Number(txn.totalAmount).toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs">
                          {txn.status}
                        </Badge>
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
                  <Store className="w-4 h-4" />
                  Open POS Terminal
                </Button>
              </Link>
              <Link href="/retailer/wallet">
                <Button variant="outline" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Top Up Wallet
                </Button>
              </Link>
              <Link href="/retailer/transactions">
                <Button variant="outline" className="gap-2">
                  <Receipt className="w-4 h-4" />
                  View All Transactions
                </Button>
              </Link>
              <Link href="/retailer/staff">
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" />
                  Manage Staff
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
