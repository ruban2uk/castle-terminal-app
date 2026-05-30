import { prisma } from './prisma';
import crypto from 'crypto';

interface WebhookPayload {
  eventType: string;
  transactionId?: string;
  providerTransactionId?: string;
  provider?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export class WebhookService {
  /**
   * Process incoming webhook from provider
   */
  static async processWebhook(
    eventType: string,
    provider: string,
    payload: WebhookPayload,
    signature?: string,
    body?: string
  ) {
    // Verify signature if provided
    if (signature && body) {
      const isValid = await this.verifySignature(provider, body, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    // Store webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        eventType,
        provider,
        payload: payload as any,
        status: 'PENDING',
        attemptCount: 1,
        lastAttemptAt: new Date(),
      },
    });

    try {
      // Process based on event type
      switch (eventType) {
        case 'transaction.completed':
        case 'transaction.success':
          await this.handleTransactionSuccess(payload);
          break;
        case 'transaction.failed':
          await this.handleTransactionFailure(payload);
          break;
        case 'transaction.pending':
          await this.handleTransactionPending(payload);
          break;
        default:
          console.log(`Unhandled webhook event type: ${eventType}`);
      }

      // Mark as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'DELIVERED',
          processedAt: new Date(),
        },
      });

      return { success: true, webhookId: webhookEvent.id };
    } catch (error) {
      // Mark as failed and schedule retry
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          nextAttemptAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
        },
      });

      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  private static async verifySignature(
    provider: string,
    body: string,
    signature: string
  ): Promise<boolean> {
    const providerConfig = await prisma.provider.findUnique({
      where: { code: provider },
    });

    if (!providerConfig?.webhookSecret) {
      // No secret configured, skip verification
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', providerConfig.webhookSecret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Handle transaction success webhook
   */
  private static async handleTransactionSuccess(payload: WebhookPayload) {
    if (!payload.transactionId && !payload.providerTransactionId) {
      throw new Error('No transaction ID in webhook payload');
    }

    // Find provider transaction
    const providerTransaction = await prisma.providerTransaction.findFirst({
      where: {
        OR: [
          { transactionId: payload.transactionId },
          { providerReference: payload.providerTransactionId },
        ],
      },
      include: {
        transaction: true,
      },
    });

    if (!providerTransaction) {
      throw new Error('Transaction not found');
    }

    // Update provider transaction
    await prisma.providerTransaction.update({
      where: { id: providerTransaction.id },
      data: {
        status: 'SUCCESS',
        webhookPayload: payload as any,
        webhookReceivedAt: new Date(),
      },
    });

    // Update main transaction
    await prisma.transaction.update({
      where: { id: providerTransaction.transactionId },
      data: {
        status: 'SUCCESS',
        completedAt: new Date(),
      },
    });

    // Release wallet hold if exists
    // This would be handled by the wallet service
  }

  /**
   * Handle transaction failure webhook
   */
  private static async handleTransactionFailure(payload: WebhookPayload) {
    if (!payload.transactionId && !payload.providerTransactionId) {
      throw new Error('No transaction ID in webhook payload');
    }

    const providerTransaction = await prisma.providerTransaction.findFirst({
      where: {
        OR: [
          { transactionId: payload.transactionId },
          { providerReference: payload.providerTransactionId },
        ],
      },
      include: {
        transaction: true,
      },
    });

    if (!providerTransaction) {
      throw new Error('Transaction not found');
    }

    // Update provider transaction
    await prisma.providerTransaction.update({
      where: { id: providerTransaction.id },
      data: {
        status: 'FAILED',
        webhookPayload: payload as any,
        webhookReceivedAt: new Date(),
        errorMessage: payload.metadata?.errorMessage || 'Transaction failed',
      },
    });

    // Update main transaction
    await prisma.transaction.update({
      where: { id: providerTransaction.transactionId },
      data: {
        status: 'FAILED',
      },
    });

    // Release wallet hold and refund
    // This would be handled by the wallet service
  }

  /**
   * Handle transaction pending webhook
   */
  private static async handleTransactionPending(payload: WebhookPayload) {
    if (!payload.transactionId && !payload.providerTransactionId) {
      throw new Error('No transaction ID in webhook payload');
    }

    const providerTransaction = await prisma.providerTransaction.findFirst({
      where: {
        OR: [
          { transactionId: payload.transactionId },
          { providerReference: payload.providerTransactionId },
        ],
      },
    });

    if (!providerTransaction) {
      throw new Error('Transaction not found');
    }

    await prisma.providerTransaction.update({
      where: { id: providerTransaction.id },
      data: {
        status: 'PENDING',
        webhookPayload: payload as any,
        webhookReceivedAt: new Date(),
      },
    });
  }

  /**
   * Retry failed webhooks
   */
  static async retryFailedWebhooks() {
    const failedWebhooks = await prisma.webhookEvent.findMany({
      where: {
        status: 'FAILED',
        nextAttemptAt: {
          lte: new Date(),
        },
        attemptCount: {
          lt: 5, // Max 5 retries
        },
      },
    });

    for (const webhook of failedWebhooks) {
      try {
        const payload = webhook.payload as unknown as WebhookPayload;
        await this.processWebhook(
          webhook.eventType,
          webhook.provider || 'unknown',
          payload
        );
      } catch (error) {
        // Increment retry count
        await prisma.webhookEvent.update({
          where: { id: webhook.id },
          data: {
            attemptCount: webhook.attemptCount + 1,
            nextAttemptAt: new Date(Date.now() + Math.pow(2, webhook.attemptCount) * 60 * 1000),
          },
        });
      }
    }

    return failedWebhooks.length;
  }

  /**
   * Get webhook events
   */
  static async getWebhookEvents(
    options?: {
      status?: string;
      provider?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = {};
    if (options?.status) where.status = options.status;
    if (options?.provider) where.provider = options.provider;

    const [events, total] = await Promise.all([
      prisma.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.webhookEvent.count({ where }),
    ]);

    return { events, total };
  }
}
