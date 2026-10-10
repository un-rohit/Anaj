import { Prisma, type SellRequestStatus, type Unit } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { generateSellRequestReference } from '../../lib/reference.js';
import { SELL_REQUEST_TRANSITIONS, KG_PER_QUINTAL } from '@anaj/shared-types';
import { logAudit } from '../../lib/audit.js';

export interface CreateSellRequestDto {
  productId: string;
  quantity: string;
  unit: Unit;
  expectedPricePerQuintal?: string | undefined;
  quality?: string | null | undefined;
  collectionAddress: string;
  preferredCollectionDate?: string | Date | undefined;
  notes?: string | null | undefined;
  clientRequestId?: string | null | undefined;
}

export interface ListSellRequestsParams {
  page?: number | undefined;
  limit?: number | undefined;
  farmerId?: string | undefined;
  productId?: string | undefined;
  status?: SellRequestStatus | undefined;
  startDate?: string | Date | undefined;
  endDate?: string | Date | undefined;
  search?: string | undefined;
}

export interface UpdateStatusDto {
  status: SellRequestStatus;
  notes?: string | undefined;
  rejectionReason?: string | undefined;
  acceptedQuantity?: string | undefined;
  agreedRateId?: string | undefined;
  agreedRatePerQuintal?: string | undefined;
}

export class SellRequestService {
  /**
   * Farmer: Submit a new sell request for agricultural produce
   */
  async createSellRequest(farmerId: string, data: CreateSellRequestDto) {
    // 1. Check idempotency if clientRequestId is provided
    if (data.clientRequestId) {
      const existing = await prisma.sellRequest.findUnique({
        where: { clientRequestId: data.clientRequestId },
        include: {
          product: { include: { translations: true } },
          agreedRate: true,
        },
      });
      if (existing) {
        return existing;
      }
    }

    // 2. Verify product is open for procurement and supports requested unit
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        rates: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    if (!product || !product.isActive) {
      throw new AppError(400, 'PRODUCT_UNAVAILABLE', 'This product is currently not open for procurement');
    }

    if (!product.allowedUnits.includes(data.unit)) {
      throw new AppError(400, 'INVALID_UNIT', `Unit ${data.unit} is not supported for this product`);
    }

    const requestedQtyDecimal = new Prisma.Decimal(data.quantity);
    if (requestedQtyDecimal.lessThanOrEqualTo(0)) {
      throw new AppError(400, 'INVALID_QUANTITY', 'Quantity must be greater than zero');
    }

    // 3. Generate human-readable reference (ANJ-YYYY-000001)
    const reference = await generateSellRequestReference();

    const preferredDate = data.preferredCollectionDate ? new Date(data.preferredCollectionDate) : null;
    const expectedPriceDecimal = data.expectedPricePerQuintal
      ? new Prisma.Decimal(data.expectedPricePerQuintal)
      : null;

    // 4. Create record in SUBMITTED status
    const created = await prisma.sellRequest.create({
      data: {
        reference,
        farmerId,
        productId: data.productId,
        status: 'SUBMITTED',
        requestedQuantity: requestedQtyDecimal,
        requestedUnit: data.unit,
        expectedPricePerQuintal: expectedPriceDecimal,
        collectionAddress: data.collectionAddress,
        preferredCollectionDate: preferredDate,
        quality: data.quality ?? null,
        notes: data.notes ?? null,
        clientRequestId: data.clientRequestId ?? null,
      },
      include: {
        product: { include: { translations: true } },
      },
    });

    await logAudit({
      actorId: farmerId,
      actorType: 'FARMER',
      action: 'SELL_REQUEST_CREATED',
      entityType: 'SellRequest',
      entityId: created.id,
      after: {
        reference: created.reference,
        quantity: created.requestedQuantity.toString(),
        unit: created.requestedUnit,
      },
    });

    return created;
  }

  /**
   * Farmer: List my own sell requests
   */
  async getMySellRequests(farmerId: string, page = 1, limit = 20, status?: SellRequestStatus) {
    const skip = (Math.max(1, page) - 1) * limit;
    const where: Prisma.SellRequestWhereInput = { farmerId };
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.sellRequest.findMany({
        where,
        include: {
          product: { include: { translations: true } },
          agreedRate: true,
          collection: true,
          qualityInspection: true,
          weighment: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sellRequest.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Farmer: Get details for my single sell request
   */
  async getMySellRequestById(farmerId: string, requestId: string) {
    const request = await prisma.sellRequest.findFirst({
      where: {
        id: requestId,
        farmerId,
      },
      include: {
        product: { include: { translations: true } },
        agreedRate: true,
        collection: true,
        qualityInspection: true,
        weighment: { include: { deductions: true } },
        payments: true,
        photos: true,
      },
    });

    if (!request) {
      throw new AppError(404, 'NOT_FOUND', 'Sell request not found');
    }

    return request;
  }

  /**
   * Admin: List all sell requests across all farmers with filters
   */
  async listAllSellRequests(params: ListSellRequestsParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SellRequestWhereInput = {};

    if (params.farmerId) where.farmerId = params.farmerId;
    if (params.productId) where.productId = params.productId;
    if (params.status) where.status = params.status;

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { reference: { contains: q, mode: 'insensitive' } },
        { farmer: { name: { contains: q, mode: 'insensitive' } } },
        { farmer: { phone: { contains: q } } },
        { collectionAddress: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.sellRequest.findMany({
        where,
        include: {
          farmer: { include: { address: true } },
          product: { include: { translations: true } },
          agreedRate: true,
          collection: true,
          qualityInspection: true,
          weighment: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sellRequest.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Get full details for any sell request
   */
  async getSellRequestById(requestId: string) {
    const request = await prisma.sellRequest.findUnique({
      where: { id: requestId },
      include: {
        farmer: { include: { address: true } },
        product: { include: { translations: true } },
        agreedRate: true,
        collection: { include: { assignedStaff: { select: { id: true, name: true } } } },
        qualityInspection: true,
        weighment: { include: { deductions: true } },
        purchaseOrder: { include: { payments: true } },
        payments: true,
        photos: true,
        processedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!request) {
      throw new AppError(404, 'NOT_FOUND', 'Sell request not found');
    }

    return request;
  }

  /**
   * Staff/Admin: Update request status and procurement lifecycle
   * Strictly validates allowed forward transitions using SELL_REQUEST_TRANSITIONS
   */
  async updateStatus(requestId: string, staffUserId: string, dto: UpdateStatusDto) {
    const existing = await prisma.sellRequest.findUnique({
      where: { id: requestId },
      include: { product: { include: { rates: { where: { isActive: true }, take: 1 } } } },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Sell request not found');
    }

    // Validate transition
    const allowedNextStatuses = SELL_REQUEST_TRANSITIONS[existing.status];
    if (!allowedNextStatuses.includes(dto.status)) {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        `Cannot transition sell request from '${existing.status}' to '${dto.status}'. Allowed transitions: ${allowedNextStatuses.join(', ') || 'none'}`,
      );
    }

    // Build update payload
    const updateData: Prisma.SellRequestUpdateInput = {
      status: dto.status,
      processedBy: { connect: { id: staffUserId } },
    };

    if (dto.notes) {
      updateData.notes = dto.notes;
    }

    if (dto.status === 'REJECTED') {
      if (!dto.rejectionReason) {
        throw new AppError(400, 'REASON_REQUIRED', 'Rejection reason is required when rejecting a request');
      }
      updateData.rejectionReason = dto.rejectionReason;
    }

    if (dto.status === 'ACCEPTED') {
      // 1. Resolve accepted quantity (default to requested quantity if not specified)
      const acceptedQty = dto.acceptedQuantity
        ? new Prisma.Decimal(dto.acceptedQuantity)
        : existing.requestedQuantity;
      updateData.acceptedQuantity = acceptedQty;

      // 2. Lock agreed rate per quintal
      let agreedRateDecimal: Prisma.Decimal;
      let agreedRateId: string | undefined = dto.agreedRateId;

      if (dto.agreedRatePerQuintal) {
        agreedRateDecimal = new Prisma.Decimal(dto.agreedRatePerQuintal);
      } else {
        // Use active rate for the product
        const activeRate = existing.product.rates[0];
        if (!activeRate) {
          throw new AppError(
            400,
            'NO_ACTIVE_RATE',
            'No active purchase rate found for this product. Please set a rate first.',
          );
        }
        agreedRateDecimal = activeRate.ratePerQuintal;
        agreedRateId = activeRate.id;
      }

      updateData.agreedRatePerQuintal = agreedRateDecimal;
      if (agreedRateId) {
        updateData.agreedRate = { connect: { id: agreedRateId } };
      }

      // Calculate initial estimated payable:
      // If requested in KG, convert: quintals = kg / 100
      let quantityInQuintals = acceptedQty;
      if (existing.requestedUnit === 'KG') {
        quantityInQuintals = acceptedQty.dividedBy(KG_PER_QUINTAL);
      }
      const estimatedPayable = quantityInQuintals.times(agreedRateDecimal);
      updateData.finalPayableAmount = estimatedPayable;
    }

    const updated = await prisma.sellRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        farmer: true,
        product: { include: { translations: true } },
        agreedRate: true,
      },
    });

    await logAudit({
      actorId: staffUserId,
      actorType: 'USER',
      action: `SELL_REQUEST_${dto.status}`,
      entityType: 'SellRequest',
      entityId: requestId,
      before: { status: existing.status },
      after: {
        status: updated.status,
        acceptedQuantity: updated.acceptedQuantity?.toString(),
        agreedRatePerQuintal: updated.agreedRatePerQuintal?.toString(),
        finalPayableAmount: updated.finalPayableAmount?.toString(),
      },
    });

    return updated;
  }
}

export const sellRequestService = new SellRequestService();
