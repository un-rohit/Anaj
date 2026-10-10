import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { mobileApi, MobileApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const updateFarmer = useAuthStore((s) => s.updateFarmer);

  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Siwan');
  const [state, setState] = useState('Bihar');
  const [pinCode, setPinCode] = useState('841239');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setErrorMessage(t('validation.nameRequired', 'कृपया अपना पूरा नाम दर्ज करें'));
      return;
    }
    if (!village.trim()) {
      setErrorMessage(t('validation.villageRequired', 'कृपया अपने गाँव का नाम दर्ज करें'));
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await mobileApi.updateProfile({
        name: name.trim(),
        village: village.trim(),
        district: district.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
      });

      await updateFarmer({
        name: name.trim(),
        village: village.trim(),
        district: district.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
      });

      router.replace('/(farmer)/home');
    } catch (err) {
      if (err instanceof MobileApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          t('common.unknownError', 'प्रोफ़ाइल सहेजने में विफल, कृपया पुनः प्रयास करें')
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
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌾 {t('registration.title', 'किसान विवरण दर्ज करें')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{t('registration.personalInfo', 'अपनी जानकारी भरें')}</Text>
          <Text style={styles.subtitle}>
            फसल बेचने एवं समय पर भुगतान प्राप्त करने के लिए अपना सही पता दर्ज करें।
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('registration.fullName', 'पूरा नाम')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="उदा. रमेश कुमार"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('registration.village', 'गाँव का नाम')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="उदा. नवका टोला / मैरवा"
              placeholderTextColor="#9ca3af"
              value={village}
              onChangeText={setVillage}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('registration.district', 'ज़िला')}</Text>
              <TextInput
                style={styles.input}
                placeholder="उदा. सीवान"
                placeholderTextColor="#9ca3af"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('registration.state', 'राज्य')}</Text>
              <TextInput
                style={styles.input}
                placeholder="उदा. बिहार"
                placeholderTextColor="#9ca3af"
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('registration.pinCode', 'पिन कोड')}</Text>
            <TextInput
              style={styles.input}
              placeholder="841239"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              maxLength={6}
              value={pinCode}
              onChangeText={setPinCode}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                {t('common.continue', 'जारी रखें')} →
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#166534' },
  scrollContent: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 20 },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },
  formGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    marginTop: 16,
    height: 56,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: { backgroundColor: '#9ca3af', elevation: 0 },
  saveButtonText: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
});
