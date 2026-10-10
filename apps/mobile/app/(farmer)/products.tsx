import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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

export default function ProductsScreen() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: rates = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['live-rates'],
    queryFn: () => mobileApi.getLiveRates(),
  });

  const isHindi = i18n.language === 'HI';

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredRates = rates.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.product.nameHi.toLowerCase().includes(q) ||
      r.product.nameEn.toLowerCase().includes(q) ||
      r.product.code.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🌾 {isHindi ? 'फसलें एवं आज के खरीद भाव' : 'Crops & Today Procurement Rates'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isHindi
            ? 'केवल अनाज कंपनी (प्रोपराइटर: एन.के. पटेल) द्वारा सीधी खरीद'
            : 'Direct purchase by ANAJ Company (Prop: NK.PATEL)'}
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder={isHindi ? '🔍 फसल का नाम खोजें...' : '🔍 Search crop name...'}
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>
            {isHindi ? 'भाव लोड हो रहे हैं...' : 'Loading rates...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌾</Text>
              <Text style={styles.emptyText}>
                {isHindi ? 'कोई फसल नहीं मिली' : 'No crops found'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cropName}>
                    {isHindi ? item.product.nameHi : item.product.nameEn}
                  </Text>
                  <Text style={styles.cropCode}>
                    {isHindi ? item.product.nameEn : item.product.nameHi} • कोड: {item.product.code}
                  </Text>
                </View>
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>1 क्विंटल = 100 किग्रा</Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>
                    {isHindi ? 'कंपनी खरीद भाव' : 'ANAJ Purchase Rate'}
                  </Text>
                  <Text style={styles.priceValue}>
                    ₹{item.ratePerQuintal.toLocaleString()}
                    <Text style={styles.priceUnit}> / क्विंटल</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.sellBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/(farmer)/sell',
                      params: { productId: item.productId },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.sellBtnText}>
                    {isHindi ? 'बेचें' : 'Sell'} →
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rangeFooter}>
                <Text style={styles.rangeText}>
                  न्यूनतम: ₹{item.minRate} • अधिकतम: ₹{item.maxRate} (गुणात्मक आधार पर)
                </Text>
              </View>
            </View>
          )}
        />
      )}
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#16a34a', fontWeight: '600', marginBottom: 12 },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  listContent: { padding: 16, gap: 12 },
  productCard: {
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cropName: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  cropCode: { fontSize: 12, color: '#64748b', marginTop: 2 },
  unitBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  unitBadgeText: { fontSize: 11, fontWeight: '700', color: '#166534' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceLabel: { fontSize: 12, color: '#64748b' },
  priceValue: { fontSize: 22, fontWeight: '800', color: '#16a34a' },
  priceUnit: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  sellBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sellBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  rangeFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  rangeText: { fontSize: 11, color: '#94a3b8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#64748b' },
});
