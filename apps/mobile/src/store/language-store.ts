/**
 * Language Store (Zustand)
 *
 * Manages:
 *  - The active app language
 *  - Whether the language selection screen should be shown (first launch)
 *
 * This is the single source of truth for language in the mobile app.
 * Components read language via useLanguage hook (see hooks/useLanguage.ts),
 * which combines this store with i18next.
 */

import { create } from 'zustand';
import type { AppLanguage } from '../i18n';
import { switchLanguage, DEFAULT_LANGUAGE } from '../i18n';

interface LanguageState {
  /** Currently active language. HI by default until resolved. */
  language: AppLanguage;
  /** True when the app has not yet resolved the persisted language (startup). */
  isLoading: boolean;
  /** True if this is the user's first launch — show language selection screen. */
  isFirstLaunch: boolean;

  // Actions
  setLanguage: (lang: AppLanguage) => Promise<void>;
  setResolved: (lang: AppLanguage, isFirstLaunch: boolean) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: DEFAULT_LANGUAGE,
  isLoading: true,
  isFirstLaunch: false,

  /** Called at startup after resolveInitialLanguage() returns. */
  setResolved: (lang, isFirstLaunch) => {
    set({ language: lang, isLoading: false, isFirstLaunch });
  },

  /**
   * Switch to a new language at runtime.
   * Updates i18next + AsyncStorage + this store.
   */
  setLanguage: async (lang) => {
    await switchLanguage(lang);
    set({ language: lang, isFirstLaunch: false });
  },
}));
