'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FarmerNav } from '@/components/FarmerNav';
import { sendFarmerOtp, verifyFarmerOtp, ApiError } from '@/lib/api-client';
import { Phone, ShieldCheck, ArrowRight, Wheat, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export default function FarmerLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('farmerWeb');
  const tc = useTranslations('common');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanedPhone = phone.trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError(locale === 'hi' ? 'कृपया एक वैध 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await sendFarmerOtp(cleanedPhone);
      setStep('OTP');
      setInfoMessage(
        locale === 'hi'
          ? `ओटीपी आपके नंबर +91 ${cleanedPhone} पर भेज दिया गया है`
          : `OTP has been dispatched to +91 ${cleanedPhone}`
      );
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(locale === 'hi' ? 'ओटीपी भेजने में समस्या आई। पुनः प्रयास करें।' : 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedOtp = otp.trim().replace(/\D/g, '');
    if (cleanedOtp.length !== 6) {
      setError(locale === 'hi' ? 'कृपया 6 अंकों का सही ओटीपी दर्ज करें' : 'Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const cleanedPhone = phone.trim().replace(/\D/g, '');
      await verifyFarmerOtp(cleanedPhone, cleanedOtp);
      router.push(`${prefix}/farmer/sell`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(locale === 'hi' ? 'ओटीपी सत्यापन विफल हुआ।' : 'OTP verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <FarmerNav />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl shadow-emerald-950/5">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-700/20">
                <Wheat className="h-7 w-7 text-amber-200" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                {t('loginWithOtp')}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {step === 'PHONE'
                  ? locale === 'hi'
                    ? 'अपनी फसल बेचने के लिए अपना मोबाइल नंबर दर्ज करें'
                    : 'Enter your mobile number to sell crops and track requests'
                  : locale === 'hi'
                  ? 'प्राप्त 6 अंकों का ओटीपी कोड यहाँ भरें'
                  : 'Enter the 6-digit OTP code received on your phone'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <p>{error}</p>
              </div>
            )}

            {/* Info Message */}
            {infoMessage && (
              <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <p>{infoMessage}</p>
              </div>
            )}

            {step === 'PHONE' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    {locale === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'}
                  </label>
                  <div className="relative flex rounded-2xl border border-gray-300 shadow-sm focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden">
                    <span className="inline-flex items-center px-4 bg-gray-50 border-r border-gray-200 text-sm font-bold text-gray-600">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      autoFocus
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3.5 text-base font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 text-base font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>{t('getOtp')}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      {t('enterOtp')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('PHONE')}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      {locale === 'hi' ? 'नंबर बदलें' : 'Change number'}
                    </button>
                  </div>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-2xl font-bold rounded-2xl border border-gray-300 shadow-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                  <p className="mt-2 text-[11px] text-gray-500 text-center">
                    {locale === 'hi'
                      ? 'विकास मोड: सर्वर कंसोल में ओटीपी तुरंत दर्ज होता है'
                      : 'Development mode: OTP is logged in backend terminal'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 text-base font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>{t('verifyOtp')}</span>
                      <CheckCircle2 className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Direct Support Note */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
              <p>
                {locale === 'hi' ? 'कोई समस्या आ रही है? सीधे संपर्क करें: ' : 'Facing issues? Call support directly: '}
                <a href="tel:7061654008" className="font-bold text-emerald-800 hover:underline">
                  7061654008
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
