import { WalletService } from '../src/lib/wallet';
import { prisma } from '../src/lib/prisma';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Wallet Service', () => {
  const testRetailerId = 'test-retailer-123';

  beforeEach(async () => {
    // Clean up test data
    await prisma.walletLedger.deleteMany({
      where: { wallet: { retailerId: testRetailerId } },
    });
    await prisma.wallet.deleteMany({
      where: { retailerId: testRetailerId },
    });

    // Create test wallet
    await WalletService.initializeWallet(testRetailerId);
  });

  afterEach(async () => {
    // Clean up
    await prisma.walletLedger.deleteMany({
      where: { wallet: { retailerId: testRetailerId } },
    });
    await prisma.wallet.deleteMany({
      where: { retailerId: testRetailerId },
    });
  });

  it('should credit wallet', async () => {
    const result = await WalletService.credit(
      testRetailerId,
      100,
      'TEST-CREDIT',
      { test: true }
    );

    expect(result.success).toBe(true);
    expect(result.wallet?.balance).toBe(100);
    expect(result.ledgerEntry?.type).toBe('CREDIT');
    expect(result.ledgerEntry?.amount).toBe(100);
  });

  it('should debit wallet', async () => {
    // First credit
    await WalletService.credit(testRetailerId, 100);

    // Then debit
    const result = await WalletService.debit(
      testRetailerId,
      50,
      'txn-123',
      'TEST-DEBIT'
    );

    expect(result.success).toBe(true);
    expect(result.wallet?.balance).toBe(50);
    expect(result.ledgerEntry?.type).toBe('DEBIT');
    expect(result.ledgerEntry?.amount).toBe(-50);
  });

  it('should fail debit with insufficient balance', async () => {
    const result = await WalletService.debit(
      testRetailerId,
      100,
      'txn-123',
      'TEST-DEBIT'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient balance');
  });

  it('should hold and release funds', async () => {
    // Credit first
    await WalletService.credit(testRetailerId, 100);

    // Hold funds
    const holdResult = await WalletService.hold(
      testRetailerId,
      30,
      'txn-123',
      'TEST-HOLD'
    );

    expect(holdResult.success).toBe(true);
    expect(holdResult.wallet?.balance).toBe(70);
    expect(holdResult.wallet?.holdAmount).toBe(30);

    // Release funds
    const releaseResult = await WalletService.release(
      testRetailerId,
      30,
      'txn-123',
      'TEST-RELEASE'
    );

    expect(releaseResult.success).toBe(true);
    expect(releaseResult.wallet?.balance).toBe(100);
    expect(releaseResult.wallet?.holdAmount).toBe(0);
  });

  it('should hold and capture funds', async () => {
    // Credit first
    await WalletService.credit(testRetailerId, 100);

    // Hold funds
    await WalletService.hold(testRetailerId, 30, 'txn-123', 'TEST-HOLD');

    // Capture funds
    const captureResult = await WalletService.capture(
      testRetailerId,
      30,
      'txn-123',
      'TEST-CAPTURE'
    );

    expect(captureResult.success).toBe(true);
    expect(captureResult.wallet?.balance).toBe(70);
    expect(captureResult.wallet?.holdAmount).toBe(0);
  });

  it('should maintain immutable ledger', async () => {
    await WalletService.credit(testRetailerId, 100);
    await WalletService.debit(testRetailerId, 30);
    await WalletService.debit(testRetailerId, 20);

    const ledger = await WalletService.getLedger(testRetailerId);
    
    expect(ledger.entries).toHaveLength(3);
    expect(ledger.total).toBe(3);

    // Verify balance progression
    expect(ledger.entries[0].balanceAfter).toBe(50); // Most recent
    expect(ledger.entries[1].balanceAfter).toBe(70);
    expect(ledger.entries[2].balanceAfter).toBe(100); // Oldest
  });
});
