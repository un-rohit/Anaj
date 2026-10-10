/**
 * ANAJ Mobile i18n Configuration
 *
 * Uses i18next + react-i18next.
 * Language preference is persisted in AsyncStorage under the key
 * '@anaj/language'. Hindi (HI) is the default / fallback.
 *
 * Call `initI18n()` once at app startup before rendering any UI.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import hi from './locales/hi.json';
import en from './locales/en.json';

export const LANGUAGE_STORAGE_KEY = '@anaj/language';
export const SUPPORTED_LANGUAGES = ['HI', 'EN'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: AppLanguage = 'HI';

/** Map from app language code to i18next locale tag */
const LOCALE_MAP: Record<AppLanguage, string> = {
  HI: 'hi',
  EN: 'en',
};

/**
 * Reads the persisted language from AsyncStorage.
 * Returns null if nothing is saved (first launch).
 */
export async function getPersistedLanguage(): Promise<AppLanguage | null> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved as AppLanguage)) {
      return saved as AppLanguage;
    }
  } catch {
    // AsyncStorage unavailable — fall through to default
  }
  return null;
}

/**
 * Persists the selected language to AsyncStorage.
 * Survives app restarts; cleared only if the user uninstalls or clears data.
 */
export async function persistLanguage(lang: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // Non-fatal — the selection will still apply to the current session
  }
}

/**
 * Returns the best initial language based on:
 * 1. Persisted user preference
 * 2. Device locale (if it matches a supported language)
 * 3. Hindi (default)
 *
 * Does NOT show the language selection screen — that is determined by
 * whether a persisted language exists (null = first launch).
 */
export async function resolveInitialLanguage(): Promise<{
  language: AppLanguage;
  isFirstLaunch: boolean;
}> {
  const persisted = await getPersistedLanguage();
  if (persisted !== null) {
    return { language: persisted, isFirstLaunch: false };
  }

  // First launch: detect device locale as a hint, but still show selection screen
  const deviceLocale = Localization.getLocales()[0]?.languageCode?.toUpperCase();
  const detected: AppLanguage =
    deviceLocale && SUPPORTED_LANGUAGES.includes(deviceLocale as AppLanguage)
      ? (deviceLocale as AppLanguage)
      : DEFAULT_LANGUAGE;

  return { language: detected, isFirstLaunch: true };
}

/**
 * Initialise i18next. Must be called once at app startup.
 * Accepts the resolved language so i18next starts in the right locale.
 */
export async function initI18n(language: AppLanguage = DEFAULT_LANGUAGE): Promise<void> {
  if (i18n.isInitialized) {
    await i18n.changeLanguage(LOCALE_MAP[language]);
    return;
  }

  await i18n.use(initReactI18next).init({
    resources: {
      hi: { translation: hi },
      en: { translation: en },
    },
    lng: LOCALE_MAP[language],
    fallbackLng: LOCALE_MAP[DEFAULT_LANGUAGE],
    interpolation: {
      escapeValue: false, // React Native handles XSS
    },
    compatibilityJSON: 'v4',
  });
}

/**
 * Switch the active language at runtime.
 * Updates i18next and persists the choice to AsyncStorage.
 */
export async function switchLanguage(lang: AppLanguage): Promise<void> {
  await i18n.changeLanguage(LOCALE_MAP[lang]);
  await persistLanguage(lang);
}

export default i18n;
