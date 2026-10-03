import React, { useState } from 'react';
import { Card, SectionLabel, Toggle } from './ui';
import { WrenchIcon, CheckCircleIcon } from './icons';

export default function MaintenanceTracker({ 
  partsWear = {}, 
  predictedFailureDays = {}, 
  onServicePart, 
  maintenanceModel, 
  aiMechanicEnabled, 
  setAiMechanicEnabled
}) {
  const statusConfig = {
    oil: { name: 'Engine Oil Life (Full Synthetic 5W-30)', label: 'Engine Oil', desc: 'Synthetic 5W-30 viscosity & lubricity index.' },
    brakes: { name: 'Brake Pad Integrity', label: 'Brake Pads', desc: 'Ceramic friction compound remaining thickness.' },
    battery: { name: '12V AGM Cranking Battery Health Index', label: 'Battery Health', desc: 'Electrochemical capacity & cranking state-of-health.' },
    coolant: { name: 'Cooling System Quality (50/50 OAT Glycol)', label: 'Cooling System', desc: 'Glycol concentration & corrosion inhibitor level.' }
  };

  const { trained, accuracy } = maintenanceModel || { trained: false, accuracy: 50 };
  const [servicingKey, setServicingKey] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const handleServiceClick = (key) => {
    setServicingKey(key);
    onServicePart(key);
    setToastMessage(`Subsystem Refreshed: ${statusConfig[key].label} restored to 100%`);
    setTimeout(() => {
      setServicingKey(null);
    }, 1200);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Oil Dipstick Graphic Component
  const renderOilDipstick = (value, isServicing) => {
    const fillPercent = isServicing ? 100 : value;
    const color = fillPercent >= 70 ? '#0F9D6B' : fillPercent >= 30 ? '#B45309' : '#D7263D';
    return (
      <div className="relative w-36 h-32 flex items-center justify-center">
        {/* Authentic Dipstick Blade */}
        <div className="relative w-12 h-28 bg-slate-200 border-2 border-slate-300 rounded-b-md overflow-hidden flex flex-col justify-end shadow-inner">
          {/* Crosshatch Pattern Background */}
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 6px)'
          }} />
          
          {/* Calibrated Level Marks */}
          <div className="absolute right-1 top-2 text-[8px] font-mono font-bold text-slate-500">MAX</div>
          <div className="absolute right-1 top-12 text-[8px] font-mono font-bold text-slate-500">SAFE</div>
          <div className="absolute right-1 bottom-3 text-[8px] font-mono font-bold text-slate-500">MIN</div>

          {/* Golden/Amber Oil Level Fill */}
          <div 
            className={`w-full transition-all duration-700 ease-out relative ${isServicing ? 'animate-pulse' : ''}`}
            style={{ 
              height: `${fillPercent}%`, 
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}80`
            }}
          >
            <div className="w-full h-1 bg-white/40 absolute top-0 left-0" />
          </div>
        </div>

        {/* Readout Pill */}
        <div className="absolute -bottom-1 flex flex-col items-center">
          <span className="text-base font-mono font-black text-[#0F172A] tabular-nums">
            {fillPercent}%
          </span>
          <span className="text-[9px] font-mono uppercase text-slate-700 font-bold">
            Dipstick Lvl
          </span>
        </div>
      </div>
    );
  };

  // 2. Brake Disc & Caliper Graphic Component
  const renderBrakeDisc = (value, isServicing) => {
    const fillPercent = isServicing ? 100 : value;
    const color = fillPercent >= 70 ? '#047857' : fillPercent >= 30 ? '#B45309' : '#D7263D';
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const strokeDash = circ - (fillPercent / 100) * circ;

    return (
      <div className="relative w-36 h-32 flex items-center justify-center">
        <svg className="w-28 h-28 transform -rotate-90">
          {/* Outer Rotor Ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="9"
            fill="none"
          />
          {/* Active Pad Thickness Arc */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth="9"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={strokeDash}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Caliper Clamp Accent on top-right */}
        <div className="absolute top-1 right-3 w-5 h-7 rounded bg-[#D7263D] shadow-sm flex items-center justify-center border border-white">
          <span className="text-[6px] font-mono text-white font-bold rotate-90">BREM</span>
        </div>

        {/* Center Rotor Hub with Lug Holes */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex flex-col items-center justify-center shadow-inner">
            <span className="text-xs font-mono font-black text-[#0F172A] tabular-nums">
              {fillPercent}%
            </span>
            <span className="text-[8px] font-mono uppercase text-slate-700 font-bold">Pad</span>
          </div>
        </div>
      </div>
    );
  };

  // 3. 12V Battery Cell Stack Component
  const renderBatteryCellStack = (value, isServicing) => {
    const fillPercent = isServicing ? 100 : value;
    const color = fillPercent >= 70 ? '#0F9D6B' : fillPercent >= 30 ? '#B45309' : '#D7263D';
    const totalBars = 5;
    const activeBars = Math.ceil((fillPercent / 100) * totalBars);

    return (
      <div className="relative w-36 h-32 flex flex-col items-center justify-center">
        {/* Battery Terminal Posts (+ and -) */}
        <div className="w-16 flex justify-between px-1.5 -mb-0.5 z-10">
          <div className="w-2.5 h-1.5 rounded-t bg-slate-400 border border-slate-500 flex items-center justify-center">
            <span className="text-[7px] text-white font-black leading-none">-</span>
          </div>
          <div className="w-2.5 h-1.5 rounded-t bg-[#D7263D] border border-red-600 flex items-center justify-center">
            <span className="text-[7px] text-white font-black leading-none">+</span>
          </div>
        </div>

        {/* Battery Main Enclosure */}
        <div className="w-20 h-20 rounded-md border-2 border-slate-300 bg-slate-100 p-1.5 flex flex-col justify-between shadow-inner">
          {[...Array(totalBars)].map((_, i) => {
            const barIndex = totalBars - 1 - i;
            const isLit = barIndex < activeBars;
            return (
              <div
                key={i}
                className="h-2.5 rounded-sm transition-all duration-300"
                style={{
                  backgroundColor: isLit ? color : '#E2E8F0',
                  boxShadow: isLit ? `0 0 6px ${color}60` : 'none'
                }}
              />
            );
          })}
        </div>

        {/* Readout */}
        <div className="mt-1 flex items-center gap-1">
          <span className="text-xs font-mono font-black text-[#0F172A] tabular-nums">
            {fillPercent}%
          </span>
          <span className="text-[9px] font-mono uppercase text-slate-700 font-bold">12.6 V</span>
        </div>
      </div>
    );
  };

  // 4. Radiator Coolant Arc Component
  const renderRadiatorCoolant = (value, isServicing) => {
    const fillPercent = isServicing ? 100 : value;
    const color = fillPercent >= 70 ? '#0B3D91' : fillPercent >= 30 ? '#B45309' : '#D7263D';
    return (
      <div className="relative w-36 h-32 flex flex-col items-center justify-center">
        {/* Radiator Cap and Expansion Chamber */}
        <div className="w-12 h-2 rounded-t bg-slate-400 border border-slate-500 mb-0.5" />
        
        {/* Vertical Coolant Column with Cooling Fin Lines */}
        <div className="relative w-20 h-18 rounded border-2 border-slate-300 bg-white overflow-hidden p-1 shadow-inner flex flex-col justify-end">
          {/* Subtle horizontal cooling fins */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 0, transparent 4px)'
          }} />

          {/* Fluid Level */}
          <div
            className={`w-full rounded-sm transition-all duration-700 ease-out relative ${isServicing ? 'animate-pulse' : ''}`}
            style={{
              height: `${fillPercent}%`,
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}70`
            }}
          >
            <div className="w-full h-1 bg-white/40 absolute top-0 left-0" />
          </div>
        </div>

        {/* Readout */}
        <div className="mt-1 flex items-center gap-1">
          <span className="text-xs font-mono font-black text-[#0F172A] tabular-nums">
            {fillPercent}%
          </span>
          <span className="text-[9px] font-mono uppercase text-slate-700 font-bold">92°C Temp</span>
        </div>
      </div>
    );
  };

  const renderPartGauge = (key, value, isServicing) => {
    switch (key) {
      case 'oil':
        return renderOilDipstick(value, isServicing);
      case 'brakes':
        return renderBrakeDisc(value, isServicing);
      case 'battery':
        return renderBatteryCellStack(value, isServicing);
      case 'coolant':
        return renderRadiatorCoolant(value, isServicing);
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 bg-white border border-[#DDE2EA] rounded-xl shadow-sm relative overflow-hidden">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-lg animate-fade-in">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SectionLabel label="PREDICTIVE WEAR & PROGNOSTICS" />
            <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border ${
              trained 
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                : 'border-slate-200 bg-slate-100 text-slate-700 font-semibold'
            }`}>
              {trained ? `AI Forecast: Active (${accuracy.toFixed(0)}%)` : 'AI Baseline'}
            </span>
          </div>
          <h3 className="text-xl font-heading font-bold text-[#0F172A] mt-1">Four-Point Automotive Subsystem Wear</h3>
        </div>

        {/* Mechanic AI Toggle */}
        <div className="flex items-center gap-3 bg-[#F8FAFC] px-3.5 py-1.5 rounded-xl border border-[#DDE2EA]">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-700 block font-bold">MECHANIC AI</span>
            <span className={`text-xs font-mono font-bold ${aiMechanicEnabled ? 'text-[#0B3D91]' : 'text-slate-700'}`}>
              {aiMechanicEnabled ? 'PREDICTIVE' : 'PASSIVE'}
            </span>
          </div>
          <Toggle checked={aiMechanicEnabled} onChange={() => setAiMechanicEnabled(!aiMechanicEnabled)} />
        </div>
      </div>

      {/* Four Automotive Wear Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const value = Math.max(0, Math.min(100, Math.round(partsWear[key] ?? 85)));
          const daysLeft = predictedFailureDays?.[key] || (key === 'brakes' ? 12 : key === 'oil' ? 28 : key === 'battery' ? 84 : 45);
          const isServicing = servicingKey === key;

          const bgBadge = value >= 70 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          value >= 30 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          'bg-rose-50 border-rose-200 text-rose-700 animate-pulse';

          return (
            <div 
              key={key} 
              className="rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] p-4 flex flex-col items-center justify-between text-center relative group hover:border-[#CBD5E1] transition shadow-xs"
            >
              {/* Top Subsystem Label */}
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-heading font-bold text-[#0F172A]">{config.label}</span>
                <span className={`text-[10px] font-mono font-bold uppercase border px-2 py-0.5 rounded-full ${bgBadge}`}>
                  {value >= 70 ? 'Optimal' : value >= 30 ? 'Moderate' : 'Critical'}
                </span>
              </div>

              {/* Automotive Part Wear Graphic */}
              <div className="my-2">
                {renderPartGauge(key, value, isServicing)}
              </div>

              {/* AI Failure Countdown */}
              <div className="my-2.5 w-full bg-white border border-[#E2E8F0] rounded-lg py-1.5 px-2">
                <span className="text-[10px] font-mono text-slate-700 block uppercase font-bold">AI FAILURE HORIZON</span>
                <span className={`text-xs font-mono font-bold ${value < 30 ? 'text-[#D7263D] animate-pulse' : 'text-[#0B3D91]'}`}>
                  {daysLeft} days remaining
                </span>
              </div>

              {/* Service Now Button */}
              <button
                type="button"
                onClick={() => handleServiceClick(key)}
                disabled={isServicing}
                className="mt-2 w-full py-2 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition border border-[#DDE2EA] bg-white hover:bg-blue-50/50 hover:border-[#0B3D91] hover:text-[#0B3D91] text-[#334155] flex items-center justify-center gap-1.5 shadow-xs"
              >
                <WrenchIcon className="w-3.5 h-3.5" />
                {isServicing ? 'Refilling 100%...' : 'Service Now'}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

