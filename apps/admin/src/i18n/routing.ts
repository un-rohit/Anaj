import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hi', 'en'],
  defaultLocale: 'hi',
  localePrefix: 'as-needed', // /hi/... only when non-default; default uses /
});

export type Locale = (typeof routing.locales)[number];
