import React from 'react';

/**
 * Showroom Precision White Automotive Card
 * Crisp white surface, body panel seams, subtle elevation, optional chrome/racing accents
 */
export function Card({
  children,
  className = '',
  cornerBrackets = false,
  racingStripe = false,
  chromeHeader = false,
  sunken = false,
  hoverEffect = false,
  darkCluster = false, // 10% permitted dark cluster binnacle
  ...props
}) {
  if (darkCluster) {
    return (
      <div
        className={`relative rounded-2xl border border-slate-800 carbon-cluster text-white shadow-cluster overflow-hidden ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-2xl border border-line ${
        sunken ? 'bg-bg-sunken shadow-inner' : 'bg-bg-surface shadow-showroom'
      } transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-showroom-hover hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {racingStripe && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-brand-blue to-brand-red rounded-t-2xl" />
      )}
      {children}
    </div>
  );
}

export function SectionLabel({ label, children, pulseColor, className = '' }) {
  const content = label || children;
  return (
    <div className={`inline-flex items-center gap-2 font-display text-xs uppercase font-bold tracking-[0.18em] text-[#0B3D91] ${className}`}>
      <span className="w-1 h-3 rounded-full bg-gradient-to-b from-[#0B3D91] to-[#D7263D] shrink-0" />
      {pulseColor && (
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full animate-ping opacity-75 bg-${pulseColor}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full bg-${pulseColor}`} />
        </span>
      )}
      <span className="font-bold text-[#0B3D91]">{content}</span>
    </div>
  );
}

export function StatusPill({ label, status = 'active', pulse = true, className = '' }) {
  const configs = {
    active: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-[#047857]', dot: '#047857' },
    transit: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-[#0B3D91]', dot: '#0B3D91' },
    idle: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-[#B45309]', dot: '#B45309' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-[#B45309]', dot: '#B45309' },
    critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-[#D7263D]', dot: '#D7263D' },
    offline: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-700', dot: null },
  };

  const c = configs[status] || configs.active;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold ${c.bg} ${c.border} ${c.text} ${className}`}>
      {c.dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75" style={{ backgroundColor: c.dot }} />}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}

export function SeverityBadge({ severity = 'INFO', className = '' }) {
  const styles = {
    CRITICAL: 'bg-red-50 border-red-300 text-[#D7263D]',
    HIGH: 'bg-red-50 border-red-300 text-[#D7263D]',
    MEDIUM: 'bg-amber-50 border-amber-300 text-[#B45309]',
    LOW: 'bg-blue-50 border-blue-300 text-[#0B3D91]',
    INFO: 'bg-slate-100 border-slate-300 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${styles[severity] || styles.INFO} ${className}`}>
      {severity}
    </span>
  );
}
