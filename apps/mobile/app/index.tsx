/**
 * app/index.tsx — Root redirect
 *
 * Determines which screen to show first:
 *  - Language selection screen (first launch, no saved preference)
 *  - Welcome/Login (returning user, not authenticated)
 *  - Farmer home (authenticated)
 *
 * Auth state is checked from SecureStore via the auth store (Phase 4).
 * For Phase 1, we redirect based on language state only.
 */

import { Redirect } from 'expo-router';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';

export default function Index() {
  const isFirstLaunch = useLanguageStore((s) => s.isFirstLaunch);
  const isLanguageLoading = useLanguageStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  if (isLanguageLoading || isAuthLoading) {
    return null;
  }

  if (isFirstLaunch) {
    return <Redirect href="/(auth)/language-select" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(farmer)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
