import React, { useState, useMemo } from 'react';
import { 
  calculateMileageAtSpeed, 
  calculateRangeMatrix, 
  calculateLimpHomeSpeed, 
  VEHICLE_PHYSICS_PROFILES 
} from '../utils/speedMileagePhysics';

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

  // Update simulated speed when current speed changes significantly (if not manually overridden)
  const effectiveSpeed = simulatedSpeed;

  // Real-time calculations
  const currentMileageStats = useMemo(() => {
    return calculateMileageAtSpeed(effectiveSpeed, vehicleProfile);
  }, [effectiveSpeed, vehicleProfile]);

  const projectedRangeAtEffectiveSpeed = useMemo(() => {
    return Math.round(fuelLiters * currentMileageStats.kmPerL);
  }, [fuelLiters, currentMileageStats]);

  const rangeMatrix = useMemo(() => {
    return calculateRangeMatrix(fuelLiters, vehicleProfile, [40, 60, 80, 100, 120]);
  }, [fuelLiters, vehicleProfile]);

  const limpAdvice = useMemo(() => {
    return calculateLimpHomeSpeed(remainingDistance, fuelLiters, vehicleProfile);
  }, [remainingDistance, fuelLiters, vehicleProfile]);

  // Status determination
  const isStrandingRisk = projectedRangeAtEffectiveSpeed < remainingDistance;
  const isMarginal = projectedRangeAtEffectiveSpeed < remainingDistance * 1.15;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400 font-semibold">Range Intelligence</p>
            {isLimpModeActive && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Limp Mode Active
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">Dynamic Velocity Governor</h2>
        </div>

        {/* Limp Mode Autonomous Toggle */}
        <div className="flex items-center gap-3 bg-slate-950/70 px-3 py-2 rounded-2xl border border-slate-800">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Limp-Home Governor</p>
            <p className="text-xs font-semibold text-slate-200">
              {isLimpModeActive ? `Capped at ${limpAdvice.recommendedSpeedKmh} km/h` : 'Disabled'}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleLimpMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 outline-none ${
              isLimpModeActive ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform duration-300 ${
                isLimpModeActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Fuel Level & Destination Reachability Status */}
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        {/* Remaining Fuel Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Remaining Fuel</span>
            <span className="font-mono text-xs font-bold text-amber-300">{fuelPercent.toFixed(1)}%</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">{fuelLiters.toFixed(1)}</span>
            <span className="text-xs text-slate-400">Liters</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                fuelPercent < 15 ? 'bg-rose-500' : fuelPercent < 30 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, fuelPercent))}%` }}
            />
          </div>
        </div>

        {/* Destination Distance Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
          <span className="text-xs text-slate-400">Distance to Destination</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">{Math.max(0, remainingDistance).toFixed(1)}</span>
            <span className="text-xs text-slate-400">km remaining</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Fixed target waypoint route</p>
        </div>

        {/* Projected Range at Current Speed Card */}
        <div className={`rounded-2xl border p-3.5 ${
          isStrandingRisk
            ? 'border-rose-500/50 bg-rose-500/10'
            : isMarginal
              ? 'border-amber-500/50 bg-amber-500/10'
              : 'border-emerald-500/50 bg-emerald-500/10'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Projected Range</span>
            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
              isStrandingRisk 
                ? 'bg-rose-500/30 text-rose-300' 
                : isMarginal 
                  ? 'bg-amber-500/30 text-amber-300' 
                  : 'bg-emerald-500/30 text-emerald-300'
            }`}>
              {isStrandingRisk ? 'Stranding Risk' : isMarginal ? 'Caution' : 'Safe Reach'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${
              isStrandingRisk ? 'text-rose-400' : isMarginal ? 'text-amber-300' : 'text-emerald-400'
            }`}>
              {projectedRangeAtEffectiveSpeed}
            </span>
            <span className="text-xs text-slate-400">km at {effectiveSpeed} km/h</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {isStrandingRisk 
              ? `Deficit of ${(remainingDistance - projectedRangeAtEffectiveSpeed).toFixed(0)} km!` 
              : `+${(projectedRangeAtEffectiveSpeed - remainingDistance).toFixed(0)} km buffer`}
          </p>
        </div>
      </div>

      {/* Interactive Speed vs Range Slider Simulator */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Cruising Speed What-If Simulator
            </span>
            <p className="text-[11px] text-slate-500">Drag to observe how velocity directly scales aerodynamic drag and remaining range</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-cyan-400 font-mono">{effectiveSpeed}</span>
            <span className="text-xs text-slate-400 ml-1">km/h</span>
          </div>
        </div>

        <input
          type="range"
          min="30"
          max="130"
          step="5"
          value={effectiveSpeed}
          onChange={(e) => setSimulatedSpeed(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <div>
            <span>Aerodynamic Drag: </span>
            <span className="font-mono text-slate-200 font-semibold">{currentMileageStats.dragPowerKw} kW ({currentMileageStats.dragForceN} N)</span>
          </div>
          <div>
            <span>Projected Economy: </span>
            <span className="font-mono text-emerald-400 font-bold">{currentMileageStats.kmPerL} km/L</span>
          </div>
          <div>
            <span>Fuel Burn Rate: </span>
            <span className="font-mono text-amber-300 font-semibold">{currentMileageStats.fuelRateLPerHr} L/h</span>
          </div>
        </div>
      </div>

      {/* Speed-to-Range Spectrum Matrix Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Speed Spectrum vs. Range-to-Empty Matrix
        </h3>

        <div className="grid grid-cols-5 gap-2 text-center">
          {rangeMatrix.map((item) => {
            const reaches = item.rangeKm >= remainingDistance;
            const isOptimal = item.speedKmh === profile.optimalSpeedKmh || (item.speedKmh === 60 && profile.optimalSpeedKmh <= 62);

            return (
              <div
                key={item.speedKmh}
                className={`rounded-xl border p-2.5 flex flex-col justify-between transition ${
                  item.speedKmh === effectiveSpeed
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400'
                    : reaches
                      ? 'border-slate-800 bg-slate-900/60'
                      : 'border-rose-900/40 bg-rose-950/20'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    {item.speedKmh} km/h
                  </div>
                  {isOptimal && (
                    <span className="inline-block mt-0.5 px-1 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase">
                      Sweet Spot
                    </span>
                  )}
                  <div className="mt-2 text-base font-extrabold font-mono text-white">
                    {item.rangeKm} <span className="text-[10px] font-normal text-slate-400">km</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400 font-mono">
                    {item.mileageKmL} km/L
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] font-bold">
                  {reaches ? (
                    <span className="text-emerald-400">Reachable</span>
                  ) : (
                    <span className="text-rose-400">Depleted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Limp-Home Recommendation Banner */}
      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
        <div className="rounded-lg bg-amber-500/20 p-2 text-amber-300 shrink-0 border border-amber-500/30">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-xs text-slate-300">
          <span className="font-bold text-amber-300">AI Limp-Home Velocity Recommendation: </span>
          {limpAdvice.canReach ? (
            <>
              Cruise at <span className="text-white font-bold font-mono">{limpAdvice.recommendedSpeedKmh} km/h</span> to safely arrive with a 
              <span className="text-emerald-300 font-bold"> {limpAdvice.safetyBufferPct}% reserve margin</span> ({limpAdvice.projectedRangeKm} km total range). 
              {isLimpModeActive 
                ? ' The governor is currently enforcing this ceiling limit.'
                : ' Click "Limp-Home Governor" above to automatically lock your throttle to this limit.'}
            </>
          ) : (
            <span className="text-rose-300 font-semibold">
              Warning: Fuel volume is critically depleted ({fuelLiters.toFixed(1)} L). Even at maximum eco speed ({profile.optimalSpeedKmh} km/h), vehicle will fall short by {(remainingDistance - limpAdvice.projectedRangeKm).toFixed(0)} km. Divert to nearest refueling station immediately.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
