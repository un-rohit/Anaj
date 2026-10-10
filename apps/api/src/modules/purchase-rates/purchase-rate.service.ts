import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { logAudit } from '../../lib/audit.js';

export interface CreateRateDto {
  productId: string;
  ratePerQuintal: string;
  effectiveFrom: string | Date;
  effectiveTo?: string | Date | undefined;
  notes?: string | undefined;
}

export class PurchaseRateService {
  /**
   * Get currently active procurement rates for all products
   */
  async getActiveRates() {
    return prisma.purchaseRate.findMany({
      where: {
        isActive: true,
        product: { isActive: true },
      },
      include: {
        product: {
          include: { translations: true },
        },
      },
      orderBy: { product: { sortOrder: 'asc' } },
    });
  }

  /**
   * Get full audit history of rate changes for a product
   */
  async getRateHistory(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { translations: true },
    });

    if (!product) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    const rates = await prisma.purchaseRate.findMany({
      where: { productId },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    return {
      product,
      rates,
    };
  }

  /**
   * Admin: Publish a new purchase rate for an agricultural product
   * Preserves previous rate history and existing accepted sell requests.
   */
  async createRate(data: CreateRateDto, adminUserId: string) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    const rateDecimal = new Prisma.Decimal(data.ratePerQuintal);
    if (rateDecimal.lessThanOrEqualTo(0)) {
      throw new AppError(400, 'INVALID_RATE', 'Rate per quintal must be greater than zero');
    }

    const effectiveFromDate = new Date(data.effectiveFrom);
    const effectiveToDate = data.effectiveTo ? new Date(data.effectiveTo) : null;

    const [previousActiveRate, newRate] = await prisma.$transaction(async (tx) => {
      // Find current active rate for audit before/after
      const currentActive = await tx.purchaseRate.findFirst({
        where: { productId: data.productId, isActive: true },
        orderBy: { effectiveFrom: 'desc' },
      });

      // Deactivate older active rates for this product
      await tx.purchaseRate.updateMany({
        where: { productId: data.productId, isActive: true },
        data: {
          isActive: false,
          effectiveTo: effectiveFromDate,
        },
      });

      // Insert new rate
      const created = await tx.purchaseRate.create({
        data: {
          productId: data.productId,
          ratePerQuintal: rateDecimal,
          effectiveFrom: effectiveFromDate,
          effectiveTo: effectiveToDate,
          isActive: true,
          notes: data.notes ?? null,
          createdById: adminUserId,
        },
        include: {
          product: { include: { translations: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      return [currentActive, created];
    });

    await logAudit({
      actorId: adminUserId,
      actorType: 'USER',
      action: 'PURCHASE_RATE_UPDATED',
      entityType: 'PurchaseRate',
      entityId: newRate.id,
      before: previousActiveRate
        ? {
            id: previousActiveRate.id,
            ratePerQuintal: previousActiveRate.ratePerQuintal.toString(),
            effectiveFrom: previousActiveRate.effectiveFrom,
          }
        : null,
      after: {
        id: newRate.id,
        productId: newRate.productId,
        ratePerQuintal: newRate.ratePerQuintal.toString(),
        effectiveFrom: newRate.effectiveFrom,
      },
    });

    return newRate;
  }
}

export const purchaseRateService = new PurchaseRateService();
