import { prisma } from './prisma';
import { AuditAction } from '@prisma/client';

interface AuditLogEntry {
  userId?: string;
  retailerId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(entry: AuditLogEntry) {
    return prisma.auditLog.create({
      data: {
        userId: entry.userId,
        retailerId: entry.retailerId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldValue: entry.oldValue || {},
        newValue: entry.newValue || {},
        metadata: entry.metadata || {},
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  }

  /**
   * Get audit logs with filtering
   */
  static async getLogs(
    options?: {
      userId?: string;
      retailerId?: string;
      action?: AuditAction;
      entityType?: string;
      entityId?: string;
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = {};

    if (options?.userId) where.userId = options.userId;
    if (options?.retailerId) where.retailerId = options.retailerId;
    if (options?.action) where.action = options.action;
    if (options?.entityType) where.entityType = options.entityType;
    if (options?.entityId) where.entityId = options.entityId;
    if (options?.fromDate || options?.toDate) {
      where.createdAt = {};
      if (options.fromDate) where.createdAt.gte = options.fromDate;
      if (options.toDate) where.createdAt.lte = options.toDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
          retailer: {
            select: { businessName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  /**
   * Get recent activity for a retailer
   */
  static async getRetailerActivity(retailerId: string, limit = 10) {
    return prisma.auditLog.findMany({
      where: { retailerId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get transaction audit trail
   */
  static async getTransactionAuditTrail(transactionId: string) {
    return prisma.auditLog.findMany({
      where: {
        OR: [
          { entityId: transactionId, entityType: 'Transaction' },
          { transaction: { id: transactionId } },
        ],
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get audit summary for dashboard
   */
  static async getAuditSummary(fromDate?: Date, toDate?: Date) {
    const dateFilter: any = {};
    if (fromDate || toDate) {
      dateFilter.createdAt = {};
      if (fromDate) dateFilter.createdAt.gte = fromDate;
      if (toDate) dateFilter.createdAt.lte = toDate;
    }

    const [
      totalActions,
      actionsByType,
      recentErrors,
    ] = await Promise.all([
      prisma.auditLog.count({ where: dateFilter }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: dateFilter,
        _count: { action: true },
      }),
      prisma.auditLog.findMany({
        where: {
          ...dateFilter,
          action: {
            in: ['TRANSACTION_FAILED', 'WALLET_DEBITED'],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalActions,
      actionsByType: actionsByType.map((a) => ({
        action: a.action,
        count: a._count.action,
      })),
      recentErrors,
    };
  }
}
