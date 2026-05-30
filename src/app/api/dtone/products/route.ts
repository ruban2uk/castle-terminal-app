import { NextResponse } from 'next/server';
import { DTOneService } from '@/lib/dtone';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryIso = searchParams.get('country');
    const operatorId = searchParams.get('operator');

    let products;
    if (countryIso) {
      products = await DTOneService.getProductsByCountry(countryIso);
    } else if (operatorId) {
      products = await DTOneService.getProductsByOperator(parseInt(operatorId));
    } else {
      products = await DTOneService.getProducts();
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('DT One products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DT One products' },
      { status: 500 }
    );
  }
}
