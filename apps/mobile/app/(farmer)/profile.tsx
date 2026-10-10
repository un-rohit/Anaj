import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const farmer = useAuthStore((s) => s.farmer);
  const logout = useAuthStore((s) => s.logout);
  const { language, setLanguage } = useLanguageStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isHindi = i18n.language === 'HI';

  const handleLogout = () => {
    Alert.alert(
      isHindi ? 'लॉगआउट की पुष्टि करें' : 'Confirm Logout',
      isHindi
        ? 'क्या आप सचमुच अपने खाते से लॉगआउट करना चाहते हैं?'
        : 'Are you sure you want to log out from ANAJ?',
      [
        { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
        {
          text: isHindi ? 'लॉगआउट' : 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          👤 {isHindi ? 'मेरी प्रोफ़ाइल एवं सेटिंग्स' : 'My Profile & Settings'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👨‍🌾</Text>
          </View>
          <Text style={styles.farmerName}>{farmer?.name || 'किसान साथी'}</Text>
          <Text style={styles.farmerPhone}>+91 {farmer?.phone}</Text>

          <View
            style={[
              styles.verifiedBadge,
              farmer?.isVerified ? styles.verifiedTrue : styles.verifiedPending,
            ]}
          >
            <Text
              style={[
                styles.verifiedText,
                farmer?.isVerified ? styles.verifiedTextTrue : styles.verifiedTextPending,
              ]}
            >
              {farmer?.isVerified
                ? isHindi
                  ? '✓ सत्यापित किसान (Verified Farmer)'
                  : '✓ Verified Farmer'
                : isHindi
                ? '⏳ सत्यापन समीक्षाधीन'
                : '⏳ Pending Verification'}
            </Text>
          </View>
        </View>

        {/* Address Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📍 {isHindi ? 'पंजीकृत पता (Registered Address)' : 'Registered Address'}
          </Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{isHindi ? 'गाँव / टोला:' : 'Village:'}</Text>
            <Text style={styles.detailValue}>{farmer?.village || 'नवका टोला'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{isHindi ? 'ज़िला:' : 'District:'}</Text>
            <Text style={styles.detailValue}>{farmer?.district || 'सीवान'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{isHindi ? 'राज्य:' : 'State:'}</Text>
            <Text style={styles.detailValue}>{farmer?.state || 'बिहार'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{isHindi ? 'पिन कोड:' : 'PIN Code:'}</Text>
            <Text style={styles.detailValue}>{farmer?.pinCode || '841239'}</Text>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🌐 {isHindi ? 'भाषा चुनें (Select Language)' : 'App Language'}
          </Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'HI' && styles.langBtnActive]}
              onPress={() => void setLanguage('HI')}
              activeOpacity={0.8}
            >
              <Text style={styles.langEmoji}>🇮🇳</Text>
              <Text style={[styles.langText, language === 'HI' && styles.langTextActive]}>
                हिन्दी (Hindi)
              </Text>
              {language === 'HI' && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langBtn, language === 'EN' && styles.langBtnActive]}
              onPress={() => void setLanguage('EN')}
              activeOpacity={0.8}
            >
              <Text style={styles.langEmoji}>🌐</Text>
              <Text style={[styles.langText, language === 'EN' && styles.langTextActive]}>
                English
              </Text>
              {language === 'EN' && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Company & Support Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🏢 {isHindi ? 'अनाज खरीद केंद्र सहायता' : 'ANAJ Procurement Support'}
          </Text>
          <Text style={styles.companySub}>
            प्रोपराइटर: <Text style={{ fontWeight: '700', color: '#16a34a' }}>श्री एन.के. पटेल (NK.PATEL)</Text>
          </Text>
          <Text style={styles.companySub}>
            📍 नवका टोला, मैरवा, सीवान, बिहार - 841239
          </Text>
          <Text style={styles.companySub}>
            📧 anajsellkishan01@gamil.com
          </Text>

          <TouchableOpacity
            style={styles.callSupportBtn}
            onPress={() => Linking.openURL('tel:7061654008')}
          >
            <Text style={styles.callSupportBtnText}>
              📞 {isHindi ? 'कंपनी को कॉल करें: 7061654008' : 'Call Owner: 7061654008'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text style={styles.logoutBtnText}>
              🚪 {isHindi ? 'लॉगआउट करें (Logout)' : 'Logout'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#86efac',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 36 },
  farmerName: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  farmerPhone: { fontSize: 15, color: '#64748b', marginBottom: 12 },
  verifiedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedTrue: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  verifiedPending: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fde68a' },
  verifiedText: { fontSize: 12, fontWeight: '700' },
  verifiedTextTrue: { color: '#166534' },
  verifiedTextPending: { color: '#92400e' },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  detailLabel: { fontSize: 14, color: '#64748b' },
  detailValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  langRow: { flexDirection: 'row', gap: 12 },
  langBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
  },
  langBtnActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  langEmoji: { fontSize: 18 },
  langText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  langTextActive: { color: '#16a34a' },
  check: { fontSize: 14, color: '#16a34a', fontWeight: '800' },
  companySub: { fontSize: 13, color: '#64748b', lineHeight: 20, marginBottom: 4 },
  callSupportBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  callSupportBtnText: { color: '#166534', fontSize: 14, fontWeight: '800' },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: { color: '#dc2626', fontSize: 16, fontWeight: '700' },
});
