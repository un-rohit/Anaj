import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '@/lib/api-client';

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: allRequests = [],
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

  const completedRequests = allRequests.filter(
    (r) => r.status === 'PAID' || r.status === 'COMPLETED'
  );

  const totalEarnings = completedRequests.reduce(
    (sum, r) => sum + (r.finalConfirmedAmount || r.totalEstimatedAmount || 0),
    0
  );

  const totalQuintals = completedRequests.reduce(
    (sum, r) => sum + (r.quantityInQuintals || 0),
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          📊 {isHindi ? 'भुगतान एवं बिक्री इतिहास' : 'Payment & Sales History'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isHindi ? 'सफलतापूर्वक पूर्ण हुए खरीद सौदे' : 'Completed Procurement Orders'}
        </Text>
      </View>

      <FlatList
        data={completedRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
        }
        ListHeaderComponent={
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                {isHindi ? 'कुल प्राप्त भुगतान (Total Earnings)' : 'Total Received Payment'}
              </Text>
              <Text style={styles.summaryValue}>₹{totalEarnings.toLocaleString()}</Text>
              <View style={styles.summaryStatsRow}>
                <View>
                  <Text style={styles.statLabel}>{isHindi ? 'कुल तौल' : 'Total Sold'}</Text>
                  <Text style={styles.statVal}>
                    {totalQuintals.toFixed(2)} {isHindi ? 'क्विंटल' : 'Qtl'}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View>
                  <Text style={styles.statLabel}>{isHindi ? 'सफल लेन-देन' : 'Orders'}</Text>
                  <Text style={styles.statVal}>{completedRequests.length}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              {isHindi ? 'भुगतान रसीदें / विवरण' : 'Payment Invoices / Records'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#16a34a" style={{ marginVertical: 32 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📜</Text>
              <Text style={styles.emptyTitle}>
                {isHindi ? 'अभी कोई पूर्ण लेनदेन नहीं है' : 'No completed sales yet'}
              </Text>
              <Text style={styles.emptyDesc}>
                {isHindi
                  ? 'जब अनाज कंपनी आपकी फसल का उठान और भुगतान पूरा करेगी, तब आपका इतिहास यहाँ दिखाई देगा।'
                  : 'Once ANAJ company completes pickup and payment, your records will appear here.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.receiptCard}>
            <View style={styles.receiptTop}>
              <View>
                <Text style={styles.refBadge}>{item.referenceNumber}</Text>
                <Text style={styles.cropName}>
                  🌾 {isHindi ? item.product.nameHi : item.product.nameEn}
                </Text>
              </View>
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>✓ {item.status}</Text>
              </View>
            </View>

            <View style={styles.receiptGrid}>
              <View>
                <Text style={styles.gridLabel}>{isHindi ? 'मात्रा' : 'Quantity'}</Text>
                <Text style={styles.gridValue}>
                  {item.quantityInQuintals} {isHindi ? 'क्विंटल' : 'Qtl'}
                </Text>
              </View>
              <View>
                <Text style={styles.gridLabel}>{isHindi ? 'तय भाव' : 'Agreed Rate'}</Text>
                <Text style={styles.gridValue}>
                  ₹{item.agreedRatePerQuintal || item.offeredRatePerQuintal}/Q
                </Text>
              </View>
              <View>
                <Text style={styles.gridLabel}>{isHindi ? 'भुगतान राशि' : 'Paid Amount'}</Text>
                <Text style={[styles.gridValue, { color: '#16a34a', fontWeight: '800' }]}>
                  ₹{(item.finalConfirmedAmount || item.totalEstimatedAmount).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.receiptFooter}>
              <Text style={styles.footerDate}>
                {isHindi ? 'दिनांक:' : 'Date:'} {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
              <Text style={styles.footerVerified}>
                🔒 प्रत्यक्ष बैंक हस्तांतरण (Direct Bank Transfer)
              </Text>
            </View>
          </View>
        )}
      />
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
  headerSubtitle: { fontSize: 13, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  listContent: { padding: 16, gap: 12 },
  summaryContainer: { marginBottom: 12 },
  summaryCard: {
    backgroundColor: '#166534',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryLabel: { fontSize: 13, color: '#bbf7d0', fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: 16 },
  summaryStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: '#dcfce7', textAlign: 'center' },
  statVal: { fontSize: 16, fontWeight: '800', color: '#ffffff', textAlign: 'center', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  receiptCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
  },
  receiptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  refBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  cropName: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  paidBadge: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paidBadgeText: { fontSize: 11, fontWeight: '800', color: '#166534' },
  receiptGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  gridLabel: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  gridValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  receiptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerDate: { fontSize: 11, color: '#64748b' },
  footerVerified: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
});
