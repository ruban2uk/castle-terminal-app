import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { WalletService } from '@/lib/wallet';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { data: session } = await auth.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { retailerId, amount, transactionId, reference } = await request.json();

    if (!retailerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Retailer ID and positive amount required' },
        { status: 400 }
      );
    }

    const result = await WalletService.debit(
      retailerId,
      amount,
      transactionId,
      reference || `DEBIT-${Date.now()}`,
      {
        processedBy: session.user.id,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Audit log without userId/entityId to avoid FK errors
    await prisma.auditLog.create({
      data: {
        retailerId,
        action: 'WALLET_DEBITED',
        entityType: 'Wallet',
        newValue: {
          amount,
          balance: result.wallet?.balance,
          transactionId,
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Wallet debit error:', error);
    return NextResponse.json(
      { error: 'Failed to process debit' },
      { status: 500 }
    );
  }
}
