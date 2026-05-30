import { NextResponse } from 'next/server';
import { DTOneService } from '@/lib/dtone';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { productId, mobileNumber, externalId, callbackUrl } = await request.json();

    if (!productId || !mobileNumber || !externalId) {
      return NextResponse.json(
        { error: 'Product ID, mobile number, and external ID are required' },
        { status: 400 }
      );
    }

    const transaction = await DTOneService.createTransaction(
      productId,
      mobileNumber,
      externalId,
      callbackUrl
    );

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('DT One transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const transaction = await DTOneService.getTransaction(parseInt(transactionId));
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('DT One transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}
