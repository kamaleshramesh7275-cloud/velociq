import React from 'react';

/**
 * Computes compliance expiry status:
 * > 30 days: Valid (Green)
 * 0 to 30 days: Expiring Soon (Amber)
 * <= 0 days: Expired (Red)
 */
export function getComplianceStatus(expiryDateStr) {
  if (!expiryDateStr) return { status: 'UNKNOWN', label: 'Missing', days: 0, color: '#64748B' };

  const now = new Date();
  const expiry = new Date(expiryDateStr);
  const diffMs = expiry - now;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      status: 'EXPIRED',
      label: `EXPIRED (${Math.abs(daysRemaining)}d ago)`,
      days: daysRemaining,
      color: '#D7263D',
      bgClass: 'bg-red-100 text-red-800 border-red-200',
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: 'EXPIRING_SOON',
      label: `EXPIRING (${daysRemaining}d left)`,
      days: daysRemaining,
      color: '#B45309',
      bgClass: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }

  return {
    status: 'VALID',
    label: `VALID (${daysRemaining}d)`,
    days: daysRemaining,
    color: '#0F9D6B',
    bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
}

export default function ComplianceBadge({ expiryDate, size = 'sm' }) {
  const { status, label, bgClass } = getComplianceStatus(expiryDate);

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-bold border uppercase tracking-wider ${sizeClasses} ${bgClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'EXPIRED' ? 'bg-[#D7263D] animate-ping' : status === 'EXPIRING_SOON' ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />
      <span>{label}</span>
    </span>
  );
}
