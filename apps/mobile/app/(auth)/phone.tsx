import { useState } from 'react';
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
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { mobileApi, MobileApiError } from '@/lib/api-client';

export default function PhoneScreen() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isValidPhone = /^[6-9]\d{9}$/.test(phone.trim());

  const handleSendOtp = async () => {
    if (!isValidPhone) {
      setErrorMessage(
        t('validation.invalidPhone', 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें / Enter valid 10-digit number')
      );
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await mobileApi.sendOtp(phone.trim());
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: phone.trim() },
      });
    } catch (err) {
      if (err instanceof MobileApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          t('common.unknownError', 'कुछ गलत हुआ, कृपया पुनः प्रयास करें')
        );
      }
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>{t('auth.phoneNumber', 'मोबाइल नंबर')}</Text>
          <Text style={styles.subtitle}>
            {t(
              'auth.phoneNumberHint',
              'सत्यापन के लिए आपके नंबर पर एक ओटीपी (OTP) भेजा जाएगा'
            )}
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.prefixContainer}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="98765 43210"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/[^0-9]/g, ''));
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

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ {t('common.appName', 'ANAJ')} किसान सहायता</Text>
            <Text style={styles.infoText}>
              सीधे अपनी फसल की सही कीमत पाएं। केवल अनाज कंपनी द्वारा सीधी खरीद।
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValidPhone || isLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSendOtp}
            disabled={!isValidPhone || isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {t('auth.sendOtp', 'ओटीपी प्राप्त करें')} →
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginBottom: 16,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: '#dcfce7',
    gap: 6,
  },
  flagEmoji: { fontSize: 20 },
  prefixText: { fontSize: 18, fontWeight: '700', color: '#166534' },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 16,
    letterSpacing: 1.5,
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
  infoBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#64748b', lineHeight: 20 },
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
