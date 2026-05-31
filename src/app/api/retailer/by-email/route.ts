import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const [approved, pending, rejected] = await Promise.all([
      prisma.retailer.findFirst({
        where: { email, status: 'APPROVED' },
        include: {
          wallet: true,
          outlets: {
            include: { staff: true, terminals: true },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.retailer.findFirst({
        where: { email, status: 'PENDING' },
      }),
      prisma.retailer.findFirst({
        where: { email, status: 'REJECTED' },
      }),
    ]);

    return NextResponse.json({ approved, pending, rejected });
  } catch (error) {
    console.error('Retailer lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to load retailer data' },
      { status: 500 }
    );
  }
}
