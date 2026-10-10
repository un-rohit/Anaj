/**
 * useLanguage hook
 *
 * Convenience hook combining the Zustand language store with react-i18next.
 * Use this in components that need to read or change the language.
 */

import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/language-store';
import type { AppLanguage } from '../i18n';

export function useLanguage() {
  const { t, i18n } = useTranslation();
  const { language, isLoading, isFirstLaunch, setLanguage } = useLanguageStore();

  /** Format a number as Indian currency (₹) */
  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(language === 'HI' ? 'hi-IN' : 'en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  /** Format a date string (ISO 8601) for the current locale */
  const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(language === 'HI' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    }).format(date);
  };

  /** Format a quantity with unit label */
  const formatQuantity = (qty: string | number, unit: 'KG' | 'QUINTAL'): string => {
    const num = typeof qty === 'string' ? parseFloat(qty) : qty;
    const formatted = new Intl.NumberFormat(language === 'HI' ? 'hi-IN' : 'en-IN', {
      maximumFractionDigits: 3,
    }).format(num);
    const unitLabel = unit === 'KG' ? t('common.kg') : t('common.quintal');
    return `${formatted} ${unitLabel}`;
  };

  return {
    language,
    isLoading,
    isFirstLaunch,
    setLanguage: async (lang: AppLanguage) => {
      await setLanguage(lang);
    },
    t,
    i18n,
    formatCurrency,
    formatDate,
    formatQuantity,
  };
}
