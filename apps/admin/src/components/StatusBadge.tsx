import React from 'react';

export type StatusKey =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'COLLECTION_SCHEDULED'
  | 'COLLECTED'
  | 'QUALITY_CHECK'
  | 'WEIGHED'
  | 'APPROVED_FOR_PAYMENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REJECTED'
  | 'CANCELLED';

interface StatusBadgeProps {
  status: StatusKey | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; hiLabel: string; enLabel: string }> = {
  SUBMITTED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    hiLabel: 'जमा किया गया',
    enLabel: 'Submitted',
  },
  UNDER_REVIEW: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    hiLabel: 'समीक्षाधीन',
    enLabel: 'Under Review',
  },
  ACCEPTED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    hiLabel: 'स्वीकृत',
    enLabel: 'Accepted',
  },
  COLLECTION_SCHEDULED: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    hiLabel: 'संग्रह निर्धारित',
    enLabel: 'Pickup Scheduled',
  },
  COLLECTED: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    hiLabel: 'संग्रहित',
    enLabel: 'Collected',
  },
  QUALITY_CHECK: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    hiLabel: 'गुणवत्ता जाँच',
    enLabel: 'Quality Check',
  },
  WEIGHED: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    hiLabel: 'तौला गया',
    enLabel: 'Weighed',
  },
  APPROVED_FOR_PAYMENT: {
    bg: 'bg-lime-50',
    text: 'text-lime-800',
    border: 'border-lime-200',
    hiLabel: 'भुगतान स्वीकृत',
    enLabel: 'Payment Approved',
  },
  PARTIALLY_PAID: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    hiLabel: 'आंशिक भुगतान',
    enLabel: 'Partially Paid',
  },
  PAID: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    hiLabel: 'भुगतान पूर्ण',
    enLabel: 'Paid',
  },
  REJECTED: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    hiLabel: 'अस्वीकृत',
    enLabel: 'Rejected',
  },
  CANCELLED: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    hiLabel: 'रद्द किया गया',
    enLabel: 'Cancelled',
  },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    hiLabel: status,
    enLabel: status,
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {label || config.hiLabel}
    </span>
  );
}
