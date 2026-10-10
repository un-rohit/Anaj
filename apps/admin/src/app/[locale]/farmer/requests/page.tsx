'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FarmerNav } from '@/components/FarmerNav';
import { StatusBadge } from '@/components/StatusBadge';
import { getMySellRequests } from '@/lib/api-client';
import {
  Wheat,
  Sprout,
  ArrowRight,
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  MapPin,
  AlertCircle,
  Truck,
  Scale,
  CreditCard,
} from 'lucide-react';

interface RequestItem {
  id: string;
  reference: string;
  status: string;
  requestedQuantity: string;
  requestedUnit: string;
  acceptedQuantity?: string | null;
  agreedRatePerQuintal?: string | null;
  finalPayableAmount?: string | null;
  collectionAddress: string;
  preferredCollectionDate?: string | null;
  createdAt: string;
  product: {
    slug: string;
    translations: Array<{ language: string; name: string }>;
  };
  collection?: {
    scheduledDate: string;
    status: string;
  } | null;
  weighment?: {
    netWeightKg: string;
  } | null;
  payments?: Array<{
    amount: string;
    status: string;
    paymentDate?: string | null;
  }>;
}

const STAGES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ACCEPTED',
  'COLLECTION_SCHEDULED',
  'COLLECTED',
  'QUALITY_CHECK',
  'WEIGHED',
  'APPROVED_FOR_PAYMENT',
  'PAID',
];

export default function FarmerRequestsPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('farmerWeb');
  const tc = useTranslations('common');

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  useEffect(() => {
    async function loadRequests() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('anaj_farmer_token') : null;
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      try {
        const items = await getMySellRequests();
        setRequests(items as unknown as RequestItem[]);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <FarmerNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full mb-2">
              <FileText className="h-3.5 w-3.5" />
              <span>{locale === 'hi' ? 'ट्रैकिंग पोर्टल' : 'Tracking Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('myRequests')}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              {t('myRequestsSubtitle')}
            </p>
          </div>

          <Link
            href={`${prefix}/farmer/sell`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-700 transition-all active:scale-95 self-start sm:self-auto"
          >
            <span>{locale === 'hi' ? '+ नया अनुरोध' : '+ New Request'}</span>
          </Link>
        </div>

        {/* Not logged in banner */}
        {!isLoggedIn && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-8 text-center shadow-sm mb-8">
            <Wheat className="mx-auto h-12 w-12 text-amber-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              {locale === 'hi' ? 'अपने अनुरोध देखने के लिए लॉगिन करें' : 'Login to View Your Requests'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              {locale === 'hi'
                ? 'अपने पंजीकृत मोबाइल नंबर पर ओटीपी प्राप्त कर आसानी से प्रवेश करें।'
                : 'Enter your registered mobile phone to receive an OTP and view all your crop submissions.'}
            </p>
            <Link
              href={`${prefix}/farmer/login`}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
            >
              <span>{locale === 'hi' ? 'किसान लॉगिन करें' : 'Farmer Login'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium">{locale === 'hi' ? 'अनुरोध लोड हो रहे हैं...' : 'Loading requests...'}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && isLoggedIn && requests.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mb-4">
              <Sprout className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t('noRequestsYet')}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              {locale === 'hi'
                ? 'अपनी गेहूं, धान या अन्य फसलों के लिए आज का खरीद अनुरोध दर्ज करें और सर्वोत्तम दाम पाएं।'
                : 'Submit your crop procurement request today to receive guaranteed rates and farm-gate pickup.'}
            </p>
            <Link
              href={`${prefix}/farmer/sell`}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
            >
              <span>{t('sellYourCrop')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Requests List */}
        {!loading && isLoggedIn && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map((req) => {
              const cropName =
                req.product?.translations?.find((tr) => tr.language === locale.toUpperCase())?.name ||
                req.product?.translations?.[0]?.name ||
                req.product?.slug ||
                'फसल';

              const currentStageIndex = STAGES.indexOf(req.status);

              return (
                <div
                  key={req.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                        <Wheat className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-lg">{cropName}</span>
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {req.reference}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={req.status} size="lg" />
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-sm">
                    <div className="rounded-2xl bg-gray-50 p-3.5 border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">{locale === 'hi' ? 'अनुरोधित मात्रा' : 'Requested Quantity'}</p>
                      <p className="text-base font-bold text-gray-900 mt-1">
                        {req.requestedQuantity} {req.requestedUnit === 'QUINTAL' ? (locale === 'hi' ? 'क्विंटल' : 'Quintals') : (locale === 'hi' ? 'किलो' : 'KG')}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3.5 border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">{locale === 'hi' ? 'सहमत दर' : 'Agreed Rate'}</p>
                      <p className="text-base font-bold text-emerald-800 mt-1">
                        {req.agreedRatePerQuintal ? `₹${parseFloat(req.agreedRatePerQuintal).toLocaleString('en-IN')}/Q` : '—'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3.5 border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">{locale === 'hi' ? 'अंतिम देय राशि' : 'Final Payable'}</p>
                      <p className="text-base font-bold text-gray-900 mt-1">
                        {req.finalPayableAmount ? `₹${parseFloat(req.finalPayableAmount).toLocaleString('en-IN')}` : '—'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3.5 border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">{locale === 'hi' ? 'संग्रह स्थिति' : 'Pickup Status'}</p>
                      <p className="text-base font-bold text-gray-900 mt-1">
                        {req.collection ? (locale === 'hi' ? 'निर्धारित' : 'Scheduled') : (locale === 'hi' ? 'प्रक्रियाधीन' : 'Pending')}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-gray-600 mb-6 bg-slate-50/70 p-3 rounded-xl border border-gray-100">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-bold text-gray-700">{locale === 'hi' ? 'संग्रह का पता: ' : 'Pickup Address: '}</span>
                      {req.collectionAddress}
                    </p>
                  </div>

                  {/* Timeline progress indicator */}
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {locale === 'hi' ? 'प्रगति स्थिति' : 'Workflow Stage'}
                    </p>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                      {[
                        { key: 'SUBMITTED', hi: 'जमा', en: 'Submitted' },
                        { key: 'UNDER_REVIEW', hi: 'समीक्षा', en: 'Review' },
                        { key: 'ACCEPTED', hi: 'स्वीकृत', en: 'Accepted' },
                        { key: 'COLLECTION_SCHEDULED', hi: 'संग्रह', en: 'Pickup' },
                        { key: 'WEIGHED', hi: 'तौल', en: 'Weighed' },
                        { key: 'APPROVED_FOR_PAYMENT', hi: 'भुगतान स्वीकृत', en: 'Approved' },
                        { key: 'PAID', hi: 'भुगतान पूर्ण', en: 'Paid' },
                      ].map((step, idx) => {
                        const isDone = currentStageIndex >= STAGES.indexOf(step.key);
                        const isCurrent = req.status === step.key;

                        return (
                          <div
                            key={step.key}
                            className={`flex-1 min-w-[70px] text-center p-2 rounded-xl text-[11px] font-bold border transition-colors ${
                              isCurrent
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200'
                            }`}
                          >
                            <span>{locale === 'hi' ? step.hi : step.en}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
