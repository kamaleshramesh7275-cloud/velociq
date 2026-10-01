import React from 'react';
import { Card, SectionLabel, SeverityBadge } from '../ui';
import { PulseDot, CarIcon, SparklesIcon, LayersIcon } from '../icons';

export default function LivingVehicleTwinCard({ 
  vehicle, 
  baseline, 
  currentMetrics, 
  healthStatus 
}) {
  const normal90 = baseline || vehicle?.normalBaseline90d || {};
  const conditions = vehicle?.operatingConditions || {};
  const serviceHistory = vehicle?.serviceHistory || [];

  const fuelDelta = Number(currentMetrics?.fuelEfficiencyDeltaPct ?? -12.4).toFixed(1);
  const coolantDelta = Number(currentMetrics?.coolantDeltaC ?? 1.2).toFixed(1);
  const mafDelta = Number(currentMetrics?.mafDeltaPct ?? 6.8).toFixed(1);

  return (
    <Card className="p-6 bg-white border border-[#CBD5E1] shadow-sm flex flex-col gap-6 relative overflow-hidden">
      <div className="racing-stripe" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-200">
            <CarIcon className="w-5 h-5 text-[#0B3D91]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#0B3D91] font-bold">
                1. LIVING VEHICLE DIGITAL TWIN
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-mono font-bold text-[#0B3D91] border border-blue-200">
                <PulseDot color="blue" active={true} />
                ONLINE TWIN
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              {vehicle?.name || 'Alpha Cruiser'}
            </h2>
            <p className="text-xs font-mono text-slate-600">
              {vehicle?.model} • Baseline Odometer: {vehicle?.odometerBaselineKm?.toLocaleString()} km
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-line bg-slate-50 px-3 py-1.5 text-right">
            <span className="text-[9px] font-mono uppercase tracking-widest text-slate-700 font-bold block">
              Twin Fidelity Baseline
            </span>
            <span className="text-xs font-mono font-bold text-[#047857] flex items-center justify-end gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#047857] animate-pulse" />
              90-Day Rolling Model
            </span>
          </div>
        </div>
      </div>

      {/* Baseline vs Current Deviation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Fuel Economy */}
        <div className="rounded-xl border border-line bg-slate-50 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold">
              Fuel Efficiency
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              Number(fuelDelta) < -5 ? 'bg-red-50 text-[#D7263D] border border-red-200' : 'bg-emerald-50 text-[#047857] border border-emerald-200'
            }`}>
              {Number(fuelDelta) > 0 ? `+${fuelDelta}%` : `${fuelDelta}%`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {Number(currentMetrics?.kmL ?? 15.6).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-600 font-semibold">km/L</span>
          </div>
          <div className="mt-1 pt-1.5 border-t border-line/60 flex items-center justify-between text-[10px] font-mono text-slate-700">
            <span>90d Baseline:</span>
            <span className="text-slate-900 font-bold">{Number(normal90.fuelEfficiencyKmL ?? 17.8).toFixed(1)} km/L</span>
          </div>
        </div>

        {/* Operating Coolant */}
        <div className="rounded-xl border border-line bg-slate-50 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold">
              Thermal Equilibrium
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              Math.abs(Number(coolantDelta)) > 3 ? 'bg-amber-50 text-[#B45309] border border-amber-300' : 'bg-emerald-50 text-[#047857] border border-emerald-200'
            }`}>
              {Number(coolantDelta) > 0 ? `+${coolantDelta}°C` : `${coolantDelta}°C`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {Number(currentMetrics?.coolantC ?? 86.8).toFixed(1)}°C
            </span>
            <span className="text-xs font-mono text-slate-600 font-semibold">Coolant</span>
          </div>
          <div className="mt-1 pt-1.5 border-t border-line/60 flex items-center justify-between text-[10px] font-mono text-slate-700">
            <span>Normal Baseline:</span>
            <span className="text-slate-900 font-bold">{Number(normal90.avgCoolantTempC ?? 86.0).toFixed(1)}°C</span>
          </div>
        </div>

        {/* Airflow / MAF */}
        <div className="rounded-xl border border-line bg-slate-50 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-bold">
              Mass Airflow (MAF)
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              Math.abs(Number(mafDelta)) > 10 ? 'bg-amber-50 text-[#B45309] border border-amber-300' : 'bg-blue-50 text-[#0B3D91] border border-blue-200'
            }`}>
              {Number(mafDelta) > 0 ? `+${mafDelta}%` : `${mafDelta}%`}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {Number(currentMetrics?.mafGs ?? 9.4).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-600 font-semibold">g/s</span>
          </div>
          <div className="mt-1 pt-1.5 border-t border-line/60 flex items-center justify-between text-[10px] font-mono text-slate-700">
            <span>Cruise Baseline:</span>
            <span className="text-slate-900 font-bold">{Number(normal90.cruiseMafGs ?? 8.8).toFixed(1)} g/s</span>
          </div>
        </div>
      </div>

      {/* Operating Conditions & Environmental Learning */}
      <div className="rounded-xl border border-line bg-bg-raised/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-text-hi flex items-center gap-2">
            <LayersIcon className="w-3.5 h-3.5 text-accent-cyan" />
            Learned Operating Conditions Distribution
          </span>
          <span className="text-[10px] font-mono text-text-lo">
            {conditions.coldStartsPerMonth ?? 54} Cold Starts / Mo • Ambient {conditions.avgAmbientTempC ?? 26}°C
          </span>
        </div>

        {/* Stacked bar representing road types */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden flex">
            <div 
              style={{ width: `${(conditions.urbanRatio || 0.38) * 100}%` }} 
              className="bg-accent-amber transition-all duration-500" 
              title="Urban Stop-and-Go"
            />
            <div 
              style={{ width: `${(conditions.highwayRatio || 0.52) * 100}%` }} 
              className="bg-accent-cyan transition-all duration-500" 
              title="Highway Express"
            />
            <div 
              style={{ width: `${(conditions.mountainRatio || 0.10) * 100}%` }} 
              className="bg-accent-violet transition-all duration-500" 
              title="Mountain & Gradient"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-text-mid px-0.5">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-amber" />
              Urban ({Math.round((conditions.urbanRatio || 0.38) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-cyan" />
              Highway ({Math.round((conditions.highwayRatio || 0.52) * 100)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-violet" />
              Heavy/Grade ({Math.round((conditions.mountainRatio || 0.10) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Service & Repair History Baseline */}
      <div className="rounded-xl border border-line bg-bg-raised/20 p-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-lo block mb-2 font-bold">
          Historical Maintenance & Calibration Baseline
        </span>
        <div className="space-y-2">
          {serviceHistory.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-bg-surface/60 border border-line/60">
              <div className="flex items-center gap-2.5">
                <span className="text-text-lo text-[11px]">{item.date}</span>
                <span className="font-bold text-text-hi">{item.type}</span>
                <span className="text-[11px] text-text-mid hidden md:inline">({item.notes})</span>
              </div>
              <span className="text-accent-cyan font-bold tabular-nums">
                {item.mileage.toLocaleString()} km
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
