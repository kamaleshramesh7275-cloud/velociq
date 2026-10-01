import React, { useState, useMemo } from 'react';
import { 
  calculateMileageAtSpeed, 
  calculateRangeMatrix, 
  calculateLimpHomeSpeed, 
  VEHICLE_PHYSICS_PROFILES 
} from '../utils/speedMileagePhysics';
import { Card, SectionLabel, Toggle } from './ui';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function RangeVelocityGovernor({
  fuelPercent = 40,
  currentSpeed = 55,
  vehicleProfile = 'sedan',
  remainingDistance = 25,
  isLimpModeActive = false,
  onToggleLimpMode
}) {
  const profile = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;
  const tankCapacity = profile.tankCapacityLiters;
  const fuelLiters = Math.max(0, (tankCapacity * fuelPercent) / 100);

  // Manual interactive speed slider to test what-if scenarios
  const [simulatedSpeed, setSimulatedSpeed] = useState(Math.round(currentSpeed || 65));
  const effectiveSpeed = simulatedSpeed;

  // Real-time calculations
  const currentMileageStats = useMemo(() => {
    return calculateMileageAtSpeed(effectiveSpeed, vehicleProfile);
  }, [effectiveSpeed, vehicleProfile]);

  const projectedRangeAtEffectiveSpeed = useMemo(() => {
    return Math.round(fuelLiters * currentMileageStats.kmPerL);
  }, [fuelLiters, currentMileageStats]);

  const rangeMatrix = useMemo(() => {
    return calculateRangeMatrix(fuelLiters, vehicleProfile, [30, 50, 70, 90, 110, 130]);
  }, [fuelLiters, vehicleProfile]);

  const limpAdvice = useMemo(() => {
    return calculateLimpHomeSpeed(remainingDistance, fuelLiters, vehicleProfile);
  }, [remainingDistance, fuelLiters, vehicleProfile]);

  // Mini chart data: Speed vs Range
  const miniChartData = useMemo(() => {
    return [30, 45, 60, 75, 90, 105, 120, 135].map((v) => {
      const stats = calculateMileageAtSpeed(v, vehicleProfile);
      return {
        speed: v,
        range: Math.round(fuelLiters * stats.kmPerL)
      };
    });
  }, [fuelLiters, vehicleProfile]);

  // Status determination
  const isStrandingRisk = projectedRangeAtEffectiveSpeed < remainingDistance;
  const isMarginal = projectedRangeAtEffectiveSpeed < remainingDistance * 1.15;

  return (
    <div 
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 relative overflow-hidden ${
        isLimpModeActive 
          ? 'border-line border-t-4 border-t-[#F2A900] shadow-md' 
          : 'border-line'
      }`}
    >
      <div className="racing-stripe" />
      
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <SectionLabel label="RANGE GOVERNOR" />
            {isLimpModeActive && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-[#B45309] border border-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                Limp Mode Active
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-text-hi font-heading mt-1">Velocity-Dependent Range Limiter</h3>
        </div>

        {/* Limp Mode Autonomous Switch */}
        <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-2xl border border-line">
          <div className="text-right">
            <p className="text-[9px] uppercase font-mono text-slate-700 font-bold">Limp-Home</p>
            <p className={`text-xs font-mono font-bold ${isLimpModeActive ? 'text-[#B45309]' : 'text-slate-700'}`}>
              {isLimpModeActive ? `CAP ${limpAdvice.recommendedSpeedKmh} KM/H` : 'DISABLED'}
            </p>
          </div>
          <Toggle 
            checked={isLimpModeActive} 
            onChange={onToggleLimpMode} 
          />
        </div>
      </div>

      {/* Governed Speed Cap Callout Banner if Limp Mode Active */}
      {isLimpModeActive && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 flex items-center justify-between text-[#0F172A] shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold block text-[#B45309]">GOVERNED SPEED CAP ENFORCED</span>
            <span className="text-xs text-slate-700 font-medium">Throttle physically restricted to guarantee destination arrival.</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[#B45309] tabular-nums">
            {limpAdvice.recommendedSpeedKmh} <span className="text-xs font-semibold text-slate-600">km/h</span>
          </span>
        </div>
      )}

      {/* KPI Tiles: Fuel, Destination, Projected Range */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="rounded-xl border border-line bg-slate-50 p-3">
          <span className="text-[10px] font-mono uppercase text-text-lo block">Fuel Tank</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-[#0B3D91] tabular-nums">{fuelPercent.toFixed(1)}</span>
            <span className="text-xs text-text-mid">%</span>
          </div>
          <span className="text-[10px] font-mono text-text-lo">{fuelLiters.toFixed(1)} L</span>
        </div>

        <div className="rounded-xl border border-line bg-slate-50 p-3">
          <span className="text-[10px] font-mono uppercase text-text-lo block">Destination</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-text-hi tabular-nums">{Math.max(0, remainingDistance).toFixed(1)}</span>
            <span className="text-xs text-text-mid">km</span>
          </div>
          <span className="text-[10px] font-mono text-text-lo">Target Waypoint</span>
        </div>

        <div className={`rounded-xl border p-3 ${
          isStrandingRisk ? 'border-red-200 bg-red-50' :
          isMarginal ? 'border-amber-200 bg-amber-50' :
          'border-emerald-200 bg-emerald-50'
        }`}>
          <span className="text-[10px] font-mono uppercase text-text-lo block">Range @ Speed</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-bold font-mono tabular-nums ${
              isStrandingRisk ? 'text-[#D7263D]' : isMarginal ? 'text-[#B45309]' : 'text-[#0F9D6B]'
            }`}>
              {projectedRangeAtEffectiveSpeed}
            </span>
            <span className="text-xs text-text-mid">km</span>
          </div>
          <span className="text-[10px] font-mono text-text-lo">
            {isStrandingRisk ? 'Deficit!' : `+${(projectedRangeAtEffectiveSpeed - remainingDistance).toFixed(0)}km buffer`}
          </span>
        </div>
      </div>

      {/* Speed-vs-Range Mini Chart */}
      <div className="rounded-xl border border-line bg-slate-50 p-3 mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[10px] font-mono uppercase text-text-lo">Speed vs Range Curve</span>
          <span className="text-[10px] font-mono text-[#0B3D91] font-semibold">Peak at ~60 km/h</span>
        </div>
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={miniChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isLimpModeActive ? "#B45309" : "#0B3D91"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isLimpModeActive ? "#B45309" : "#0B3D91"} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="speed" stroke="#475569" tick={{ fontSize: 10, fill: '#334155' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#334155' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '10px', color: '#0F172A', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                formatter={(val) => [`${val} km`, 'Range']}
              />
              <Area type="monotone" dataKey="range" stroke={isLimpModeActive ? "#B45309" : "#0B3D91"} strokeWidth={2} fillOpacity={1} fill="url(#rangeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Speed What-If Slider */}
      <div className="rounded-xl border border-line bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[10px] font-mono uppercase text-text-lo">What-If Speed Slider</span>
          <span className="text-sm font-bold font-mono text-[#0B3D91] tabular-nums">
            {effectiveSpeed} <span className="text-[10px] text-text-lo font-normal">km/h</span>
          </span>
        </div>

        <input
          type="range"
          min="30"
          max="130"
          step="5"
          value={effectiveSpeed}
          onChange={(e) => setSimulatedSpeed(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B3D91]"
        />

        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-text-mid pt-1 border-t border-line">
          <span>Drag: <strong className="text-text-hi">{currentMileageStats.dragPowerKw} kW</strong></span>
          <span>Economy: <strong className="text-[#0F9D6B]">{currentMileageStats.kmPerL} km/L</strong></span>
          <span>Burn: <strong className="text-[#B45309]">{currentMileageStats.fuelRateLPerHr} L/h</strong></span>
        </div>
      </div>
    </div>
  );
}
