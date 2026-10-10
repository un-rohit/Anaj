'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { staffLogin, ApiError } from '@/lib/api-client';
import { ShieldCheck, Lock, Phone, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('auth');

  const [identifier, setIdentifier] = useState('9000000001');
  const [password, setPassword] = useState('Dev@anaj2024!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await staffLogin(identifier.trim(), password);
      router.push(`${prefix}/admin`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(locale === 'hi' ? 'लॉगिन विफल हुआ। क्रेडेंशियल जांचें।' : 'Login failed. Check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20">
            अ
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {t('loginTitle')}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-950/50 border border-red-800/80 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('phone')} / {t('email')}
              </label>
              <div className="relative flex rounded-2xl border border-slate-700 bg-slate-900 focus-within:border-amber-400 overflow-hidden">
                <span className="inline-flex items-center px-4 text-slate-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="9000000001"
                  className="w-full px-4 py-3.5 text-sm font-semibold text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('password')}
              </label>
              <div className="relative flex rounded-2xl border border-slate-700 bg-slate-900 focus-within:border-amber-400 overflow-hidden">
                <span className="inline-flex items-center px-4 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 text-sm font-semibold text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>{t('loginButton')}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Dev credentials tip */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            <p>
              {locale === 'hi' ? 'डेवलपमेंट क्रेडेंशियल: 9000000001 / Dev@anaj2024!' : 'Dev Credentials: 9000000001 / Dev@anaj2024!'}
            </p>
            <div className="mt-3">
              <Link href={`${prefix}/`} className="text-amber-400 hover:underline">
                ← {locale === 'hi' ? 'किसान पोर्टल पर वापस जाएँ' : 'Back to Farmer Portal'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
