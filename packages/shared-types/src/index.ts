// =============================================================================
// ANAJ Shared Types
// Platform-independent TypeScript interfaces, enums, and type utilities.
// Used by: apps/api, apps/admin, apps/mobile
// =============================================================================

// ---------------------------------------------------------------------------
// Enumerations (stored as-is in the database; never translated here)
// ---------------------------------------------------------------------------

export type Language = 'HI' | 'EN';

export const LANGUAGES = ['HI', 'EN'] as const satisfies readonly Language[];

export type UserRole =
  | 'OWNER'
  | 'ADMIN'
  | 'PROCUREMENT_MANAGER'
  | 'COLLECTION_STAFF'
  | 'QUALITY_INSPECTOR'
  | 'ACCOUNTS_STAFF';

export type Unit = 'KG' | 'QUINTAL';

export const UNITS = ['KG', 'QUINTAL'] as const satisfies readonly Unit[];

/** 1 quintal = 100 kilograms. This is the canonical conversion factor. */
export const KG_PER_QUINTAL = 100 as const;

export type SellRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'COLLECTION_SCHEDULED'
  | 'COLLECTED'
  | 'QUALITY_CHECK'
  | 'WEIGHED'
  | 'APPROVED_FOR_PAYMENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REJECTED'
  | 'CANCELLED';

export const SELL_REQUEST_STATUSES = [
  'SUBMITTED',
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
] as const satisfies readonly SellRequestStatus[];

/**
 * Valid forward transitions for sell request status.
 * The backend enforces these; clients must not bypass them.
 */
export const SELL_REQUEST_TRANSITIONS: Record<SellRequestStatus, readonly SellRequestStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED', 'CANCELLED'],
  UNDER_REVIEW: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COLLECTION_SCHEDULED', 'CANCELLED'],
  COLLECTION_SCHEDULED: ['COLLECTED', 'CANCELLED'],
  COLLECTED: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['WEIGHED', 'REJECTED'],
  WEIGHED: ['APPROVED_FOR_PAYMENT', 'REJECTED'],
  APPROVED_FOR_PAYMENT: ['PARTIALLY_PAID', 'PAID'],
  PARTIALLY_PAID: ['PAID'],
  PAID: [],
  REJECTED: [],
  CANCELLED: [],
};

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export type CollectionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type QualityResult = 'PASSED' | 'FAILED' | 'CONDITIONAL';

// ---------------------------------------------------------------------------
// API Response Wrappers
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Farmer
// ---------------------------------------------------------------------------

export interface FarmerAddress {
  id: string;
  village: string;
  postOffice: string;
  district: string;
  state: string;
  pinCode: string;
}

export interface Farmer {
  id: string;
  phone: string;
  name: string;
  profilePhotoUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  language: Language;
  address: FarmerAddress | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface FarmerProfile extends Farmer {
  // Extended profile with additional computed fields
  totalRequests: number;
  completedPurchases: number;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ProductTranslation {
  language: Language;
  name: string;
  description: string | null;
}

export interface Product {
  id: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  allowedUnits: Unit[];
  sortOrder: number;
  translations: ProductTranslation[];
  currentRate: PurchaseRate | null;
  createdAt: string;
  updatedAt: string;
}

/** Product as seen by the farmer app (locale-specific name resolved) */
export interface ProductView {
  id: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  allowedUnits: Unit[];
  name: string; // resolved for the requested language
  description: string | null;
  currentRate: PurchaseRateView | null;
}

// ---------------------------------------------------------------------------
// Purchase Rates
// ---------------------------------------------------------------------------

export interface PurchaseRate {
  id: string;
  productId: string;
  ratePerQuintal: string; // decimal string to avoid floating-point issues
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  notes: string | null;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRateView {
  ratePerQuintal: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

// ---------------------------------------------------------------------------
// Sell Requests
// ---------------------------------------------------------------------------

export interface SellRequestPhoto {
  id: string;
  url: string;
  uploadedAt: string;
}

export interface SellRequest {
  id: string;
  reference: string;
  farmerId: string;
  product: Pick<Product, 'id' | 'slug' | 'translations' | 'imageUrl'>;
  status: SellRequestStatus;
  requestedQuantity: string;
  requestedUnit: Unit;
  acceptedQuantity: string | null;
  collectedQuantity: string | null;
  finalQuantity: string | null;
  expectedPricePerQuintal: string | null;
  agreedRatePerQuintal: string | null;
  applicableDeductions: string | null;
  finalPayableAmount: string | null;
  collectionAddress: string | null;
  preferredCollectionDate: string | null;
  quality: string | null;
  notes: string | null;
  rejectionReason: string | null;
  photos: SellRequestPhoto[];
  collection: CollectionSummary | null;
  paymentSummary: PaymentSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionSummary {
  scheduledDate: string;
  actualDate: string | null;
  address: string;
  status: CollectionStatus;
}

export interface PaymentSummary {
  totalPayable: string;
  totalPaid: string;
  balance: string;
  lastPaymentDate: string | null;
}

// ---------------------------------------------------------------------------
// Company Settings
// ---------------------------------------------------------------------------

export interface CompanySetting {
  key: string;
  value: string;
}

export interface PublicCompanySettings {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  supportHours: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601
}

export interface FarmerAuthPayload {
  sub: string; // farmerId
  phone: string;
  type: 'farmer';
  iat: number;
  exp: number;
}

export interface UserAuthPayload {
  sub: string; // userId
  role: UserRole;
  type: 'staff';
  iat: number;
  exp: number;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  sentAt: string;
}

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

/** Make specific fields of T required (opposite of Partial for specific keys) */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Strip null from a specific key */
export type NonNullableField<T, K extends keyof T> = Omit<T, K> & { [P in K]: NonNullable<T[P]> };
