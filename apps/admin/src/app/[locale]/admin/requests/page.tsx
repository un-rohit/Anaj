'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AdminNav } from '@/components/AdminNav';
import { StatusBadge } from '@/components/StatusBadge';
import { listSellRequestsAdmin, updateSellRequestStatus, ApiError } from '@/lib/api-client';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Wheat,
  MapPin,
  RefreshCw,
  AlertCircle,
  Truck,
  Scale,
  CreditCard,
} from 'lucide-react';

export default function AdminRequestsPage() {
  const locale = useLocale();
  const t = useTranslations('sellRequests');
  const tc = useTranslations('common');

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'ACCEPT' | 'REJECT' | 'ADVANCE' | null>(null);
  const [acceptedQty, setAcceptedQty] = useState('');
  const [agreedRate, setAgreedRate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await listSellRequestsAdmin({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setRequests(data || []);
    } catch {
      // Demo fallback if backend offline
      setRequests([
        {
          id: 'demo-req-1',
          reference: 'ANJ-2026-000001',
          status: 'SUBMITTED',
          requestedQuantity: '25.000',
          requestedUnit: 'QUINTAL',
          collectionAddress: 'ग्राम: रामपुर, पोस्ट: मैरवा, सीवान',
          createdAt: new Date().toISOString(),
          farmer: { name: 'रामेश्वर सिंह', phone: '9876543210' },
          product: { name: 'गेहूं (Wheat)', translations: [{ language: 'HI', name: 'गेहूं' }] },
        },
        {
          id: 'demo-req-2',
          reference: 'ANJ-2026-000002',
          status: 'UNDER_REVIEW',
          requestedQuantity: '40.000',
          requestedUnit: 'QUINTAL',
          collectionAddress: 'ग्राम: बड़हरिया, सीवान',
          createdAt: new Date().toISOString(),
          farmer: { name: 'महेश प्रसाद', phone: '9876543212' },
          product: { name: 'धान (Paddy)', translations: [{ language: 'HI', name: 'धान' }] },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const openAcceptModal = (req: any) => {
    setSelectedRequest(req);
    setAcceptedQty(req.requestedQuantity);
    setAgreedRate(req.agreedRatePerQuintal || '2200.00');
    setModalAction('ACCEPT');
    setActionError(null);
  };

  const openRejectModal = (req: any) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setModalAction('REJECT');
    setActionError(null);
  };

  const openAdvanceModal = (req: any, target: string) => {
    setSelectedRequest(req);
    setNextStatus(target);
    setModalAction('ADVANCE');
    setActionError(null);
  };

  const handleExecuteAction = async () => {
    if (!selectedRequest) return;
    setActionError(null);
    setActionLoading(true);

    try {
      if (modalAction === 'ACCEPT') {
        await updateSellRequestStatus(selectedRequest.id, {
          status: 'ACCEPTED',
          acceptedQuantity: acceptedQty,
          agreedRatePerQuintal: agreedRate,
        });
      } else if (modalAction === 'REJECT') {
        if (!rejectionReason.trim()) {
          setActionError(locale === 'hi' ? 'कृपया अस्वीकृति का कारण अवश्य दर्ज करें' : 'Rejection reason is required');
          setActionLoading(false);
          return;
        }
        await updateSellRequestStatus(selectedRequest.id, {
          status: 'REJECTED',
          rejectionReason: rejectionReason.trim(),
        });
      } else if (modalAction === 'ADVANCE') {
        await updateSellRequestStatus(selectedRequest.id, {
          status: nextStatus,
        });
      }

      setModalAction(null);
      fetchRequests();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError(locale === 'hi' ? 'कार्यवाही विफल हुई' : 'Action failed');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNav currentPath={`${prefix}/admin/requests`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('title')} — {locale === 'hi' ? 'खरीद अनुरोध समीक्षा व स्वीकृति' : 'Review & Lifecycle'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {locale === 'hi'
                ? 'किसानों से प्राप्त बिक्री अनुरोधों को स्वीकार, अस्वीकार या चरणबद्ध आगे बढ़ाएं'
                : 'Accept, reject, or advance procurement stages for farmer sell requests'}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === 'hi' ? 'संदर्भ या किसान खोजें...' : 'Search reference or farmer...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-gray-200 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-semibold rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none"
            >
              <option value="">{locale === 'hi' ? 'सभी स्थितियाँ (All Statuses)' : 'All Statuses'}</option>
              <option value="SUBMITTED">जमा किया गया (Submitted)</option>
              <option value="UNDER_REVIEW">समीक्षाधीन (Under Review)</option>
              <option value="ACCEPTED">स्वीकृत (Accepted)</option>
              <option value="COLLECTION_SCHEDULED">संग्रह निर्धारित (Pickup Scheduled)</option>
              <option value="COLLECTED">संग्रहित (Collected)</option>
              <option value="QUALITY_CHECK">गुणवत्ता जाँच (Quality Check)</option>
              <option value="WEIGHED">तौला गया (Weighed)</option>
              <option value="APPROVED_FOR_PAYMENT">भुगतान स्वीकृत (Payment Approved)</option>
              <option value="PAID">भुगतान पूर्ण (Paid)</option>
              <option value="REJECTED">अस्वीकृत (Rejected)</option>
            </select>

            <button
              onClick={fetchRequests}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              {locale === 'hi' ? 'रिफ्रेश' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* List Table */}
        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">{t('reference')}</th>
                  <th className="px-6 py-4">{t('farmer')}</th>
                  <th className="px-6 py-4">{t('product')}</th>
                  <th className="px-6 py-4">{t('requestedQty')}</th>
                  <th className="px-6 py-4">{t('status')}</th>
                  <th className="px-6 py-4 text-right">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {requests.map((req) => {
                  const cropName =
                    req.product?.translations?.find((tr: any) => tr.language === locale.toUpperCase())?.name ||
                    req.product?.translations?.[0]?.name ||
                    req.product?.slug ||
                    'फसल';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{req.reference}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{req.farmer?.name || 'किसान'}</div>
                        <div className="text-[11px] text-gray-500">{req.farmer?.phone}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{cropName}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {req.requestedQuantity} {req.requestedUnit}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {req.status === 'SUBMITTED' && (
                          <button
                            onClick={() => openAdvanceModal(req, 'UNDER_REVIEW')}
                            className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100"
                          >
                            {locale === 'hi' ? 'समीक्षा शुरू करें' : 'Start Review'}
                          </button>
                        )}

                        {(req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW') && (
                          <>
                            <button
                              onClick={() => openAcceptModal(req)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                            >
                              {locale === 'hi' ? 'स्वीकार करें' : 'Accept'}
                            </button>
                            <button
                              onClick={() => openRejectModal(req)}
                              className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50"
                            >
                              {locale === 'hi' ? 'अस्वीकार' : 'Reject'}
                            </button>
                          </>
                        )}

                        {req.status === 'ACCEPTED' && (
                          <button
                            onClick={() => openAdvanceModal(req, 'COLLECTION_SCHEDULED')}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
                          >
                            {locale === 'hi' ? 'संग्रह तय करें' : 'Schedule Pickup'}
                          </button>
                        )}

                        {req.status === 'COLLECTION_SCHEDULED' && (
                          <button
                            onClick={() => openAdvanceModal(req, 'COLLECTED')}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                          >
                            {locale === 'hi' ? 'संग्रह दर्ज करें' : 'Mark Collected'}
                          </button>
                        )}

                        {req.status === 'COLLECTED' && (
                          <button
                            onClick={() => openAdvanceModal(req, 'QUALITY_CHECK')}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
                          >
                            {locale === 'hi' ? 'गुणवत्ता जाँच' : 'Quality Check'}
                          </button>
                        )}

                        {req.status === 'QUALITY_CHECK' && (
                          <button
                            onClick={() => openAdvanceModal(req, 'WEIGHED')}
                            className="px-2.5 py-1.5 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700"
                          >
                            {locale === 'hi' ? 'तौल दर्ज करें' : 'Record Weight'}
                          </button>
                        )}

                        {req.status === 'WEIGHED' && (
                          <button
                            onClick={() => openAdvanceModal(req, 'APPROVED_FOR_PAYMENT')}
                            className="px-2.5 py-1.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
                          >
                            {locale === 'hi' ? 'भुगतान स्वीकृत' : 'Approve Payment'}
                          </button>
                        )}

                        {req.status === 'APPROVED_FOR_PAYMENT' && (
                          <button
                            onClick={() => openAdvanceModal(req, 'PAID')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-900"
                          >
                            {locale === 'hi' ? 'भुगतान पूर्ण दर्ज करें' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Modal */}
        {modalAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {modalAction === 'ACCEPT' && (locale === 'hi' ? 'खरीद अनुरोध स्वीकार करें' : 'Accept Purchase Request')}
                {modalAction === 'REJECT' && (locale === 'hi' ? 'अनुरोध अस्वीकार करें' : 'Reject Sell Request')}
                {modalAction === 'ADVANCE' && (locale === 'hi' ? 'अगला चरण अग्रसर करें' : 'Advance Procurement Stage')}
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {selectedRequest?.reference} — {selectedRequest?.farmer?.name}
              </p>

              {actionError && (
                <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <p>{actionError}</p>
                </div>
              )}

              {modalAction === 'ACCEPT' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {locale === 'hi' ? 'स्वीकृत मात्रा' : 'Accepted Quantity'}
                    </label>
                    <input
                      type="text"
                      value={acceptedQty}
                      onChange={(e) => setAcceptedQty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {locale === 'hi' ? 'सहमत दर (₹ प्रति क्विंटल) — लॉक होगी' : 'Agreed Rate (₹/Quintal) — Locked'}
                    </label>
                    <input
                      type="text"
                      value={agreedRate}
                      onChange={(e) => setAgreedRate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-bold text-emerald-800"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      {locale === 'hi'
                        ? 'यह दर स्थायी रूप से अनुरोध पर लॉक हो जाएगी'
                        : 'This rate is permanently locked on the sell request'}
                    </p>
                  </div>
                </div>
              )}

              {modalAction === 'REJECT' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {locale === 'hi' ? 'अस्वीकृति कारण (अनिवार्य)' : 'Rejection Reason (Required)'} *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={locale === 'hi' ? 'जैसे: गुणवत्ता मानक अनुसार नहीं, अधिक नमी' : 'E.g. High moisture, below quality standard'}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-sm font-medium"
                  />
                </div>
              )}

              {modalAction === 'ADVANCE' && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs">
                  <p className="text-gray-600">
                    {locale === 'hi' ? 'स्थिति को बदलकर निम्नलिखित किया जाएगा:' : 'Status will be updated to:'}
                  </p>
                  <p className="mt-2 font-black text-slate-900 text-base">{nextStatus}</p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleExecuteAction}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : tc('confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
