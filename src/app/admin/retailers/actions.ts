'use server';

import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveRetailer(formData: FormData): Promise<void> {
  try {
    const { data: session } = await auth.getSession({ headers: headers() });
    
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const retailerId = formData.get('retailerId') as string;
    
    if (!retailerId) {
      throw new Error('Retailer ID is required');
    }

    const retailer = await prisma.retailer.update({
      where: { id: retailerId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
    });

    // Ensure wallet exists for approved retailer
    const existingWallet = await prisma.wallet.findUnique({
      where: { retailerId },
    });

    if (!existingWallet) {
      await prisma.wallet.create({
        data: {
          retailerId,
          balance: 0,
          currency: 'GBP',
        },
      });
    }

    // Audit log without userId/entityId to avoid FK errors with Neon Auth users
    await prisma.auditLog.create({
      data: {
        retailerId: retailer.id,
        action: 'RETAILER_APPROVED',
        entityType: 'Retailer',
        oldValue: { status: 'PENDING' },
        newValue: { status: 'APPROVED' },
      },
    });

    revalidatePath('/admin/retailers');
  } catch (error) {
    console.error('Approve retailer error:', error);
    throw error;
  }
}

export async function rejectRetailer(formData: FormData): Promise<void> {
  try {
    const { data: session } = await auth.getSession({ headers: headers() });
    
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const retailerId = formData.get('retailerId') as string;
    
    if (!retailerId) {
      throw new Error('Retailer ID is required');
    }

    const retailer = await prisma.retailer.update({
      where: { id: retailerId },
      data: {
        status: 'REJECTED',
        approvedBy: session.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        retailerId: retailer.id,
        action: 'RETAILER_REJECTED',
        entityType: 'Retailer',
        oldValue: { status: 'PENDING' },
        newValue: { status: 'REJECTED' },
      },
    });

    revalidatePath('/admin/retailers');
  } catch (error) {
    console.error('Reject retailer error:', error);
    throw error;
  }
}

export async function suspendRetailer(formData: FormData): Promise<void> {
  try {
    const { data: session } = await auth.getSession({ headers: headers() });
    
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const retailerId = formData.get('retailerId') as string;
    
    if (!retailerId) {
      throw new Error('Retailer ID is required');
    }

    const retailer = await prisma.retailer.update({
      where: { id: retailerId },
      data: {
        status: 'SUSPENDED',
      },
    });

    await prisma.auditLog.create({
      data: {
        retailerId: retailer.id,
        action: 'RETAILER_SUSPENDED',
        entityType: 'Retailer',
        oldValue: { status: 'APPROVED' },
        newValue: { status: 'SUSPENDED' },
      },
    });

    revalidatePath('/admin/retailers');
  } catch (error) {
    console.error('Suspend retailer error:', error);
    throw error;
  }
}
