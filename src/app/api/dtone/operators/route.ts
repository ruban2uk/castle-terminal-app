import { NextResponse } from 'next/server';
import { DTOneService } from '@/lib/dtone';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryIso = searchParams.get('country');

    let operators;
    if (countryIso) {
      operators = await DTOneService.getOperatorsByCountry(countryIso);
    } else {
      operators = await DTOneService.getOperators();
    }

    return NextResponse.json(operators);
  } catch (error) {
    console.error('DT One operators error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch operators' },
      { status: 500 }
    );
  }
}
