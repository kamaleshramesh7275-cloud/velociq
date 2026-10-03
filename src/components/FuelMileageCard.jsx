import React, { useMemo } from 'react';
import { Card, SectionLabel } from './ui';
import { WarningLight } from './ui/WarningLight';
import { useFleet } from '../context/FleetContext';
import { getEngineType } from '../config/engineTypes';

export default function FuelMileageCard({ telemetry = {} }) {
  const fleet = useFleet ? useFleet() : null;
  const activeVehicle = fleet?.activeVehicle;
  const engineTypeId = activeVehicle?.engineTypeId || 'i4_petrol';
  const engineType = getEngineType(engineTypeId);
  const isBev = engineType?.category === 'BEV';

  const mileageUnit = engineType?.mileageUnit || 'km/L';

  const { speed = 0, maf = 9.4, fuel = 40.1, tripMileage = 0.0, co2 = 0.0 } = telemetry || {};

  // Real-world physical conversion:
  // Fuel rate (L/h) ~ MAF (g/s) * 3600 / (14.7 * 740 g/L) ~ MAF * 0.33 L/h
  // km/L ~ Speed (km/h) / Fuel rate (L/h)
  const fuelRateLPerHour = useMemo(() => maf * 0.33, [maf]);
  const kmPerL = useMemo(() => {
    if (speed < 1 || fuelRateLPerHour <= 0) return '0.0';
    return (speed / fuelRateLPerHour).toFixed(1);
  }, [speed, fuelRateLPerHour]);

  // Fuel Needle Sweep: 180° to 0° (or arc from left E to right F)
  const clampedFuel = Math.min(100, Math.max(0, fuel));
  // Needle angle: from -60deg (Empty) to +60deg (Full)
  const needleAngle = -60 + (clampedFuel / 100) * 120;

  return (
    <Card className="p-4 sm:p-6 flex flex-col justify-between h-full aerogel-card border border-slate-200/90 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {isBev ? 'TRACTION ENERGY BUS' : 'FUEL & BSFC TELEMATICS'}
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
            {isBev ? 'High-Voltage State of Charge' : 'Fuel & Range Flow Deck'}
          </h3>
        </div>
        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
          <WarningLight type="fuel" active={fuel < 15} color={fuel < 10 ? 'red' : 'amber'} size={22} />
        </div>
      </div>

      {/* Luminous Analog Fuel / Energy Gauge */}
      <div className="my-3 sm:my-4 flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
        {/* Specular Ambient Glow */}
        <div className="absolute -top-10 left-1/4 right-1/4 h-16 bg-gradient-to-b from-blue-100/50 to-transparent rounded-full blur-md pointer-events-none" />

        <svg width="220" height="105" viewBox="0 0 220 105" className="max-w-full overflow-visible select-none">
          <defs>
            <linearGradient id="gaugeTrackGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <radialGradient id="needleHubGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>
          </defs>

          {/* Outer Chrome Bezel Arc */}
          <path
            d="M 28 85 A 88 88 0 0 1 192 85"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Inner Inset Track */}
          <path
            d="M 33 85 A 82 82 0 0 1 187 85"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="5"
          />

          {/* Reserve / Critical Band near E (0 - 15%) */}
          <path
            d="M 28 85 A 88 88 0 0 1 58 55"
            fill="none"
            stroke="#E11D48"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Optimal Efficiency / Full Band near F (70 - 100%) */}
          <path
            d="M 142 46 A 88 88 0 0 1 192 85"
            fill="none"
            stroke="#059669"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* E, 1/2, F Precision Text Marks */}
          <text x="20" y="90" fontFamily="Rajdhani, sans-serif" fontWeight="800" fontSize="13" fill="#E11D48">
            E
          </text>
          <text x="110" y="24" fontFamily="Rajdhani, sans-serif" fontWeight="800" fontSize="11" fill="#64748B" textAnchor="middle">
            1/2
          </text>
          <text x="198" y="90" fontFamily="Rajdhani, sans-serif" fontWeight="800" fontSize="13" fill="#059669">
            F
          </text>

          {/* Minor Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const ang = -60 + p * 120;
            const rad = (ang - 90) * (Math.PI / 180);
            const x1 = 110 + 80 * Math.cos(rad);
            const y1 = 88 + 80 * Math.sin(rad);
            const x2 = 110 + 94 * Math.cos(rad);
            const y2 = 88 + 94 * Math.sin(rad);
            return (
              <line 
                key={i} 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke="#64748B" 
                strokeWidth={i % 2 === 0 ? '2' : '1'} 
                strokeLinecap="round"
              />
            );
          })}

          {/* Precision Red Tapered Needle */}
          <g transform={`rotate(${needleAngle} 110 88)`} className="transition-transform duration-300 ease-out">
            <line x1="110" y1="88" x2="110" y2="12" stroke="#E11D48" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="110" y1="88" x2="110" y2="16" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
            <circle cx="110" cy="88" r="8" fill="url(#needleHubGrad)" stroke="#64748B" strokeWidth="1" />
            <circle cx="110" cy="88" r="3" fill="#0B3D91" />
          </g>
        </svg>

        <div className="flex items-center justify-between w-full px-4 text-xs font-mono mt-1">
          <span className="text-slate-500 font-semibold">{isBev ? 'Battery SoC:' : 'Tank Level:'}</span>
          <span className="font-bold text-slate-900 tabular-nums text-sm">
            {fuel.toFixed(1)}% <span className="text-xs font-normal text-slate-500">
              (~{Math.round(fuel * 0.55)} {isBev ? 'kWh' : 'L'})
            </span>
          </span>
        </div>
      </div>

      {/* Instant Economy vs Trip Distance Rows */}
      <div className="space-y-2.5">
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs hover:border-blue-300 transition">
          <div>
            <span className="font-display text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block">
              INSTANT EFFICIENCY
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-2xl font-black text-emerald-600 tabular-nums">
                {speed > 0 ? kmPerL : fuelRateLPerHour.toFixed(1)}
              </span>
              <span className="font-mono text-xs text-slate-600 font-bold">
                {speed > 0 ? mileageUnit : 'L/h (idle)'}
              </span>
            </div>
          </div>
          <span className={`font-mono text-[9.5px] font-bold px-2 py-0.5 rounded border ${
            speed >= 55 && speed <= 65 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {speed >= 55 && speed <= 65 ? 'SWEET SPOT' : 'ACTIVE ECO'}
          </span>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs hover:border-blue-300 transition">
          <div>
            <span className="font-display text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block">
              CURRENT TRIP DISTANCE
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                {tripMileage.toFixed(2)}
              </span>
              <span className="font-mono text-xs text-slate-600 font-bold">km</span>
            </div>
          </div>
          <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            ODOMETER SYNC
          </span>
        </div>
      </div>

      {/* CO2 Emissions Counter */}
      <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="font-display text-[10px] uppercase font-bold text-slate-500 block">CARBON FOOTPRINT</span>
          <span className="text-[11px] text-slate-600 font-medium">
            {isBev ? 'Zero Tailpipe Emissions' : `${(engineType?.co2Factor || 2.31).toFixed(2)} kg CO₂ / ${engineType?.mileageUnit?.split('/')[1] || 'L'}`}
          </span>
          </span>
        </div>
        <div className="text-right">
          <span className="font-mono text-base font-bold text-[#0B3D91] tabular-nums">
            {co2.toFixed(3)}
          </span>
          <span className="text-slate-600 font-semibold ml-1">kg</span>
          {isBev && (
            <div className="text-[9px] font-mono text-slate-500">
              WTW: {(telemetry.co2WellToWheel || (tripMileage * 0.088)).toFixed(3)} kg
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
