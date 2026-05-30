import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { RoutingEngine } from '@/lib/routing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { data: session } = await auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const ranking = await RoutingEngine.getProviderRanking(productId);

    return NextResponse.json(ranking);
  } catch (error) {
    console.error('Routing error:', error);
    return NextResponse.json(
      { error: 'Failed to get routing' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { data: session } = await auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    const decision = await RoutingEngine.findBestProvider(productId);

    return NextResponse.json(decision);
  } catch (error) {
    console.error('Routing error:', error);
    return NextResponse.json(
      { error: 'Failed to get routing decision' },
      { status: 500 }
    );
  }
}
