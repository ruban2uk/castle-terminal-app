import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { PinService } from '@/lib/pin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { data: session } = await auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, pins, buyingPrice } = await request.json();

    if (!productId || !pins || !Array.isArray(pins) || pins.length === 0) {
      return NextResponse.json(
        { error: 'Product ID and PINs array required' },
        { status: 400 }
      );
    }

    const result = await PinService.uploadBatch(
      productId,
      pins,
      buyingPrice || 0,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PIN_BATCH_UPLOADED',
        entityType: 'PinBatch',
        newValue: {
          batchCode: result.batchCode,
          productId,
          totalCount: result.totalCount,
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('PIN upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload PINs' },
      { status: 500 }
    );
  }
}
