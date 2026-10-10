import { useState, useEffect } from 'react';
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
  Modal,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi, MobileApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export default function SellScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ productId?: string }>();
  const queryClient = useQueryClient();
  const farmer = useAuthStore((s) => s.farmer);

  const [selectedProductId, setSelectedProductId] = useState<string>(params.productId || '');
  const [unitMode, setUnitMode] = useState<'QUINTAL' | 'KG'>('QUINTAL');
  const [quantityInput, setQuantityInput] = useState('');
  const [village, setVillage] = useState(farmer?.village || 'Navaka Tola');
  const [district, setDistrict] = useState(farmer?.district || 'Siwan');
  const [pinCode, setPinCode] = useState(farmer?.pinCode || '841239');
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isHindi = i18n.language === 'HI';

  // Fetch Live Rates
  const { data: rates = [], isLoading: isRatesLoading } = useQuery({
    queryKey: ['live-rates'],
    queryFn: () => mobileApi.getLiveRates(),
  });

  // Set default product if none selected
  useEffect(() => {
    if (!selectedProductId && rates.length > 0) {
      const match = params.productId
        ? rates.find((r) => r.productId === params.productId)
        : rates[0];
      if (match) setSelectedProductId(match.productId);
      else if (rates[0]) setSelectedProductId(rates[0].productId);
    }
  }, [rates, params.productId, selectedProductId]);

  const selectedRate = rates.find((r) => r.productId === selectedProductId);

  // Calculate quantity in quintals
  const rawQty = parseFloat(quantityInput) || 0;
  const quantityInQuintals = unitMode === 'QUINTAL' ? rawQty : rawQty / 100;
  const estimatedAmount = selectedRate ? quantityInQuintals * selectedRate.ratePerQuintal : 0;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const clientRequestId =
        'mob-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

      return mobileApi.submitSellRequest({
        productId: selectedProductId,
        quantityInQuintals,
        pickupVillage: village.trim(),
        pickupDistrict: district.trim(),
        pickupPinCode: pinCode.trim(),
        notes: notes.trim() || undefined,
        clientRequestId,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      setShowConfirmModal(false);
      Alert.alert(
        isHindi ? 'अनुरोध सफलतापूर्वक भेजा गया!' : 'Request Submitted Successfully!',
        isHindi
          ? 'अनाज कंपनी आपके अनुरोध की समीक्षा करेगी। आप अपनी स्थिति यहां देख सकते हैं।'
          : 'ANAJ company will review your request. You can track its status here.',
        [{ text: 'OK', onPress: () => router.push('/(farmer)/requests') }]
      );
    },
    onError: (err) => {
      setShowConfirmModal(false);
      if (err instanceof MobileApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('अनुरोध सबमिट करने में विफल, कृपया पुनः प्रयास करें।');
      }
    },
  });

  const handleValidateAndOpenConfirm = () => {
    if (!selectedProductId) {
      setErrorMessage(isHindi ? 'कृपया फसल का चयन करें' : 'Please select a crop');
      return;
    }
    if (quantityInQuintals <= 0) {
      setErrorMessage(
        isHindi ? 'कृपया मान्य मात्रा दर्ज करें (कम से कम 1 किग्रा या 0.01 क्विंटल)' : 'Please enter a valid quantity'
      );
      return;
    }
    if (!village.trim() || !district.trim() || !pinCode.trim()) {
      setErrorMessage(
        isHindi ? 'कृपया पूरा उठाव (Pickup) पता दर्ज करें' : 'Please enter full pickup address'
      );
      return;
    }
    setErrorMessage('');
    setShowConfirmModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← {t('common.back', 'वापस')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌾 {isHindi ? 'फसल बिक्री अनुरोध' : 'Sell Produce'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* Step 1: Select Crop */}
          <Text style={styles.sectionHeading}>
            1. {isHindi ? 'फसल का चयन करें' : 'Select Agricultural Crop'}
          </Text>
          {isRatesLoading ? (
            <ActivityIndicator color="#16a34a" style={{ marginVertical: 12 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cropsScroll}
            >
              {rates.map((rate) => {
                const isSelected = rate.productId === selectedProductId;
                return (
                  <TouchableOpacity
                    key={rate.id}
                    onPress={() => setSelectedProductId(rate.productId)}
                    style={[styles.cropChip, isSelected && styles.cropChipSelected]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.cropChipTitle, isSelected && styles.cropChipTitleSelected]}>
                      {isHindi ? rate.product.nameHi : rate.product.nameEn}
                    </Text>
                    <Text style={[styles.cropChipPrice, isSelected && styles.cropChipPriceSelected]}>
                      ₹{rate.ratePerQuintal}/क्विंटल
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Step 2: Quantity & Unit */}
          <View style={styles.stepBlock}>
            <View style={styles.stepHeaderRow}>
              <Text style={styles.sectionHeading}>
                2. {isHindi ? 'फसल की मात्रा दर्ज करें' : 'Enter Quantity'}
              </Text>
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[styles.unitBtn, unitMode === 'QUINTAL' && styles.unitBtnActive]}
                  onPress={() => setUnitMode('QUINTAL')}
                >
                  <Text
                    style={[styles.unitBtnText, unitMode === 'QUINTAL' && styles.unitBtnTextActive]}
                  >
                    क्विंटल (Quintal)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitBtn, unitMode === 'KG' && styles.unitBtnActive]}
                  onPress={() => setUnitMode('KG')}
                >
                  <Text
                    style={[styles.unitBtnText, unitMode === 'KG' && styles.unitBtnTextActive]}
                  >
                    किलोग्राम (KG)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quantityInputBox}>
              <TextInput
                style={styles.quantityInput}
                placeholder={unitMode === 'QUINTAL' ? 'उदा. 25' : 'उदा. 2500'}
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={quantityInput}
                onChangeText={setQuantityInput}
              />
              <Text style={styles.quantitySuffix}>
                {unitMode === 'QUINTAL' ? 'क्विंटल' : 'KG'}
              </Text>
            </View>
            <Text style={styles.conversionNote}>
              💡 1 क्विंटल = 100 किलोग्राम | आपकी मात्रा:{' '}
              <Text style={{ fontWeight: '700', color: '#16a34a' }}>
                {quantityInQuintals.toFixed(2)} क्विंटल ({Math.round(quantityInQuintals * 100)} KG)
              </Text>
            </Text>
          </View>

          {/* Step 3: Estimated Calculation Card */}
          {selectedRate && quantityInQuintals > 0 ? (
            <View style={styles.calcCard}>
              <Text style={styles.calcTitle}>
                💰 {isHindi ? 'अनुमानित कुल आय (Estimated Payout)' : 'Estimated Total Payout'}
              </Text>
              <Text style={styles.calcFormula}>
                {quantityInQuintals.toFixed(2)} क्विंटल × ₹{selectedRate.ratePerQuintal}/क्विंटल
              </Text>
              <Text style={styles.calcTotal}>₹{Math.round(estimatedAmount).toLocaleString()}</Text>
              <Text style={styles.calcSub}>
                * अंतिम भुगतान उठान के समय सटीक इलेक्ट्रॉनिक तौल व गुणवत्ता के आधार पर होगा।
              </Text>
            </View>
          ) : null}

          {/* Step 4: Pickup Details */}
          <Text style={styles.sectionHeading}>
            3. {isHindi ? 'फसल उठाने का पता (Pickup Address)' : 'Pickup Location'}
          </Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{isHindi ? 'गाँव / टोला' : 'Village'} *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="गाँव का नाम"
              value={village}
              onChangeText={setVillage}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{isHindi ? 'ज़िला' : 'District'} *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="ज़िला"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{isHindi ? 'पिन कोड' : 'PIN Code'} *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="841239"
                keyboardType="number-pad"
                value={pinCode}
                onChangeText={setPinCode}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {isHindi ? 'अतिरिक्त टिप्पणी (वैकल्पिक)' : 'Notes (Optional)'}
            </Text>
            <TextInput
              style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
              placeholder={isHindi ? 'उदा. सूखी साफ फसल, सड़क किनारे उपलब्ध' : 'Crop condition, pickup details'}
              placeholderTextColor="#9ca3af"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (quantityInQuintals <= 0 || submitMutation.isPending) && styles.submitBtnDisabled,
            ]}
            onPress={handleValidateAndOpenConfirm}
            disabled={quantityInQuintals <= 0 || submitMutation.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {isHindi ? 'अनुरोध की समीक्षा करें एवं भेजें' : 'Review & Submit Request'} →
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                🌾 {isHindi ? 'फसल बिक्री की पुष्टि करें' : 'Confirm Produce Sale'}
              </Text>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>{isHindi ? 'फसल:' : 'Crop:'}</Text>
                <Text style={styles.modalValue}>
                  {selectedRate
                    ? isHindi
                      ? selectedRate.product.nameHi
                      : selectedRate.product.nameEn
                    : '-'}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>{isHindi ? 'मात्रा:' : 'Quantity:'}</Text>
                <Text style={styles.modalValue}>
                  {quantityInQuintals.toFixed(2)} क्विंटल ({Math.round(quantityInQuintals * 100)} किग्रा)
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>{isHindi ? 'कंपनी भाव:' : 'Rate:'}</Text>
                <Text style={styles.modalValue}>
                  ₹{selectedRate?.ratePerQuintal}/क्विंटल
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>{isHindi ? 'अनुमानित आय:' : 'Est. Total:'}</Text>
                <Text style={[styles.modalValue, { color: '#16a34a', fontWeight: '800' }]}>
                  ₹{Math.round(estimatedAmount).toLocaleString()}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalLabel}>{isHindi ? 'उठान पता:' : 'Pickup:'}</Text>
                <Text style={styles.modalValue}>
                  {village}, {district} - {pinCode}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowConfirmModal(false)}
                  disabled={submitMutation.isPending}
                >
                  <Text style={styles.modalCancelText}>{t('common.cancel', 'रद्द करें')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>
                      {isHindi ? 'हाँ, अनुरोध भेजें' : 'Confirm & Submit'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  backBtn: { paddingVertical: 4 },
  backBtnText: { fontSize: 15, color: '#16a34a', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  cropsScroll: { gap: 10, paddingBottom: 16 },
  cropChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cropChipSelected: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  cropChipTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  cropChipTitleSelected: { color: '#166534' },
  cropChipPrice: { fontSize: 13, color: '#64748b', marginTop: 2 },
  cropChipPriceSelected: { color: '#15803d', fontWeight: '700' },
  stepBlock: { marginTop: 8, marginBottom: 16 },
  stepHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 3,
  },
  unitBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  unitBtnActive: { backgroundColor: '#16a34a' },
  unitBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  unitBtnTextActive: { color: '#ffffff' },
  quantityInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#16a34a',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  quantityInput: {
    flex: 1,
    height: 54,
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  quantitySuffix: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
  conversionNote: { fontSize: 12, color: '#64748b', marginTop: 6 },
  calcCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  calcTitle: { fontSize: 14, fontWeight: '700', color: '#166534', marginBottom: 4 },
  calcFormula: { fontSize: 13, color: '#15803d', marginBottom: 6 },
  calcTotal: { fontSize: 32, fontWeight: '900', color: '#15803d', marginBottom: 6 },
  calcSub: { fontSize: 11, color: '#166534', lineHeight: 16 },
  formGroup: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 6 },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#9ca3af', elevation: 0 },
  submitBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalLabel: { fontSize: 14, color: '#64748b' },
  modalValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '700', color: '#64748b' },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
});
