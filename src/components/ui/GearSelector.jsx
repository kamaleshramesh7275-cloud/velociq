import React from 'react';

/**
 * Automotive Gear-Shift Selector Component (P-R-N-D Style Segmented Control)
 * Perfect for mode selection: Eco / Cruise / Rush, Live / Replay, or custom presets
 */
export function GearSelector({
  options = [
    { id: 'eco', label: 'E', name: 'Eco' },
    { id: 'cruise', label: 'C', name: 'Cruise' },
    { id: 'rush', label: 'R', name: 'Rush' },
  ],
  value,
  onChange,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const sizeClasses = {
    sm: 'p-1 gap-1 text-xs',
    md: 'p-1.5 gap-1.5 text-xs',
    lg: 'p-2 gap-2 text-sm',
  };

  const buttonSizes = {
    sm: 'h-7 px-2.5 min-w-[32px]',
    md: 'h-8 px-3.5 min-w-[38px]',
    lg: 'h-10 px-4 min-w-[46px]',
  };

  return (
    <div
      role="radiogroup"
      className={`inline-flex items-center rounded-xl border border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1),0_1px_2px_rgba(255,255,255,0.8)] select-none ${sizeClasses[size]} ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center justify-center gap-1.5 rounded-lg font-mono font-bold transition-all duration-150 ${buttonSizes[size]} ${
              isActive
                ? 'bg-[#0B3D91] text-white shadow-[0_2px_6px_rgba(11,61,145,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] ring-1 ring-[#0B3D91]'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
            }`}
            title={opt.name || opt.label}
          >
            {/* Red shift-gate line indicator on active gear */}
            {isActive && (
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded-full bg-[#D7263D]" />
            )}
            <span className="text-sm font-black">{opt.label}</span>
            {opt.name && (
              <span className={`text-[10px] font-sans font-medium hidden sm:inline ${
                isActive ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {opt.name}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
