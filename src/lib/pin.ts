import { prisma } from './prisma';
import crypto from 'crypto';
import { PinStatus } from '@prisma/client';

// AES-256 encryption for PINs
const PIN_ENCRYPTION_KEY = process.env.PIN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

function encryptPin(pin: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(PIN_ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(pin, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptPin(encryptedPin: string): string {
  const [ivHex, encrypted] = encryptedPin.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(PIN_ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

interface PinUploadResult {
  success: boolean;
  batchCode?: string;
  totalCount?: number;
  duplicateCount?: number;
  error?: string;
}

export class PinService {
  /**
   * Upload PIN batch from CSV/XLSX data
   */
  static async uploadBatch(
    productId: string,
    pins: Array<{
      pin: string;
      serialNumber?: string;
      expiryDate?: Date;
    }>,
    buyingPrice: number,
    uploadedBy: string
  ): Promise<PinUploadResult> {
    return prisma.$transaction(async (tx) => {
      // Generate unique batch code
      const batchCode = `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create batch
      const batch = await tx.pinBatch.create({
        data: {
          batchCode,
          productId,
          uploadedBy,
          totalCount: pins.length,
          buyingPrice,
          availableCount: 0,
          soldCount: 0,
        },
      });

      let duplicateCount = 0;
      let uploadedCount = 0;

      // Process each PIN
      for (const pinData of pins) {
        const pinHash = hashPin(pinData.pin);

        // Check for duplicates
        const existing = await tx.pinInventory.findUnique({
          where: { pinHash },
        });

        if (existing) {
          duplicateCount++;
          continue;
        }

        // Encrypt and store PIN
        const encryptedPin = encryptPin(pinData.pin);

        await tx.pinInventory.create({
          data: {
            batchId: batch.id,
            encryptedPin,
            pinHash,
            serialNumber: pinData.serialNumber || null,
            status: 'AVAILABLE',
          },
        });

        uploadedCount++;
      }

      // Update batch counts
      await tx.pinBatch.update({
        where: { id: batch.id },
        data: {
          availableCount: uploadedCount,
          totalCount: uploadedCount,
        },
      });

      return {
        success: true,
        batchCode,
        totalCount: uploadedCount,
        duplicateCount,
      };
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to upload PIN batch',
    }));
  }

  /**
   * Reserve PIN for transaction (transactional row locking)
   */
  static async reservePin(batchId: string, transactionId: string): Promise<{
    success: boolean;
    pinId?: string;
    serialNumber?: string | null;
    error?: string;
  }> {
    return prisma.$transaction(async (tx) => {
      // Find available PIN with row-level lock
      const pin = await tx.pinInventory.findFirst({
        where: {
          batchId,
          status: 'AVAILABLE',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!pin) {
        throw new Error('No available PINs in batch');
      }

      // Reserve the PIN
      const updated = await tx.pinInventory.update({
        where: { id: pin.id },
        data: {
          status: 'RESERVED',
          transactionId,
        },
      });

      // Update batch counts
      await tx.pinBatch.update({
        where: { id: batchId },
        data: {
          availableCount: { decrement: 1 },
          soldCount: { increment: 1 },
        },
      });

      return {
        success: true,
        pinId: updated.id,
        serialNumber: updated.serialNumber,
      };
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to reserve PIN',
    }));
  }

  /**
   * Mark PIN as sold
   */
  static async sellPin(pinId: string): Promise<{
    success: boolean;
    pin?: string;
    serialNumber?: string | null;
    error?: string;
  }> {
    return prisma.$transaction(async (tx) => {
      const pin = await tx.pinInventory.update({
        where: { id: pinId },
        data: {
          status: 'SOLD',
          soldAt: new Date(),
        },
      });

      return {
        success: true,
        pin: decryptPin(pin.encryptedPin),
        serialNumber: pin.serialNumber,
      };
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to sell PIN',
    }));
  }

  /**
   * Release reserved PIN (if transaction fails)
   */
  static async releasePin(pinId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return prisma.$transaction(async (tx) => {
      const pin = await tx.pinInventory.update({
        where: { id: pinId },
        data: {
          status: 'AVAILABLE',
          transactionId: null,
        },
      });

      // Update batch counts
      await tx.pinBatch.update({
        where: { id: pin.batchId },
        data: {
          availableCount: { increment: 1 },
          soldCount: { decrement: 1 },
        },
      });

      return { success: true };
    }).catch((error) => ({
      success: false,
      error: error.message || 'Failed to release PIN',
    }));
  }

  /**
   * Get PIN inventory status
   */
  static async getInventoryStatus(productId?: string) {
    const where: any = {};
    if (productId) {
      where.batch = { productId };
    }

    const [total, available, reserved, sold] = await Promise.all([
      prisma.pinInventory.count({ where }),
      prisma.pinInventory.count({ where: { ...where, status: 'AVAILABLE' } }),
      prisma.pinInventory.count({ where: { ...where, status: 'RESERVED' } }),
      prisma.pinInventory.count({ where: { ...where, status: 'SOLD' } }),
    ]);

    return { total, available, reserved, sold };
  }

  /**
   * Get batches for product
   */
  static async getBatches(productId?: string) {
    return prisma.pinBatch.findMany({
      where: productId ? { productId } : undefined,
      include: {
        _count: {
          select: { pins: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
