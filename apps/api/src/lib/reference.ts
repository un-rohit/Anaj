import { prisma } from './prisma.js';

/**
 * Generate human-friendly reference numbers for sell requests (e.g. ANJ-2026-000042)
 */
export async function generateSellRequestReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ANJ-${year}-`;

  // Find the highest existing reference for the current year
  const latest = await prisma.sellRequest.findFirst({
    where: {
      reference: {
        startsWith: prefix,
      },
    },
    orderBy: {
      reference: 'desc',
    },
    select: {
      reference: true,
    },
  });

  let nextSequence = 1;
  if (latest?.reference) {
    const parts = latest.reference.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2] || '', 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
}

/**
 * Generate human-friendly purchase order numbers (e.g. PO-2026-000042)
 */
export async function generatePurchaseOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;

  const latest = await prisma.purchaseOrder.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
    select: {
      orderNumber: true,
    },
  });

  let nextSequence = 1;
  if (latest?.orderNumber) {
    const parts = latest.orderNumber.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2] || '', 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
}
