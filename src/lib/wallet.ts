import { prisma } from './prisma';
import { WalletLedgerType, WalletLedgerStatus, Prisma } from '@prisma/client';

interface WalletOperationResult {
  success: boolean;
  wallet?: {
    id: string;
    balance: number;
    holdAmount: number;
  };
  ledgerEntry?: {
    id: string;
    type: WalletLedgerType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
  };
  error?: string;
}

export class WalletService {
  /**
   * Credit wallet (add funds)
   */
  static async credit(
    retailerId: string,
    amount: number,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<WalletOperationResult> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { retailerId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const currentBalance = Number(wallet.balance);
      const newBalance = currentBalance + amount;

      const updatedWallet = await tx.wallet.update({
        where: { retailerId },
        data: {
          balance: newBalance,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          status: 'COMPLETED',
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          reference,
          metadata: metadata || {},
        },
      });

      return {
        success: true,
        wallet: {
          id: updatedWallet.id,
          balance: Number(updatedWallet.balance),
          holdAmount: Number(updatedWallet.holdAmount),
        },
        ledgerEntry: {
          id: ledgerEntry.id,
          type: ledgerEntry.type,
          amount: Number(ledgerEntry.amount),
          balanceBefore: Number(ledgerEntry.balanceBefore),
          balanceAfter: Number(ledgerEntry.balanceAfter),
        },
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to credit wallet',
    }));
  }

  /**
   * Debit wallet (deduct funds)
   */
  static async debit(
    retailerId: string,
    amount: number,
    transactionId?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<WalletOperationResult> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { retailerId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const currentBalance = Number(wallet.balance);

      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      const newBalance = currentBalance - amount;

      const updatedWallet = await tx.wallet.update({
        where: { retailerId },
        data: {
          balance: newBalance,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          status: 'COMPLETED',
          amount: -amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          transactionId,
          reference,
          metadata: metadata || {},
        },
      });

      return {
        success: true,
        wallet: {
          id: updatedWallet.id,
          balance: Number(updatedWallet.balance),
          holdAmount: Number(updatedWallet.holdAmount),
        },
        ledgerEntry: {
          id: ledgerEntry.id,
          type: ledgerEntry.type,
          amount: Number(ledgerEntry.amount),
          balanceBefore: Number(ledgerEntry.balanceBefore),
          balanceAfter: Number(ledgerEntry.balanceAfter),
        },
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to debit wallet',
    }));
  }

  /**
   * Place hold on wallet funds
   */
  static async hold(
    retailerId: string,
    amount: number,
    transactionId?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<WalletOperationResult> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { retailerId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const currentBalance = Number(wallet.balance);
      const currentHold = Number(wallet.holdAmount);

      if (currentBalance < amount) {
        throw new Error('Insufficient balance for hold');
      }

      const updatedWallet = await tx.wallet.update({
        where: { retailerId },
        data: {
          balance: currentBalance - amount,
          holdAmount: currentHold + amount,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: 'HOLD',
          status: 'COMPLETED',
          amount: -amount,
          balanceBefore: currentBalance,
          balanceAfter: currentBalance - amount,
          transactionId,
          reference,
          metadata: metadata || {},
        },
      });

      return {
        success: true,
        wallet: {
          id: updatedWallet.id,
          balance: Number(updatedWallet.balance),
          holdAmount: Number(updatedWallet.holdAmount),
        },
        ledgerEntry: {
          id: ledgerEntry.id,
          type: ledgerEntry.type,
          amount: Number(ledgerEntry.amount),
          balanceBefore: Number(ledgerEntry.balanceBefore),
          balanceAfter: Number(ledgerEntry.balanceAfter),
        },
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to place hold',
    }));
  }

  /**
   * Capture held funds
   */
  static async capture(
    retailerId: string,
    amount: number,
    transactionId?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<WalletOperationResult> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { retailerId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const currentHold = Number(wallet.holdAmount);

      if (currentHold < amount) {
        throw new Error('Insufficient held funds');
      }

      const updatedWallet = await tx.wallet.update({
        where: { retailerId },
        data: {
          holdAmount: currentHold - amount,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: 'CAPTURE',
          status: 'COMPLETED',
          amount: -amount,
          balanceBefore: Number(wallet.balance),
          balanceAfter: Number(wallet.balance),
          transactionId,
          reference,
          metadata: metadata || {},
        },
      });

      return {
        success: true,
        wallet: {
          id: updatedWallet.id,
          balance: Number(updatedWallet.balance),
          holdAmount: Number(updatedWallet.holdAmount),
        },
        ledgerEntry: {
          id: ledgerEntry.id,
          type: ledgerEntry.type,
          amount: Number(ledgerEntry.amount),
          balanceBefore: Number(ledgerEntry.balanceBefore),
          balanceAfter: Number(ledgerEntry.balanceAfter),
        },
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to capture funds',
    }));
  }

  /**
   * Release held funds back to balance
   */
  static async release(
    retailerId: string,
    amount: number,
    transactionId?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<WalletOperationResult> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { retailerId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const currentBalance = Number(wallet.balance);
      const currentHold = Number(wallet.holdAmount);

      if (currentHold < amount) {
        throw new Error('Insufficient held funds to release');
      }

      const updatedWallet = await tx.wallet.update({
        where: { retailerId },
        data: {
          balance: currentBalance + amount,
          holdAmount: currentHold - amount,
        },
      });

      const ledgerEntry = await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          type: 'RELEASE',
          status: 'COMPLETED',
          amount,
          balanceBefore: currentBalance,
          balanceAfter: currentBalance + amount,
          transactionId,
          reference,
          metadata: metadata || {},
        },
      });

      return {
        success: true,
        wallet: {
          id: updatedWallet.id,
          balance: Number(updatedWallet.balance),
          holdAmount: Number(updatedWallet.holdAmount),
        },
        ledgerEntry: {
          id: ledgerEntry.id,
          type: ledgerEntry.type,
          amount: Number(ledgerEntry.amount),
          balanceBefore: Number(ledgerEntry.balanceBefore),
          balanceAfter: Number(ledgerEntry.balanceAfter),
        },
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to release funds',
    }));
  }

  /**
   * Refund amount back to wallet
   */
  static async refund(
    retailerId: string,
    amount: number,
    transactionId?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<WalletOperationResult> {
    return this.credit(retailerId, amount, reference, {
      ...metadata,
      isRefund: true,
      originalTransactionId: transactionId,
    });
  }

  /**
   * Get wallet with ledger
   */
  static async getWallet(retailerId: string) {
    return prisma.wallet.findUnique({
      where: { retailerId },
      include: {
        ledger: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  /**
   * Get wallet ledger entries
   */
  static async getLedger(
    retailerId: string,
    options?: {
      type?: WalletLedgerType;
      status?: WalletLedgerStatus;
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    const wallet = await prisma.wallet.findUnique({
      where: { retailerId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const where: any = { walletId: wallet.id };

    if (options?.type) where.type = options.type;
    if (options?.status) where.status = options.status;
    if (options?.fromDate || options?.toDate) {
      where.createdAt = {};
      if (options.fromDate) where.createdAt.gte = options.fromDate;
      if (options.toDate) where.createdAt.lte = options.toDate;
    }

    const [entries, total] = await Promise.all([
      prisma.walletLedger.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.walletLedger.count({ where }),
    ]);

    return { entries, total };
  }

  /**
   * Initialize wallet for new retailer
   */
  static async initializeWallet(retailerId: string) {
    const existing = await prisma.wallet.findUnique({
      where: { retailerId },
    });

    if (existing) {
      return existing;
    }

    return prisma.wallet.create({
      data: {
        retailerId,
        balance: 0,
        currency: 'GBP',
      },
    });
  }
}
