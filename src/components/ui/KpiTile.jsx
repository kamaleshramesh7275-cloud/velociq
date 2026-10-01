import React from 'react';
import { Card } from './Card';

export function KpiTile({
  label,
  value,
  unit = '',
  delta = null,
  deltaType = 'positive', // 'positive' (green) | 'negative' (red) | 'neutral'
  icon = null,
  sparkline = null,
  className = '',
}) {
  const deltaColor =
    deltaType === 'positive'
      ? 'text-[#0F9D6B] bg-[#0F9D6B]/10 border-[#0F9D6B]/30'
      : deltaType === 'negative'
      ? 'text-[#D7263D] bg-[#D7263D]/10 border-[#D7263D]/30'
      : 'text-slate-600 bg-slate-100 border-slate-200';

  return (
    <Card className={`p-4 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-display text-xs uppercase font-bold tracking-wider text-text-lo">
          {label}
        </span>
        {icon && <div className="text-text-lo">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-text-hi tabular-nums">
          {value}
        </span>
        {unit && <span className="font-mono text-xs font-semibold text-text-mid">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-line/60">
        {delta !== null ? (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono text-[11px] font-bold tabular-nums ${deltaColor}`}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-text-lo">Nominal Baseline</span>
        )}

        {sparkline && <div className="h-4 w-16">{sparkline}</div>}
      </div>
    </Card>
  );
}
