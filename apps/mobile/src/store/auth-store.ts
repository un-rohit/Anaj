import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FarmerProfile {
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
}

interface AuthState {
  farmer: FarmerProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initAuth: () => Promise<void>;
  login: (tokens: { accessToken: string; refreshToken: string }, farmer: FarmerProfile) => Promise<void>;
  updateFarmer: (partial: Partial<FarmerProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const ACCESS_TOKEN_KEY = 'anaj_farmer_access_token';
const REFRESH_TOKEN_KEY = 'anaj_farmer_refresh_token';
const FARMER_KEY = 'anaj_farmer_profile';

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return await AsyncStorage.getItem(key);
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  farmer: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    try {
      const [accessToken, refreshToken, farmerJson] = await Promise.all([
        getSecureItem(ACCESS_TOKEN_KEY),
        getSecureItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(FARMER_KEY),
      ]);

      if (accessToken && farmerJson) {
        const farmer = JSON.parse(farmerJson) as FarmerProfile;
        set({
          accessToken,
          refreshToken,
          farmer,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      // Ignore reading error
    }

    set({
      accessToken: null,
      refreshToken: null,
      farmer: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  login: async ({ accessToken, refreshToken }, farmer) => {
    await Promise.all([
      setSecureItem(ACCESS_TOKEN_KEY, accessToken),
      setSecureItem(REFRESH_TOKEN_KEY, refreshToken),
      AsyncStorage.setItem(FARMER_KEY, JSON.stringify(farmer)),
    ]);

    set({
      accessToken,
      refreshToken,
      farmer,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateFarmer: async (partial) => {
    const current = get().farmer;
    if (!current) return;
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(FARMER_KEY, JSON.stringify(updated));
    set({ farmer: updated });
  },

  logout: async () => {
    await Promise.all([
      deleteSecureItem(ACCESS_TOKEN_KEY),
      deleteSecureItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(FARMER_KEY),
    ]);

    set({
      accessToken: null,
      refreshToken: null,
      farmer: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
