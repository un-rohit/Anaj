import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {tc('appName')} — {tc('tagline')}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">{t('title')}</h2>

        {/* Placeholder stats grid — connected to real data in Phase 3 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t('totalFarmers'), value: '—', color: 'blue' },
            { label: t('pendingRequests'), value: '—', color: 'yellow' },
            { label: t('totalPurchaseValue'), value: '—', color: 'green' },
            { label: t('outstandingPayable'), value: '—', color: 'red' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Phase 3 will connect this dashboard to real database metrics.
        </p>
      </div>
    </main>
  );
}
