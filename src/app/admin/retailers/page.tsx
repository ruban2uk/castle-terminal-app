import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle
} from 'lucide-react';
import { approveRetailer, rejectRetailer, suspendRetailer } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminRetailersPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  // Check if user is admin (you may need to add role check)
  // For now, we'll allow any authenticated user to view this page

  const retailers = await prisma.retailer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      wallet: true,
      _count: {
        select: { outlets: true }
      }
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'SUSPENDED':
        return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200"><PauseCircle className="w-3 h-3 mr-1" /> Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Retailer Management</h1>
            <p className="text-zinc-600 mt-1">Manage retailer applications and approvals</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-sm text-zinc-500">Total</span>
              <p className="text-2xl font-bold">{retailers.length}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-sm text-zinc-500">Pending</span>
              <p className="text-2xl font-bold text-amber-600">
                {retailers.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-sm text-zinc-500">Approved</span>
              <p className="text-2xl font-bold text-emerald-600">
                {retailers.filter(r => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {retailers.map((retailer) => (
            <Card key={retailer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{retailer.businessName}</h3>
                      {getStatusBadge(retailer.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Mail className="w-4 h-4" />
                        {retailer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Phone className="w-4 h-4" />
                        {retailer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <MapPin className="w-4 h-4" />
                        {retailer.city}, {retailer.postcode}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Building2 className="w-4 h-4" />
                        {retailer._count.outlets} outlets
                      </div>
                    </div>

                    {retailer.wallet && (
                      <div className="mt-3 text-sm">
                        <span className="text-zinc-500">Wallet Balance:</span>
                        <span className="font-semibold ml-1">
                          £{Number(retailer.wallet.balance).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-zinc-400">
                      Applied: {new Date(retailer.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {retailer.status === 'PENDING' && (
                      <>
                        <form action={approveRetailer}>
                          <input type="hidden" name="retailerId" value={retailer.id} />
                          <Button 
                            type="submit" 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </form>
                        <form action={rejectRetailer}>
                          <input type="hidden" name="retailerId" value={retailer.id} />
                          <Button 
                            type="submit" 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </form>
                      </>
                    )}
                    
                    {retailer.status === 'APPROVED' && (
                      <form action={suspendRetailer}>
                        <input type="hidden" name="retailerId" value={retailer.id} />
                        <Button 
                          type="submit" 
                          variant="outline" 
                          size="sm"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <PauseCircle className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      </form>
                    )}

                    {retailer.status === 'SUSPENDED' && (
                      <form action={approveRetailer}>
                        <input type="hidden" name="retailerId" value={retailer.id} />
                        <Button 
                          type="submit" 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Reactivate
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {retailers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-600">No Retailers Yet</h3>
                <p className="text-zinc-500 mt-1">
                  Retailer applications will appear here once submitted.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
