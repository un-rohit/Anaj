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

export default function Index() {
  const isFirstLaunch = useLanguageStore((s) => s.isFirstLaunch);
  const isLoading = useLanguageStore((s) => s.isLoading);

  if (isLoading) {
    return null; // Splash screen handles the wait
  }

  if (isFirstLaunch) {
    return <Redirect href="/(auth)/language-select" />;
  }

  // TODO Phase 4: check auth token from SecureStore
  // If authenticated → redirect to /(farmer)/home
  // If not authenticated → redirect to /(auth)/welcome
  return <Redirect href="/(auth)/welcome" />;
}
