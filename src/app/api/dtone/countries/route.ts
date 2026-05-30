import { NextResponse } from 'next/server';
import { DTOneService } from '@/lib/dtone';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const countries = await DTOneService.getCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error('DT One countries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
