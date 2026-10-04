import React from 'react';

/**
 * Real Automotive Instrument Warning Light Component
 * Types: 'engine' | 'oil' | 'battery' | 'coolant' | 'brake' | 'tire' | 'abs' | 'fuel'
 */
export function WarningLight({
  type = 'engine',
  active = false,
  color = 'amber', // 'amber' | 'red' | 'green' | 'blue'
  size = 28,
  showLabel = false,
  label = '',
  className = '',
  onClick,
}) {
  const colorConfigs = {
    amber: {
      lit: 'text-[#F2A900] drop-shadow-[0_0_8px_rgba(242,169,0,0.8)] fill-[#F2A900]/20',
      unlit: 'text-slate-600/40 fill-transparent',
      glowBg: 'bg-[#F2A900]/10 border-[#F2A900]/30',
    },
    red: {
      lit: 'text-[#D7263D] drop-shadow-[0_0_8px_rgba(215,38,61,0.85)] fill-[#D7263D]/20',
      unlit: 'text-slate-600/40 fill-transparent',
      glowBg: 'bg-[#D7263D]/10 border-[#D7263D]/30',
    },
    green: {
      lit: 'text-[#0F9D6B] drop-shadow-[0_0_8px_rgba(15,157,107,0.8)] fill-[#0F9D6B]/20',
      unlit: 'text-slate-600/40 fill-transparent',
      glowBg: 'bg-[#0F9D6B]/10 border-[#0F9D6B]/30',
    },
    blue: {
      lit: 'text-[#1E88E5] drop-shadow-[0_0_8px_rgba(30,136,229,0.8)] fill-[#1E88E5]/20',
      unlit: 'text-slate-600/40 fill-transparent',
      glowBg: 'bg-[#1E88E5]/10 border-[#1E88E5]/30',
    },
  };

  const c = colorConfigs[color] || colorConfigs.amber;

  const renderIconSvg = () => {
    switch (type) {
      case 'engine':
        // Check Engine MIL
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.2">
            <path d="M4 10V7h2V5h3v2h6V5h3v2h2v3h1v4h-1v2h-2v2h-4v-2H9v2H5v-2H3v-2H2v-4h2zm2 1h12v-2h-3V8H9v1H6v2zm12 3H6v2h12v-2z" />
          </svg>
        );
      case 'oil':
        // Oil Can with Drip
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14l3-5h8l3 5H4z" />
            <path d="M18 9l3-4h-2" />
            <path d="M7 9V6h4v3" />
            <path d="M19 18a2 2 0 11-4 0c0-1.5 2-3.5 2-3.5s2 2 2 3.5z" fill="currentColor" />
          </svg>
        );
      case 'battery':
        // 12V Cell with +/-
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M6 4v3m12-3v3" />
            <path d="M7 13h4m-2-2v4m7-2h4" />
          </svg>
        );
      case 'coolant':
        // Thermometer in Fluid
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 14.5a3.5 3.5 0 104 0V5a2 2 0 10-4 0v9.5z" />
            <path d="M12 9v5" />
            <path d="M4 20c1.5 0 2-1 3.5-1s2 1 3.5 1 2-1 3.5-1 2 1 3.5 1 2-1 3.5-1" />
          </svg>
        );
      case 'brake':
        // Brake System (!)
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" />
            <path d="M4.5 7.5A9.5 9.5 0 004.5 16.5" />
            <path d="M19.5 7.5A9.5 9.5 0 0119.5 16.5" />
            <path d="M12 9v4m0 3h.01" />
          </svg>
        );
      case 'tire':
        // TPMS Tire Pressure
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 16.5C3.5 14 3.5 10 4 7.5c1.5-3 5-4.5 8-4.5s6.5 1.5 8 4.5c.5 2.5.5 6.5 0 9" />
            <path d="M6 19.5h12M4 19.5l1.5-2m14.5 2l-1.5-2" />
            <path d="M12 8v5m0 3h.01" />
          </svg>
        );
      case 'abs':
        // Anti-lock Braking System
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7.5" />
            <path d="M4.5 7A9.5 9.5 0 004.5 17" />
            <path d="M19.5 7A9.5 9.5 0 0119.5 17" />
            <text x="12" y="14" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="monospace">ABS</text>
          </svg>
        );
      case 'fuel':
      default:
        // Fuel Station Pump
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h8v16H4zM12 10h2a2 2 0 012 2v6a1 1 0 002 0v-8l-3-3" />
            <path d="M7 8h2" />
          </svg>
        );
    }
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center p-1.5 rounded-lg transition-all ${
        active ? c.glowBg : 'bg-transparent'
      } ${onClick ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'} ${className}`}
      title={`${type.toUpperCase()} Warning ${active ? 'Active' : 'Standby'}`}
    >
      <div className={`transition-all duration-300 ${active ? c.lit : c.unlit}`}>
        {renderIconSvg()}
      </div>
      {showLabel && (
        <span className={`mt-1 font-mono text-[9px] uppercase tracking-wider font-bold ${active ? 'text-text-hi' : 'text-text-lo'}`}>
          {label || type}
        </span>
      )}
    </Component>
  );
}
