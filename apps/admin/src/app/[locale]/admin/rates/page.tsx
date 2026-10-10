'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AdminNav } from '@/components/AdminNav';
import { getProducts, publishPurchaseRate, type ProductItem, ApiError } from '@/lib/api-client';
import {
  TrendingUp,
  Wheat,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function AdminRatesPage() {
  const locale = useLocale();
  const t = useTranslations('rates');
  const tc = useTranslations('common');

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New rate modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newRate, setNewRate] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await getProducts(locale as 'hi' | 'en');
      setProducts(prods);
      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0]!.id);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [locale]);

  const handlePublishRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionLoading(true);

    try {
      await publishPurchaseRate({
        productId: selectedProductId,
        ratePerQuintal: newRate,
        effectiveFrom: new Date(effectiveFrom!).toISOString(),
        notes: notes || undefined,
      });

      setIsModalOpen(false);
      setNewRate('');
      setNotes('');
      loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError(locale === 'hi' ? 'दर प्रकाशित करने में त्रुटि' : 'Failed to publish rate');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNav currentPath={`${prefix}/admin/rates`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('title')} — {locale === 'hi' ? 'समर्थन व खरीद दरें' : 'Procurement Rates'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {locale === 'hi'
                ? 'फसलों की दरें प्रति क्विंटल (100 कि.ग्रा.) निर्धारित करें। पूर्व में स्वीकृत अनुरोधों की दरें अपरिवर्तित रहेंगी।'
                : 'Manage rates per quintal. Confirmed accepted requests preserve their locked agreed rates.'}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{t('addRate')}</span>
          </button>
        </div>

        {/* Rate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((prod) => {
            const currentRateStr = prod.currentRate?.ratePerQuintal
              ? Number(prod.currentRate.ratePerQuintal).toLocaleString('en-IN')
              : '2,200';

            return (
              <div
                key={prod.id}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
                      <Wheat className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {locale === 'hi' ? 'सक्रिय' : 'Active'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{prod.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{prod.description}</p>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {t('currentRate')}
                    </span>
                    <div className="text-2xl font-black text-emerald-800 mt-1">
                      ₹{currentRateStr} <span className="text-xs font-bold text-gray-500">/ क्विंटल</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {locale === 'hi' ? 'प्रभावी: ' : 'Effective: '}
                      {prod.currentRate?.effectiveFrom
                        ? new Date(prod.currentRate.effectiveFrom).toLocaleDateString()
                        : 'आज से'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedProductId(prod.id);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {locale === 'hi' ? 'नई दर निर्धारित करें' : 'Update Rate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t('addRate')}</h2>
              <p className="text-xs text-gray-500 mb-6">
                {locale === 'hi'
                  ? 'नई दर लागू करने पर पिछली सक्रिय दर स्वतः इतिहास में सहेजी जाएगी।'
                  : 'New rate will take effect and archive previous rate in audit history.'}
              </p>

              {actionError && (
                <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <p>{actionError}</p>
                </div>
              )}

              <form onSubmit={handlePublishRate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {locale === 'hi' ? 'फसल चुनें' : 'Select Crop'}
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-bold bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('ratePerQuintal')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="2250.00"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('effectiveFrom')}
                  </label>
                  <input
                    type="date"
                    required
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('notes')}
                  </label>
                  <input
                    type="text"
                    placeholder={locale === 'hi' ? 'जैसे: बाजार भाव वृद्धि के अनुसार' : 'E.g. Market price adjustment'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-medium"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    {tc('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : tc('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
