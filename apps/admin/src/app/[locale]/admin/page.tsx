'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AdminNav } from '@/components/AdminNav';
import { StatusBadge } from '@/components/StatusBadge';
import { getDashboardStats } from '@/lib/api-client';
import {
  Users,
  Wheat,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        // Fallback demo stats if backend offline
        setStats({
          overview: {
            totalFarmers: 1,
            activeFarmers: 1,
            pendingSellingRequests: 2,
            acceptedPurchaseRequests: 3,
            produceCollectedCount: 1,
            completedPurchases: 1,
            totalPurchaseValue: 425000,
            completedPaymentsTotal: 220000,
            completedPaymentsCount: 1,
            outstandingPayableAmount: 205000,
          },
          recentSellRequests: [
            {
              id: 'demo-1',
              reference: 'ANJ-2026-000001',
              status: 'SUBMITTED',
              requestedQuantity: '25.000',
              requestedUnit: 'QUINTAL',
              finalPayableAmount: '55000.00',
              createdAt: new Date().toISOString(),
              farmer: { name: 'रामेश्वर सिंह', phone: '9876543210' },
              product: { translations: [{ language: 'HI', name: 'गेहूं' }] },
            },
            {
              id: 'demo-2',
              reference: 'ANJ-2026-000002',
              status: 'ACCEPTED',
              requestedQuantity: '15.000',
              requestedUnit: 'QUINTAL',
              finalPayableAmount: '32745.00',
              createdAt: new Date().toISOString(),
              farmer: { name: 'सुरेश कुमार', phone: '9876543211' },
              product: { translations: [{ language: 'HI', name: 'धान' }] },
            },
          ],
          recentActivities: [
            {
              id: 'log-1',
              action: 'SELL_REQUEST_CREATED',
              entityType: 'SellRequest',
              createdAt: new Date().toISOString(),
              actor: { name: 'किसान रामेश्वर' },
            },
            {
              id: 'log-2',
              action: 'PURCHASE_RATE_UPDATED',
              entityType: 'PurchaseRate',
              createdAt: new Date().toISOString(),
              actor: { name: 'NK.PATEL' },
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const overview = stats?.overview || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNav currentPath={`${prefix}/admin`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('title')} — {locale === 'hi' ? 'संचालन एवं खरीद नियंत्रण' : 'Operations & Procurement'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {locale === 'hi'
                ? 'मालिक: NK.PATEL | नवका टोला, मैरवा, सीवान, बिहार | फोन: 7061654008'
                : 'Owner: NK.PATEL | Mairwa, Siwan, Bihar | Phone: 7061654008'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`${prefix}/admin/rates`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{locale === 'hi' ? 'दर अपडेट करें' : 'Update Rates'}</span>
            </Link>

            <Link
              href={`${prefix}/admin/requests`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>{locale === 'hi' ? 'अनुरोध प्रबंधित करें' : 'Manage Requests'}</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('totalFarmers')}</span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-gray-900">
              {overview.totalFarmers ?? 0}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {locale === 'hi' ? 'सक्रिय किसान: ' : 'Active farmers: '}
              <span className="font-bold text-emerald-700">{overview.activeFarmers ?? 0}</span>
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('pendingRequests')}</span>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600">
              {overview.pendingSellingRequests ?? 0}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {locale === 'hi' ? 'समीक्षा व स्वीकृति प्रतीक्षारत' : 'Pending review & approval'}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('totalPurchaseValue')}</span>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700">
              ₹{Number(overview.totalPurchaseValue || 0).toLocaleString('en-IN')}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {locale === 'hi' ? 'स्वीकृत खरीद का कुल मूल्य' : 'Total approved purchase value'}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('outstandingPayable')}</span>
              <CreditCard className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-3xl font-black text-red-600">
              ₹{Number(overview.outstandingPayableAmount || 0).toLocaleString('en-IN')}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {locale === 'hi' ? 'पूर्ण भुगतान: ' : 'Paid: '}
              <span className="font-bold text-gray-800">₹{Number(overview.completedPaymentsTotal || 0).toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Sell Requests (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  {locale === 'hi' ? 'हालिया फसल बिक्री अनुरोध' : 'Recent Sell Requests'}
                </h2>
                <p className="text-xs text-gray-500">
                  {locale === 'hi' ? 'किसानों द्वारा सीधे सबमिट किए गए अनुरोध' : 'Requests submitted directly by farmers'}
                </p>
              </div>

              <Link
                href={`${prefix}/admin/requests`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>{locale === 'hi' ? 'सभी देखें' : 'View All'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {stats?.recentSellRequests?.map((req: any) => {
                const cropName =
                  req.product?.translations?.find((tr: any) => tr.language === locale.toUpperCase())?.name ||
                  req.product?.translations?.[0]?.name ||
                  'फसल';

                return (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 gap-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-emerald-700 font-bold">
                        <Wheat className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{req.farmer?.name || 'किसान'}</span>
                          <span className="font-mono text-xs text-gray-500">({req.reference})</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {cropName} • {req.requestedQuantity} {req.requestedUnit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <StatusBadge status={req.status} size="sm" />
                      <Link
                        href={`${prefix}/admin/requests`}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                      >
                        {locale === 'hi' ? 'समीक्षा' : 'Review'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Audit Activities (1 Col) */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  {locale === 'hi' ? 'ऑडिट गतिविधि' : 'Audit Trail'}
                </h2>
                <p className="text-xs text-gray-500">
                  {locale === 'hi' ? 'सिस्टम में हालिया बदलाव' : 'Recent verified activities'}
                </p>
              </div>

              <Link
                href={`${prefix}/admin/audit-logs`}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <span>{locale === 'hi' ? 'लॉग' : 'Logs'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {stats?.recentActivities?.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      {act.action?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {act.actor?.name || 'सिस्टम'} • {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
