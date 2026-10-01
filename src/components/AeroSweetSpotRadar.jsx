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
    <Card className="p-6 bg-white border border-line shadow-showroom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4 mb-4">
        <div>
          <SectionLabel label="AERODYNAMICS & BSFC PHYSICS" />
          <h2 className="font-display text-xl font-bold text-text-hi mt-0.5 tracking-tight">
            Speed vs. Mileage Efficiency Island
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-bold uppercase text-text-lo">AERO SWEET SPOT:</span>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full border border-[#0F9D6B]/30 bg-[#0F9D6B]/10 text-[#0F9D6B] shadow-xs tabular-nums">
            {sweetSpotSpeed} km/h (~{profile.peakMileageKmL} km/L)
          </span>
        </div>
      </div>

      {/* Main Parabolic Efficiency Chart (Light Background & Grid) */}
      <div className="rounded-2xl border border-line bg-bg-sunken/40 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <div>
            <span className="font-display text-sm font-bold uppercase tracking-wider text-text-hi">
              Quadratic Aerodynamic Decay Curve (P_drag ∝ v³)
            </span>
            <p className="font-mono text-[11px] text-text-mid mt-0.5">
              Green band indicates optimal laminar window (55-65 km/h). Drag rises cubically past 80 km/h.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs mt-2 sm:mt-0 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0F9D6B]" />
              <span className="text-text-mid text-[11px]">Laminar Zone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0B3D91]" />
              <span className="text-[#0B3D91] font-bold text-[11px] tabular-nums">
                Live: {Math.round(currentSpeed)} km/h
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
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
