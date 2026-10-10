import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate and fall back to default locale
  if (!locale || !routing.locales.includes(locale as 'hi' | 'en')) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`./messages/${locale}.json`)) as { default: Record<string, unknown> };

  return {
    locale,
    messages: messages.default,
  };
});
