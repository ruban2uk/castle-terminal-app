import { NextResponse } from 'next/server';
import { DTOneService } from '@/lib/dtone';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { mobileNumber, productId } = await request.json();

    if (!mobileNumber || !productId) {
      return NextResponse.json(
        { error: 'Mobile number and product ID are required' },
        { status: 400 }
      );
    }

    const result = await DTOneService.lookupMobileNumber(mobileNumber, productId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('DT One lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup mobile number' },
      { status: 500 }
    );
  }
}
