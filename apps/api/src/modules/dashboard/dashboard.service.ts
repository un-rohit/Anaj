import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export interface DashboardFilterParams {
  startDate?: string | Date | undefined;
  endDate?: string | Date | undefined;
}

export class DashboardService {
  /**
   * Calculate live metrics from actual database records — no hardcoded statistics
   */
  async getStats(filters: DashboardFilterParams) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.lte = new Date(filters.endDate);

    const hasDateFilter = Boolean(filters.startDate || filters.endDate);

    const sellRequestWhere: Prisma.SellRequestWhereInput = hasDateFilter ? { createdAt: dateFilter } : {};
    const farmerWhere: Prisma.FarmerWhereInput = hasDateFilter ? { createdAt: dateFilter } : {};
    const paymentWhere: Prisma.PaymentWhereInput = hasDateFilter ? { createdAt: dateFilter } : {};

    const [
      totalFarmers,
      activeFarmers,
      pendingRequests,
      acceptedRequests,
      collectedCount,
      completedPurchases,
      purchaseValueAgg,
      paymentsCompletedAgg,
      recentSellRequests,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.farmer.count({ where: farmerWhere }),
      prisma.farmer.count({ where: { ...farmerWhere, isActive: true } }),
      prisma.sellRequest.count({
        where: {
          ...sellRequestWhere,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
      prisma.sellRequest.count({
        where: {
          ...sellRequestWhere,
          status: { in: ['ACCEPTED', 'COLLECTION_SCHEDULED'] },
        },
      }),
      prisma.sellRequest.count({
        where: {
          ...sellRequestWhere,
          status: { in: ['COLLECTED', 'QUALITY_CHECK', 'WEIGHED'] },
        },
      }),
      prisma.sellRequest.count({
        where: {
          ...sellRequestWhere,
          status: 'PAID',
        },
      }),
      prisma.sellRequest.aggregate({
        where: {
          ...sellRequestWhere,
          status: {
            in: ['ACCEPTED', 'COLLECTION_SCHEDULED', 'COLLECTED', 'QUALITY_CHECK', 'WEIGHED', 'APPROVED_FOR_PAYMENT', 'PARTIALLY_PAID', 'PAID'],
          },
        },
        _sum: {
          finalPayableAmount: true,
          acceptedQuantity: true,
        },
      }),
      prisma.payment.aggregate({
        where: {
          ...paymentWhere,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
      prisma.sellRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: { select: { id: true, name: true, phone: true } },
          product: { include: { translations: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    const totalPurchaseValue = purchaseValueAgg._sum.finalPayableAmount?.toNumber() ?? 0;
    const completedPaymentsTotal = paymentsCompletedAgg._sum.amount?.toNumber() ?? 0;
    const outstandingPayable = Math.max(0, totalPurchaseValue - completedPaymentsTotal);

    return {
      overview: {
        totalFarmers,
        activeFarmers,
        pendingSellingRequests: pendingRequests,
        acceptedPurchaseRequests: acceptedRequests,
        produceCollectedCount: collectedCount,
        completedPurchases,
        totalPurchaseValue,
        completedPaymentsTotal,
        completedPaymentsCount: paymentsCompletedAgg._count.id,
        outstandingPayableAmount: outstandingPayable,
      },
      recentSellRequests,
      recentActivities: recentAuditLogs,
    };
  }
}

export const dashboardService = new DashboardService();
