'use server';

import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitRetailerApplication(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  try {
    // Get current session
    const { data: session } = await auth.getSession();
    
    if (!session?.user) {
      return { error: 'You must be logged in to submit a retailer application' };
    }

    // Extract form data
    const businessName = formData.get('businessName') as string;
    const tradingName = formData.get('tradingName') as string || null;
    const companyNumber = formData.get('companyNumber') as string || null;
    const vatNumber = formData.get('vatNumber') as string || null;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const addressLine1 = formData.get('addressLine1') as string;
    const addressLine2 = formData.get('addressLine2') as string || null;
    const city = formData.get('city') as string;
    const postcode = formData.get('postcode') as string;
    const country = formData.get('country') as string || 'GB';

    // Validate required fields
    if (!businessName || !email || !phone || !addressLine1 || !city || !postcode) {
      return { error: 'Please fill in all required fields' };
    }

    // Check if retailer already exists with this email
    const existingRetailer = await prisma.retailer.findFirst({
      where: { email },
    });

    if (existingRetailer) {
      return { error: 'A retailer application with this email already exists' };
    }

    // Create retailer application
    const retailer = await prisma.retailer.create({
      data: {
        businessName,
        tradingName,
        companyNumber,
        vatNumber,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        postcode,
        country,
        status: 'PENDING',
      },
    });

    // Create initial wallet
    await prisma.wallet.create({
      data: {
        retailerId: retailer.id,
        balance: 0,
        currency: 'GBP',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        retailerId: retailer.id,
        action: 'RETAILER_CREATED',
        entityType: 'Retailer',
        entityId: retailer.id,
        newValue: { businessName, email, status: 'PENDING' },
      },
    });

    revalidatePath('/admin/retailers');
    
    return { success: true };
  } catch (error) {
    console.error('Retailer application error:', error);
    return { error: 'Failed to submit application. Please try again.' };
  }
}
