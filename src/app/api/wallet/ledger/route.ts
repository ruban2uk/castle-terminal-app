import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { WalletService } from '@/lib/wallet';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { data: session } = await auth.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const retailerId = searchParams.get('retailerId');
    const type = searchParams.get('type') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!retailerId) {
      return NextResponse.json({ error: 'Retailer ID required' }, { status: 400 });
    }

    const result = await WalletService.getLedger(retailerId, {
      type,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ledger fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ledger' },
      { status: 500 }
    );
  }
}
