import React from 'react';

/**
 * Automotive Segmented Mode Control
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  className = '',
}) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-xs',
    lg: 'p-1 text-sm',
  };

  return (
    <div className={`inline-flex rounded-xl border border-line bg-bg-sunken ${sizeClasses[size]} ${className}`}>
      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-mono font-medium transition-all duration-150 ${
              isActive
                ? 'bg-white text-brand-blue shadow-[0_1px_3px_rgba(15,23,42,0.1)] border border-slate-200 font-bold'
                : 'text-text-mid hover:text-text-hi hover:bg-white/50'
            }`}
          >
            {opt.icon && <span className="text-text-lo">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Precision Automotive Slider with Tabular Mono Value
 */
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange,
  accentColor = 'blue', // 'blue' | 'green' | 'amber' | 'red'
  className = '',
}) {
  const accentClasses = {
    blue: 'accent-[#0B3D91]',
    green: 'accent-[#0F9D6B]',
    amber: 'accent-[#B45309]',
    red: 'accent-[#D7263D]',
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="font-display text-xs uppercase font-bold tracking-wider text-text-lo">
          {label}
        </label>
        <span className="font-mono text-xs font-bold text-text-hi tabular-nums px-2 py-0.5 rounded bg-bg-sunken border border-line">
          {typeof value === 'number' ? value : value} {unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 ${accentClasses[accentColor] || accentClasses.blue}`}
      />

      <div className="flex justify-between font-mono text-[10px] text-text-lo">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

/**
 * Automotive Rocker / Lever Toggle Switch
 */
export function Toggle({
  checked = false,
  onChange,
  label = '',
  sublabel = '',
  accent = 'blue',
  disabled = false,
  className = '',
}) {
  const accentBg = {
    blue: 'bg-[#0B3D91]',
    green: 'bg-[#0F9D6B]',
    amber: 'bg-[#B45309]',
    red: 'bg-[#D7263D]',
  };

  return (
    <label className={`inline-flex items-center justify-between cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || sublabel) && (
        <div className="mr-3 flex flex-col">
          {label && <span className="font-display text-xs font-bold text-text-hi">{label}</span>}
          {sublabel && <span className="font-mono text-[10px] text-text-lo">{sublabel}</span>}
        </div>
      )}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`block w-11 h-6 rounded-full border border-slate-300 transition-colors duration-200 ${
            checked ? (accentBg[accent] || accentBg.blue) : 'bg-slate-200'
          }`}
        />
        <div
          className={`dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-sm border border-slate-300 ${
            checked ? 'transform translate-x-5' : ''
          }`}
        />
      </div>
    </label>
  );
}
