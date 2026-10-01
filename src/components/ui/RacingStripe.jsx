import React from 'react';

/**
 * Precision Racing Stripe Component (Horizontal or Vertical)
 * 3px dual-line stripe: Racing Blue (#0B3D91) + Brake Red (#D7263D)
 */
export function RacingStripe({
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  className = '',
}) {
  if (orientation === 'vertical') {
    return (
      <div className={`w-[3px] h-full flex flex-col shrink-0 ${className}`}>
        <div className="flex-1 bg-[#0B3D91]" />
        <div className="h-1/3 bg-[#D7263D]" />
      </div>
    );
  }

  return (
    <div className={`h-[3px] w-full flex shrink-0 ${className}`}>
      <div className="flex-1 bg-[#0B3D91]" />
      <div className="w-16 sm:w-24 bg-[#D7263D]" />
    </div>
  );
}

/**
 * Chequered-Flag Divider Section Marker
 */
export function ChequeredDivider({ className = '' }) {
  return (
    <div className={`w-full flex items-center gap-3 my-4 select-none ${className}`}>
      <div className="h-px flex-1 bg-slate-200" />
      <div className="chequered-flag w-24 h-2 rounded" />
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
