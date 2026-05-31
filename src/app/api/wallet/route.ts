import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { WalletService } from '@/lib/wallet';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { data: session } = await auth.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const retailerId = searchParams.get('retailerId');

    if (!retailerId) {
      return NextResponse.json({ error: 'Retailer ID required' }, { status: 400 });
    }

    const wallet = await WalletService.getWallet(retailerId);
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
