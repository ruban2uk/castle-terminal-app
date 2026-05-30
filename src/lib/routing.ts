import { prisma } from './prisma';
import { ProviderStatus } from '@prisma/client';

interface RoutingCandidate {
  providerId: string;
  providerName: string;
  providerCode: string;
  providerProductCode: string;
  buyingPrice: number;
  retailPrice: number;
  platformMargin: number;
  retailerMargin: number;
  priority: number;
  stockLevel?: number;
  successRate?: number | null;
  avgResponseTime?: number | null;
}

interface RoutingDecision {
  selectedProvider: RoutingCandidate;
  backupProviders: RoutingCandidate[];
  platformMargin: number;
  retailerMargin: number;
  decisionLogic: string;
  timestamp: string;
}

export class RoutingEngine {
  /**
   * Find best provider for a product
   */
  static async findBestProvider(productId: string): Promise<RoutingDecision> {
    // Get all active provider products for this product
    const candidates = await prisma.providerProduct.findMany({
      where: {
        productId,
        isActive: true,
        provider: {
          status: ProviderStatus.ACTIVE,
        },
      },
      include: {
        provider: true,
      },
      orderBy: [
        { priority: 'asc' },
        { platformMargin: 'desc' },
      ],
    });

    if (candidates.length === 0) {
      throw new Error('No active providers found for this product');
    }

    // Filter candidates with stock (for manual PIN providers)
    const availableCandidates: RoutingCandidate[] = candidates
      .filter((pp) => {
        // For manual PIN providers, check stock
        if (pp.provider.type === 'MANUAL') {
          return pp.stockLevel > 0;
        }
        return true;
      })
      .map((pp) => ({
        providerId: pp.providerId,
        providerName: pp.provider.name,
        providerCode: pp.provider.code,
        providerProductCode: pp.providerProductCode,
        buyingPrice: Number(pp.buyingPrice),
        retailPrice: Number(pp.retailPrice),
        platformMargin: Number(pp.platformMargin),
        retailerMargin: Number(pp.retailerMargin),
        priority: pp.priority,
        stockLevel: pp.stockLevel,
        successRate: pp.provider.successRate ? Number(pp.provider.successRate) : null,
        avgResponseTime: pp.provider.avgResponseTime,
      }));

    if (availableCandidates.length === 0) {
      throw new Error('No available providers with stock for this product');
    }

    // Select best provider (first by priority, then by margin)
    const selectedProvider = availableCandidates[0];
    const backupProviders = availableCandidates.slice(1);

    // Calculate margins
    const platformMargin = selectedProvider.platformMargin;
    const retailerMargin = selectedProvider.retailerMargin;

    return {
      selectedProvider,
      backupProviders,
      platformMargin,
      retailerMargin,
      decisionLogic: `Selected ${selectedProvider.providerName} based on priority ${selectedProvider.priority} and platform margin £${platformMargin.toFixed(2)}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get provider ranking for a product
   */
  static async getProviderRanking(productId: string) {
    const candidates = await prisma.providerProduct.findMany({
      where: {
        productId,
        isActive: true,
        provider: {
          status: ProviderStatus.ACTIVE,
        },
      },
      include: {
        provider: true,
      },
      orderBy: [
        { priority: 'asc' },
        { platformMargin: 'desc' },
      ],
    });

    return candidates.map((pp, index) => ({
      rank: index + 1,
      providerId: pp.providerId,
      providerName: pp.provider.name,
      providerCode: pp.provider.code,
      priority: pp.priority,
      buyingPrice: Number(pp.buyingPrice),
      retailPrice: Number(pp.retailPrice),
      platformMargin: Number(pp.platformMargin),
      retailerMargin: Number(pp.retailerMargin),
      stockLevel: pp.stockLevel,
      isAvailable: pp.provider.type === 'MANUAL' ? pp.stockLevel > 0 : true,
    }));
  }

  /**
   * Update provider priority
   */
  static async updatePriority(
    providerProductId: string,
    priority: number
  ) {
    return prisma.providerProduct.update({
      where: { id: providerProductId },
      data: { priority },
    });
  }

  /**
   * Fallback to next provider if primary fails
   */
  static async getFallbackProvider(
    productId: string,
    excludeProviderId: string
  ): Promise<RoutingCandidate | null> {
    const candidates = await prisma.providerProduct.findMany({
      where: {
        productId,
        isActive: true,
        providerId: { not: excludeProviderId },
        provider: {
          status: ProviderStatus.ACTIVE,
        },
      },
      include: {
        provider: true,
      },
      orderBy: [
        { priority: 'asc' },
        { platformMargin: 'desc' },
      ],
      take: 1,
    });

    if (candidates.length === 0) {
      return null;
    }

    const pp = candidates[0];
    return {
      providerId: pp.providerId,
      providerName: pp.provider.name,
      providerCode: pp.provider.code,
      providerProductCode: pp.providerProductCode,
      buyingPrice: Number(pp.buyingPrice),
      retailPrice: Number(pp.retailPrice),
      platformMargin: Number(pp.platformMargin),
      retailerMargin: Number(pp.retailerMargin),
      priority: pp.priority,
      stockLevel: pp.stockLevel,
      successRate: pp.provider.successRate ? Number(pp.provider.successRate) : null,
      avgResponseTime: pp.provider.avgResponseTime,
    };
  }
}
