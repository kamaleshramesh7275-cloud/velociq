import React from 'react';

export function EmptyState({
  icon = null,
  title = 'No telemetry data available',
  description = 'Data will appear automatically once telemetry stream begins.',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-bg-sunken/40 ${className}`}>
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <h4 className="font-display text-base font-bold text-text-hi">{title}</h4>
      <p className="mt-1 font-mono text-xs text-text-mid max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = 'h-4 w-full', rounded = 'rounded-md' }) {
  return (
    <div className={`animate-pulse bg-slate-200/80 ${rounded} ${className}`} />
  );
}
