import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  calculateMileageAtSpeed,
  generateSpeedMileageCurve,
  calculateAeroDragTax,
  calculateKineticStopPenalty,
  VEHICLE_PHYSICS_PROFILES,
} from '../utils/speedMileagePhysics';
import {
  Card,
  SectionLabel,
  KpiTile,
  GearSelector,
  Slider,
  CarSilhouette,
  PlateBadge,
} from '../components/ui';
import {
  SimulatorIcon,
  RefreshIcon,
  SparklesIcon,
  WindIcon,
  WeightIcon,
  PulseDot,
} from '../components/icons';
import { useFleet } from '../context/FleetContext';

export default function SimulatorPage({ telemetry }) {
  const { activeVehicle } = useFleet();
  const engineType = {
    label: '2.0L Inline-4 DOHC 16V Turbo',
    shortLabel: '2.0L I4 Turbo',
    mileageUnit: 'km/L',
    fuelType: 'petrol',
    category: 'ICE_PETROL'
  };

  // Baseline live state
  const liveSpeed = Math.round(telemetry?.speed || 60);
  const liveProfile = activeVehicle?.profile || 'sedan';

  // Simulation Controls State
  const [targetSpeed, setTargetSpeed] = useState(liveSpeed);
  const [vehicleProfile, setVehicleProfile] = useState(liveProfile);
  const [payloadKg, setPayloadKg] = useState(120);
  const [headwindKmh, setHeadwindKmh] = useState(10); // -50 to +50
  const [ambientTempC, setAmbientTempC] = useState(25);
  const [tripDistanceKm, setTripDistanceKm] = useState(100);
  const [fuelPrice, setFuelPrice] = useState(1.65); // $/L
  const [valueOfTime, setValueOfTime] = useState(30); // $/hr
  const [stopEventsCount, setStopEventsCount] = useState(4); // 0 to 15 stops

  // Saved scenarios in memory (up to 3: A, B, C)
  const [scenarios, setScenarios] = useState([]);

  // Active gear preset state
  const [selectedGearMode, setSelectedGearMode] = useState(
    targetSpeed <= 75 ? 'eco' : targetSpeed <= 100 ? 'cruise' : 'rush'
  );

  const handleGearPresetChange = (mode) => {
    setSelectedGearMode(mode);
    if (mode === 'eco') setTargetSpeed(70);
    else if (mode === 'cruise') setTargetSpeed(95);
    else if (mode === 'rush') setTargetSpeed(120);
  };

  // Physics calculation options
  const physicsOptions = useMemo(
    () => ({
      windSpeedKmh: Math.abs(headwindKmh),
      windAngleDeg: headwindKmh >= 0 ? 0 : 180, // 0 = headwind, 180 = tailwind
      payloadKg,
      ambientTempC,
    }),
    [headwindKmh, payloadKg, ambientTempC]
  );

  const profile = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;
  const tankCapacityLiters = profile.fuelTankLiters || 50;

  // Active simulated result
  const simResult = useMemo(() => {
    return calculateMileageAtSpeed(targetSpeed, vehicleProfile, physicsOptions);
  }, [targetSpeed, vehicleProfile, physicsOptions]);

  // Baseline live comparison result
  const baselineResult = useMemo(() => {
    return calculateMileageAtSpeed(liveSpeed, liveProfile, { payloadKg: 75, windSpeedKmh: 0 });
  }, [liveSpeed, liveProfile]);

  // Curve data points for dual-axis chart (Speed vs Mileage & Range)
  const curveData = useMemo(() => {
    const rawCurve = generateSpeedMileageCurve(vehicleProfile, physicsOptions);
    return rawCurve.map((pt) => {
      const rangeAtSpeed = Math.round(tankCapacityLiters * pt.kmPerL);
      return {
        speed: pt.speed,
        mileage: pt.kmPerL,
        range: rangeAtSpeed,
        dragPower: pt.dragPowerKw,
      };
    });
  }, [vehicleProfile, physicsOptions, tankCapacityLiters]);

  // KPI Calculations
  const simMileage = simResult.kmPerL;
  const simRange = Math.round(tankCapacityLiters * simMileage);
  const simDurationMinutes = (tripDistanceKm / targetSpeed) * 60;
  const baselineDurationMinutes = (tripDistanceKm / Math.max(20, liveSpeed)) * 60;
  const timeSavedMinutes = Math.round((baselineDurationMinutes - simDurationMinutes) * 10) / 10;

  const cruiseFuelLiters = tripDistanceKm / Math.max(1, simMileage);
  const massKg = profile?.massKg || 1400;
  const stopPenalty = useMemo(() => {
    const single = calculateKineticStopPenalty(targetSpeed, 0, massKg);
    const extraFuelLiters = (single.fuelWastedLiters || 0) * stopEventsCount;
    const totalEnergyDissipatedKj = (single.energyKj || 0) * stopEventsCount;
    const totalCostPenalty = (single.costPenalty || 0) * stopEventsCount;
    return {
      energyKj: totalEnergyDissipatedKj,
      totalEnergyDissipatedKj,
      fuelWastedLiters: extraFuelLiters,
      extraFuelLiters,
      costPenalty: totalCostPenalty,
      isRecovered: single.isRecovered
    };
  }, [targetSpeed, massKg, stopEventsCount]);

  const totalFuelLiters = cruiseFuelLiters + (stopPenalty.extraFuelLiters || 0);
  const totalFuelCost = totalFuelLiters * fuelPrice;
  const totalCo2Kg = Math.round(totalFuelLiters * 2.31 * 10) / 10;

  const baselineFuelLiters = tripDistanceKm / baselineResult.kmPerL;
  const baselineFuelCost = baselineFuelLiters * fuelPrice;
  const costDelta = Math.round((totalFuelCost - baselineFuelCost) * 100) / 100;

  // Drag tax breakdown
  const dragTax = useMemo(() => {
    return calculateAeroDragTax(targetSpeed, vehicleProfile, physicsOptions, fuelPrice);
  }, [targetSpeed, vehicleProfile, physicsOptions, fuelPrice]);

  // Handle Save Scenario
  const handleSaveScenario = () => {
    if (scenarios.length >= 3) return;
    const names = ['Scenario A', 'Scenario B', 'Scenario C'];
    const newScenario = {
      id: Date.now(),
      name: names[scenarios.length],
      speed: targetSpeed,
      profile: vehicleProfile,
      mileage: simMileage,
      range: simRange,
      cost: totalFuelCost.toFixed(2),
      timeMin: simDurationMinutes.toFixed(1),
    };
    setScenarios([...scenarios, newScenario]);
  };

  const handleResetToLive = () => {
    setTargetSpeed(liveSpeed);
    setVehicleProfile(liveProfile);
    setPayloadKg(75);
    setHeadwindKmh(0);
    setAmbientTempC(25);
    setTripDistanceKm(100);
    setStopEventsCount(2);
    setSelectedGearMode(liveSpeed <= 75 ? 'eco' : liveSpeed <= 100 ? 'cruise' : 'rush');
  };

  // 3-Tier Matrix Data (Eco vs Cruise vs Rush)
  const tiers = useMemo(() => {
    const ecoSpeed = 70;
    const cruiseSpeed = 95;
    const rushSpeed = 120;

    const ecoRes = calculateMileageAtSpeed(ecoSpeed, vehicleProfile, physicsOptions);
    const cruiseRes = calculateMileageAtSpeed(cruiseSpeed, vehicleProfile, physicsOptions);
    const rushRes = calculateMileageAtSpeed(rushSpeed, vehicleProfile, physicsOptions);

    const ecoDurationMin = (tripDistanceKm / ecoSpeed) * 60;
    const cruiseDurationMin = (tripDistanceKm / cruiseSpeed) * 60;
    const rushDurationMin = (tripDistanceKm / rushSpeed) * 60;

    const ecoCost = (tripDistanceKm / ecoRes.kmPerL) * fuelPrice;
    const cruiseCost = (tripDistanceKm / cruiseRes.kmPerL) * fuelPrice;
    const rushCost = (tripDistanceKm / rushRes.kmPerL) * fuelPrice;

    // Marginal cost per minute saved from Cruise -> Rush
    const timeSavedCruiseToRush = cruiseDurationMin - rushDurationMin;
    const extraCostCruiseToRush = rushCost - cruiseCost;
    const marginalRatePerHour = timeSavedCruiseToRush > 0 ? (extraCostCruiseToRush / timeSavedCruiseToRush) * 60 : 0;

    // Determine optimal recommendation based on user's Value of Time
    const rushJustified = valueOfTime >= marginalRatePerHour;

    return {
      eco: { speed: ecoSpeed, mileage: ecoRes.kmPerL, cost: ecoCost, duration: ecoDurationMin },
      cruise: { speed: cruiseSpeed, mileage: cruiseRes.kmPerL, cost: cruiseCost, duration: cruiseDurationMin },
      rush: { speed: rushSpeed, mileage: rushRes.kmPerL, cost: rushCost, duration: rushDurationMin },
      marginalRatePerHour: Math.round(marginalRatePerHour * 10) / 10,
      rushJustified,
    };
  }, [vehicleProfile, physicsOptions, tripDistanceKm, fuelPrice, valueOfTime]);

  // Airflow Streamline Length & Color based on target speed
  const streamlineLen = Math.min(40, (targetSpeed / 140) * 40);
  const streamlineColor = targetSpeed > 105 ? '#D7263D' : targetSpeed > 80 ? '#F2A900' : '#0F9D6B';

  return (
    <div className="p-6 md:p-8 text-text-hi flex-1 overflow-auto bg-[#F4F6F9]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Page Header with 3px Racing Stripe */}
        <header className="relative bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <SectionLabel label="PHYSICS SIMULATION & WHAT-IF EXPERIMENT LAB" />
              <h1 className="font-heading text-2xl md:text-3xl font-black text-[#0A0F1D] tracking-tight mt-1 flex items-center gap-2.5">
                <SimulatorIcon className="w-7 h-7 text-[#0B3D91]" />
                Speed vs. Mileage What-If Laboratory
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-slate-800">Powertrain:</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-blue-50 text-[#0B3D91] border border-blue-200">
                  {engineType.label} • {engineType.mileageUnit}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-700 font-medium">
                Explore the cubic aerodynamic drag tax, stop-and-go energy dissipation, and financial trade-offs in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToLive}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-mono text-xs font-bold text-slate-800 shadow-xs transition"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Reset to Live</span>
              </button>

              <button
                type="button"
                onClick={handleSaveScenario}
                disabled={scenarios.length >= 3}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B3D91] hover:bg-[#082b68] font-mono text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
              >
                <span>Save Scenario ({scenarios.length}/3)</span>
              </button>
            </div>
          </div>
        </header>

        {/* Master Workspace: 2-Column Split (Left 360px Control Panel, Right Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Controls Panel (360px on desktop = 4 cols) */}
          <Card className="lg:col-span-4 p-5 bg-white border border-line shadow-showroom flex flex-col gap-5">
            <div className="border-b border-line pb-3 flex items-center justify-between">
              <span className="font-display text-xs uppercase font-bold tracking-wider text-text-lo">
                PHYSICS PARAMETER DECK
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0B3D91] border border-blue-200">
                LAMINAR MODEL v2.4
              </span>
            </div>

            {/* Target Speed Slider & Gated Shifter Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-text-lo">
                  TARGET TRANSIT SPEED
                </span>
                <span className="font-mono text-lg font-bold text-[#0B3D91] tabular-nums">
                  {targetSpeed} <span className="text-xs text-text-lo">km/h</span>
                </span>
              </div>

              {/* P-R-N-D Styled Gated Selector for Quick Speed Tiers */}
              <div className="flex justify-center">
                <GearSelector
                  value={selectedGearMode}
                  onChange={handleGearPresetChange}
                  options={[
                    { id: 'eco', label: 'E', name: 'Eco (70)' },
                    { id: 'cruise', label: 'C', name: 'Cruise (95)' },
                    { id: 'rush', label: 'R', name: 'Rush (120)' },
                  ]}
                />
              </div>

              <input
                type="range"
                min="20"
                max="140"
                step="1"
                value={targetSpeed}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTargetSpeed(val);
                  setSelectedGearMode(val <= 75 ? 'eco' : val <= 100 ? 'cruise' : 'rush');
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-[#0B3D91]"
              />
              <div className="flex justify-between font-mono text-[10px] text-text-lo">
                <span>20 km/h</span>
                <span>Sweet Spot: 60 km/h</span>
                <span>140 km/h</span>
              </div>
            </div>

            {/* Vehicle Profile Selection Cards with SVG Silhouettes */}
            <div className="space-y-2 pt-2 border-t border-line">
              <label className="font-display text-xs uppercase font-bold tracking-wider text-text-lo block">
                VEHICLE AERODYNAMIC PROFILE
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sedan', label: 'Sedan', cd: '0.28' },
                  { id: 'suv', label: 'SUV', cd: '0.36' },
                  { id: 'hatchback', label: 'Hatchback', cd: '0.31' },
                  { id: 'truck', label: 'Truck', cd: '0.45' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleProfile(v.id)}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition ${
                      vehicleProfile === v.id
                        ? 'border-[#0B3D91] bg-blue-50/80 shadow-xs'
                        : 'border-line bg-bg-sunken/40 hover:bg-slate-100'
                    }`}
                  >
                    <CarSilhouette profile={v.id} view="side" className="w-12 h-5 text-[#0B3D91]" />
                    <span className="font-display text-xs font-bold text-text-hi mt-1">
                      {v.label}
                    </span>
                    <span className="font-mono text-[9px] text-text-lo">Cd = {v.cd}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payload Slider */}
            <Slider
              label="Passenger & Cargo Payload"
              value={payloadKg}
              min={0}
              max={600}
              step={10}
              unit="kg"
              accentColor="blue"
              onChange={setPayloadKg}
            />

            {/* Headwind / Tailwind Slider */}
            <Slider
              label={`Wind Vector (${headwindKmh >= 0 ? 'Headwind' : 'Tailwind'})`}
              value={headwindKmh}
              min={-40}
              max={50}
              step={5}
              unit="km/h"
              accentColor="blue"
              onChange={setHeadwindKmh}
            />

            {/* Ambient Temperature */}
            <Slider
              label="Ambient Temperature"
              value={ambientTempC}
              min={-10}
              max={45}
              step={1}
              unit="°C"
              accentColor="blue"
              onChange={setAmbientTempC}
            />

            {/* Route Distance */}
            <Slider
              label="Trip Route Distance"
              value={tripDistanceKm}
              min={10}
              max={500}
              step={10}
              unit="km"
              accentColor="blue"
              onChange={setTripDistanceKm}
            />

            {/* Economics: Fuel Price & Value of Time */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line">
              <div>
                <label className="font-display text-[11px] uppercase font-bold text-text-lo block">
                  Fuel Price ($/L)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-line bg-bg-sunken px-3 py-1.5 font-mono text-xs text-text-hi focus:border-[#0B3D91] outline-none"
                />
              </div>

              <div>
                <label className="font-display text-[11px] uppercase font-bold text-text-lo block">
                  Value of Time ($/hr)
                </label>
                <input
                  type="number"
                  step="5"
                  value={valueOfTime}
                  onChange={(e) => setValueOfTime(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-line bg-bg-sunken px-3 py-1.5 font-mono text-xs text-text-hi focus:border-[#0B3D91] outline-none"
                />
              </div>
            </div>

            {/* Stop-and-Go Signal Cycles */}
            <Slider
              label="Stop-and-Go Traffic Cycles"
              value={stopEventsCount}
              min={0}
              max={15}
              step={1}
              unit="stops"
              accentColor="red"
              onChange={setStopEventsCount}
            />
          </Card>

          {/* RIGHT COLUMN: Results Workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Top 5 White KPI Tiles with Delta Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              <KpiTile
                label="PROJECTED MILEAGE"
                value={simMileage}
                unit="km/L"
                delta={Math.round((simMileage - baselineResult.kmPerL) * 10) / 10}
                deltaType={simMileage >= baselineResult.kmPerL ? 'positive' : 'negative'}
              />
              <KpiTile
                label="RANGE-TO-EMPTY"
                value={simRange}
                unit="km"
                delta={simRange - Math.round(tankCapacityLiters * baselineResult.kmPerL)}
                deltaType={simRange >= tankCapacityLiters * baselineResult.kmPerL ? 'positive' : 'negative'}
              />
              <KpiTile
                label="TOTAL TRIP COST"
                value={`$${totalFuelCost.toFixed(2)}`}
                delta={`$${costDelta}`}
                deltaType={costDelta <= 0 ? 'positive' : 'negative'}
              />
              <KpiTile
                label="TIME SAVED"
                value={timeSavedMinutes}
                unit="min"
                delta={timeSavedMinutes}
                deltaType={timeSavedMinutes >= 0 ? 'positive' : 'negative'}
              />
              <KpiTile
                label="CO2 FOOTPRINT"
                value={totalCo2Kg}
                unit="kg"
                delta={Math.round((totalCo2Kg - (baselineFuelLiters * 2.31)) * 10) / 10}
                deltaType={totalCo2Kg <= baselineFuelLiters * 2.31 ? 'positive' : 'negative'}
              />
            </div>

            {/* Main Dual-Axis Chart: Speed vs. Mileage & Range with SVG Airflow Streamlines */}
            <Card className="p-6 bg-white border border-line shadow-showroom">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-3 mb-4">
                <div>
                  <SectionLabel label="DUAL-AXIS CHARACTERISTIC" />
                  <h3 className="font-display text-lg font-bold text-text-hi mt-0.5 tracking-tight">
                    Speed vs. Fuel Mileage & Continuous Range
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#0B3D91]" />
                    <span className="text-text-mid font-semibold">Mileage (km/L)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#0F9D6B]" />
                    <span className="text-text-mid font-semibold">Range (km)</span>
                  </div>
                </div>
              </div>

              {/* Chart Viewport */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F0" />
                    <XAxis
                      dataKey="speed"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      unit=" km/h"
                    />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tick={{ fill: '#0B3D91', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      unit=" km/L"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tick={{ fill: '#0F9D6B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      unit=" km"
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
                        if (name === 'Mileage') return [`${val} km/L`, 'Fuel Economy'];
                        if (name === 'Range') return [`${val} km`, 'Full Tank Range'];
                        return [val, name];
                      }}
                    />

                    {/* Active Target Speed Reference Line */}
                    <ReferenceLine
                      x={targetSpeed}
                      yAxisId="left"
                      stroke="#0B3D91"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />

                    {/* Saved Scenarios as Dashed Lines */}
                    {scenarios.map((sc) => (
                      <ReferenceLine
                        key={sc.id}
                        x={sc.speed}
                        yAxisId="left"
                        stroke="#B45309"
                        strokeDasharray="2 2"
                        label={{
                          value: `${sc.name}: ${sc.speed} km/h`,
                          fill: '#B45309',
                          fontSize: 9,
                          fontFamily: 'JetBrains Mono',
                          position: 'top',
                        }}
                      />
                    ))}

                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="mileage"
                      name="Mileage"
                      stroke="#0B3D91"
                      strokeWidth={2.5}
                      dot={false}
                    />

                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="range"
                      name="Range"
                      stroke="#0F9D6B"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Airflow Streamline Visualizer at Bottom of Chart */}
              <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <CarSilhouette profile={vehicleProfile} view="top" className="w-6 h-10 text-[#0B3D91]" />
                    {/* SVG Airflow Streamlines extending behind car */}
                    <svg width="60" height="20" className="ml-2 overflow-visible">
                      <line x1="0" y1="5" x2={streamlineLen} y2="5" stroke={streamlineColor} strokeWidth="2" strokeDasharray="3 2" />
                      <line x1="0" y1="10" x2={streamlineLen * 1.2} y2="10" stroke={streamlineColor} strokeWidth="2.5" />
                      <line x1="0" y1="15" x2={streamlineLen} y2="15" stroke={streamlineColor} strokeWidth="2" strokeDasharray="3 2" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-display text-xs font-bold text-text-hi block">
                      Aero Wake Dispersion & Flow Drag
                    </span>
                    <span className="font-mono text-[10px] text-text-lo">
                      Streamlines stretch and shift to redline as cubic drag takes over
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] text-text-lo block">DRAG POWER DISSIPATED</span>
                  <span className="font-mono text-sm font-bold text-[#D7263D] tabular-nums">
                    {Number(dragTax?.dragPowerKw ?? dragTax?.currentDragPowerKw ?? 0).toFixed(1)} kW
                  </span>
                </div>
              </div>
            </Card>

            {/* Drag Tax Meter (Horizontal Redline Strip) */}
            <Card className="p-4 bg-white border border-line shadow-showroom">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-display font-bold text-text-hi">
                  AERODYNAMIC DRAG TAX METER
                </span>
                <span className="text-[#D7263D] font-bold text-[11px]">
                  90 to 120 km/h = 2.37x aerodynamic power
                </span>
              </div>
              {/* Horizontal Bar Styled Like a Tachometer Redline Strip */}
              <div className="relative h-4 w-full rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex">
                <div style={{ width: '40%' }} className="bg-[#0F9D6B] h-full" title="0-60 km/h (Laminar)" />
                <div style={{ width: '25%' }} className="bg-[#1E88E5] h-full" title="60-90 km/h (Transitional)" />
                <div style={{ width: '15%' }} className="bg-[#F2A900] h-full" title="90-110 km/h (Elevated Drag)" />
                <div style={{ width: '20%' }} className="bg-[#D7263D] h-full" title="110-140 km/h (Redline Drag)" />
              </div>
              <div className="flex justify-between font-mono text-[9px] text-text-lo mt-1 px-1">
                <span>0 km/h (Laminar)</span>
                <span>60 km/h (Peak Economy)</span>
                <span>90 km/h (Drag Pivot)</span>
                <span className="text-[#D7263D] font-bold">120+ km/h (Severe Drag)</span>
              </div>
            </Card>

            {/* 3-Tier Optimization Matrix: Eco vs Cruise vs Rush */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <SectionLabel label="TRIP ECONOMICS MATRIX" />
                  <h3 className="font-display text-lg font-bold text-text-hi mt-0.5">
                    3-Tier Speed & Financial Time Trade-off Matrix
                  </h3>
                </div>
                <span className="font-mono text-xs text-text-mid">
                  Marginal cost to rush: <strong className="text-text-hi">${tiers.marginalRatePerHour}/hr</strong>
                </span>
              </div>

              {/* Economic Verdict Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                tiers.rushJustified
                  ? 'border-[#0F9D6B]/40 bg-[#0F9D6B]/10 text-slate-800'
                  : 'border-amber-300 bg-amber-50 text-slate-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${tiers.rushJustified ? 'bg-[#0F9D6B]' : 'bg-[#B45309]'}`} />
                  <span className="font-mono text-xs font-bold">
                    {tiers.rushJustified
                      ? `Economic Verdict: Rushing at 120 km/h is justified at your $${valueOfTime}/hr Value of Time (costs $${tiers.marginalRatePerHour}/hr to save time).`
                      : `Economic Verdict: Rushing is economically wasteful. It costs $${tiers.marginalRatePerHour}/hr in fuel drag to save time, exceeding your $${valueOfTime}/hr threshold.`}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-300 shrink-0">
                  {tiers.rushJustified ? 'RUSH JUSTIFIED' : 'CRUISE RECOMMENDED'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Tier 1: Eco (70 km/h) */}
                <div className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
                  !tiers.rushJustified && valueOfTime < 25 ? 'ring-2 ring-[#0F9D6B]' : 'border-line'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xs font-bold uppercase text-[#0F9D6B]">TIER 1: ECO</span>
                      <span className="font-mono text-xs text-text-lo">70 km/h</span>
                    </div>
                    <div className="mt-2">
                      <span className="font-mono text-2xl font-bold text-text-hi">{tiers.eco.mileage.toFixed(1)}</span>
                      <span className="font-mono text-xs text-text-lo ml-1">km/L</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-line text-xs font-mono space-y-1">
                    <div className="flex justify-between text-text-mid">
                      <span>Trip Fuel:</span> <strong>${tiers.eco.cost.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-text-mid">
                      <span>Duration:</span> <strong>{tiers.eco.duration.toFixed(0)} min</strong>
                    </div>
                  </div>
                </div>

                {/* Tier 2: Cruise (95 km/h) */}
                <div className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
                  !tiers.rushJustified ? 'ring-2 ring-[#0F9D6B]' : 'border-line'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xs font-bold uppercase text-[#0B3D91]">TIER 2: CRUISE</span>
                      <span className="font-mono text-xs text-text-lo">95 km/h</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        <span className="font-mono text-2xl font-bold text-text-hi">{tiers.cruise.mileage.toFixed(1)}</span>
                        <span className="font-mono text-xs text-text-lo ml-1">km/L</span>
                      </div>
                      {!tiers.rushJustified && (
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#0F9D6B] border border-emerald-200">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-line text-xs font-mono space-y-1">
                    <div className="flex justify-between text-text-mid">
                      <span>Trip Fuel:</span> <strong>${tiers.cruise.cost.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-text-mid">
                      <span>Duration:</span> <strong>{tiers.cruise.duration.toFixed(0)} min</strong>
                    </div>
                  </div>
                </div>

                {/* Tier 3: Rush (120 km/h) */}
                <div className={`p-4 rounded-xl border bg-white shadow-xs flex flex-col justify-between ${
                  tiers.rushJustified ? 'ring-2 ring-[#0F9D6B]' : 'border-line'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xs font-bold uppercase text-[#D7263D]">TIER 3: RUSH</span>
                      <span className="font-mono text-xs text-text-lo">120 km/h</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        <span className="font-mono text-2xl font-bold text-text-hi">{tiers.rush.mileage.toFixed(1)}</span>
                        <span className="font-mono text-xs text-text-lo ml-1">km/L</span>
                      </div>
                      {tiers.rushJustified && (
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#0F9D6B] border border-emerald-200">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-line text-xs font-mono space-y-1">
                    <div className="flex justify-between text-text-mid">
                      <span>Trip Fuel:</span> <strong>${tiers.rush.cost.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-text-mid">
                      <span>Duration:</span> <strong>{tiers.rush.duration.toFixed(0)} min</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stop-and-Go Kinetic Tax Waterfall Summary */}
            <Card className="p-5 bg-white border border-line shadow-showroom">
              <div className="flex items-center justify-between border-b border-line pb-2 mb-3">
                <span className="font-display text-xs uppercase font-bold tracking-wider text-text-lo">
                  KINETIC STOP-AND-GO PENALTY BREAKDOWN
                </span>
                <span className="font-mono text-xs text-[#D7263D] font-bold">
                  +{Number(stopPenalty?.extraFuelLiters ?? 0).toFixed(2)} L Wasted in Braking
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-bg-sunken border border-line">
                  <span className="text-text-lo block text-[10px]">TOTAL ENERGY DISSIPATED</span>
                  <span className="font-bold text-text-hi text-sm">{Math.round(stopPenalty.totalEnergyDissipatedKj)} kJ</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-sunken border border-line">
                  <span className="text-text-lo block text-[10px]">AVG BRAKE HEAT LOSS</span>
                  <span className="font-bold text-text-hi text-sm">~{Math.round(stopPenalty.totalEnergyDissipatedKj / Math.max(1, stopEventsCount))} kJ / stop</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-sunken border border-line">
                  <span className="text-text-lo block text-[10px]">FINANCIAL STOP PENALTY</span>
                  <span className="font-bold text-[#D7263D] text-sm">+${Number((stopPenalty?.extraFuelLiters ?? 0) * fuelPrice).toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-bg-sunken border border-line">
                  <span className="text-text-lo block text-[10px]">GLOSA RECOVERY BUFFER</span>
                  <span className="font-bold text-[#0F9D6B] text-sm">Pass on Green saves 100%</span>
                </div>
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
