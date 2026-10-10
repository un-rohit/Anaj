'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  LayoutDashboard,
  Users,
  Wheat,
  TrendingUp,
  FileText,
  ShieldAlert,
  LogOut,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { removeStaffToken } from '@/lib/api-client';

export function AdminNav({ currentPath = '' }: { currentPath?: string }) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const [staffUser, setStaffUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('anaj_staff_user');
      if (stored) {
        setStaffUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    removeStaffToken();
    window.location.href = `/${locale}/admin/login`;
  };

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  const navItems = [
    { href: `${prefix}/admin`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `${prefix}/admin/requests`, label: t('sellRequests'), icon: FileText },
    { href: `${prefix}/admin/farmers`, label: t('farmers'), icon: Users },
    { href: `${prefix}/admin/products`, label: t('products'), icon: Wheat },
    { href: `${prefix}/admin/rates`, label: t('rates'), icon: TrendingUp },
    { href: `${prefix}/admin/audit-logs`, label: t('auditLogs'), icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href={`${prefix}/admin`} className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-base shadow">
              अ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-gray-950">अनाज</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                  प्रशासन
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Owner & Staff Console</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 border-l border-gray-200 pl-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href || (item.href !== `${prefix}/admin` && currentPath.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Switch to Farmer Web View */}
          <Link
            href={`${prefix}/`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <span>{locale === 'hi' ? 'किसान पोर्टल देखें' : 'View Farmer Portal'}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <LanguageSwitcher />

          {staffUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-gray-900">{staffUser.name || 'NK.PATEL'}</span>
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                  {staffUser.role || 'OWNER'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href={`${prefix}/admin/login`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <span>{locale === 'hi' ? 'लॉगिन' : 'Login'}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
