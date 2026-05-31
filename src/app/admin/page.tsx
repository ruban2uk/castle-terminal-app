import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  ShoppingCart, 
  Wallet, 
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { data: session } = await auth.getSession({ headers: headers() });

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  // Fetch admin stats
  const [
    totalRetailers,
    pendingRetailers,
    approvedRetailers,
    totalProducts,
    totalTransactions,
    todayTransactions,
    totalWalletBalance,
  ] = await Promise.all([
    prisma.retailer.count(),
    prisma.retailer.count({ where: { status: 'PENDING' } }),
    prisma.retailer.count({ where: { status: 'APPROVED' } }),
    prisma.product.count(),
    prisma.transaction.count(),
    prisma.transaction.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.wallet.aggregate({
      _sum: { balance: true },
    }),
  ]);

  const stats = [
    {
      title: 'Total Retailers',
      value: totalRetailers,
      icon: Building2,
      trend: `${pendingRetailers} pending approval`,
      color: 'bg-blue-50 text-blue-700',
      link: '/admin/retailers',
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: ShoppingCart,
      trend: 'Active in catalogue',
      color: 'bg-emerald-50 text-emerald-700',
      link: '/admin/products',
    },
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: TrendingUp,
      trend: `${todayTransactions} today`,
      color: 'bg-purple-50 text-purple-700',
      link: '/admin/transactions',
    },
    {
      title: 'Wallet Balance',
      value: `£${Number(totalWalletBalance._sum.balance || 0).toFixed(2)}`,
      icon: Wallet,
      trend: 'Total across all retailers',
      color: 'bg-amber-50 text-amber-700',
      link: '/admin/wallets',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-600 mt-1">Platform overview and management</p>
          </div>
          <Badge variant="outline" className="bg-zinc-950 text-white">
            Admin
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/retailers">
                <Button variant="outline" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Manage Retailers
                  {pendingRetailers > 0 && (
                    <Badge className="bg-amber-500 text-white ml-1">
                      {pendingRetailers}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button variant="outline" className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Product Catalogue
                </Button>
              </Link>
              <Link href="/admin/pin-upload">
                <Button variant="outline" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  PIN Upload
                </Button>
              </Link>
              <Link href="/admin/routing">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Provider Routing
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
