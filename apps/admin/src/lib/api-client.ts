/**
 * ANAJ API Client for Web Applications (Farmer Portal + Admin Console)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getFarmerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('anaj_farmer_token');
}

function getStaffToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('anaj_staff_token');
}

export function setFarmerToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('anaj_farmer_token', token);
  }
}

export function removeFarmerToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('anaj_farmer_token');
    localStorage.removeItem('anaj_farmer_user');
  }
}

export function setStaffToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('anaj_staff_token', token);
  }
}

export function removeStaffToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('anaj_staff_token');
    localStorage.removeItem('anaj_staff_user');
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  tokenType: 'FARMER' | 'STAFF' | 'NONE' = 'NONE',
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = tokenType === 'FARMER' ? getFarmerToken() : tokenType === 'STAFF' ? getStaffToken() : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    const error = json.error || { code: 'UNKNOWN_ERROR', message: 'Request failed' };
    throw new ApiError(error.code, error.message, error.details);
  }

  return json.data as T;
}

// ---------------------------------------------------------------------------
// Public & Company Endpoints
// ---------------------------------------------------------------------------

export interface CompanyInfo {
  name: string;
  nameHi: string;
  ownerName: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  addressHi: string;
  minPurchaseQuantityKg: number;
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
  return request<CompanyInfo>('/company/public');
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  allowedUnits: ('KG' | 'QUINTAL')[];
  sortOrder: number;
  currentRate: {
    id: string;
    ratePerQuintal: string;
    effectiveFrom: string;
  } | null;
}

export async function getProducts(lang?: 'hi' | 'en'): Promise<ProductItem[]> {
  const query = lang ? `?lang=${lang.toUpperCase()}` : '';
  return request<ProductItem[]>(`/products${query}`);
}

// ---------------------------------------------------------------------------
// Farmer Authentication & Portal Endpoints
// ---------------------------------------------------------------------------

export async function sendFarmerOtp(phone: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/auth/farmer/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export interface FarmerAuthResult {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  farmer: {
    id: string;
    phone: string;
    name: string;
    language: string;
    isVerified: boolean;
  };
}

export async function verifyFarmerOtp(phone: string, otp: string): Promise<FarmerAuthResult> {
  const result = await request<FarmerAuthResult>('/auth/farmer/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
  setFarmerToken(result.accessToken);
  if (typeof window !== 'undefined') {
    localStorage.setItem('anaj_farmer_user', JSON.stringify(result.farmer));
  }
  return result;
}

export async function getFarmerProfile(): Promise<any> {
  return request('/farmers/me', {}, 'FARMER');
}

export async function updateFarmerProfile(data: {
  name?: string;
  address?: { village: string; postOffice: string; district: string; state: string; pinCode: string };
}): Promise<any> {
  return request(
    '/farmers/me',
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    'FARMER',
  );
}

export interface CreateSellRequestParams {
  productId: string;
  quantity: string;
  unit: 'KG' | 'QUINTAL';
  collectionAddress: string;
  preferredCollectionDate?: string | undefined;
  notes?: string | undefined;
  clientRequestId?: string | undefined;
}

export async function createSellRequest(data: CreateSellRequestParams): Promise<any> {
  return request(
    '/sell-requests',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    'FARMER',
  );
}

export async function getMySellRequests(page = 1, limit = 20): Promise<any[]> {
  return request<any[]>(`/sell-requests/my?page=${page}&limit=${limit}`, {}, 'FARMER');
}

// ---------------------------------------------------------------------------
// Staff Authentication & Admin Console Endpoints
// ---------------------------------------------------------------------------

export interface StaffAuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    role: string;
    language: string;
  };
}

export async function staffLogin(identifier: string, password: string): Promise<StaffAuthResult> {
  const result = await request<StaffAuthResult>('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  setStaffToken(result.accessToken);
  if (typeof window !== 'undefined') {
    localStorage.setItem('anaj_staff_user', JSON.stringify(result.user));
  }
  return result;
}

export async function getDashboardStats(): Promise<any> {
  return request('/dashboard/stats', {}, 'STAFF');
}

export async function listFarmers(
  params: { page?: number | undefined; limit?: number | undefined; search?: string | undefined } = {},
): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);

  return request(`/farmers?${searchParams.toString()}`, {}, 'STAFF');
}

export async function verifyFarmer(id: string, isVerified: boolean): Promise<any> {
  return request(
    `/farmers/${id}/verify`,
    {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    },
    'STAFF',
  );
}

export async function listSellRequestsAdmin(
  params: {
    status?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
  } = {},
): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);

  return request(`/sell-requests?${searchParams.toString()}`, {}, 'STAFF');
}

export async function updateSellRequestStatus(
  id: string,
  data: {
    status: string;
    notes?: string | undefined;
    rejectionReason?: string | undefined;
    acceptedQuantity?: string | undefined;
    agreedRatePerQuintal?: string | undefined;
  },
): Promise<any> {
  return request(
    `/sell-requests/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    'STAFF',
  );
}

export async function publishPurchaseRate(data: {
  productId: string;
  ratePerQuintal: string;
  effectiveFrom: string;
  notes?: string | undefined;
}): Promise<any> {
  return request(
    '/purchase-rates',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    'STAFF',
  );
}

export async function listAuditLogs(
  params: { page?: number | undefined; limit?: number | undefined } = {},
): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());

  return request(`/audit-logs?${searchParams.toString()}`, {}, 'STAFF');
}
