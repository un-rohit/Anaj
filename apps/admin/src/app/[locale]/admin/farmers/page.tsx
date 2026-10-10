'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AdminNav } from '@/components/AdminNav';
import { listFarmers, verifyFarmer, ApiError } from '@/lib/api-client';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Phone,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function AdminFarmersPage() {
  const locale = useLocale();
  const t = useTranslations('farmers');
  const tc = useTranslations('common');

  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  const loadFarmers = async () => {
    setLoading(true);
    try {
      const res = await listFarmers({ search: search.trim() || undefined });
      setFarmers(res || []);
    } catch {
      // Demo fallback if backend offline
      setFarmers([
        {
          id: 'farmer-1',
          name: 'रामेश्वर सिंह',
          phone: '9876543210',
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          address: { village: 'नवका टोला', district: 'सीवान', state: 'बिहार' },
          _count: { sellRequests: 4 },
        },
        {
          id: 'farmer-2',
          name: 'सुरेश कुमार',
          phone: '9876543211',
          isVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          address: { village: 'मैरवा', district: 'सीवान', state: 'बिहार' },
          _count: { sellRequests: 1 },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  const handleToggleVerify = async (id: string, current: boolean) => {
    try {
      await verifyFarmer(id, !current);
      loadFarmers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNav currentPath={`${prefix}/admin/farmers`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('title')} — {locale === 'hi' ? 'पंजीकृत किसान एवं प्रोफाइल' : 'Registered Farmers'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {locale === 'hi'
                ? 'किसानों के प्रोफाइल, सत्यापन स्थिति और खरीद इतिहास की निगरानी'
                : 'Monitor farmer profiles, verification badges, and procurement records'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadFarmers()}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-gray-200 focus:outline-none focus:border-slate-900"
            />
          </div>
          <button
            onClick={loadFarmers}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            {locale === 'hi' ? 'खोजें' : 'Search'}
          </button>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">{t('name')}</th>
                <th className="px-6 py-4">{t('phone')}</th>
                <th className="px-6 py-4">{t('village')} & {t('district')}</th>
                <th className="px-6 py-4">{locale === 'hi' ? 'सत्यापन' : 'Verification'}</th>
                <th className="px-6 py-4">{locale === 'hi' ? 'अनुरोध संख्या' : 'Total Requests'}</th>
                <th className="px-6 py-4 text-right">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{farmer.name}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">{farmer.phone}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {farmer.address ? `${farmer.address.village}, ${farmer.address.district}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {farmer.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('verified')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold">
                        {t('unverified')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {farmer._count?.sellRequests ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleVerify(farmer.id, farmer.isVerified)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        farmer.isVerified
                          ? 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {farmer.isVerified ? (locale === 'hi' ? 'सत्यापन हटाएं' : 'Unverify') : t('verifyAccount')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
