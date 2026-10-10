'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AdminNav } from '@/components/AdminNav';
import { getProducts, type ProductItem } from '@/lib/api-client';
import {
  Wheat,
  Sprout,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function AdminProductsPage() {
  const locale = useLocale();
  const t = useTranslations('products');
  const tc = useTranslations('common');

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  useEffect(() => {
    async function loadProducts() {
      try {
        const list = await getProducts(locale as 'hi' | 'en');
        setProducts(list);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [locale]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNav currentPath={`${prefix}/admin/products`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('title')} — {locale === 'hi' ? 'खरीद फसल कैटलॉग' : 'Procurement Produce Catalogue'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {locale === 'hi'
                ? 'कैटलॉग में फसलों की स्थिति और अनुमत इकाइयों का प्रबंधन'
                : 'Manage procurement status and allowed units for agricultural produce'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200">
                    <Wheat className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {t('isActive')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{prod.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{prod.description}</p>

                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">{t('allowedUnits')}</span>
                    <span className="font-bold text-gray-800">{prod.allowedUnits.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-500">{locale === 'hi' ? 'वर्तमान दर' : 'Current Rate'}</span>
                    <span className="font-extrabold text-emerald-800">
                      ₹{prod.currentRate?.ratePerQuintal || '—'} / Q
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Slug: {prod.slug}</span>
                <span className="font-semibold text-emerald-700">{locale === 'hi' ? 'सक्रिय' : 'Active'}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
