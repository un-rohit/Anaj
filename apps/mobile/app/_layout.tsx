/**
 * Root Layout (_layout.tsx)
 *
 * Responsibilities:
 * 1. Initialize i18n with the persisted/resolved language before rendering
 * 2. Set isFirstLaunch in the language store
 * 3. Hide the splash screen
 * 4. Render the Expo Router <Stack>
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import i18n, { initI18n, resolveInitialLanguage } from '@/i18n';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

// Keep the splash screen visible during initialization
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden or not available — non-fatal
});

export default function RootLayout() {
  const setResolved = useLanguageStore((s) => s.setResolved);
  const isLanguageLoading = useLanguageStore((s) => s.isLoading);
  const initAuth = useAuthStore((s) => s.initAuth);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    async function initialize() {
      try {
        const [{ language, isFirstLaunch }] = await Promise.all([
          resolveInitialLanguage(),
          initAuth(),
        ]);
        await initI18n(language);
        setResolved(language, isFirstLaunch);
      } catch {
        // Fallback: initialize with Hindi
        await initI18n('HI');
        setResolved('HI', true);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    void initialize();
  }, [setResolved, initAuth]);

  if (isLanguageLoading || isAuthLoading) {
    // Splash screen is still visible — render nothing until initialized
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(farmer)" />
        </Stack>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
