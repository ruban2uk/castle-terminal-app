import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { WalletService } from '@/lib/wallet';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { data: session } = await auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { retailerId, amount, paymentMethod, reference } = await request.json();

    if (!retailerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Retailer ID and positive amount required' },
        { status: 400 }
      );
    }

    const result = await WalletService.credit(
      retailerId,
      amount,
      reference || `TOPUP-${Date.now()}`,
      {
        paymentMethod: paymentMethod || 'card',
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
        action: 'WALLET_CREDITED',
        entityType: 'Wallet',
        newValue: {
          amount,
          balance: result.wallet?.balance,
          paymentMethod,
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Wallet topup error:', error);
    return NextResponse.json(
      { error: 'Failed to process top-up' },
      { status: 500 }
    );
  }
}
