import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

// Mock auth module
vi.mock('@/lib/auth/server', () => ({
  auth: {
    getSession: vi.fn(),
  },
}));

// Mock prisma — must use factory function, no top-level vars
vi.mock('@/lib/prisma', () => ({
  prisma: {
    retailer: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    wallet: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { submitRetailerApplication } from '@/app/retailer/onboard/actions';
import { auth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

describe('submitRetailerApplication', () => {
  const mockRetailer = prisma.retailer as any;
  const mockWallet = prisma.wallet as any;
  const mockAuditLog = prisma.auditLog as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when user is not logged in', async () => {
    (auth.getSession as any).mockResolvedValue({ data: null });

    const formData = new FormData();
    const result = await submitRetailerApplication(null, formData);

    expect(result.error).toBe('You must be logged in to submit a retailer application');
  });

  it('should return error when required fields are missing', async () => {
    (auth.getSession as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });

    const formData = new FormData();
    formData.append('businessName', 'Test Business');

    const result = await submitRetailerApplication(null, formData);

    expect(result.error).toBe('Please fill in all required fields');
  });

  it('should return error when retailer already exists', async () => {
    (auth.getSession as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });

    mockRetailer.findFirst.mockResolvedValue({ id: 'existing-retailer' });

    const formData = new FormData();
    formData.append('businessName', 'Test Business');
    formData.append('phone', '+44 123 456 7890');
    formData.append('addressLine1', '123 Test St');
    formData.append('city', 'London');
    formData.append('postcode', 'SW1A 1AA');

    const result = await submitRetailerApplication(null, formData);

    expect(result.error).toBe('A retailer application with this email already exists');
  });

  it('should successfully create retailer, wallet, and audit log WITHOUT entityId', async () => {
    (auth.getSession as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });

    mockRetailer.findFirst.mockResolvedValue(null);
    mockRetailer.create.mockResolvedValue({
      id: 'retailer-123',
      businessName: 'Test Business',
      email: 'test@example.com',
    });
    mockWallet.create.mockResolvedValue({ id: 'wallet-123' });
    mockAuditLog.create.mockResolvedValue({ id: 'audit-123' });

    const formData = new FormData();
    formData.append('businessName', 'Test Business');
    formData.append('phone', '+44 123 456 7890');
    formData.append('addressLine1', '123 Test St');
    formData.append('city', 'London');
    formData.append('postcode', 'SW1A 1AA');

    const result = await submitRetailerApplication(null, formData);

    expect(result.success).toBe(true);
    expect(mockRetailer.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        businessName: 'Test Business',
        email: 'test@example.com',
        status: 'PENDING',
      }),
    });
    expect(mockWallet.create).toHaveBeenCalledWith({
      data: {
        retailerId: 'retailer-123',
        balance: 0,
        currency: 'GBP',
      },
    });
    
    const auditLogCall = mockAuditLog.create.mock.calls[0][0];
    expect(auditLogCall.data).toEqual(expect.objectContaining({
      retailerId: 'retailer-123',
      action: 'RETAILER_CREATED',
      entityType: 'Retailer',
      newValue: expect.any(Object),
    }));
    expect(auditLogCall.data).not.toHaveProperty('entityId');
  });

  it('should handle database errors gracefully', async () => {
    (auth.getSession as any).mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    });

    mockRetailer.findFirst.mockRejectedValue(new Error('Database connection failed'));

    const formData = new FormData();
    formData.append('businessName', 'Test Business');
    formData.append('phone', '+44 123 456 7890');
    formData.append('addressLine1', '123 Test St');
    formData.append('city', 'London');
    formData.append('postcode', 'SW1A 1AA');

    const result = await submitRetailerApplication(null, formData);

    expect(result.error).toContain('Failed to submit application');
    expect(result.error).toContain('Database connection failed');
  });
});
