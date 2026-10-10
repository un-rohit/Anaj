/**
 * Welcome Screen
 * First screen shown to returning users (language already selected).
 * Shows the ANAJ branding, brief tagline, and buttons for Login / Register.
 */

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#16a34a" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>
        <Text style={styles.appName}>{t('common.appName')}</Text>
        <Text style={styles.tagline}>{t('common.tagline')}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.welcomeTitle}>{t('auth.welcome')}</Text>
        <Text style={styles.welcomeSubtitle}>{t('auth.welcomeSubtitle')}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/phone')}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/(auth)/phone')}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.registerButtonText}>{t('auth.register')}</Text>
        </TouchableOpacity>
      </View>

      {/* Support number — always visible */}
      <Text style={styles.supportText}>
        {t('support.callUs')}: {t('support.phone')}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#16a34a' },
  header: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 50 },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  body: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 12,
  },
  loginButton: {
    height: 60,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  registerButton: {
    height: 60,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: '700',
  },
  supportText: {
    backgroundColor: '#ffffff',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
    paddingBottom: 24,
    paddingTop: 8,
  },
});
