import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { mobileApi, MobileApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function OtpScreen() {
  const { t } = useTranslation();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      setErrorMessage(
        t('validation.invalidOtp', 'कृपया 6-अंकीय ओटीपी दर्ज करें / Enter valid 6-digit OTP')
      );
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await mobileApi.verifyOtp(phone || '', otp.trim());
      await login(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        response.farmer
      );

      if (response.isNewUser) {
        router.replace('/(auth)/register');
      } else {
        router.replace('/(farmer)/home');
      }
    } catch (err) {
      if (err instanceof MobileApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          t('common.unknownError', 'ओटीपी सत्यापन में त्रुटि, पुनः प्रयास करें')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');

    try {
      await mobileApi.sendOtp(phone || '');
      setCountdown(60);
    } catch (err) {
      if (err instanceof MobileApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('ओटीपी भेजने में विफल');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>← {t('common.back', 'वापस')}</Text>
          </TouchableOpacity>
          <Text style={styles.logoTag}>🌾 {t('common.appName', 'ANAJ')}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.otpVerification', 'ओटीपी सत्यापन')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otpSentTo', 'ओटीपी भेजा गया है:')}{' '}
            <Text style={styles.boldPhone}>+91 {phone}</Text>
          </Text>

          <View style={styles.otpInputWrapper}>
            <TextInput
              style={styles.otpInput}
              placeholder="• • • • • •"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ''));
                if (errorMessage) setErrorMessage('');
              }}
              autoFocus
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>
                {t('auth.resendOtpIn', { seconds: countdown }) ||
                  `ओटीपी पुनः भेजें: ${countdown} सेकंड`}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
                accessibilityRole="button"
              >
                <Text style={styles.resendActiveText}>
                  {isResending
                    ? 'भेज रहे हैं...'
                    : t('auth.resendOtp', 'ओटीपी पुनः भेजें (Resend OTP)')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.devHint}>
            <Text style={styles.devHintText}>
              💡 विकास मोड (Dev Mode): यदि एसएमएस न मिले, तो टर्मिनल में जनरेट किया गया कोड या '123456' का उपयोग करें।
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (otp.trim().length !== 6 || isLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={otp.trim().length !== 6 || isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {t('auth.verifyOtp', 'सत्यापित करें एवं आगे बढ़ें')} ✓
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: { paddingVertical: 6, paddingHorizontal: 4 },
  backButtonText: { fontSize: 16, color: '#16a34a', fontWeight: '600' },
  logoTag: { fontSize: 16, fontWeight: '700', color: '#15803d' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22, marginBottom: 28 },
  boldPhone: { fontWeight: '700', color: '#111827' },
  otpInputWrapper: {
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: '800',
    color: '#166534',
    textAlign: 'center',
    letterSpacing: 10,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },
  resendRow: { alignItems: 'center', marginBottom: 24 },
  countdownText: { fontSize: 14, color: '#6b7280' },
  resendActiveText: { fontSize: 15, color: '#16a34a', fontWeight: '700' },
  devHint: {
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fef08a',
    borderRadius: 12,
    padding: 12,
  },
  devHintText: { fontSize: 12, color: '#854d0e', lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 },
  submitButton: {
    height: 58,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
