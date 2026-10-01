import React from 'react';

/**
 * Precision Automotive Silhouette Vector Component
 * Profiles: 'sedan' | 'suv' | 'hatchback' | 'truck'
 * Views: 'top' (for maps & aerodynamic curves) | 'side' (for showroom cards & landing)
 */
export function CarSilhouette({
  profile = 'sedan',
  view = 'top', // 'top' | 'side'
  className = 'w-10 h-10',
  color = 'currentColor',
}) {
  const normProfile = (profile || 'sedan').toLowerCase();

  if (view === 'side') {
    switch (normProfile) {
      case 'suv':
        return (
          <svg className={className} viewBox="0 0 100 36" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* SUV Side Profile: Higher roof, upright rear */}
            <path d="M4 24h6a6 6 0 0012 0h48a6 6 0 0012 0h12v-6l-8-6-16-2H34l-14 8H4v6z" fill={`${color}`} fillOpacity="0.08" />
            <path d="M22 18l10-6h18v6M52 12h18l6 6H52" />
            <circle cx="16" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
            <circle cx="76" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'hatchback':
        return (
          <svg className={className} viewBox="0 0 100 36" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Hatchback Side Profile: Compact, sloped rear hatch */}
            <path d="M6 24h6a6 6 0 0012 0h46a6 6 0 0012 0h10v-5l-12-7H40l-16 6H6v6z" fill={`${color}`} fillOpacity="0.08" />
            <path d="M26 18l12-5h22v5M62 13h10l8 5H62" />
            <circle cx="18" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
            <circle cx="76" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'truck':
        return (
          <svg className={className} viewBox="0 0 100 36" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Heavy Truck Side Profile: Cab-over or long hauler */}
            <path d="M4 24h6a6 6 0 0012 0h12a6 6 0 0012 0h28a6 6 0 0012 0h8v-16H36v4H18l-8 4v8z" fill={`${color}`} fillOpacity="0.08" />
            <rect x="38" y="10" width="48" height="12" fill={`${color}`} fillOpacity="0.15" />
            <circle cx="16" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
            <circle cx="34" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
            <circle cx="80" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'sedan':
      default:
        return (
          <svg className={className} viewBox="0 0 100 36" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Sports Sedan Side Profile: Sleek coupe-like roofline */}
            <path d="M4 24h6a6 6 0 0012 0h50a6 6 0 0012 0h10v-5l-14-5-22-3H36l-18 6H4v7z" fill={`${color}`} fillOpacity="0.08" />
            <path d="M22 19l12-5h26v5M62 14h10l10 5H62" />
            <circle cx="16" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
            <circle cx="78" cy="24" r="5" fill="#0F172A" stroke={color} strokeWidth="2" />
          </svg>
        );
    }
  }

  // Top View (Used for Map GPS Markers and Aero Curve Markers)
  switch (normProfile) {
    case 'suv':
      return (
        <svg className={className} viewBox="0 0 36 60" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Top-down SUV: broader shoulders, panoramic roof */}
          <rect x="6" y="4" width="24" height="52" rx="9" fill={`${color}`} fillOpacity="0.12" />
          <path d="M8 18h20M8 42h20M10 22h16v16H10z" fill={`${color}`} fillOpacity="0.25" />
          <line x1="12" y1="8" x2="24" y2="8" strokeWidth="2.5" />
          {/* Wheels */}
          <rect x="4" y="10" width="3" height="8" rx="1.5" fill="#0F172A" />
          <rect x="29" y="10" width="3" height="8" rx="1.5" fill="#0F172A" />
          <rect x="4" y="42" width="3" height="8" rx="1.5" fill="#0F172A" />
          <rect x="29" y="42" width="3" height="8" rx="1.5" fill="#0F172A" />
        </svg>
      );
    case 'hatchback':
      return (
        <svg className={className} viewBox="0 0 36 60" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Top-down Hatchback: compact length */}
          <rect x="7" y="6" width="22" height="48" rx="8" fill={`${color}`} fillOpacity="0.12" />
          <path d="M9 18h18M9 40h18M11 22h14v14H11z" fill={`${color}`} fillOpacity="0.25" />
          <rect x="5" y="12" width="3" height="7" rx="1.5" fill="#0F172A" />
          <rect x="28" y="12" width="3" height="7" rx="1.5" fill="#0F172A" />
          <rect x="5" y="39" width="3" height="7" rx="1.5" fill="#0F172A" />
          <rect x="28" y="39" width="3" height="7" rx="1.5" fill="#0F172A" />
        </svg>
      );
    case 'truck':
      return (
        <svg className={className} viewBox="0 0 36 60" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Top-down Truck: rectangular cargo bed + cabin */}
          <rect x="5" y="2" width="26" height="56" rx="4" fill={`${color}`} fillOpacity="0.12" />
          <rect x="7" y="5" width="22" height="15" rx="3" fill={`${color}`} fillOpacity="0.25" />
          <rect x="8" y="22" width="20" height="32" strokeDasharray="3 3" />
          <rect x="3" y="8" width="3" height="9" rx="1.5" fill="#0F172A" />
          <rect x="30" y="8" width="3" height="9" rx="1.5" fill="#0F172A" />
          <rect x="3" y="38" width="3" height="9" rx="1.5" fill="#0F172A" />
          <rect x="30" y="38" width="3" height="9" rx="1.5" fill="#0F172A" />
          <rect x="3" y="48" width="3" height="9" rx="1.5" fill="#0F172A" />
          <rect x="30" y="48" width="3" height="9" rx="1.5" fill="#0F172A" />
        </svg>
      );
    case 'sedan':
    default:
      return (
        <svg className={className} viewBox="0 0 36 60" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {/* Top-down Sports Sedan: aerodynamic tapered nose and tail */}
          <path d="M12 4C8 5 6 9 6 15v30c0 6 2 11 6 12h12c4-1 6-6 6-12V15c0-6-2-10-6-11H12z" fill={`${color}`} fillOpacity="0.12" />
          <path d="M8 17h20M9 41h18M10 21h16v16H10z" fill={`${color}`} fillOpacity="0.25" />
          <line x1="12" y1="8" x2="24" y2="8" strokeWidth="2.5" />
          {/* Wheels */}
          <rect x="4" y="11" width="3" height="8" rx="1.5" fill="#0F172A" />
          <rect x="29" y="11" width="3" height="8" rx="1.5" fill="#0F172A" />
          <rect x="4" y="41" width="3" height="8" rx="1.5" fill="#0F172A" />
          <rect x="29" y="41" width="3" height="8" rx="1.5" fill="#0F172A" />
        </svg>
      );
  }
}
