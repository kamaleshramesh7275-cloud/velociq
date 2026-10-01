import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import {
  generateSpeedMileageCurve,
  calculateAeroDragTax,
  VEHICLE_PHYSICS_PROFILES
} from '../utils/speedMileagePhysics';

export default function AeroSweetSpotRadar({
  currentSpeed = 55,
  vehicleProfile = 'sedan',
  weather = null,
  fuelPrice = 95
}) {
  const profile = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;

  // Environmental and load configuration state
  const [payloadKg, setPayloadKg] = useState(75); // 1 driver by default
  const [hasRoofRack, setHasRoofRack] = useState(false);
  const [useLiveWeather, setUseLiveWeather] = useState(true);
  const [manualWindSpeed, setManualWindSpeed] = useState(15);
  const [manualWindAngle, setManualWindAngle] = useState(0); // 0 = headwind, 180 = tailwind

  // Resolve active wind values
  const effectiveWindSpeed = useLiveWeather && weather?.windspeed != null 
    ? Math.round(weather.windspeed) 
    : manualWindSpeed;
  
  const effectiveWindAngle = useLiveWeather && weather?.winddirection != null
    ? Math.round(weather.winddirection % 180)
    : manualWindAngle;

  const physicsOptions = useMemo(() => ({
    windSpeedKmh: effectiveWindSpeed,
    windAngleDeg: effectiveWindAngle,
    payloadKg,
    hasRoofRack
  }), [effectiveWindSpeed, effectiveWindAngle, payloadKg, hasRoofRack]);

  // Generate dynamic parabolic curve points
  const curveData = useMemo(() => {
    return generateSpeedMileageCurve(vehicleProfile, physicsOptions);
  }, [vehicleProfile, physicsOptions]);

  // Calculate live drag tax & penalty metrics
  const dragTax = useMemo(() => {
    return calculateAeroDragTax(currentSpeed, vehicleProfile, physicsOptions, fuelPrice);
  }, [currentSpeed, vehicleProfile, physicsOptions, fuelPrice]);

  // Find nearest curve point for current speed to place the live dot
  const currentSpeedPoint = useMemo(() => {
    const roundedSpeed = Math.round(Math.min(135, Math.max(15, currentSpeed)));
    const matched = curveData.find(p => Math.abs(p.speed - roundedSpeed) <= 2);
    return matched || { speed: roundedSpeed, kmPerL: 15 };
  }, [curveData, currentSpeed]);

  const sweetSpotSpeed = profile.optimalSpeedKmh;
  const isSpeedingPastSweetSpot = currentSpeed > sweetSpotSpeed + 15;
  const isNearSweetSpot = Math.abs(currentSpeed - sweetSpotSpeed) <= 8;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400 font-semibold">Aerodynamics & BSFC</p>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider">
              Sweet-Spot Radar
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Speed vs. Mileage Efficiency Island</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sweet Spot:</span>
          <span className="text-xs font-black px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono">
            {sweetSpotSpeed} km/h (Peak ~{profile.peakMileageKmL} km/L)
          </span>
        </div>
      </div>

      {/* Main Parabolic Efficiency Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Parabolic Economy Curve & Live Operating Point
            </span>
            <p className="text-[11px] text-slate-500">
              Fuel efficiency drops quadratically at high speeds due to aerodynamic drag power (P_drag ∝ v³)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs mt-1 sm:mt-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm" />
              <span className="text-slate-400 text-[11px]">Eco Sweet-Spot</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse" />
              <span className="text-white font-bold text-[11px]">Current Speed ({Math.round(currentSpeed)} km/h)</span>
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="mileageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#0284c7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="speed" 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                unit=" km/h"
              />
              <YAxis 
                tickLine={false} 
                axisLine={{ stroke: '#334155' }} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                domain={[0, 'auto']}
                unit=" km/L"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(val, name) => {
                  if (name === 'kmPerL') return [`${val} km/L`, 'Projected Mileage'];
                  if (name === 'dragPowerKw') return [`${val} kW`, 'Aero Drag Power'];
                  return [val, name];
                }}
                labelFormatter={(label) => `Speed: ${label} km/h`}
              />
              <ReferenceLine 
                x={sweetSpotSpeed} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ value: 'Sweet Spot', fill: '#34d399', fontSize: 10, position: 'top' }}
              />
              <Area 
                type="monotone" 
                dataKey="kmPerL" 
                stroke="#38bdf8" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#mileageGradient)" 
              />
              <ReferenceDot 
                x={currentSpeedPoint.speed} 
                y={currentSpeedPoint.kmPerL} 
                r={6} 
                fill="#38bdf8" 
                stroke="#ffffff" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aerodynamic Drag Metrics Strip */}
      <div className="grid gap-3 sm:grid-cols-4 mb-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Air Resistance Force</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-white font-mono">{dragTax.currentDragForceN}</span>
            <span className="text-xs text-slate-400">Newtons</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Fd = 0.5 · ρ · Cd · A · v²</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Aero Power Loss</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-black text-amber-300 font-mono">{dragTax.currentDragPowerKw}</span>
            <span className="text-xs text-slate-400">kW ({Math.round(dragTax.currentDragPowerKw * 1.341)} HP)</span>
          </div>
          <p className="text-[10px] text-slate-500">Power overcoming wind</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">Engine Load for Air</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-black font-mono ${
              dragTax.currentAeroDragPct > 70 ? 'text-rose-400' : 'text-cyan-300'
            }`}>
              {dragTax.currentAeroDragPct}%
            </span>
            <span className="text-xs text-slate-400">of total power</span>
          </div>
          <p className="text-[10px] text-slate-500">vs rolling friction</p>
        </div>

        <div className={`rounded-xl border p-3 ${
          isSpeedingPastSweetSpot 
            ? 'border-rose-500/30 bg-rose-500/10' 
            : isNearSweetSpot 
              ? 'border-emerald-500/30 bg-emerald-500/10' 
              : 'border-slate-800 bg-slate-950/70'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-400">Aero Drag Fuel Penalty</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-black font-mono ${
              isSpeedingPastSweetSpot ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isSpeedingPastSweetSpot ? `+${dragTax.efficiencyLossPct}%` : 'Optimal'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {isSpeedingPastSweetSpot 
              ? `+₹${dragTax.excessCostPer100Km} / 100 km extra` 
              : 'Minimal aerodynamic drain'}
          </p>
        </div>
      </div>

      {/* Environmental & Load Modifiers Deck */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Drag Coefficient & Environmental Modifiers
            </h3>
            <p className="text-[11px] text-slate-500">Simulate how cargo weight, roof attachments, and headwinds bend the curve</p>
          </div>

          {weather && (
            <button
              type="button"
              onClick={() => setUseLiveWeather(!useLiveWeather)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition border ${
                useLiveWeather 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {useLiveWeather ? 'Live Weather Sync: ON' : 'Manual Wind'}
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Payload Weight Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Payload Weight</span>
              <span className="font-mono font-bold text-white">{payloadKg} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="25"
              value={payloadKg}
              onChange={(e) => setPayloadKg(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="mt-1 text-[10px] text-slate-500">Driver + passengers + cargo</p>
          </div>

          {/* Roof Rack Aerodynamic Toggle */}
          <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Roof Cargo / Box</span>
              <span className="text-[10px] text-slate-400">+15% Drag ($C_d$)</span>
            </div>
            <button
              type="button"
              onClick={() => setHasRoofRack(!hasRoofRack)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 outline-none ${
                hasRoofRack ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform duration-300 ${
                  hasRoofRack ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Wind Vector Display / Manual Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Headwind / Airspeed</span>
              <span className="font-mono font-bold text-cyan-300">
                {effectiveWindSpeed} km/h ({effectiveWindAngle <= 45 ? 'Headwind' : effectiveWindAngle >= 135 ? 'Tailwind' : 'Crosswind'})
              </span>
            </div>
            {!useLiveWeather ? (
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={manualWindSpeed}
                onChange={(e) => setManualWindSpeed(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            ) : (
              <div className="h-1.5 w-full bg-cyan-950/60 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (effectiveWindSpeed / 60) * 100)}%` }}
                />
              </div>
            )}
            <p className="mt-1 text-[10px] text-slate-500">
              Effective airspeed: {(currentSpeed + (effectiveWindAngle <= 45 ? effectiveWindSpeed : -effectiveWindSpeed * 0.5)).toFixed(0)} km/h
            </p>
          </div>
        </div>
      </div>

      {/* AI Radar Advice */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-start gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 shrink-0 border border-emerald-500/20">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-slate-300">
          <span className="font-bold text-white">AI Aero-Radar Verdict: </span>
          {isSpeedingPastSweetSpot ? (
            <>
              Vehicle velocity ({Math.round(currentSpeed)} km/h) is operating in the <span className="text-rose-400 font-bold">High Aerodynamic Drag Zone</span>. Air resistance consumes {dragTax.currentAeroDragPct}% of engine power. Trimming speed toward <span className="text-emerald-300 font-bold">{sweetSpotSpeed} km/h</span> restores up to <span className="text-emerald-300 font-bold">+{dragTax.efficiencyLossPct}% km/L</span>.
            </>
          ) : isNearSweetSpot ? (
            <>
              Operating within the optimal <span className="text-emerald-400 font-bold">Aerodynamic Sweet Spot Island</span> ({sweetSpotSpeed} km/h). Drag power is minimal, preserving optimal fuel-to-distance conversion.
            </>
          ) : (
            <>
              Cruising at {Math.round(currentSpeed)} km/h. At city speeds, aerodynamic drag accounts for only {dragTax.currentAeroDragPct}% of load; rolling resistance and stop-and-go acceleration are the primary factors.
            </>
          )}
        </div>
      </div>
    </section>
  );
}
