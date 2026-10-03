import React, { useState, useMemo, useEffect } from 'react';
import { Card } from './ui';
import { useFleet } from '../context/FleetContext';

export default function ChassisHeatmapDeck({ 
  telemetry = {},
  sportMode = false,
  activeAero = false 
}) {
  const { activeVehicle } = useFleet?.() || {};
  const [viewMode, setViewMode] = useState('isometric'); // 'isometric' | 'topdown'
  const [pressureUnit, setPressureUnit] = useState('bar'); // 'bar' | 'psi'

  const { speed = 55 } = telemetry;

  // Dynamic simulation of 4-wheel tire physics based on speed and load
  const [tires, setTires] = useState({
    fl: { bar: 2.32, tempC: 42.5, wear: 94, brakeGlow: 28 },
    fr: { bar: 2.34, tempC: 43.1, wear: 93, brakeGlow: 29 },
    rl: { bar: 2.48, tempC: 39.8, wear: 96, brakeGlow: 22 },
    rr: { bar: 2.50, tempC: 40.2, wear: 95, brakeGlow: 23 },
  });

  useEffect(() => {
    // Real-time micro-fluctuation of tire pressures & heat
    const interval = setInterval(() => {
      const speedFactor = (speed / 140) * 8;
      const sportFactor = sportMode ? 4 : 0;
      setTires({
        fl: { 
          bar: Number((2.30 + Math.sin(Date.now() / 3000) * 0.04 + speedFactor * 0.01).toFixed(2)), 
          tempC: Number((41.0 + speedFactor + sportFactor + Math.sin(Date.now() / 4000) * 1.2).toFixed(1)),
          wear: 94,
          brakeGlow: Math.min(100, Math.round(20 + speedFactor * 4))
        },
        fr: { 
          bar: Number((2.32 + Math.cos(Date.now() / 3200) * 0.04 + speedFactor * 0.01).toFixed(2)), 
          tempC: Number((41.5 + speedFactor + sportFactor + Math.cos(Date.now() / 4200) * 1.1).toFixed(1)),
          wear: 93,
          brakeGlow: Math.min(100, Math.round(22 + speedFactor * 4))
        },
        rl: { 
          bar: Number((2.46 + Math.sin(Date.now() / 3500) * 0.03 + speedFactor * 0.008).toFixed(2)), 
          tempC: Number((38.5 + speedFactor * 0.8 + sportFactor + Math.sin(Date.now() / 3800) * 0.9).toFixed(1)),
          wear: 96,
          brakeGlow: Math.min(100, Math.round(15 + speedFactor * 3))
        },
        rr: { 
          bar: Number((2.48 + Math.cos(Date.now() / 3400) * 0.03 + speedFactor * 0.008).toFixed(2)), 
          tempC: Number((39.0 + speedFactor * 0.8 + sportFactor + Math.cos(Date.now() / 4100) * 1.0).toFixed(1)),
          wear: 95,
          brakeGlow: Math.min(100, Math.round(16 + speedFactor * 3))
        },
      });
    }, 400);

    return () => clearInterval(interval);
  }, [speed, sportMode]);

  // Helper for thermal color
  const getThermalColor = (temp) => {
    if (temp < 38) return '#0284C7'; // Cool cyan
    if (temp <= 48) return '#059669'; // Optimal emerald
    if (temp <= 58) return '#D97706'; // Warm amber
    return '#E11D48'; // High heat ruby
  };

  const formatPressure = (barVal) => {
    if (pressureUnit === 'psi') {
      return `${(barVal * 14.5038).toFixed(1)} PSI`;
    }
    return `${barVal.toFixed(2)} bar`;
  };

  // Suspension load distribution calculation
  const frontLoadPct = useMemo(() => Math.round(52 + Math.sin(speed / 20) * 2), [speed]);
  const rearLoadPct = 100 - frontLoadPct;

  return (
    <Card className="p-4 sm:p-6 aerogel-card border border-slate-200/90 shadow-xl overflow-hidden relative">
      {/* Specular Ambient Light Reflection at Top Edge */}
      <div className="absolute -top-16 left-1/4 right-1/4 h-24 bg-gradient-to-b from-blue-100/60 to-transparent rounded-full blur-xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5 text-[#0B3D91]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8h4l3 5v3h-2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10.5px] uppercase font-bold text-slate-500 tracking-wider">
                CHASSIS & CORNERING DYNAMICS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-[#0B3D91] border border-blue-200">
                ACTIVE 4-CORNER SENSING
              </span>
            </div>
            <h3 className="font-display text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              3D Isometric Chassis & Dynamic Tire Heatmap
            </h3>
          </div>
        </div>

        {/* View & Unit Switchers */}
        <div className="flex items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setViewMode('isometric')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'isometric' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              3D AERO
            </button>
            <button
              type="button"
              onClick={() => setViewMode('topdown')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'topdown' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              TOP CHASSIS
            </button>
          </div>

          {/* Unit Toggle */}
          <button
            type="button"
            onClick={() => setPressureUnit(p => p === 'bar' ? 'psi' : 'bar')}
            className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            {pressureUnit.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Interactive CAD Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Side Telemetry: Front Axle (Cols 1-3) */}
        <div className="lg:col-span-3 space-y-3.5 order-2 lg:order-1">
          {/* Front Left Tire Pod */}
          <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-black text-slate-900">FRONT LEFT (FL)</span>
              <span 
                className="font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${getThermalColor(tires.fl.tempC)}18`, color: getThermalColor(tires.fl.tempC) }}
              >
                {tires.fl.tempC}°C
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                {formatPressure(tires.fl.bar)}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold">NOMINAL</span>
            </div>
            {/* Thermal Indicator Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(tires.fl.tempC / 80) * 100}%`, backgroundColor: getThermalColor(tires.fl.tempC) }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>Brake Heat: {tires.fl.brakeGlow}%</span>
              <span>Wear: {tires.fl.wear}%</span>
            </div>
          </div>

          {/* Rear Left Tire Pod */}
          <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-black text-slate-900">REAR LEFT (RL)</span>
              <span 
                className="font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${getThermalColor(tires.rl.tempC)}18`, color: getThermalColor(tires.rl.tempC) }}
              >
                {tires.rl.tempC}°C
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                {formatPressure(tires.rl.bar)}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold">NOMINAL</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(tires.rl.tempC / 80) * 100}%`, backgroundColor: getThermalColor(tires.rl.tempC) }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>Brake Heat: {tires.rl.brakeGlow}%</span>
              <span>Wear: {tires.rl.wear}%</span>
            </div>
          </div>
        </div>

        {/* Center: 3D Isometric Wireframe Hypercar Stage (Cols 4-9) */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-b from-slate-50/80 via-white to-slate-100/60 border border-slate-200/90 shadow-inner order-1 lg:order-2 overflow-hidden min-h-[300px]">
          {/* Isometric Perspective Background Grid */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px), linear-gradient(to right, #F1F5F9 1px, transparent 1px)',
              backgroundSize: '24px 24px, 48px 48px'
            }}
          />

          {/* Live Speed Aero Vapor Halo */}
          <div 
            className="absolute w-72 h-44 rounded-full bg-blue-400/10 blur-2xl pointer-events-none transition-all duration-500"
            style={{ transform: `scale(${1 + (speed / 140) * 0.4})` }}
          />

          {/* SVG 3D Isometric Wireframe Hypercar Projection */}
          <svg viewBox="0 0 500 280" className="w-full h-64 max-w-lg select-none relative z-10 drop-shadow-md">
            <defs>
              {/* Radial Thermal Heatmap Gradient for Tires */}
              <radialGradient id="flHeatGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={getThermalColor(tires.fl.tempC)} stopOpacity="0.9" />
                <stop offset="65%" stopColor={getThermalColor(tires.fl.tempC)} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="frHeatGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={getThermalColor(tires.fr.tempC)} stopOpacity="0.9" />
                <stop offset="65%" stopColor={getThermalColor(tires.fr.tempC)} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="rlHeatGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={getThermalColor(tires.rl.tempC)} stopOpacity="0.9" />
                <stop offset="65%" stopColor={getThermalColor(tires.rl.tempC)} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="rrHeatGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={getThermalColor(tires.rr.tempC)} stopOpacity="0.9" />
                <stop offset="65%" stopColor={getThermalColor(tires.rr.tempC)} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
              </radialGradient>

              {/* Aero Streamline Gradient */}
              <linearGradient id="aeroStreamLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#00C0F0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Aerodynamic Streamlines around Chassis */}
            <g className="animate-pulse" opacity="0.85">
              <path d="M 40,70 C 130,68 180,45 270,48 C 360,52 420,80 480,95" fill="none" stroke="url(#aeroStreamLine)" strokeWidth="1.8" strokeDasharray="8 4" />
              <path d="M 30,110 C 120,105 170,80 260,82 C 350,85 410,125 480,140" fill="none" stroke="url(#aeroStreamLine)" strokeWidth="2.2" strokeDasharray="10 3" />
              <path d="M 40,165 C 130,160 210,150 280,152 C 360,155 420,185 480,195" fill="none" stroke="url(#aeroStreamLine)" strokeWidth="1.8" strokeDasharray="7 5" />
              <path d="M 50,215 C 140,215 250,215 480,215" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.5" />
            </g>

            {/* 3D Isometric Ground Shadow */}
            <ellipse cx="250" cy="225" rx="170" ry="38" fill="#94A3B8" opacity="0.25" filter="blur(8px)" />

            {/* 3D Isometric Chassis Wireframe Silhouette */}
            <g transform="translate(45, 10)">
              {/* Underbody Tray */}
              <polygon points="120,195 290,195 330,165 80,165" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Main Body Cockpit & Panels */}
              <path
                d="M 90,165 C 110,125 150,95 210,95 C 270,95 310,120 330,165 Z"
                fill="rgba(255, 255, 255, 0.85)"
                stroke="#0B3D91"
                strokeWidth="2.2"
              />

              {/* Windshield & Greenhouse Glass */}
              <path
                d="M 140,135 C 160,105 190,102 240,102 C 270,102 290,120 300,135 Z"
                fill="#EFF6FF"
                stroke="#60A5FA"
                strokeWidth="1.5"
                opacity="0.85"
              />

              {/* Hood & Nose Cone */}
              <path
                d="M 50,180 C 70,165 90,160 120,165 L 120,195 C 80,195 60,188 50,180 Z"
                fill="#F8FAFC"
                stroke="#64748B"
                strokeWidth="1.8"
              />

              {/* Rear Deck & Active Wing */}
              <path
                d="M 290,165 C 320,160 340,165 365,178 L 365,195 C 330,195 310,190 290,195 Z"
                fill="#F8FAFC"
                stroke="#64748B"
                strokeWidth="1.8"
              />
              {activeAero && (
                <rect x="330" y="150" width="38" height="6" rx="2" fill="#E11D48" stroke="#FFFFFF" strokeWidth="1" className="animate-pulse" />
              )}

              {/* Center Kinetic Mass Beacon */}
              <circle cx="210" cy="155" r="5" fill="#0B3D91" />
              <circle cx="210" cy="155" r="12" fill="none" stroke="#0B3D91" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" />
            </g>

            {/* 4-Wheel Heatmap Rotors */}
            {/* FL Wheel */}
            <g transform="translate(130, 185)">
              <ellipse cx="0" cy="0" rx="20" ry="12" fill="url(#flHeatGrad)" stroke="#334155" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              <text x="0" y="18" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700" fill="#0F172A">
                FL
              </text>
            </g>

            {/* FR Wheel */}
            <g transform="translate(195, 140)">
              <ellipse cx="0" cy="0" rx="17" ry="10" fill="url(#frHeatGrad)" stroke="#475569" strokeWidth="2" opacity="0.9" />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
              <text x="0" y="-12" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700" fill="#0F172A">
                FR
              </text>
            </g>

            {/* RL Wheel */}
            <g transform="translate(340, 192)">
              <ellipse cx="0" cy="0" rx="22" ry="13" fill="url(#rlHeatGrad)" stroke="#334155" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
              <text x="0" y="20" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700" fill="#0F172A">
                RL
              </text>
            </g>

            {/* RR Wheel */}
            <g transform="translate(390, 148)">
              <ellipse cx="0" cy="0" rx="18" ry="11" fill="url(#rrHeatGrad)" stroke="#475569" strokeWidth="2" opacity="0.9" />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
              <text x="0" y="-12" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700" fill="#0F172A">
                RR
              </text>
            </g>
          </svg>

          {/* Under-Chassis Real-Time Load Balance Strip */}
          <div className="flex items-center gap-6 mt-1 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs text-xs font-mono">
            <span className="text-slate-600 font-bold">
              FRONT AXLE: <strong className="text-[#0B3D91]">{frontLoadPct}%</strong>
            </span>
            <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
              <div className="bg-[#0B3D91] h-full" style={{ width: `${frontLoadPct}%` }} />
              <div className="bg-[#059669] h-full" style={{ width: `${rearLoadPct}%` }} />
            </div>
            <span className="text-slate-600 font-bold">
              REAR AXLE: <strong className="text-[#059669]">{rearLoadPct}%</strong>
            </span>
          </div>
        </div>

        {/* Right Side Telemetry: Rear Axle (Cols 10-12) */}
        <div className="lg:col-span-3 space-y-3.5 order-3">
          {/* Front Right Tire Pod */}
          <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-black text-slate-900">FRONT RIGHT (FR)</span>
              <span 
                className="font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${getThermalColor(tires.fr.tempC)}18`, color: getThermalColor(tires.fr.tempC) }}
              >
                {tires.fr.tempC}°C
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                {formatPressure(tires.fr.bar)}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold">NOMINAL</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(tires.fr.tempC / 80) * 100}%`, backgroundColor: getThermalColor(tires.fr.tempC) }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>Brake Heat: {tires.fr.brakeGlow}%</span>
              <span>Wear: {tires.fr.wear}%</span>
            </div>
          </div>

          {/* Rear Right Tire Pod */}
          <div className="p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-black text-slate-900">REAR RIGHT (RR)</span>
              <span 
                className="font-mono text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${getThermalColor(tires.rr.tempC)}18`, color: getThermalColor(tires.rr.tempC) }}
              >
                {tires.rr.tempC}°C
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                {formatPressure(tires.rr.bar)}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold">NOMINAL</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(tires.rr.tempC / 80) * 100}%`, backgroundColor: getThermalColor(tires.rr.tempC) }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
              <span>Brake Heat: {tires.rr.brakeGlow}%</span>
              <span>Wear: {tires.rr.wear}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
