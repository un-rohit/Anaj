import { Prisma, type Language, type Unit } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { logAudit } from '../../lib/audit.js';

export interface CreateProductDto {
  slug: string;
  allowedUnits: Unit[];
  sortOrder?: number | undefined;
  imageUrl?: string | null | undefined;
  translations: Array<{
    language: Language;
    name: string;
    description?: string | null | undefined;
  }>;
}

export interface UpdateProductDto {
  allowedUnits?: Unit[] | undefined;
  sortOrder?: number | undefined;
  imageUrl?: string | null | undefined;
  isActive?: boolean | undefined;
  translations?: Array<{
    language: Language;
    name: string;
    description?: string | null | undefined;
  }> | undefined;
}

export class ProductService {
  /**
   * List products with their active purchase rates and localized/full translations
   */
  async listProducts(language?: Language, includeInactive = false) {
    const where: Prisma.ProductWhereInput = includeInactive ? {} : { isActive: true };
    const products = await prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        rates: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    return products.map((prod) => {
      // Find translation matching requested language or Hindi fallback or first
      const selectedTrans = language
        ? prod.translations.find((t) => t.language === language) ??
          prod.translations.find((t) => t.language === 'HI') ??
          prod.translations[0]
        : undefined;

      const activeRate = prod.rates[0];

      return {
        id: prod.id,
        slug: prod.slug,
        imageUrl: prod.imageUrl,
        isActive: prod.isActive,
        allowedUnits: prod.allowedUnits,
        sortOrder: prod.sortOrder,
        name: selectedTrans?.name ?? prod.slug,
        description: selectedTrans?.description ?? null,
        translations: prod.translations,
        currentRate: activeRate
          ? {
              id: activeRate.id,
              ratePerQuintal: activeRate.ratePerQuintal.toString(),
              effectiveFrom: activeRate.effectiveFrom,
            }
          : null,
      };
    });
  }

  /**
   * Fetch a single product by ID or slug
   */
  async getProductById(idOrSlug: string, language?: Language) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        translations: true,
        rates: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    const selectedTrans = language
      ? product.translations.find((t) => t.language === language) ??
        product.translations.find((t) => t.language === 'HI') ??
        product.translations[0]
      : undefined;

    const activeRate = product.rates[0];

    return {
      id: product.id,
      slug: product.slug,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      allowedUnits: product.allowedUnits,
      sortOrder: product.sortOrder,
      name: selectedTrans?.name ?? product.slug,
      description: selectedTrans?.description ?? null,
      translations: product.translations,
      currentRate: activeRate
        ? {
            id: activeRate.id,
            ratePerQuintal: activeRate.ratePerQuintal.toString(),
            effectiveFrom: activeRate.effectiveFrom,
          }
        : null,
    };
  }

  /**
   * Admin: Create a new agricultural product
   */
  async createProduct(data: CreateProductDto, adminUserId: string) {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError(409, 'SLUG_EXISTS', `Product with slug '${data.slug}' already exists`);
    }

    const created = await prisma.product.create({
      data: {
        slug: data.slug,
        allowedUnits: data.allowedUnits,
        sortOrder: data.sortOrder ?? 0,
        imageUrl: data.imageUrl ?? null,
        isActive: true,
        translations: {
          create: data.translations.map((t) => ({
            language: t.language,
            name: t.name,
            description: t.description ?? null,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    await logAudit({
      actorId: adminUserId,
      actorType: 'USER',
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: created.id,
      after: { slug: created.slug, allowedUnits: created.allowedUnits },
    });

    return created;
  }

  /**
   * Admin: Update product details and translations
   */
  async updateProduct(id: string, data: UpdateProductDto, adminUserId: string) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update translations if provided
      if (data.translations) {
        for (const t of data.translations) {
          await tx.productTranslation.upsert({
            where: {
              productId_language: {
                productId: id,
                language: t.language,
              },
            },
            create: {
              productId: id,
              language: t.language,
              name: t.name,
              description: t.description ?? null,
            },
            update: {
              name: t.name,
              description: t.description ?? null,
            },
          });
        }
      }

      // 2. Update base product
      const prodUpdateData: Prisma.ProductUpdateInput = {};
      if (data.allowedUnits !== undefined) prodUpdateData.allowedUnits = data.allowedUnits;
      if (data.sortOrder !== undefined) prodUpdateData.sortOrder = data.sortOrder;
      if (data.imageUrl !== undefined) prodUpdateData.imageUrl = data.imageUrl;
      if (data.isActive !== undefined) prodUpdateData.isActive = data.isActive;

      return tx.product.update({
        where: { id },
        data: prodUpdateData,
        include: {
          translations: true,
        },
      });
    });

    await logAudit({
      actorId: adminUserId,
      actorType: 'USER',
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      before: { allowedUnits: existing.allowedUnits, isActive: existing.isActive, sortOrder: existing.sortOrder },
      after: { allowedUnits: updated.allowedUnits, isActive: updated.isActive, sortOrder: updated.sortOrder },
    });

    return updated;
  }

  /**
   * Admin: Toggle whether product is currently open for procurement
   */
  async toggleActive(id: string, isActive: boolean, adminUserId: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Product not found');
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive },
      include: { translations: true },
    });

    await logAudit({
      actorId: adminUserId,
      actorType: 'USER',
      action: isActive ? 'PRODUCT_OPENED_FOR_PROCUREMENT' : 'PRODUCT_CLOSED_FOR_PROCUREMENT',
      entityType: 'Product',
      entityId: id,
      before: { isActive: existing.isActive },
      after: { isActive: updated.isActive },
    });

    return updated;
  }
}

export const productService = new ProductService();
