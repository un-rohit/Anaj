'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(newLocale: string) {
    if (newLocale === locale) return;

    // Save preference to localStorage for persistence across sessions
    if (typeof window !== 'undefined') {
      localStorage.setItem('anaj-admin-locale', newLocale);
    }

    // Remove current locale prefix from pathname and prepend new one
    const segments = pathname.split('/');
    const isLocaleSegment = segments[1] === 'hi' || segments[1] === 'en';
    const pathWithoutLocale = isLocaleSegment ? '/' + segments.slice(2).join('/') : pathname;

    const newPath = newLocale === 'hi' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;

    startTransition(() => {
      router.replace(newPath || '/');
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-gray-200 p-1">
      <button
        onClick={() => switchLocale('hi')}
        disabled={isPending}
        aria-label="हिन्दी में बदलें"
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          locale === 'hi'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {t('hindi')}
      </button>
      <button
        onClick={() => switchLocale('en')}
        disabled={isPending}
        aria-label="Switch to English"
        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {t('english')}
      </button>
    </div>
  );
}
