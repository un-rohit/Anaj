import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '@/lib/api-client';

const STAGES = [
  { key: 'SUBMITTED', hi: 'प्रस्तुत', en: 'Submitted' },
  { key: 'UNDER_REVIEW', hi: 'समीक्षाधीन', en: 'Under Review' },
  { key: 'RATE_OFFERED', hi: 'भाव प्रस्तावित', en: 'Rate Offered' },
  { key: 'ACCEPTED_BY_FARMER', hi: 'स्वीकृत', en: 'Accepted' },
  { key: 'SCHEDULED_FOR_PICKUP', hi: 'उठान तय', en: 'Pickup Scheduled' },
  { key: 'PICKUP_IN_PROGRESS', hi: 'उठान जारी', en: 'In Pickup' },
  { key: 'QUALITY_INSPECTION', hi: 'गुणवत्ता जांच', en: 'Inspection' },
  { key: 'FINAL_WEIGHT_CONFIRMED', hi: 'तौल पुष्ट', en: 'Weight Confirmed' },
  { key: 'PAYMENT_PROCESSING', hi: 'भुगतान जारी', en: 'Payment Processing' },
  { key: 'PAID', hi: 'भुगतान संपन्न', en: 'Paid' },
  { key: 'COMPLETED', hi: 'पूर्ण', en: 'Completed' },
];

export default function RequestsScreen() {
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: requests = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-requests'],
    queryFn: () => mobileApi.getMySellRequests(),
  });

  const isHindi = i18n.language === 'HI';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStageIndex = (status: string) => {
    return STAGES.findIndex((s) => s.key === status);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            📋 {isHindi ? 'मेरे फसल बिक्री अनुरोध' : 'My Sell Requests'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isHindi ? 'लाइव 12-चरणीय स्थिति ट्रैकर' : 'Live 12-Stage Status Tracker'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/(farmer)/sell')}
          accessibilityRole="button"
        >
          <Text style={styles.newBtnText}>+ {isHindi ? 'नया अनुरोध' : 'New'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>
            {isHindi ? 'अनुरोध लोड हो रहे हैं...' : 'Loading requests...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌾</Text>
              <Text style={styles.emptyTitle}>
                {isHindi ? 'अभी कोई बिक्री अनुरोध नहीं है' : 'No sell requests yet'}
              </Text>
              <Text style={styles.emptyDesc}>
                {isHindi
                  ? 'अपनी फसल बेचने के लिए नया अनुरोध भेजें और सीधी कीमत पाएं।'
                  : 'Submit a new sell request to connect directly with ANAJ company.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={() => router.push('/(farmer)/sell')}
              >
                <Text style={styles.emptyCtaText}>
                  {isHindi ? 'फसल बिक्री अनुरोध भेजें' : 'Submit Sell Request'} →
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            const currentIdx = getStageIndex(item.status);
            const isRejected = item.status === 'REJECTED';

            return (
              <View style={styles.card}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <View style={styles.refRow}>
                        <Text style={styles.refBadge}>{item.referenceNumber}</Text>
                        <Text style={styles.dateText}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.cropName}>
                        🌾 {isHindi ? item.product.nameHi : item.product.nameEn}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isRejected ? styles.statusBadgeRejected : styles.statusBadgeNormal,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isRejected && styles.statusBadgeTextRejected,
                        ]}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                      <Text style={styles.metricLabel}>{isHindi ? 'मात्रा' : 'Quantity'}</Text>
                      <Text style={styles.metricVal}>
                        {item.quantityInQuintals} {isHindi ? 'क्विंटल' : 'Qtl'}
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricLabel}>{isHindi ? 'कंपनी भाव' : 'Rate'}</Text>
                      <Text style={styles.metricVal}>
                        ₹{item.agreedRatePerQuintal || item.offeredRatePerQuintal}/Q
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricLabel}>{isHindi ? 'कुल राशि' : 'Amount'}</Text>
                      <Text style={[styles.metricVal, { color: '#16a34a' }]}>
                        ₹{(item.finalConfirmedAmount || item.totalEstimatedAmount).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Progress bar */}
                {!isRejected && (
                  <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(
                              100,
                              Math.max(10, ((currentIdx + 1) / STAGES.length) * 100)
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressNote}>
                      {isHindi ? 'चरण:' : 'Stage:'} {currentIdx + 1} / {STAGES.length} —{' '}
                      {STAGES[currentIdx]?.[isHindi ? 'hi' : 'en'] || item.status}
                    </Text>
                  </View>
                )}

                {/* Rejection Notice */}
                {isRejected && (
                  <View style={styles.rejectedBox}>
                    <Text style={styles.rejectedTitle}>
                      ❌ {isHindi ? 'अनुरोध अस्वीकृत' : 'Request Rejected'}
                    </Text>
                    <Text style={styles.rejectedReason}>
                      {item.rejectionReason || 'गुणवत्ता मानक या परिवहन अनुपलब्धता के कारण।'}
                    </Text>
                  </View>
                )}

                {/* Expandable Details */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{isHindi ? 'उठान का पता:' : 'Pickup:'}</Text>
                      <Text style={styles.detailValue}>
                        {item.pickupVillage}, {item.pickupDistrict} - {item.pickupPinCode}
                      </Text>
                    </View>
                    {item.notes ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{isHindi ? 'टिप्पणी:' : 'Notes:'}</Text>
                        <Text style={styles.detailValue}>{item.notes}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        {isHindi ? 'अंतिम अपडेट:' : 'Last Updated:'}
                      </Text>
                      <Text style={styles.detailValue}>
                        {new Date(item.updatedAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
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
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  newBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  listContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  refBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  dateText: { fontSize: 12, color: '#94a3b8' },
  cropName: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeNormal: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  statusBadgeRejected: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#1d4ed8' },
  statusBadgeTextRejected: { color: '#dc2626' },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  metric: { alignItems: 'center' },
  metricLabel: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  metricVal: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  progressBarWrapper: { marginTop: 12 },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: { height: '100%', backgroundColor: '#16a34a' },
  progressNote: { fontSize: 11, color: '#64748b' },
  rejectedBox: {
    marginTop: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
  },
  rejectedTitle: { fontSize: 12, fontWeight: '700', color: '#b91c1c', marginBottom: 2 },
  rejectedReason: { fontSize: 12, color: '#dc2626' },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: { fontSize: 13, color: '#64748b' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyCta: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyCtaText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
