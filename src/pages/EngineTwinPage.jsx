import React, { useState, useEffect, useRef, useMemo } from 'react';
import EngineTwinCanvas from '../components/engine3d/EngineTwinCanvas';
import {
  stepEngineDigitalTwin,
  generateDynoPowerCurve,
  VISUAL_MODES,
  TWIN_FAULT_SCENARIOS,
  buildComponentRiskMap
} from '../utils/engineTwinPhysics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function EngineTwinPage({ telemetry: fleetTelemetry, onTriggerDTC, onClearDTCs, activeDTCs: fleetDTCs = [] }) {
  // Engine Control States
  const [rpm, setRpm] = useState(2400);
  const [throttlePct, setThrottlePct] = useState(25);
  const [visualMode, setVisualMode] = useState(VISUAL_MODES.CAD || 'CAD');
  const [explodedFactor, setExplodedFactor] = useState(0.0);
  const [activeScenario, setActiveScenario] = useState('NOMINAL');
  const [isSimRunning, setIsSimRunning] = useState(true);

  // Dyno State
  const [isDynoRunning, setIsDynoRunning] = useState(false);
  const [dynoProgress, setDynoProgress] = useState(0);
  const [dynoData, setDynoData] = useState(() => generateDynoPowerCurve('NOMINAL'));

  // Selected Component for 3D Inspection
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Twin Multi-Physics State
  const [twinState, setTwinState] = useState(() =>
    stepEngineDigitalTwin({ rpm: 2400, throttlePct: 25, activeScenario: 'NOMINAL', time: 0 })
  );

  // Live Waveform Buffer (for Oscilloscope)
  const [waveformHistory, setWaveformHistory] = useState([]);

  // Time ticker ref
  const timeRef = useRef(0);
  const prevThermalRef = useRef(null);

  // Main high-frequency multi-physics simulation loop (60ms)
  useEffect(() => {
    if (!isSimRunning && !isDynoRunning) return;

    const interval = setInterval(() => {
      timeRef.current += 0.06;

      setTwinState((prev) => {
        const next = stepEngineDigitalTwin({
          rpm,
          throttlePct,
          activeScenario,
          time: timeRef.current,
          driverScore: fleetTelemetry?.score || 95,
          prevThermalState: prev.thermal,
          isDynoRunning
        });
        prevThermalRef.current = next.thermal;

        // Append to waveform history for live chart (keep last 20 points)
        setWaveformHistory((wPrev) => {
          const point = {
            t: timeRef.current.toFixed(1),
            cyl1: next.cylinderBalance[0].peakPressureBar,
            cyl3: next.cylinderBalance[2].peakPressureBar,
            oilPsi: next.telemetry.oilPressurePsi,
            boost: next.telemetry.turboBoostPsi
          };
          const nextW = [...wPrev, point];
          return nextW.length > 25 ? nextW.slice(nextW.length - 25) : nextW;
        });

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isSimRunning, isDynoRunning, rpm, throttlePct, activeScenario, fleetTelemetry]);

  // Run Virtual Dyno Sweep
  const runDynoTest = () => {
    if (isDynoRunning) return;
    setIsDynoRunning(true);
    setDynoProgress(0);
    setThrottlePct(100); // Wide open throttle

    let currentRpm = 1000;
    const sweepInterval = setInterval(() => {
      currentRpm += 150;
      setRpm(currentRpm);
      setDynoProgress(Math.round(((currentRpm - 1000) / (6800 - 1000)) * 100));

      if (currentRpm >= 6800) {
        clearInterval(sweepInterval);
        setIsDynoRunning(false);
        setThrottlePct(20);
        setRpm(1800);
        // Refresh dyno curve for current scenario
        setDynoData(generateDynoPowerCurve(activeScenario));
      }
    }, 80);
  };

  // Switch Scenario
  const handleSelectScenario = (scenKey) => {
    setActiveScenario(scenKey);
    // Regenerate dyno curves for this scenario
    setDynoData(generateDynoPowerCurve(scenKey));
  };

  // Sync DTCs to Fleet Scanner
  const handleSyncToECU = () => {
    if (twinState.diagnostics.activeDTCs.length > 0 && onTriggerDTC) {
      twinState.diagnostics.activeDTCs.forEach((code) => {
        onTriggerDTC(code);
      });
    }
  };

  const { telemetry, thermal, cylinderBalance, wear, diagnostics } = twinState;
  const componentRiskMap = useMemo(
    () => buildComponentRiskMap({ diagnostics, thermal, wear, telemetry, activeScenario }),
    [diagnostics, thermal, wear, telemetry, activeScenario]
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">

        {/* 1. MASTER HEADER & VISUAL MODE SWITCHER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-2 text-cyan-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Engine 3D Digital Twin
                  <span className="text-xs font-mono font-normal uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                    TwinCore Multi-Physics
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time cyber-physical model of 2.0L Turbo DOHC engine with live thermal IR, fluid dynamics & combustion balance.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Mode Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setVisualMode(VISUAL_MODES.CAD); setExplodedFactor(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.CAD || visualMode === 'CAD'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <span>Precision CAD</span>
            </button>
            <button
              onClick={() => { setVisualMode(VISUAL_MODES.THERMAL); setExplodedFactor(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.THERMAL
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343a7.975 7.975 0 010 11.314z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Thermal IR</span>
            </button>
            <button
              onClick={() => { setVisualMode(VISUAL_MODES.FLUIDS); setExplodedFactor(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.FLUIDS
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>Fluids & Flow</span>
            </button>
            <button
              onClick={() => { setVisualMode(VISUAL_MODES.MECHANICAL); setExplodedFactor(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.MECHANICAL
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Combustion & Knock</span>
            </button>
            <button
              onClick={() => { setVisualMode(VISUAL_MODES.EXPLODED); setExplodedFactor(0.75); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.EXPLODED
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10l8 4 8-4V7M4 7l8 4m8-4l-8 4m0 0v10M12 3l8 4-8 4-8-4 8-4z" />
              </svg>
              <span>Exploded Subsystems</span>
            </button>
          </div>
        </header>

        {/* 2. ENGINE MASTER CONTROLS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          {/* RPM Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Engine Speed (RPM)</span>
              <span className="font-mono text-cyan-400 font-bold">{rpm} RPM</span>
            </div>
            <input
              type="range"
              min="750"
              max="6500"
              step="50"
              value={rpm}
              onChange={(e) => setRpm(Number(e.target.value))}
              disabled={isDynoRunning}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <button onClick={() => setRpm(850)} className="hover:text-slate-300">Idle (850)</button>
              <button onClick={() => setRpm(2200)} className="hover:text-slate-300">City (2200)</button>
              <button onClick={() => setRpm(3600)} className="hover:text-slate-300">Highway (3600)</button>
              <button onClick={() => setRpm(6000)} className="hover:text-slate-300">Redline (6000)</button>
            </div>
          </div>

          {/* Throttle Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Throttle Angle</span>
              <span className="font-mono text-amber-400 font-bold">{throttlePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={throttlePct}
              onChange={(e) => setThrottlePct(Number(e.target.value))}
              disabled={isDynoRunning}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Closed (0%)</span>
              <span>Cruise (25%)</span>
              <span>WOT (100%)</span>
            </div>
          </div>

          {/* Exploded Separation Slider (if in Exploded mode) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Subsystem Separation</span>
              <span className="font-mono text-indigo-400 font-bold">{Math.round(explodedFactor * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedFactor}
              onChange={(e) => {
                setExplodedFactor(Number(e.target.value));
                if (visualMode !== VISUAL_MODES.EXPLODED && Number(e.target.value) > 0) {
                  setVisualMode(VISUAL_MODES.EXPLODED);
                }
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Assembled (0%)</span>
              <span>Full Exploded (100%)</span>
            </div>
          </div>

          {/* Simulation Toggle & Health Badge */}
          <div className="flex items-center justify-between gap-3 border-l border-slate-800 pl-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Engine Health</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-lg font-bold font-mono ${
                  diagnostics.healthIndex > 80 ? 'text-emerald-400' : diagnostics.healthIndex > 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {diagnostics.healthIndex}%
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  diagnostics.activeDTCs.length === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300 animate-pulse'
                }`}>
                  {diagnostics.activeDTCs.length === 0 ? 'NOMINAL' : `${diagnostics.activeDTCs.length} FAULT(S)`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSimRunning(!isSimRunning)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isSimRunning
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400'
              }`}
            >
              {isSimRunning ? 'Pause Engine' : 'Resume Engine'}
            </button>
          </div>
        </div>

        {/* 3. MAIN WORKSPACE: 3D VIEWPORT (LEFT) + TESTING & DIAGNOSTICS DECK (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 3D Engine Canvas (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative h-[530px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-2 py-1.5 backdrop-blur-sm">
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Risk</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-200"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Healthy</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-200"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />Watch</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-200"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Damaged</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-200"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Critical</span>
              </div>
              <EngineTwinCanvas
                isSimRunning={isSimRunning}
                visualMode={visualMode}
                explodedFactor={explodedFactor}
                thermalState={thermal}
                telemetry={telemetry}
                cylinderBalance={cylinderBalance}
                activeScenario={activeScenario}
                onSelectComponent={(comp) => setSelectedComponent(comp)}
                selectedComponent={selectedComponent}
                componentRiskMap={componentRiskMap}
              />
            </div>

            {/* Clicked Component Telemetry Inspector Card */}
            {selectedComponent && (
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-4 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedComponent.name}</h4>
                    <p className="text-xs text-slate-400">Subsystem: {selectedComponent.subsystem}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">TEMP</span>
                    <span className="text-amber-400 font-bold">
                      {selectedComponent.id.includes('head') ? thermal.headTemp : selectedComponent.id.includes('exhaust') ? thermal.exhaustTemp : thermal.blockTemp}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">STATUS</span>
                    <span className="text-emerald-400 font-bold">Verified</span>
                  </div>
                  <button
                    onClick={() => setSelectedComponent(null)}
                    className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostics, Scenarios & Dyno Testing (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Virtual Dyno Pull Box */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Performance Benchmarking</p>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Virtual Chassis Dyno
                    {isDynoRunning && <span className="text-xs font-mono text-cyan-400 animate-pulse">SWEEPING... {dynoProgress}%</span>}
                  </h3>
                </div>
                <button
                  onClick={runDynoTest}
                  disabled={isDynoRunning}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                    isDynoRunning
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isDynoRunning ? 'Dyno Pull in Progress' : 'Launch Dyno Pull'}
                </button>
              </div>

              {/* Peak Output Readouts */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <span className="text-[10px] uppercase text-slate-500 font-medium">Current Power</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-mono text-cyan-400">{telemetry.horsepower}</span>
                    <span className="text-xs text-slate-400">HP</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Peak: ~285 HP @ 5800 RPM</div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <span className="text-[10px] uppercase text-slate-500 font-medium">Current Torque</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold font-mono text-amber-400">{telemetry.torqueNm}</span>
                    <span className="text-xs text-slate-400">Nm</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Peak: ~360 Nm @ 3200 RPM</div>
                </div>
              </div>

              {/* Dyno Curve Recharts Graph */}
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dynoData}>
                    <XAxis dataKey="rpm" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                      formatter={(val, name) => [val, name === 'horsepower' ? 'Horsepower (HP)' : 'Torque (Nm)']}
                    />
                    <Line type="monotone" dataKey="horsepower" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="torque" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4-Cylinder Power Balance & Misfire Locator */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Combustion Synchronization</p>
                  <h3 className="text-base font-bold text-white">4-Cylinder Power Balance</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Firing: Cyl #{telemetry.activeFiringCylinder}
                </span>
              </div>

              <div className="space-y-2.5">
                {cylinderBalance.map((cyl) => {
                  const isMisfiring = cyl.status === 'Misfire';
                  const isFiringNow = telemetry.activeFiringCylinder === cyl.id;

                  return (
                    <div key={cyl.id} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          isMisfiring ? 'bg-rose-500 animate-ping' : isFiringNow ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                        }`} />
                        <span className="font-bold text-slate-200">{cyl.name}</span>
                        {isMisfiring && (
                          <span className="rounded bg-rose-500/20 text-rose-400 px-1.5 py-0.5 text-[10px] font-bold">
                            MISFIRE DETECTED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 text-[9px] mr-1">EFF</span>
                          <span className={cyl.efficiency < 50 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {cyl.efficiency}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] mr-1">PRESSURE</span>
                          <span className="text-cyan-400">{cyl.peakPressureBar} bar</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] mr-1">TEMP</span>
                          <span className="text-amber-400">{cyl.tempC}°C</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scenario Stress Injector Deck */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">What-If Fault Simulation</p>
                  <h3 className="text-base font-bold text-white">Scenario Injector</h3>
                </div>
                {activeScenario !== 'NOMINAL' && (
                  <button
                    onClick={() => handleSelectScenario('NOMINAL')}
                    className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    Restore Healthy
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.keys(TWIN_FAULT_SCENARIOS).map((key) => {
                  const sc = TWIN_FAULT_SCENARIOS[key];
                  const isActive = activeScenario === key;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectScenario(key)}
                      className={`text-left p-2.5 rounded-xl border transition flex flex-col gap-0.5 ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-md'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight line-clamp-1">{sc.title}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">
                        {sc.dtc.length > 0 ? `Triggers: ${sc.dtc.join(', ')}` : 'Zero Faults'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Diagnosis & DTC Sync */}
              {diagnostics.activeDTCs.length > 0 && (
                <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      Active DTCs: {diagnostics.activeDTCs.join(', ')}
                    </span>
                    <button
                      onClick={handleSyncToECU}
                      className="rounded-lg bg-rose-500 text-slate-950 font-bold px-3 py-1 text-[11px] hover:bg-rose-400 transition shadow"
                    >
                      Sync to Fleet ECU Scanner
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {diagnostics.scenarioDesc}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 4. REAL-TIME MULTI-PHYSICS TELEMETRY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Coolant Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Coolant Temperature</span>
              <span>Jacket Flow</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-mono ${
                thermal.coolantTemp > 105 ? 'text-rose-400' : 'text-cyan-400'
              }`}>
                {thermal.coolantTemp}
              </span>
              <span className="text-slate-400 text-sm">°C</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  thermal.coolantTemp > 105 ? 'bg-rose-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, (thermal.coolantTemp / 125) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">Thermostat threshold: 88°C</p>
          </div>

          {/* Oil Pressure & Temp */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Oil Lubrication</span>
              <span>Viscosity</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-mono ${
                telemetry.oilPressurePsi < 18 ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {telemetry.oilPressurePsi}
              </span>
              <span className="text-slate-400 text-sm">PSI</span>
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-300">
              <span>Temp: {thermal.oilTemp}°C</span>
              <span>{telemetry.oilViscosityCentistokes} cSt</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Bearing film: {telemetry.bearingFilmThicknessMicrons} µm</p>
          </div>

          {/* Boost / Manifold Absolute Pressure */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Induction & Boost</span>
              <span>MAP</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-mono ${
                telemetry.turboBoostPsi > 22 ? 'text-rose-400' : 'text-indigo-400'
              }`}>
                {telemetry.turboBoostPsi > 0 ? `+${telemetry.turboBoostPsi}` : `${telemetry.manifoldPressureKPa}`}
              </span>
              <span className="text-slate-400 text-sm">{telemetry.turboBoostPsi > 0 ? 'PSI Boost' : 'kPa Vacuum'}</span>
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-300">
              <span>MAF: {telemetry.mafFlowRate} g/s</span>
              <span>Exh: {thermal.exhaustTemp}°C</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Wastegate duty: 64%</p>
          </div>

          {/* Lambda & Fuel Trim */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Combustion Lambda</span>
              <span>Closed Loop</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold font-mono ${
                telemetry.lambda > 1.1 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                λ {telemetry.lambda}
              </span>
              <span className="text-slate-400 text-sm">({(telemetry.lambda * 14.7).toFixed(1)} AFR)</span>
            </div>
            <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-300">
              <span>STFT: {telemetry.stftPct > 0 ? `+${telemetry.stftPct}%` : `${telemetry.stftPct}%`}</span>
              <span className={telemetry.knockDetected ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                {telemetry.knockDetected ? 'KNOCK' : '0.0° Retard'}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Target: Stoichiometric 14.7:1</p>
          </div>
        </div>

        {/* 5. BOTTOM DIAGNOSTIC OSCILLOSCOPE (COMBUSTION WAVEFORMS) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">High-Speed Sensor Waveforms</p>
              <h3 className="text-base font-bold text-white">Live Cylinder Pressure Oscilloscope</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Cyl #1 Peak Pressure
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Cyl #3 Pressure
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waveformHistory}>
                <defs>
                  <linearGradient id="cyl1Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cyl3Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 9 }} domain={[0, 110]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="cyl1" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#cyl1Grad)" />
                <Area type="monotone" dataKey="cyl3" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#cyl3Grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
