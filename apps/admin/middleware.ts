import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except static files, api routes, and Next.js internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
