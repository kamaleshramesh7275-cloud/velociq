import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import {
  generateSpeedMileageCurve,
  calculateAeroDragTax,
  VEHICLE_PHYSICS_PROFILES,
} from '../utils/speedMileagePhysics';
import { Card, SectionLabel, CarSilhouette } from './ui';
import { WindIcon, WeightIcon } from './icons';

export default function AeroSweetSpotRadar({
  currentSpeed = 55,
  vehicleProfile = 'sedan',
  weather = null,
  fuelPrice = 95,
}) {
  const profile = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;

  // Environmental and load configuration state
  const [payloadKg, setPayloadKg] = useState(75);
  const [hasRoofRack, setHasRoofRack] = useState(false);
  const [useLiveWeather, setUseLiveWeather] = useState(true);
  const [manualWindSpeed, setManualWindSpeed] = useState(15);
  const [manualWindAngle, setManualWindAngle] = useState(0);

  // Resolve active wind values
  const effectiveWindSpeed =
    useLiveWeather && weather?.windspeed != null
      ? Math.round(weather.windspeed)
      : manualWindSpeed;

  const effectiveWindAngle =
    useLiveWeather && weather?.winddirection != null
      ? Math.round(weather.winddirection % 180)
      : manualWindAngle;

  const physicsOptions = useMemo(
    () => ({
      windSpeedKmh: effectiveWindSpeed,
      windAngleDeg: effectiveWindAngle,
      payloadKg,
      hasRoofRack,
    }),
    [effectiveWindSpeed, effectiveWindAngle, payloadKg, hasRoofRack]
  );

  // Generate dynamic parabolic curve points
  const curveData = useMemo(() => {
    return generateSpeedMileageCurve(vehicleProfile, physicsOptions);
  }, [vehicleProfile, physicsOptions]);

  // Calculate live drag tax & penalty metrics
  const dragTax = useMemo(() => {
    return calculateAeroDragTax(currentSpeed, vehicleProfile, physicsOptions, fuelPrice);
  }, [currentSpeed, vehicleProfile, physicsOptions, fuelPrice]);

  const dragForceN = dragTax?.currentDragForceN ?? dragTax?.dragForceNewtons ?? 0;
  const dragPowerKw = dragTax?.currentDragPowerKw ?? dragTax?.dragPowerKw ?? 0;
  const dragHp = dragTax?.dragHp ?? (dragPowerKw * 1.34102);
  const fuelMultiplier = dragTax?.fuelMultiplier ?? (1 + (dragTax?.efficiencyLossPct || 0) / 100);
  const costPenaltyPer100Km = dragTax?.excessCostPer100Km ?? dragTax?.costPenaltyPer100Km ?? 0;

  // Find nearest curve point for current speed
  const currentSpeedPoint = useMemo(() => {
    const roundedSpeed = Math.round(Math.min(135, Math.max(15, currentSpeed)));
    const matched = curveData.find((p) => Math.abs(p.speed - roundedSpeed) <= 2);
    return matched || { speed: roundedSpeed, kmPerL: 15 };
  }, [curveData, currentSpeed]);

  const sweetSpotSpeed = profile.optimalSpeedKmh;
  const isNearSweetSpot = Math.abs(currentSpeed - sweetSpotSpeed) <= 6;

  // Custom Car SVG Dot Component on the Recharts curve
  const renderCustomCarDot = (props) => {
    const { cx, cy, payload } = props || {};
    if (!payload || payload.speed !== currentSpeedPoint?.speed) return null;

    return (
      <g key="live-car-dot" transform={`translate(${cx}, ${cy})`}>
        {/* Soft pulse ring */}
        <circle cx="0" cy="0" r="14" fill="#0B3D91" fillOpacity="0.2" />
        <circle cx="0" cy="0" r="7" fill="#0B3D91" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
      </g>
    );
  };

  return (
    <Card className="p-4 sm:p-7 aerogel-card border border-slate-200/90 shadow-lg overflow-hidden">
      {/* Header with Technical Aerospace Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-3 sm:pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 border border-blue-200 text-[#0B3D91]">
              AEROSPACE DYNAMICS
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-semibold">
              BSFC FLIGHT ENVELOPE
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Wind Tunnel Dynamics & Cubic Drag Island
          </h2>
          <p className="font-mono text-xs text-slate-500 mt-0.5">
            Cubic velocity drag resistance equation: <code className="text-[#0B3D91] font-bold">P_drag = 0.5 · ρ · C_d · A · v³</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="font-display text-xs font-bold uppercase text-slate-600">SWEET SPOT:</span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 tabular-nums">
              {sweetSpotSpeed} km/h (~{profile.peakMileageKmL} km/L)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasRoofRack(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
              hasRoofRack
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {hasRoofRack ? 'ROOF RACK: MOUNTED (+0.05 Cd)' : '+ ADD ROOF RACK'}
          </button>
        </div>
      </div>

      {/* Aerodynamic Wind Tunnel Visualization Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 items-stretch">
        {/* Left: Wind Tunnel Streamline Simulation (Cols 1-5) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-700">
              VIRTUAL WIND TUNNEL STREAMLINES
            </span>
            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${
              currentSpeed <= 65 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {currentSpeed <= 65 ? 'LAMINAR BOUNDARY' : 'TURBULENT WAKE'}
            </span>
          </div>

          {/* SVG Animated Wind Tunnel Graphic */}
          <div className="relative w-full h-36 flex items-center justify-center rounded-xl bg-white border border-slate-200/90 shadow-inner overflow-hidden">
            {/* Wind tunnel grid floor and roof */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-slate-300" />
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-slate-300" />
            
            {/* Streamline Vectors */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 120">
              <defs>
                <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0B3D91" stopOpacity="0.8" />
                  <stop offset="50%" stopColor={currentSpeed > 75 ? "#E11D48" : "#059669"} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={currentSpeed > 75 ? "#D97706" : "#0284C7"} stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Upper streamline */}
              <path
                d="M 10,25 C 120,25 150,15 220,18 C 290,20 330,35 390,40"
                fill="none"
                stroke="url(#streamGrad)"
                strokeWidth={currentSpeed > 80 ? "2.5" : "1.8"}
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              {/* Mid roof contour streamline */}
              <path
                d="M 10,48 C 100,48 140,25 210,28 C 270,30 310,65 390,75"
                fill="none"
                stroke="url(#streamGrad)"
                strokeWidth={currentSpeed > 80 ? "3" : "2"}
                strokeDasharray="8 3"
              />
              {/* Hood / Windshield streamline */}
              <path
                d="M 10,72 C 90,72 130,55 190,56 C 250,58 290,82 390,88"
                fill="none"
                stroke="url(#streamGrad)"
                strokeWidth="2"
                strokeDasharray="7 4"
              />
              {/* Underbody ground effect streamline */}
              <path
                d="M 10,102 C 140,102 240,102 390,102"
                fill="none"
                stroke="#64748B"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              {/* Turbulent Vortex Rings at Rear for high speed */}
              {currentSpeed > 75 && (
                <g className="animate-spin origin-[330px_60px]">
                  <circle cx="330" cy="55" r="9" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />
                  <circle cx="355" cy="70" r="14" fill="none" stroke="#D97706" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.65" />
                </g>
              )}
            </svg>

            {/* Central Vehicle CAD Silhouette */}
            <div className="relative z-10 scale-125">
              <CarSilhouette profile={vehicleProfile} className="w-48 h-20 text-slate-800 drop-shadow-sm" />
            </div>
          </div>

          {/* Micro Telemetry Bar under Wind Tunnel */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200 text-center font-mono">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block font-bold">DRAG COEFF</span>
              <span className="text-xs font-bold text-slate-900">
                {(profile.cd + (hasRoofRack ? 0.05 : 0)).toFixed(2)} Cd
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block font-bold">FRONTAL AREA</span>
              <span className="text-xs font-bold text-slate-900">{profile.frontalAreaM2} m²</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block font-bold">AIR DENSITY</span>
              <span className="text-xs font-bold text-slate-900">1.225 kg/m³</span>
            </div>
          </div>
        </div>

        {/* Right: Parabolic Efficiency Chart (Cols 6-12) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <div>
              <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 block">
                Quadratic Aerodynamic Decay Curve (P_drag ∝ v³)
              </span>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                Green band indicates optimal laminar window (55-65 km/h).
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#059669]" />
                <span className="text-slate-600 text-[11px] font-semibold">Laminar Zone</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                <span className="h-2 w-2 rounded-full bg-[#0B3D91]" />
                <span className="text-[#0B3D91] font-bold text-[11px] tabular-nums">
                  Live: {Math.round(currentSpeed)} km/h
                </span>
              </div>
            </div>
          </div>

          <div className="h-48 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curveData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <defs>
                {/* Light Theme Parabolic Stroke Gradient: Amber -> Green Peak -> Racing Red */}
                <linearGradient id="aeroStrokeLight" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="36%" stopColor="#0F9D6B" />
                  <stop offset="50%" stopColor="#0F9D6B" />
                  <stop offset="68%" stopColor="#1E88E5" />
                  <stop offset="100%" stopColor="#D7263D" />
                </linearGradient>

                <linearGradient id="aeroFillLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B3D91" stopOpacity={0.12} />
                  <stop offset="60%" stopColor="#0F9D6B" stopOpacity={0.06} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F0" />

              <XAxis
                dataKey="speed"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                unit=" km/h"
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                domain={[0, 'auto']}
                unit=" km/L"
              />

              {/* Sweet-Spot Laminar Band (55 to 65 km/h) */}
              <ReferenceArea
                x1={55}
                x2={65}
                fill="#0F9D6B"
                fillOpacity={0.12}
                stroke="#0F9D6B"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.1)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  color: '#0F172A',
                }}
                labelStyle={{ color: '#0B3D91', fontWeight: 'bold' }}
                formatter={(val, name) => {
                  if (name === 'kmPerL') return [`${val} km/L`, 'Projected Mileage'];
                  if (name === 'dragPowerKw') return [`${val} kW`, 'Aero Drag Power'];
                  return [val, name];
                }}
                labelFormatter={(label) => `Transit Speed: ${label} km/h`}
              />

              <ReferenceLine
                x={sweetSpotSpeed}
                stroke="#0F9D6B"
                strokeDasharray="4 4"
                label={{
                  value: 'PEAK SWEET-SPOT',
                  fill: '#0F9D6B',
                  fontSize: 10,
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  position: 'top',
                }}
              />

              <Area
                type="monotone"
                dataKey="kmPerL"
                stroke="url(#aeroStrokeLight)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#aeroFillLight)"
                dot={renderCustomCarDot}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

      {/* Physics Callout Strip & Interactive Modifiers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Drag Force */}
        <div className="p-3 rounded-xl border border-line bg-bg-sunken/40">
          <span className="font-display text-[10px] uppercase font-bold text-slate-700 tracking-wider block">
            AERODYNAMIC DRAG FORCE
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums">
              {Math.round(dragForceN)}
            </span>
            <span className="font-mono text-xs text-slate-600 font-semibold">N</span>
          </div>
          <span className="text-[10px] font-mono text-slate-700 font-medium block mt-0.5">
            Air resistance acting on chassis
          </span>
        </div>

        {/* Drag Power Wasted */}
        <div className="p-3 rounded-xl border border-line bg-bg-sunken/40">
          <span className="font-display text-[10px] uppercase font-bold text-slate-700 tracking-wider block">
            POWER OVERCOME DRAG
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`font-mono text-xl font-bold tabular-nums ${
              dragPowerKw > 25 ? 'text-[#D7263D]' : 'text-[#0B3D91]'
            }`}>
              {dragPowerKw.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-slate-600 font-semibold">kW</span>
          </div>
          <span className="text-[10px] font-mono text-slate-700 font-medium block mt-0.5">
            {dragHp.toFixed(0)} equivalent engine HP
          </span>
        </div>

        {/* Fuel Penalty Multiplier */}
        <div className="p-3 rounded-xl border border-line bg-bg-sunken/40">
          <span className="font-display text-[10px] uppercase font-bold text-slate-700 tracking-wider block">
            FUEL BURN MULTIPLIER
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`font-mono text-xl font-bold tabular-nums ${
              fuelMultiplier > 1.3 ? 'text-[#D7263D]' : 'text-[#047857]'
            }`}>
              {fuelMultiplier.toFixed(2)}x
            </span>
            <span className="font-mono text-xs text-slate-600 font-semibold">vs baseline</span>
          </div>
          <span className="text-[10px] font-mono text-slate-700 font-medium block mt-0.5">
            Cost penalty: ${costPenaltyPer100Km.toFixed(2)}/100km
          </span>
        </div>

        {/* Payload & Wind Modifiers */}
        <div className="p-3 rounded-xl border border-line bg-bg-sunken/40 flex flex-col justify-between">
          <span className="font-display text-[10px] uppercase font-bold text-slate-700 tracking-wider block">
            ACTIVE CORRECTIONS
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 border border-slate-300 text-slate-700">
              <WeightIcon className="w-3 h-3" /> {payloadKg} kg
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 border border-slate-300 text-slate-700">
              <WindIcon className="w-3 h-3 text-[#0B3D91]" /> {effectiveWindSpeed} km/h
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
