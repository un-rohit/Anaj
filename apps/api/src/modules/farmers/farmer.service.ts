import type { Prisma, Language } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { logAudit } from '../../lib/audit.js';

export interface UpdateFarmerDto {
  name?: string | undefined;
  language?: Language | undefined;
  address?: {
    village: string;
    postOffice: string;
    district: string;
    state: string;
    pinCode: string;
  } | undefined;
}

export interface ListFarmersParams {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  isVerified?: boolean | undefined;
  isActive?: boolean | undefined;
  district?: string | undefined;
}

export class FarmerService {
  /**
   * Get farmer's own profile and aggregated stats
   */
  async getProfile(farmerId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        address: true,
      },
    });

    if (!farmer) {
      throw new AppError(404, 'NOT_FOUND', 'Farmer profile not found');
    }

    // Aggregated sell request stats
    const [requestCount, totalCompleted] = await Promise.all([
      prisma.sellRequest.count({
        where: { farmerId },
      }),
      prisma.sellRequest.count({
        where: { farmerId, status: 'PAID' },
      }),
    ]);

    return {
      ...farmer,
      stats: {
        totalRequests: requestCount,
        completedPurchases: totalCompleted,
      },
    };
  }

  /**
   * Update farmer's own profile (name, language, address)
   */
  async updateProfile(farmerId: string, data: UpdateFarmerDto) {
    const existing = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: { address: true },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Farmer profile not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update farmer basic info
      const farmerUpdateData: Prisma.FarmerUpdateInput = {};
      if (data.name !== undefined) farmerUpdateData.name = data.name;
      if (data.language !== undefined) farmerUpdateData.language = data.language;

      const farmer = await tx.farmer.update({
        where: { id: farmerId },
        data: farmerUpdateData,
      });

      // 2. Upsert address if provided
      let address = existing.address;
      if (data.address) {
        address = await tx.farmerAddress.upsert({
          where: { farmerId },
          create: {
            farmerId,
            village: data.address.village,
            postOffice: data.address.postOffice,
            district: data.address.district,
            state: data.address.state,
            pinCode: data.address.pinCode,
          },
          update: {
            village: data.address.village,
            postOffice: data.address.postOffice,
            district: data.address.district,
            state: data.address.state,
            pinCode: data.address.pinCode,
          },
        });
      }

      return { ...farmer, address };
    });

    await logAudit({
      actorId: farmerId,
      actorType: 'FARMER',
      action: 'FARMER_PROFILE_UPDATED',
      entityType: 'Farmer',
      entityId: farmerId,
      before: { name: existing.name, language: existing.language, address: existing.address },
      after: { name: updated.name, language: updated.language, address: updated.address },
    });

    return updated;
  }

  /**
   * Admin: List farmers with search, filtering, and pagination
   */
  async listFarmers(params: ListFarmersParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.FarmerWhereInput = {};

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.isVerified !== undefined) {
      where.isVerified = params.isVerified;
    }

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { address: { district: { contains: q, mode: 'insensitive' } } },
        { address: { village: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (params.district) {
      where.address = { district: { contains: params.district.trim(), mode: 'insensitive' } };
    }

    const [items, total] = await Promise.all([
      prisma.farmer.findMany({
        where,
        include: {
          address: true,
          _count: {
            select: { sellRequests: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.farmer.count({ where }),
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
   * Admin: View complete farmer record with procurement history and notes
   */
  async getFarmerById(farmerId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        address: true,
        notes: {
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        sellRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              include: { translations: true },
            },
          },
        },
        _count: {
          select: { sellRequests: true, deviceTokens: true },
        },
      },
    });

    if (!farmer) {
      throw new AppError(404, 'NOT_FOUND', 'Farmer not found');
    }

    return farmer;
  }

  /**
   * Admin: Verify farmer profile
   */
  async verifyFarmer(farmerId: string, isVerified: boolean, adminUserId: string) {
    const existing = await prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Farmer not found');
    }

    const updated = await prisma.farmer.update({
      where: { id: farmerId },
      data: { isVerified },
    });

    await logAudit({
      actorId: adminUserId,
      actorType: 'USER',
      action: isVerified ? 'FARMER_VERIFIED' : 'FARMER_UNVERIFIED',
      entityType: 'Farmer',
      entityId: farmerId,
      before: { isVerified: existing.isVerified },
      after: { isVerified: updated.isVerified },
    });

    return updated;
  }

  /**
   * Admin: Toggle farmer active / suspended status
   */
  async updateFarmerStatus(farmerId: string, isActive: boolean, adminUserId: string) {
    const existing = await prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Farmer not found');
    }

    const updated = await prisma.farmer.update({
      where: { id: farmerId },
      data: { isActive },
    });

    await logAudit({
      actorId: adminUserId,
      actorType: 'USER',
      action: isActive ? 'FARMER_ACTIVATED' : 'FARMER_SUSPENDED',
      entityType: 'Farmer',
      entityId: farmerId,
      before: { isActive: existing.isActive },
      after: { isActive: updated.isActive },
    });

    return updated;
  }

  /**
   * Admin: Add internal note to farmer profile
   */
  async addFarmerNote(farmerId: string, authorId: string, note: string) {
    const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      throw new AppError(404, 'NOT_FOUND', 'Farmer not found');
    }

    return prisma.farmerNote.create({
      data: {
        farmerId,
        authorId,
        note,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });
  }
}

export const farmerService = new FarmerService();
