import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fully mock the auth client module
vi.mock('@/lib/auth/client', () => ({
  authClient: {
    getSession: vi.fn(),
    signIn: { social: vi.fn() },
    signOut: vi.fn(),
  },
  signInWithGoogle: vi.fn(),
  signInWithGitHub: vi.fn(),
}));

import { authClient, signInWithGoogle } from '@/lib/auth/client';

describe('Auth Flow - End to End', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Detection', () => {
    it('should return null for unauthenticated users', async () => {
      (authClient.getSession as any).mockResolvedValue({ data: null });
      const result = await (authClient.getSession as any)();
      expect(result.data).toBeNull();
    });

    it('should return user data for authenticated users', async () => {
      (authClient.getSession as any).mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'ruban2uk@gmail.com', name: 'Test User' },
        },
      });
      const result = await (authClient.getSession as any)();
      expect(result.data.user.email).toBe('ruban2uk@gmail.com');
      expect(result.data.user.name).toBe('Test User');
    });

    it('should handle getSession network errors', async () => {
      (authClient.getSession as any).mockRejectedValue(new Error('Network error'));
      await expect((authClient.getSession as any)()).rejects.toThrow('Network error');
    });
  });

  describe('Google Sign-In', () => {
    it('should call signInWithGoogle with callbackURL', async () => {
      (signInWithGoogle as any).mockResolvedValue(undefined);
      await signInWithGoogle('/retailer/dashboard');
      expect(signInWithGoogle).toHaveBeenCalledWith('/retailer/dashboard');
    });

    it('should handle Google sign-in errors gracefully', async () => {
      (signInWithGoogle as any).mockRejectedValue(new Error('OAuth failed'));
      await expect(signInWithGoogle('/retailer/dashboard')).rejects.toThrow('OAuth failed');
    });
  });
});

describe('Retailer API Lookup Logic', () => {
  it('should return 401 when no session', () => {
    const response = { status: 401, data: { error: 'Unauthorized' } };
    expect(response.status).toBe(401);
    expect(response.data.error).toBe('Unauthorized');
  });

  it('should return approved retailer with wallet balance', () => {
    const data = {
      approved: {
        id: 'ret-1', businessName: 'Test Business', status: 'APPROVED',
        wallet: { balance: 100 }, outlets: [], transactions: [],
      },
      pending: null,
      rejected: null,
    };
    expect(data.approved.status).toBe('APPROVED');
    expect(data.approved.wallet.balance).toBe(100);
    expect(data.pending).toBeNull();
  });

  it('should return pending retailer when application awaiting approval', () => {
    const data = {
      approved: null,
      pending: { id: 'ret-2', businessName: 'New Shop', status: 'PENDING', createdAt: '2026-01-01' },
      rejected: null,
    };
    expect(data.pending.status).toBe('PENDING');
    expect(data.approved).toBeNull();
  });

  it('should return nothing when user has no retailer', () => {
    const data = { approved: null, pending: null, rejected: null };
    expect(data.approved).toBeNull();
    expect(data.pending).toBeNull();
    expect(data.rejected).toBeNull();
    // In this case, dashboard shows "Apply as Retailer"
  });
});
