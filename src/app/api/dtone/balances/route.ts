import { NextResponse } from 'next/server';
import { DTOneService } from '@/lib/dtone';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const balances = await DTOneService.getBalances();
    return NextResponse.json(balances);
  } catch (error) {
    console.error('DT One balances error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}
