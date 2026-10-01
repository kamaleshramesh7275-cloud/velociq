import React, { useMemo } from 'react';
import { Card, SectionLabel } from './ui';
import { WarningLight } from './ui/WarningLight';

export default function FuelMileageCard({ telemetry }) {
  const { speed = 0, maf = 9.4, fuel = 40.1, tripMileage = 0.0, co2 = 0.0 } = telemetry;

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
    <Card className="p-6 flex flex-col justify-between h-full bg-white border border-line shadow-showroom">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <SectionLabel label="ENERGY & CONSUMPTION" />
          <h3 className="font-display text-lg font-bold text-text-hi mt-0.5 tracking-tight">
            Fuel & Range Telematics
          </h3>
        </div>
        <WarningLight type="fuel" active={fuel < 15} color={fuel < 10 ? 'red' : 'amber'} size={24} />
      </div>

      {/* Automotive Analog Fuel Gauge (E to F needle sweep) */}
      <div className="my-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-bg-sunken/60 border border-line">
        <svg width="200" height="95" viewBox="0 0 200 95" className="overflow-visible select-none">
          {/* Arc Background Track */}
          <path
            d="M 30 75 A 80 80 0 0 1 170 75"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Red Reserve Band near E */}
          <path
            d="M 30 75 A 80 80 0 0 1 55 50"
            fill="none"
            stroke="#D7263D"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Green Eco/Optimal Band near F */}
          <path
            d="M 125 42 A 80 80 0 0 1 170 75"
            fill="none"
            stroke="#0F9D6B"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* E and F letter markings */}
          <text x="22" y="80" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="13" fill="#D7263D">
            E
          </text>
          <text x="100" y="24" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="11" fill="#64748B" textAnchor="middle">
            1/2
          </text>
          <text x="176" y="80" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="13" fill="#0F9D6B">
            F
          </text>

          {/* Minor Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const ang = -60 + p * 120;
            const rad = (ang - 90) * (Math.PI / 180);
            const x1 = 100 + 74 * Math.cos(rad);
            const y1 = 80 + 74 * Math.sin(rad);
            const x2 = 100 + 86 * Math.cos(rad);
            const y2 = 80 + 86 * Math.sin(rad);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748B" strokeWidth={i % 2 === 0 ? '2' : '1'} />
            );
          })}

          {/* Center Pivot Needle */}
          <g transform={`rotate(${needleAngle} 100 80)`} className="transition-transform duration-300 ease-out">
            <line x1="100" y1="80" x2="100" y2="12" stroke="#D7263D" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="80" r="7" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="100" cy="80" r="2.5" fill="#FFFFFF" />
          </g>
        </svg>

        <div className="flex items-center justify-between w-full px-4 text-xs font-mono mt-1">
          <span className="text-text-lo">Capacity:</span>
          <span className="font-bold text-text-hi tabular-nums text-sm">
            {fuel.toFixed(1)}% <span className="text-xs font-normal text-text-lo">(~{Math.round(fuel * 0.55)} L)</span>
          </span>
        </div>
      </div>

      {/* Instant Economy vs Trip Distance Rows */}
      <div className="space-y-3">
        <div className="p-3 rounded-xl border border-line bg-bg-sunken/40 flex items-center justify-between">
          <div>
            <span className="font-display text-[11px] uppercase font-bold text-slate-700 tracking-wider block">
              INSTANT EFFICIENCY
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-2xl font-bold text-[#047857] tabular-nums">
                {speed > 0 ? kmPerL : fuelRateLPerHour.toFixed(1)}
              </span>
              <span className="font-mono text-xs text-slate-700 font-semibold">
                {speed > 0 ? 'km/L' : 'L/h (idle)'}
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#047857] border border-emerald-200">
            {speed >= 55 && speed <= 65 ? 'SWEET SPOT' : 'ACTIVE'}
          </span>
        </div>

        <div className="p-3 rounded-xl border border-line bg-bg-sunken/40 flex items-center justify-between">
          <div>
            <span className="font-display text-[11px] uppercase font-bold text-slate-700 tracking-wider block">
              CURRENT TRIP DISTANCE
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {tripMileage.toFixed(2)}
              </span>
              <span className="font-mono text-xs text-slate-700 font-semibold">km</span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-slate-700 font-bold">ODOMETER SYNC</span>
        </div>
      </div>

      {/* CO2 Emissions Counter */}
      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-mono">
        <div>
          <span className="font-display text-[10px] uppercase font-bold text-slate-700 block">CARBON FOOTPRINT</span>
          <span className="text-[11px] text-slate-700 font-medium">0.192 kg CO₂ / km factor</span>
        </div>
        <div className="text-right">
          <span className="font-mono text-base font-bold text-[#0B3D91] tabular-nums">
            {co2.toFixed(3)}
          </span>
          <span className="text-slate-600 font-semibold ml-1">kg</span>
        </div>
      </div>
    </Card>
  );
}
