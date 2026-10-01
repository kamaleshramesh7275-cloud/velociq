import React, { useState, useEffect, useRef, useMemo } from 'react';
import EngineTwinCanvas from '../components/engine3d/EngineTwinCanvas';
import {
  stepEngineDigitalTwin,
  generateDynoPowerCurve,
  VISUAL_MODES,
  TWIN_FAULT_SCENARIOS,
  buildComponentRiskMap
} from '../utils/engineTwinPhysics';
import { Card, SectionLabel, StatusPill, SeverityBadge, WarningLight } from '../components/ui';
import {
  PulseDot,
  WrenchIcon,
  AlertTriangleIcon,
  PlayIcon,
  PauseIcon,
  SparklineIcon,
  CloseIcon
} from '../components/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
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
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState(1.0); // 0.25x to 2x

  // Loading state for Three.js initialization
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Dyno State & Deep Diagnostics Drawer
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace', 'dyno', 'oscilloscope'
  const [isDynoRunning, setIsDynoRunning] = useState(false);
  const [dynoProgress, setDynoProgress] = useState(0);
  const [dynoData, setDynoData] = useState(() => generateDynoPowerCurve('NOMINAL'));

  // Selected Component for 3D Inspection / Hotspot
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Twin Multi-Physics State
  const [twinState, setTwinState] = useState(() =>
    stepEngineDigitalTwin({ rpm: 2400, throttlePct: 25, activeScenario: 'NOMINAL', time: 0 })
  );

  // Live Waveform Buffer (for Oscilloscope & Mini RPM trace)
  const [waveformHistory, setWaveformHistory] = useState([]);
  const [rpmTrace, setRpmTrace] = useState(() => Array.from({ length: 24 }, (_, i) => ({ t: i, rpm: 2400 })));

  // Time ticker ref
  const timeRef = useRef(0);
  const prevThermalRef = useRef(null);

  // Simulate initial load sequence for wireframe silhouette
  useEffect(() => {
    const timer = setTimeout(() => setIsCanvasReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Main high-frequency multi-physics simulation loop (60ms scaled by simSpeedMultiplier)
  useEffect(() => {
    if (!isSimRunning && !isDynoRunning) return;

    const interval = setInterval(() => {
      const dt = 0.06 * simSpeedMultiplier;
      timeRef.current += dt;

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

        // Waveform history
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

        // RPM trace
        setRpmTrace((rPrev) => {
          const nextR = [...rPrev.slice(1), { t: timeRef.current.toFixed(1), rpm: next.telemetry.rpm || rpm }];
          return nextR;
        });

        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isSimRunning, isDynoRunning, rpm, throttlePct, activeScenario, fleetTelemetry, simSpeedMultiplier]);

  // Run Virtual Dyno Sweep
  const runDynoTest = () => {
    if (isDynoRunning) return;
    setIsDynoRunning(true);
    setDynoProgress(0);
    setThrottlePct(100);

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
        setDynoData(generateDynoPowerCurve(activeScenario));
      }
    }, 80);
  };

  const handleSelectScenario = (scenKey) => {
    setActiveScenario(scenKey);
    setDynoData(generateDynoPowerCurve(scenKey));
  };

  const { telemetry, thermal, cylinderBalance, diagnostics } = twinState;
  const componentRiskMap = useMemo(
    () => buildComponentRiskMap({ diagnostics, thermal, wear: twinState.wear, telemetry, activeScenario }),
    [diagnostics, thermal, twinState.wear, telemetry, activeScenario]
  );

  // Compute calculated crank angle and piston position for telemetry overlay
  const crankAngle = Math.round(((rpm / 60) * 360 * timeRef.current) % 720);
  const pistonPosMm = (Math.cos(((rpm / 60) * 2 * Math.PI * timeRef.current)) * 45).toFixed(1);

  // Fault scenarios for buttons
  const faultOptions = [
    { key: 'CYL_3_MISFIRE', label: 'Cyl 3 Misfire', desc: 'Ignition breakdown' },
    { key: 'INTAKE_VACUUM_LEAK', label: 'Intake Leak', desc: 'Plenum gasket unmetered air' },
    { key: 'OIL_STARVATION', label: 'Sensor Drift / Oil', desc: 'Pressure drops to 12 PSI' },
    { key: 'THERMOSTAT_STUCK', label: 'Thermostat Stuck', desc: '118°C thermal runaway' }
  ];

  // Hotspots definitions
  const hotspots = [
    {
      id: 'piston_crown',
      name: 'Piston Crown #1',
      subsystem: 'Combustion Chamber',
      temp: `${thermal.headTemp + 35}°C`,
      load: `${(telemetry.brakeMeanEffectivePressureBar * 8.2).toFixed(1)} bar`,
      left: '38%',
      top: '44%'
    },
    {
      id: 'cylinder_liner',
      name: 'Cast Iron Liner #2',
      subsystem: 'Cylinder Block',
      temp: `${thermal.blockTemp}°C`,
      load: '92% Ring Seal',
      left: '49%',
      top: '52%'
    },
    {
      id: 'valve_train',
      name: 'DOHC Valvetrain',
      subsystem: 'Cylinder Head',
      temp: `${thermal.headTemp}°C`,
      load: `${telemetry.oilPressurePsi} PSI Film`,
      left: '56%',
      top: '32%'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] text-text-hi overflow-hidden relative select-none">
      
      {/* TOP HEADER CONTROLS BAR */}
      <header className="h-14 border-b border-line bg-white px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <SectionLabel label="DIGITAL TWIN / 3D CYBER-PHYSICAL" />
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-line">
            <span className="text-xs font-mono font-semibold text-text-mid">2.0L Turbo DOHC TwinCore</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              diagnostics.healthIndex > 80 
                ? 'bg-emerald-50 text-[#0F9D6B] border border-emerald-200' 
                : 'bg-red-50 text-[#D7263D] border border-red-200 animate-pulse'
            }`}>
              {diagnostics.activeDTCs.length === 0 ? 'NOMINAL HEALTH' : `${diagnostics.activeDTCs.length} FAULT(S)`}
            </span>
          </div>
        </div>

        {/* Center / Right Mode Switchers & View Toggles */}
        <div className="flex items-center gap-2">
          {/* Visual Mode selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-line">
            <button
              onClick={() => setVisualMode(VISUAL_MODES.CAD)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.CAD || visualMode === 'CAD'
                  ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                  : 'text-text-mid hover:text-text-hi'
              }`}
            >
              Precision CAD
            </button>
            <button
              onClick={() => setVisualMode(VISUAL_MODES.THERMAL)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.THERMAL
                  ? 'bg-white text-[#D7263D] shadow-xs border border-slate-200'
                  : 'text-text-mid hover:text-text-hi'
              }`}
            >
              Thermal IR
            </button>
            <button
              onClick={() => setVisualMode(VISUAL_MODES.FLUIDS)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                visualMode === VISUAL_MODES.FLUIDS
                  ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                  : 'text-text-mid hover:text-text-hi'
              }`}
            >
              Fluids
            </button>
          </div>

          {/* Exploded View Toggle */}
          <button
            onClick={() => {
              if (explodedFactor > 0) {
                setExplodedFactor(0);
                if (visualMode === VISUAL_MODES.EXPLODED) setVisualMode(VISUAL_MODES.CAD);
              } else {
                setExplodedFactor(0.75);
                setVisualMode(VISUAL_MODES.EXPLODED);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              explodedFactor > 0
                ? 'bg-blue-50 text-[#0B3D91] border-[#0B3D91]/40 shadow-xs'
                : 'bg-white text-text-mid border-line hover:text-text-hi hover:bg-slate-50'
            }`}
          >
            {explodedFactor > 0 ? 'Exploded: ON' : 'Exploded View'}
          </button>

          {/* Diagnostics Drawer Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-line">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'workspace' ? 'bg-white text-text-hi shadow-xs border border-slate-200' : 'text-text-mid hover:text-text-hi'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setActiveTab('dyno')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dyno' ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200' : 'text-text-mid hover:text-text-hi'
              }`}
            >
              Dyno Bench
            </button>
            <button
              onClick={() => setActiveTab('oscilloscope')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'oscilloscope' ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200' : 'text-text-mid hover:text-text-hi'
              }`}
            >
              Oscilloscope
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT: 65% 3D VIEWPORT WITH CHROME BEZEL + 35% LIGHT TELEMETRY & FAULT PANEL */}
      <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col gap-4">
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
          {/* LEFT 65% COLUMN: 3D VIEWPORT STAGE (THE PERMITTED 10% DARK SURFACE) + BOTTOM TIMELINE */}
          <div className="lg:col-span-8 flex flex-col gap-3 min-h-0">
            
            {/* 3D Dark Studio Stage with Brushed-Chrome Bezel */}
            <div className="flex-1 relative rounded-2xl border-2 border-slate-300 bg-[#0A0F1C] shadow-bezel overflow-hidden min-h-[380px]">
              
              {/* Subtle Carbon Fiber Weave Texture Overlay */}
              <div className="absolute inset-0 carbon-cluster pointer-events-none z-0" />
              
              {/* Studio Stage Label */}
              <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                  STUDIO STAGE • 3D DIGITAL TWIN
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {visualMode} MODE
                </span>
              </div>

              {/* Loading Wireframe Silhouette */}
              {!isCanvasReady && (
                <div className="absolute inset-0 z-40 bg-[#0A0F1C] flex flex-col items-center justify-center gap-4">
                  <svg className="w-20 h-20 text-cyan-400 animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 30 L80 30 L85 45 L85 75 L15 75 L15 45 Z" strokeDasharray="4 2" />
                    <circle cx="35" cy="55" r="10" strokeDasharray="3 3" />
                    <circle cx="65" cy="55" r="10" strokeDasharray="3 3" />
                    <path d="M50 20 L50 30 M35 30 L35 45 M65 30 L65 45" />
                  </svg>
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400">Initializing Cyber-Physical Mesh...</span>
                </div>
              )}

              {/* 3D WebGL Canvas */}
              <div className="w-full h-full relative z-10">
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

              {/* Hotspot Pins over Canvas */}
              {activeTab === 'workspace' && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {hotspots.map((hs) => (
                    <div
                      key={hs.id}
                      className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: hs.left, top: hs.top }}
                    >
                      <div className="relative group cursor-pointer" onClick={() => setSelectedComponent(hs)}>
                        <div className="h-4 w-4 rounded-full bg-cyan-500/40 border border-cyan-400 flex items-center justify-center animate-pulse">
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                        </div>
                        {/* Leader label badge */}
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap text-[10px] font-mono text-white shadow-lg">
                          <span className="text-cyan-400 font-bold">{hs.name}</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-amber-400">{hs.temp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BELOW THE VIEWPORT (LIGHT CARD): PLAYBACK TIMELINE & CONTROLS */}
            <div className="bg-white rounded-xl border border-line shadow-xs p-3 flex flex-wrap items-center justify-between gap-4">
              {/* Play / Pause & Multiplier */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSimRunning(!isSimRunning)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isSimRunning
                      ? 'bg-slate-100 text-text-hi border border-line hover:bg-slate-200'
                      : 'bg-[#0B3D91] text-white shadow-xs hover:bg-[#093276]'
                  }`}
                >
                  {isSimRunning ? (
                    <>
                      <PauseIcon className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-3.5 h-3.5" /> Play
                    </>
                  )}
                </button>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line">
                  {[0.25, 0.5, 1.0, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSimSpeedMultiplier(s)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition ${
                        simSpeedMultiplier === s
                          ? 'bg-white text-[#0B3D91] shadow-xs'
                          : 'text-text-mid hover:text-text-hi'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono text-text-mid">
                  TICK: <span className="text-text-hi font-bold tabular-nums">{timeRef.current.toFixed(2)}s</span>
                </div>
              </div>

              {/* RPM Scrubber */}
              <div className="flex-1 flex items-center gap-3 min-w-[200px] max-w-sm">
                <span className="text-[10px] font-mono uppercase text-text-lo whitespace-nowrap">Throttle</span>
                <input
                  type="range"
                  min="750"
                  max="6500"
                  step="50"
                  value={rpm}
                  onChange={(e) => setRpm(Number(e.target.value))}
                  disabled={isDynoRunning}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#0B3D91]"
                />
                <span className="text-xs font-mono font-bold text-[#0B3D91] tabular-nums w-16 text-right">
                  {rpm} <span className="text-[10px] font-normal text-text-lo">RPM</span>
                </span>
              </div>

              {/* Exploded View & Mini RPM Trace */}
              <div className="flex items-center gap-3 pl-3 border-l border-line">
                <button
                  onClick={() => {
                    if (explodedFactor > 0) {
                      setExplodedFactor(0);
                      if (visualMode === VISUAL_MODES.EXPLODED) setVisualMode(VISUAL_MODES.CAD);
                    } else {
                      setExplodedFactor(0.75);
                      setVisualMode(VISUAL_MODES.EXPLODED);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    explodedFactor > 0
                      ? 'bg-blue-50 text-[#0B3D91] border-[#0B3D91]/40'
                      : 'bg-white text-text-mid border-line hover:text-text-hi hover:bg-slate-50'
                  }`}
                >
                  {explodedFactor > 0 ? 'Exploded: ON' : 'Exploded View'}
                </button>

                <div className="hidden xl:flex items-center gap-2 h-8 w-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rpmTrace}>
                      <Area type="monotone" dataKey="rpm" stroke="#0B3D91" strokeWidth={1.5} fill="#0B3D91" fillOpacity={0.12} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT 35% COLUMN (LIGHT PANEL): FAULT INJECTION, LIVE READOUTS & THERMAL SCALE */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
            
            {/* Fault Injection Card */}
            <div className="bg-white rounded-2xl border border-line shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <div className="flex items-center gap-2">
                  <WarningLight type="engine" state={activeScenario !== 'NOMINAL' ? 'critical' : 'off'} className="w-5 h-5" />
                  <span className="text-xs font-heading font-bold text-text-hi uppercase tracking-wider">Fault Injection</span>
                </div>
                {activeScenario !== 'NOMINAL' ? (
                  <span className="text-[10px] font-mono uppercase bg-red-50 text-[#D7263D] border border-red-200 px-2 py-0.5 rounded-full font-bold animate-pulse">
                    Fault Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#0F9D6B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                    Nominal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {faultOptions.map((f) => {
                  const isActive = activeScenario === f.key;
                  let iconType = 'engine';
                  if (f.key === 'OIL_STARVATION') iconType = 'oil';
                  if (f.key === 'THERMOSTAT_STUCK') iconType = 'coolant';
                  
                  return (
                    <button
                      key={f.key}
                      onClick={() => handleSelectScenario(isActive ? 'NOMINAL' : f.key)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition flex flex-col gap-1 ${
                        isActive
                          ? 'border-[#D7263D] bg-red-50/70 text-[#0F172A] shadow-xs'
                          : 'border-line bg-slate-50/60 text-text-mid hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <WarningLight type={iconType} state={isActive ? 'critical' : 'off'} className="w-4 h-4" />
                          <span className="font-bold text-text-hi text-xs">{f.label}</span>
                        </div>
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#D7263D] animate-ping" />}
                      </div>
                      <span className="text-[10px] text-text-lo line-clamp-1">{f.desc}</span>
                    </button>
                  );
                })}
              </div>

              {activeScenario !== 'NOMINAL' ? (
                <button
                  onClick={() => handleSelectScenario('NOMINAL')}
                  className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-[#0F9D6B] hover:bg-emerald-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  Restore Nominal Engine State
                </button>
              ) : (
                <div className="py-1.5 text-center text-[10px] font-mono text-[#0F9D6B] bg-emerald-50/60 rounded-lg border border-emerald-200">
                  Zero Faults Active • Subsystems Nominal
                </div>
              )}
            </div>

            {/* Live Readouts Card */}
            <div className="bg-white rounded-2xl border border-line shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <span className="text-xs font-heading font-bold text-text-hi uppercase tracking-wider">Live Readouts</span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#0F9D6B] animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border border-line p-2.5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-text-lo block">Engine Speed</span>
                  <div className="text-xl font-bold font-mono text-[#0B3D91] tabular-nums mt-0.5">
                    {telemetry.rpm || rpm} <span className="text-xs font-normal text-text-lo">RPM</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-line p-2.5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-text-lo block">Crank Angle</span>
                  <div className="text-xl font-bold font-mono text-text-hi tabular-nums mt-0.5">
                    {crankAngle}°
                  </div>
                </div>

                <div className="bg-slate-50 border border-line p-2.5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-text-lo block">Piston Position</span>
                  <div className="text-xl font-bold font-mono text-[#B45309] tabular-nums mt-0.5">
                    {pistonPosMm} <span className="text-xs font-normal text-text-lo">mm</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-line p-2.5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono text-text-lo block">Firing Cylinder</span>
                  <div className="text-xl font-bold font-mono text-[#0F9D6B] tabular-nums mt-0.5">
                    #{telemetry.activeFiringCylinder || 1}
                  </div>
                </div>
              </div>

              {/* Vertical Thermal Scale Bar */}
              <div className="bg-slate-50 border border-line p-3 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-text-mid font-mono text-[10px] uppercase">Coolant Thermal Scale</span>
                  <span className={`font-mono font-bold text-sm tabular-nums ${
                    thermal.coolantTemp > 105 ? 'text-[#D7263D]' : thermal.coolantTemp > 90 ? 'text-[#B45309]' : 'text-[#0B3D91]'
                  }`}>
                    {thermal.coolantTemp}°C
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Vertical bar */}
                  <div className="relative h-20 w-3 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex flex-col justify-end">
                    <div 
                      className={`w-full transition-all duration-300 ${
                        thermal.coolantTemp > 105 ? 'bg-[#D7263D]' :
                        thermal.coolantTemp > 92 ? 'bg-[#B45309]' : 'bg-[#0B3D91]'
                      }`}
                      style={{ height: `${Math.min(100, Math.max(10, ((thermal.coolantTemp - 40) / 85) * 100))}%` }}
                    />
                  </div>

                  {/* Gradient scale labels */}
                  <div className="flex-1 flex flex-col justify-between h-20 text-[10px] font-mono">
                    <div className="flex items-center justify-between text-[#D7263D] font-semibold">
                      <span>Critical Thermal</span>
                      <span>105°C+</span>
                    </div>
                    <div className="flex items-center justify-between text-[#B45309] font-semibold">
                      <span>Thermostat Open</span>
                      <span>92°C</span>
                    </div>
                    <div className="flex items-center justify-between text-[#0B3D91] font-semibold">
                      <span>Nominal Cool</span>
                      <span>70°C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Hotspot Detail Card */}
              {selectedComponent && (
                <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-[#0B3D91] uppercase tracking-wider font-bold">
                        {selectedComponent.subsystem || 'ENGINE CORE'}
                      </span>
                      <h4 className="text-xs font-bold text-text-hi">{selectedComponent.name}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedComponent(null)}
                      className="text-text-lo hover:text-text-hi text-xs p-1"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-200/60 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-text-lo block">TEMPERATURE</span>
                      <span className="text-[#B45309] font-bold">{selectedComponent.temp || `${thermal.headTemp}°C`}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-lo block">OPERATIONAL LOAD</span>
                      <span className="text-[#0B3D91] font-bold">{selectedComponent.load || 'Nominal Strain'}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>






        {/* DYNO BENCH OVERLAY DRAWER (LIGHT SHOWROOM THEME) */}
        {activeTab === 'dyno' && (
          <div className="absolute inset-x-4 inset-y-4 z-30 pointer-events-auto bg-white/95 backdrop-blur-2xl rounded-2xl border border-line p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <SectionLabel label="VIRTUAL CHASSIS DYNO BENCHMARK" />
                <h3 className="text-lg font-bold text-text-hi mt-1">Wide-Open Throttle Horsepower & Torque Curve</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={runDynoTest}
                  disabled={isDynoRunning}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isDynoRunning
                      ? 'bg-slate-100 text-text-lo cursor-not-allowed'
                      : 'bg-[#0B3D91] text-white shadow-xs hover:bg-[#093276]'
                  }`}
                >
                  <SparklineIcon className="w-4 h-4" />
                  {isDynoRunning ? `Dyno Sweep ${dynoProgress}%` : 'Launch Dyno Sweep'}
                </button>
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="px-3 py-2 rounded-xl bg-slate-100 border border-line text-xs font-semibold text-text-mid hover:text-text-hi hover:bg-slate-200"
                >
                  Back to 3D View
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-line p-4 rounded-xl">
                <span className="text-xs font-mono uppercase text-text-lo">Current Power</span>
                <div className="text-3xl font-bold font-mono text-[#0B3D91] tabular-nums mt-1">
                  {telemetry.horsepower} <span className="text-sm text-text-lo font-normal">HP</span>
                </div>
                <p className="text-[10px] text-text-lo font-mono mt-1">Peak: 285 HP @ 5800 RPM</p>
              </div>

              <div className="bg-slate-50 border border-line p-4 rounded-xl">
                <span className="text-xs font-mono uppercase text-text-lo">Current Torque</span>
                <div className="text-3xl font-bold font-mono text-[#B45309] tabular-nums mt-1">
                  {telemetry.torqueNm} <span className="text-sm text-text-lo font-normal">Nm</span>
                </div>
                <p className="text-[10px] text-text-lo font-mono mt-1">Peak: 360 Nm @ 3200 RPM</p>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full bg-slate-50 border border-line rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynoData}>
                  <XAxis dataKey="rpm" stroke="#475569" tick={{ fontSize: 10, fill: '#334155' }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#334155' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DDE2EA', borderRadius: '12px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                  />
                  <Line type="monotone" dataKey="horsepower" stroke="#0B3D91" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="torque" stroke="#B45309" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* OSCILLOSCOPE OVERLAY DRAWER (LIGHT SHOWROOM THEME) */}
        {activeTab === 'oscilloscope' && (
          <div className="absolute inset-x-4 inset-y-4 z-30 pointer-events-auto bg-white/95 backdrop-blur-2xl rounded-2xl border border-line p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <SectionLabel label="HIGH-SPEED SENSOR WAVEFORMS" />
                <h3 className="text-lg font-bold text-text-hi mt-1">Real-Time Cylinder Pressure & Rail Oscilloscope</h3>
              </div>
              <button
                onClick={() => setActiveTab('workspace')}
                className="px-3 py-2 rounded-xl bg-slate-100 border border-line text-xs font-semibold text-text-mid hover:text-text-hi hover:bg-slate-200"
              >
                Back to 3D View
              </button>
            </div>

            <div className="flex-1 min-h-[340px] w-full bg-slate-50 border border-line rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waveformHistory}>
                  <defs>
                    <linearGradient id="cyl1Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B3D91" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0B3D91" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cyl3Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D7263D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D7263D" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" stroke="#475569" tick={{ fontSize: 9, fill: '#334155' }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 9, fill: '#334155' }} domain={[0, 110]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DDE2EA', borderRadius: '12px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                  />
                  <Area type="monotone" dataKey="cyl1" stroke="#0B3D91" strokeWidth={2} fillOpacity={1} fill="url(#cyl1Grad)" />
                  <Area type="monotone" dataKey="cyl3" stroke="#D7263D" strokeWidth={2} fillOpacity={1} fill="url(#cyl3Grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
