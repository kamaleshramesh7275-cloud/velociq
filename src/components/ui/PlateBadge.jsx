import React from 'react';

/**
 * Authentic License-Plate Badge Component
 * White plate with blue edge strip, embossed mono characters, and border
 */
export function PlateBadge({
  plate = 'NY-482-XA',
  region = 'USA',
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const sizeStyles = {
    sm: 'h-6 text-[10px] px-1.5 gap-1.5',
    md: 'h-7 text-xs px-2 gap-2',
    lg: 'h-8 text-sm px-2.5 gap-2.5',
  };

  const blueStripSizes = {
    sm: 'w-3 text-[7px]',
    md: 'w-4 text-[8px]',
    lg: 'w-5 text-[9px]',
  };

  return (
    <div
      className={`inline-flex items-center rounded border border-slate-400/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)] font-mono font-bold tracking-widest text-[#0F172A] select-none ${sizeStyles[size]} ${className}`}
      title={`License Plate: ${plate}`}
    >
      {/* Left Blue Country/Region Strip */}
      <div className={`-ml-1 h-full rounded-l-[3px] bg-[#0B3D91] flex flex-col items-center justify-center text-white font-sans font-bold leading-none ${blueStripSizes[size]}`}>
        <span className="scale-75 text-[6px] text-amber-300">★</span>
        <span className="font-mono">{region.slice(0, 2)}</span>
      </div>

      {/* Plate Characters */}
      <span className="tabular-nums font-black tracking-wider text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
        {plate}
      </span>
    </div>
  );
}
