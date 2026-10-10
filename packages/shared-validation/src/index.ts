// =============================================================================
// ANAJ Shared Zod Validation Schemas
// Re-usable validation that runs identically on client and server.
// Never import React or platform-specific code here.
// =============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile numbers
export const PIN_CODE_REGEX = /^\d{6}$/;
export const OTP_REGEX = /^\d{6}$/;

// ---------------------------------------------------------------------------
// Common field schemas
// ---------------------------------------------------------------------------

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, 'Please enter a valid 10-digit Indian mobile number');

export const otpSchema = z
  .string()
  .trim()
  .regex(OTP_REGEX, 'Please enter the 6-digit OTP');

export const pinCodeSchema = z
  .string()
  .trim()
  .regex(PIN_CODE_REGEX, 'Please enter a valid 6-digit PIN code');

export const languageSchema = z.enum(['HI', 'EN']);

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ---------------------------------------------------------------------------
// Farmer Registration
// ---------------------------------------------------------------------------

export const farmerAddressSchema = z.object({
  village: z.string().trim().min(2).max(100),
  postOffice: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pinCode: pinCodeSchema,
});

export const farmerRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  language: languageSchema.default('HI'),
  address: farmerAddressSchema,
});

export const updateFarmerProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  language: languageSchema.optional(),
  address: farmerAddressSchema.optional(),
});

// ---------------------------------------------------------------------------
// Sell Request
// ---------------------------------------------------------------------------

export const unitSchema = z.enum(['KG', 'QUINTAL']);

const positiveDecimalString = z
  .string()
  .regex(/^\d+(\.\d{1,3})?$/, 'Must be a positive number')
  .refine((v) => parseFloat(v) > 0, { message: 'Must be greater than 0' });

export const createSellRequestSchema = z.object({
  productId: z.string().uuid('Invalid product'),
  quantity: positiveDecimalString,
  unit: unitSchema,
  expectedPricePerQuintal: positiveDecimalString.optional(),
  quality: z.string().trim().max(500).optional(),
  collectionAddress: z.string().trim().min(5).max(500),
  preferredCollectionDate: z.string().datetime().optional(),
  notes: z.string().trim().max(1000).optional(),
  clientRequestId: z.string().uuid().optional(), // idempotency key
});

// ---------------------------------------------------------------------------
// Purchase Rate
// ---------------------------------------------------------------------------

export const createPurchaseRateSchema = z.object({
  productId: z.string().uuid(),
  ratePerQuintal: positiveDecimalString,
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  notes: z.string().trim().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Product Management (admin)
// ---------------------------------------------------------------------------

export const createProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  allowedUnits: z.array(unitSchema).min(1, 'At least one unit must be allowed'),
  sortOrder: z.number().int().min(0).default(0),
  translations: z
    .array(
      z.object({
        language: languageSchema,
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().max(500).optional(),
      }),
    )
    .min(1),
});

export const updateProductSchema = createProductSchema.partial().omit({ slug: true });

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------------------------------------------------------------------------
// Sell Request status update (admin only)
// ---------------------------------------------------------------------------

export const updateSellRequestStatusSchema = z.object({
  status: z.enum([
    'UNDER_REVIEW',
    'ACCEPTED',
    'COLLECTION_SCHEDULED',
    'COLLECTED',
    'QUALITY_CHECK',
    'WEIGHED',
    'APPROVED_FOR_PAYMENT',
    'PARTIALLY_PAID',
    'PAID',
    'REJECTED',
    'CANCELLED',
  ]),
  rejectionReason: z.string().trim().max(500).optional(),
  // Acceptance fields
  acceptedQuantity: positiveDecimalString.optional(),
  agreedRateId: z.string().uuid().optional(),
  agreedRatePerQuintal: positiveDecimalString.optional(),
});

// ---------------------------------------------------------------------------
// Inferred types for convenience
// ---------------------------------------------------------------------------

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type FarmerRegistrationInput = z.infer<typeof farmerRegistrationSchema>;
export type UpdateFarmerProfileInput = z.infer<typeof updateFarmerProfileSchema>;
export type CreateSellRequestInput = z.infer<typeof createSellRequestSchema>;
export type CreatePurchaseRateInput = z.infer<typeof createPurchaseRateSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type UpdateSellRequestStatusInput = z.infer<typeof updateSellRequestStatusSchema>;
