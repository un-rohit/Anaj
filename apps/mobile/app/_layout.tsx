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

import i18n, { initI18n, resolveInitialLanguage } from '@/i18n';
import { useLanguageStore } from '@/store/language-store';

// Keep the splash screen visible during initialization
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden or not available — non-fatal
});

export default function RootLayout() {
  const setResolved = useLanguageStore((s) => s.setResolved);
  const isLoading = useLanguageStore((s) => s.isLoading);

  useEffect(() => {
    async function initialize() {
      try {
        const { language, isFirstLaunch } = await resolveInitialLanguage();
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
  }, [setResolved]);

  if (isLoading) {
    // Splash screen is still visible — render nothing until initialized
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(farmer)" />
      </Stack>
    </I18nextProvider>
  );
}
