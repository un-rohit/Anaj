'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FarmerNav } from '@/components/FarmerNav';
import {
  getProducts,
  createSellRequest,
  type ProductItem,
  ApiError,
} from '@/lib/api-client';
import {
  Wheat,
  Sprout,
  Calculator,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-wheat',
    slug: 'wheat',
    name: 'गेहूं (Wheat)',
    description: 'मध्यम और उच्च गुणवत्ता का गेहूं',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 1,
    currentRate: { id: 'r1', ratePerQuintal: '2200.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-paddy',
    slug: 'paddy',
    name: 'धान (Paddy)',
    description: 'खरीफ मौसम की ताजा धान',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 2,
    currentRate: { id: 'r2', ratePerQuintal: '2183.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-rice',
    slug: 'rice',
    name: 'चावल (Rice)',
    description: 'साफ और सूखा चावल',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 3,
    currentRate: { id: 'r3', ratePerQuintal: '3100.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-maize',
    slug: 'maize',
    name: 'मक्का (Maize)',
    description: 'पीली दानेदार सूखी मक्का',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 4,
    currentRate: { id: 'r4', ratePerQuintal: '2090.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-mustard',
    slug: 'mustard',
    name: 'सरसों (Mustard)',
    description: 'उच्च तेल मात्रा वाली सरसों',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 5,
    currentRate: { id: 'r5', ratePerQuintal: '5650.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-bajra',
    slug: 'bajra',
    name: 'बाजरा (Bajra)',
    description: 'साफ और सूखा बाजरा',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 6,
    currentRate: { id: 'r6', ratePerQuintal: '2500.00', effectiveFrom: '2026-10-10' },
  },
  {
    id: 'prod-arhar',
    slug: 'arhar',
    name: 'अरहर (Arhar / Pigeon Pea)',
    description: 'साफ अरहर दाल बीज',
    imageUrl: null,
    isActive: true,
    allowedUnits: ['QUINTAL', 'KG'],
    sortOrder: 7,
    currentRate: { id: 'r7', ratePerQuintal: '7000.00', effectiveFrom: '2026-10-10' },
  },
];

export default function SellProducePage() {
  const locale = useLocale() as 'hi' | 'en';
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('farmerWeb');
  const tc = useTranslations('common');

  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('20');
  const [unit, setUnit] = useState<'QUINTAL' | 'KG'>('QUINTAL');
  const [address, setAddress] = useState<string>('ग्राम: नवका टोला, पोस्ट: मैरवा, जिला: सीवान, बिहार, पिन: 841239');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  useEffect(() => {
    async function loadCrops() {
      try {
        const prodList = await getProducts(locale).catch(() => FALLBACK_PRODUCTS);
        if (prodList && prodList.length > 0) {
          setProducts(prodList);

          const preCrop = searchParams.get('crop');
          const matched = preCrop ? prodList.find((p) => p.slug === preCrop) : prodList[0];
          setSelectedProductId(matched ? matched.id : prodList[0]!.id);
        }
      } catch {
        // fallback
      }
    }
    loadCrops();
  }, [locale, searchParams]);

  const selectedCrop = products.find((p) => p.id === selectedProductId) || products[0];
  const ratePerQuintal = selectedCrop?.currentRate?.ratePerQuintal
    ? parseFloat(selectedCrop.currentRate.ratePerQuintal)
    : 2200;

  // Compute estimated earnings
  const numQty = parseFloat(quantity) || 0;
  const qtyInQuintals = unit === 'QUINTAL' ? numQty : numQty / 100;
  const estimatedPayable = qtyInQuintals * ratePerQuintal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if farmer is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('anaj_farmer_token') : null;
    if (!token) {
      router.push(`${prefix}/farmer/login`);
      return;
    }

    if (numQty <= 0) {
      setError(locale === 'hi' ? 'कृपया शून्य से अधिक मात्रा दर्ज करें' : 'Please enter quantity greater than 0');
      return;
    }

    if (!address.trim()) {
      setError(locale === 'hi' ? 'कृपया फसल संग्रह का पता दर्ज करें' : 'Please enter pickup collection address');
      return;
    }

    setLoading(true);
    try {
      const clientRequestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
      const res = await createSellRequest({
        productId: selectedCrop!.id,
        quantity: numQty.toString(),
        unit,
        collectionAddress: address.trim(),
        preferredCollectionDate: preferredDate || undefined,
        notes: notes.trim() || undefined,
        clientRequestId,
      });

      setSubmittedRef(res.reference || 'ANJ-2026-SUBMITTED');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'UNAUTHORIZED') {
          router.push(`${prefix}/farmer/login`);
        } else {
          setError(err.message);
        }
      } else {
        setError(locale === 'hi' ? 'अनुरोध दर्ज करने में त्रुटि आई। कृपया पुनः प्रयास करें।' : 'Failed to submit request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <FarmerNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full mb-2">
            <Sprout className="h-3.5 w-3.5" />
            <span>{locale === 'hi' ? 'सीधी खरीद प्रपत्र' : 'Direct Procurement Form'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {t('sellYourCrop')}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            {t('sellYourCropSubtitle')}
          </p>
        </div>

        {/* Success Modal / Card */}
        {submittedRef ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {locale === 'hi' ? 'बिक्री अनुरोध सफलतापूर्वक दर्ज किया गया!' : 'Sell Request Submitted Successfully!'}
            </h2>
            <div className="mt-4 inline-block rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-3">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                {locale === 'hi' ? 'अनुरोध संदर्भ संख्या' : 'Request Reference Number'}
              </p>
              <p className="text-2xl font-black text-emerald-950 font-mono tracking-wider mt-1">
                {submittedRef}
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-600 max-w-md mx-auto">
              {locale === 'hi'
                ? 'अनाज कंपनी की टीम आपके अनुरोध की समीक्षा करेगी और संग्रह की पुष्टि करेगी। आप अपने अनुरोध की प्रगति किसी भी समय ट्रैक कर सकते हैं।'
                : 'ANAJ company will review your request and confirm pickup schedule. You can track status at any time.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`${prefix}/farmer/requests`}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
              >
                <span>{t('viewTracking')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="rounded-2xl border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                {locale === 'hi' ? 'नया अनुरोध दर्ज करें' : 'Submit Another Request'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* 1. Crop Selection Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <label className="block text-sm font-extrabold text-gray-900 mb-4">
                1. {t('selectCrop')}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((crop) => {
                  const isSelected = crop.id === selectedProductId;
                  const rateStr = crop.currentRate?.ratePerQuintal
                    ? parseFloat(crop.currentRate.ratePerQuintal).toLocaleString('en-IN')
                    : '2,200';

                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => setSelectedProductId(crop.id)}
                      className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-150 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                          : 'border-gray-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Wheat
                          className={`h-5 w-5 ${isSelected ? 'text-emerald-700' : 'text-gray-400'}`}
                        />
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{crop.name}</span>
                      <span className="mt-1 text-xs font-black text-emerald-800">
                        ₹{rateStr} / Q
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Quantity & Calculator Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <label className="block text-sm font-extrabold text-gray-900 mb-4">
                2. {t('quantity')} एवं {t('unit')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                {/* Quantity Input */}
                <div>
                  <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    {locale === 'hi' ? 'मात्रा दर्ज करें' : 'Enter Quantity'}
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3.5 text-xl font-bold text-gray-900 border border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                {/* Unit Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    {t('unit')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setUnit('QUINTAL')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        unit === 'QUINTAL'
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {locale === 'hi' ? 'क्विंटल (Quintal)' : 'Quintal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('KG')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        unit === 'KG'
                          ? 'bg-white text-emerald-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {locale === 'hi' ? 'किलो (KG)' : 'Kilograms (KG)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion helper note */}
              <p className="mt-3 text-xs text-gray-500">
                ℹ️ 1 क्विंटल = 100 किलोग्राम (1 Quintal = 100 KG)
              </p>

              {/* Dynamic Estimated Earnings Banner */}
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-green-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {t('estimatedEarnings')}
                  </span>
                  <div className="text-3xl font-black text-amber-300 mt-0.5">
                    ₹{estimatedPayable > 0 ? estimatedPayable.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
                  </div>
                </div>

                <div className="text-xs text-emerald-200 sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-700/60 pt-3 sm:pt-0 sm:pl-5">
                  <p>
                    {locale === 'hi' ? 'लागू दर:' : 'Applied rate:'}{' '}
                    <span className="font-bold text-white">₹{ratePerQuintal.toLocaleString('en-IN')}/क्विंटल</span>
                  </p>
                  <p className="mt-1">
                    {locale === 'hi' ? 'अंतिम राशि तौल के बाद स्वीकृत होगी' : 'Final amount determined upon weighment'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Pickup Details Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <label className="block text-sm font-extrabold text-gray-900 mb-4">
                3. {t('collectionAddress')} एवं तारीख
              </label>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                    {t('collectionAddress')} *
                  </label>
                  <textarea
                    id="address"
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={locale === 'hi' ? 'गाँव, पोस्ट, जिला, राज्य, पिन कोड' : 'Village, Post, District, State, PIN code'}
                    className="w-full px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prefDate" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      {t('preferredDate')}
                    </label>
                    <input
                      id="prefDate"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      {t('additionalNotes')}
                    </label>
                    <input
                      id="notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={locale === 'hi' ? 'जैसे: सूखा माल, बोरी तैयार है' : 'E.g. Clean dry crop, packed in bags'}
                      className="w-full px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {locale === 'hi'
                    ? 'कंपनी सीधे खेत से माल उठाकर डिजिटल रसीद प्रदान करेगी'
                    : 'Company collects from your farm with transparent weighment receipt'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-700 hover:to-green-700 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>{t('submitRequest')}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
