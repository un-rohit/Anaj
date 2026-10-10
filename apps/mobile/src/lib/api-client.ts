import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth-store';

const DEFAULT_LOCAL_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1';

export const API_BASE_URL =
  process.env['EXPO_PUBLIC_API_URL'] || DEFAULT_LOCAL_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class MobileApiError extends Error {
  code?: string | undefined;
  statusCode: number;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'MobileApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new MobileApiError(
      'इंटरनेट कनेक्शन चेक करें / Please check your internet connection',
      0,
      'NETWORK_ERROR'
    );
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    if (response.status === 401) {
      // Session expired
      void useAuthStore.getState().logout();
    }
    const message = json.error?.message || json.message || 'Request failed';
    throw new MobileApiError(message, response.status, json.error?.code);
  }

  return json.data;
}

export const mobileApi = {
  // Auth
  async sendOtp(phone: string): Promise<{ expiresAt: string; message: string }> {
    return request('/auth/farmer/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(phone: string, otp: string) {
    return request<{
      accessToken: string;
      refreshToken: string;
      isNewUser: boolean;
      farmer: {
        id: string;
        phone: string;
        name: string;
        language: 'HI' | 'EN';
        isVerified: boolean;
      };
    }>('/auth/farmer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  },

  // Farmer Profile
  async getProfile() {
    return request<{
      id: string;
      phone: string;
      name: string;
      language: 'HI' | 'EN';
      isVerified: boolean;
      village?: string | null;
      postOffice?: string | null;
      district?: string | null;
      state?: string | null;
      pinCode?: string | null;
    }>('/farmers/me');
  },

  async updateProfile(data: {
    name?: string;
    language?: 'HI' | 'EN';
    village?: string;
    postOffice?: string;
    district?: string;
    state?: string;
    pinCode?: string;
  }) {
    return request('/farmers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Products & Rates
  async getProducts() {
    return request<
      Array<{
        id: string;
        code: string;
        nameEn: string;
        nameHi: string;
        unit: string;
        isActive: boolean;
      }>
    >('/products');
  },

  async getLiveRates() {
    return request<
      Array<{
        id: string;
        productId: string;
        ratePerQuintal: number;
        minRate: number;
        maxRate: number;
        effectiveFrom: string;
        product: {
          code: string;
          nameEn: string;
          nameHi: string;
          unit: string;
        };
      }>
    >('/purchase-rates/live');
  },

  // Sell Requests
  async getMySellRequests() {
    return request<
      Array<{
        id: string;
        referenceNumber: string;
        productId: string;
        quantityInQuintals: number;
        offeredRatePerQuintal: number;
        agreedRatePerQuintal: number | null;
        totalEstimatedAmount: number;
        finalConfirmedAmount: number | null;
        status: string;
        pickupVillage: string;
        pickupDistrict: string;
        pickupPinCode: string;
        notes: string | null;
        rejectionReason: string | null;
        createdAt: string;
        updatedAt: string;
        product: {
          nameEn: string;
          nameHi: string;
          code: string;
        };
      }>
    >('/sell-requests/my');
  },

  async submitSellRequest(data: {
    productId: string;
    quantityInQuintals: number;
    pickupVillage: string;
    pickupDistrict: string;
    pickupPinCode: string;
    notes?: string | undefined;
    clientRequestId?: string | undefined;
  }) {
    return request('/sell-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Company Info
  async getCompanyInfo() {
    return request<{
      name: string;
      brandName: string;
      ownerName: string;
      phone: string;
      email: string;
      address: {
        line1: string;
        village: string;
        tehsil: string;
        district: string;
        state: string;
        pinCode: string;
      };
    }>('/company/info');
  },
};
