import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { mobileApi } from '@/lib/api-client';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const farmer = useAuthStore((s) => s.farmer);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: rates = [],
    isLoading: isRatesLoading,
    refetch: refetchRates,
  } = useQuery({
    queryKey: ['live-rates'],
    queryFn: () => mobileApi.getLiveRates(),
  });

  const {
    data: myRequests = [],
    isLoading: isRequestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['my-requests'],
    queryFn: () => mobileApi.getMySellRequests(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchRates(), refetchRequests()]);
    setRefreshing(false);
  };

  const isHindi = i18n.language === 'HI';
  const recentRequest = myRequests[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandSubtitle}>
            {isHindi ? 'अनाज खरीद मंच' : 'Procurement Platform'}
          </Text>
          <Text style={styles.greeting}>
            {isHindi
              ? `नमस्ते, ${farmer?.name || 'किसान साथी'}`
              : `Hello, ${farmer?.name || 'Farmer Partner'}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.callHeaderBtn}
          onPress={() => Linking.openURL('tel:7061654008')}
          accessibilityRole="button"
        >
          <Text style={styles.callIcon}>📞</Text>
          <Text style={styles.callLabel}>
            {isHindi ? 'मदद' : 'Help'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
        }
      >
        {/* Sell Produce Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              {isHindi ? '🌾 सीधे अनाज कंपनी को बेचें' : '🌾 Direct Procurement by ANAJ'}
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            {isHindi ? 'अपनी फसल की सही कीमत पाएं' : 'Get Fair & Instant Rate For Your Produce'}
          </Text>
          <Text style={styles.heroDesc}>
            {isHindi
              ? 'खेत से सीधी उठान • पारदर्शी तौल • सीधा बैंक खाते में भुगतान'
              : 'Direct Farm Pickup • Accurate Digital Weighing • Instant Bank Transfer'}
          </Text>

          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => router.push('/(farmer)/sell')}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.heroCtaText}>
              {isHindi ? 'फसल बिक्री का अनुरोध भेजें' : 'Submit Sell Request'} →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Request Alert if any */}
        {recentRequest ? (
          <View style={styles.recentCard}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>
                {isHindi ? 'हाल का अनुरोध:' : 'Recent Request:'}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{recentRequest.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <Text style={styles.recentCrop}>
              🌾 {isHindi ? recentRequest.product.nameHi : recentRequest.product.nameEn} —{' '}
              {recentRequest.quantityInQuintals} {isHindi ? 'क्विंटल' : 'Quintals'}
            </Text>
            <Text style={styles.recentRef}>
              {recentRequest.referenceNumber} •{' '}
              {new Date(recentRequest.createdAt).toLocaleDateString()}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(farmer)/requests')}
              style={styles.recentLink}
            >
              <Text style={styles.recentLinkText}>
                {isHindi ? 'विवरण एवं स्थिति देखें' : 'View Details & Status'} →
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Live Procurement Rates */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            📊 {isHindi ? 'आज के खरीद भाव (प्रति क्विंटल)' : 'Today Live Rates (Per Quintal)'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(farmer)/products')}>
            <Text style={styles.sectionAction}>
              {isHindi ? 'सभी देखें' : 'View All'} →
            </Text>
          </TouchableOpacity>
        </View>

        {isRatesLoading ? (
          <ActivityIndicator color="#16a34a" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.ratesGrid}>
            {rates.slice(0, 6).map((rate) => (
              <View key={rate.id} style={styles.rateCard}>
                <View style={styles.rateCardTop}>
                  <Text style={styles.rateCropName}>
                    {isHindi ? rate.product.nameHi : rate.product.nameEn}
                  </Text>
                  <Text style={styles.rateUnit}>/ क्विंटल</Text>
                </View>
                <Text style={styles.ratePrice}>₹{rate.ratePerQuintal.toLocaleString()}</Text>
                <Text style={styles.rateRange}>
                  रेंज: ₹{rate.minRate} - ₹{rate.maxRate}
                </Text>
                <TouchableOpacity
                  style={styles.rateSellBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(farmer)/sell',
                      params: { productId: rate.productId },
                    })
                  }
                >
                  <Text style={styles.rateSellBtnText}>
                    {isHindi ? 'बेचें' : 'Sell'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ANAJ Verified Info Card */}
        <View style={styles.companyCard}>
          <View style={styles.companyHeader}>
            <Text style={styles.companyEmoji}>🏢</Text>
            <View>
              <Text style={styles.companyTitle}>अनाज (ANAJ) कृषि खरीद केंद्र</Text>
              <Text style={styles.companyOwner}>प्रोपराइटर: श्री एन.के. पटेल (NK.PATEL)</Text>
            </View>
          </View>
          <Text style={styles.companyAddress}>
            📍 नवका टोला, मैरवा, सीवान, बिहार - पिन 841239
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('tel:7061654008')}
            >
              <Text style={styles.contactBtnText}>📞 कॉल करें: 7061654008</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  brandSubtitle: { fontSize: 12, fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' },
  greeting: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  callHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 4,
  },
  callIcon: { fontSize: 14 },
  callLabel: { fontSize: 13, fontWeight: '700', color: '#166534' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  heroCard: {
    backgroundColor: '#15803d',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 6, lineHeight: 28 },
  heroDesc: { fontSize: 13, color: '#dcfce7', lineHeight: 18, marginBottom: 18 },
  heroCta: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  heroCtaText: { color: '#15803d', fontSize: 16, fontWeight: '800' },
  recentCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recentTitle: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  statusPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  statusText: { fontSize: 11, fontWeight: '700', color: '#1d4ed8' },
  recentCrop: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  recentRef: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  recentLink: { alignSelf: 'flex-start' },
  recentLinkText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  sectionAction: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  ratesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  rateCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
  },
  rateCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  rateCropName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  rateUnit: { fontSize: 11, color: '#64748b' },
  ratePrice: { fontSize: 20, fontWeight: '800', color: '#16a34a', marginBottom: 4 },
  rateRange: { fontSize: 11, color: '#64748b', marginBottom: 12 },
  rateSellBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  rateSellBtnText: { color: '#166534', fontSize: 13, fontWeight: '700' },
  companyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
  },
  companyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  companyEmoji: { fontSize: 28 },
  companyTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  companyOwner: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  companyAddress: { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 12 },
  contactButtons: { flexDirection: 'row', gap: 8 },
  contactBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  contactBtnText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
});
