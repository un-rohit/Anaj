'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sprout, Phone, ShieldCheck, LogOut, User, ClipboardList, Wheat } from 'lucide-react';
import { removeFarmerToken } from '@/lib/api-client';

export function FarmerNav() {
  const locale = useLocale();
  const t = useTranslations('farmerWeb');
  const tc = useTranslations('common');
  const [farmerUser, setFarmerUser] = useState<{ id: string; name: string; phone: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('anaj_farmer_user');
      if (stored) {
        setFarmerUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    removeFarmerToken();
    setFarmerUser(null);
    window.location.href = `/${locale}/farmer/login`;
  };

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href={`${prefix}/`} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Wheat className="h-5 w-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-gray-900">अनाज</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ANAJ
              </span>
            </div>
            <p className="text-[11px] font-medium text-emerald-800">
              {locale === 'hi' ? 'किसानों का भरोसेमंद साथी' : 'Farmer Procurement Portal'}
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`${prefix}/#rates`}
            className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
          >
            {t('todayRates')}
          </Link>
          <Link
            href={`${prefix}/farmer/sell`}
            className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
          >
            {t('sellYourCrop')}
          </Link>
          <Link
            href={`${prefix}/farmer/requests`}
            className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
          >
            {t('myRequests')}
          </Link>
          <Link
            href={`${prefix}/#support`}
            className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
          >
            {t('supportContact')}
          </Link>
        </nav>

        {/* User Action & Language Switcher */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {farmerUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={`${prefix}/farmer/requests`}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-emerald-700" />
                <span>{farmerUser.name || farmerUser.phone}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href={`${prefix}/farmer/login`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-green-700 transition-all active:scale-95"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{locale === 'hi' ? 'किसान लॉगिन' : 'Farmer Login'}</span>
            </Link>
          )}

          {/* Admin link */}
          <Link
            href={`${prefix}/admin`}
            className="hidden lg:inline-flex text-xs font-medium text-gray-400 hover:text-gray-700 border-l border-gray-200 pl-3 transition-colors"
          >
            {locale === 'hi' ? 'कंपनी प्रशासन' : 'Admin'}
          </Link>
        </div>
      </div>
    </header>
  );
}
