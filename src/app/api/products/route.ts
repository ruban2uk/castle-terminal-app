import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      include: {
        category: true,
        providerProducts: {
          where: { isActive: true },
          include: {
            provider: true,
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
