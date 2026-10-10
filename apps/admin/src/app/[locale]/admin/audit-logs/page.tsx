'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AdminNav } from '@/components/AdminNav';
import { listAuditLogs } from '@/lib/api-client';
import { ShieldAlert, Clock, User, FileText, RefreshCw } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const locale = useLocale();
  const t = useTranslations('auditLogs');
  const tc = useTranslations('common');

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const prefix = locale === 'hi' ? '' : `/${locale}`;

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await listAuditLogs();
        setLogs(res || []);
      } catch {
        // demo fallback
        setLogs([
          {
            id: 'log-1',
            action: 'SELL_REQUEST_CREATED',
            entityType: 'SellRequest',
            entityId: 'req-001',
            createdAt: new Date().toISOString(),
            actor: { name: 'रामेश्वर सिंह' },
            after: { reference: 'ANJ-2026-000001', quantity: '25.000' },
          },
          {
            id: 'log-2',
            action: 'PURCHASE_RATE_UPDATED',
            entityType: 'PurchaseRate',
            entityId: 'rate-001',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            actor: { name: 'NK.PATEL' },
            before: { ratePerQuintal: '2150.00' },
            after: { ratePerQuintal: '2200.00' },
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNav currentPath={`${prefix}/admin/audit-logs`} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {t('title')} — {locale === 'hi' ? 'सिस्टम क्रियाकलाप रिकॉर्ड' : 'System Activity Audit Trail'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {locale === 'hi'
              ? 'दर परिवर्तन, अनुरोध स्वीकृति/अस्वीकृति और किसान खाता संशोधनों का अपरिवर्तनीय इतिहास'
              : 'Immutable record of rate updates, request approvals, and account alterations'}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">{t('timestamp')}</th>
                <th className="px-6 py-4">{t('actor')}</th>
                <th className="px-6 py-4">{t('action')}</th>
                <th className="px-6 py-4">{t('entity')}</th>
                <th className="px-6 py-4">{locale === 'hi' ? 'विवरण' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {log.actor?.name || 'सिस्टम'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">{log.entityType}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-[11px] max-w-xs truncate">
                    {log.after ? JSON.stringify(log.after) : '—'}
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
