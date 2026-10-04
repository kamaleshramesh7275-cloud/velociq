import React from 'react';
import { AnalogDial } from './ui/AnalogDial';
import { WarningLight } from './ui/WarningLight';
import { PulseDot, ThermometerIcon, WindIcon } from './icons';
import { useFleet } from '../context/FleetContext';
import { useTheme } from '../context/ThemeContext';
import { getEngineType } from '../config/engineTypes';

export default function TelemetryPanel({
  telemetry = {},
  isConnected = true,
  speedLimit = 90,
  activeDTCs = []
}) {
  const { theme } = useTheme();
  const fleet = useFleet ? useFleet() : null;
  const activeVehicle = fleet?.activeVehicle;
  const engineTypeId = activeVehicle?.engineTypeId || 'i4_petrol';
  const engineType = getEngineType(engineTypeId);
  const isBev = engineType?.category === 'BEV';
  const isDiesel = engineType?.fuelType === 'diesel';
  const isCng = engineType?.fuelType === 'cng';

  const tachMax = 7000;
  const majorStep = 1000;
  const minorStep = 200;

  const tachBands = [
    { from: 0, to: 1500, color: '#64748B' },
    { from: 1500, to: 3500, color: '#0F9D6B' },
    { from: 3500, to: 5500, color: '#1E88E5' },
    { from: 5500, to: 6500, color: '#F2A900' },
    { from: 6500, to: 7000, color: '#D7263D' },
  ];
  const {
    speed = 0,
    rpm = 0,
    coolant = 85.8,
    maf = 9.4,
    voltage = 13.9,
  } = telemetry;

  const isSpeedOverLimit = speed > speedLimit;
  const isCoolantAlert = coolant > 100;
  const isCheckEngine = activeDTCs && activeDTCs.length > 0;

  // Approximate gear from speed
  const currentGear = speed === 0 ? 'P' : speed < 25 ? 'D1' : speed < 45 ? 'D2' : speed < 65 ? 'D3' : speed < 85 ? 'D4' : 'D5';

  // Real Longitudinal G-force derived from OBD speed differentiation (dv/dt)
  const prevSpeedRef = React.useRef(speed);
  const prevTimeRef = React.useRef(Date.now());
  const [longG, setLongG] = React.useState(0);

  React.useEffect(() => {
    const now = Date.now();
    const dt = Math.max(0.1, (now - prevTimeRef.current) / 1000);
    const dvMs = ((speed - prevSpeedRef.current) * 1000) / 3600;
    const gVal = dvMs / (dt * 9.80665);
    setLongG(Number(Math.max(-1.5, Math.min(1.5, gVal)).toFixed(2)));
    prevSpeedRef.current = speed;
    prevTimeRef.current = now;
  }, [speed]);

  const [isSmallScreen, setIsSmallScreen] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  React.useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const dialSize = isSmallScreen ? 180 : 230;

  return (
    <div className="relative rounded-2xl sm:rounded-3xl p-1 sm:p-2 titanium-binnacle w-full overflow-hidden select-none">
      {/* Precision Chamfered Luminous Binnacle Housing */}
      <div className="titanium-binnacle-inner rounded-[16px] sm:rounded-[22px] p-3 sm:p-6 text-slate-800 flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Ambient Light Bounce Across Top of Cluster */}
        <div className="pointer-events-none absolute -top-12 left-1/4 right-1/4 h-24 bg-gradient-to-b from-white/80 to-transparent rounded-full blur-md" />

        {/* Top Status Bar: Aerospace Telematics Flight Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200/90 pb-2.5 sm:pb-3 mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border"
              style={{
                backgroundColor: theme.badgeBg,
                borderColor: theme.cardBorder,
                color: theme.secondary || theme.primary,
              }}
            >
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
              <span className="font-display text-[11px] uppercase font-bold tracking-[0.18em]">
                AERO INSTRUMENT BINNACLE
              </span>
            </div>
            <span className="hidden sm:inline-block font-mono text-[10px] text-slate-500 font-semibold">
              300ms CAN-FD BUS
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Speed Limit Road Sign */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600 font-bold">LIMIT:</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#D7263D] bg-white text-slate-900 font-mono text-[10.5px] font-black">
                {speedLimit}
              </div>
            </div>

            {/* Live Streaming Indicator */}
            <div className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200/90 px-3 py-1 font-mono text-[10.5px] text-slate-700 shadow-xs">
              <PulseDot color={isConnected ? 'emerald' : 'amber'} active={true} />
              <span className="font-bold">{isConnected ? 'CAN-BUS SYNC' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        {/* Dual Luminous Chronometer Dials & Central Avionics HUD */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center py-1">
          {/* Left: Speedometer Dial (Cols 1-5) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <AnalogDial
              value={speed}
              min={0}
              max={140}
              label="AIR / ROAD SPEED"
              unit="km/h"
              speedLimit={speedLimit}
              size={dialSize}
              darkTheme={false}
              bands={[
                { from: 0, to: 55, color: '#0B3D91' },
                { from: 55, to: 65, color: '#059669' }, // Sweet Spot Emerald
                { from: 65, to: 80, color: '#0284C7' },
                { from: 80, to: 100, color: '#D97706' },
                { from: 100, to: 140, color: '#E11D48' }, // Redline
              ]}
              secondaryReadout={
                speed >= 55 && speed <= 65 ? 'SWEET SPOT' : isSpeedOverLimit ? 'SPEEDING' : 'CRUISE'
              }
            />
          </div>

          {/* Center: Central Avionics HUD Flight Box (Cols 6-7) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center py-2 space-y-3">
            {/* Transmission & Drive Mode Inset */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-white border border-slate-300 px-4 py-2 shadow-xs w-full max-w-[140px]">
              <span className="font-mono text-[8px] uppercase tracking-widest text-slate-600 font-bold">DRIVE MODE</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                  {currentGear}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-100 text-blue-700">
                  AUTO
                </span>
              </div>
            </div>

            {/* Real Longitudinal G-Force Impulse Gauge (OBD-Derived via dv/dt) */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-200 shadow-xs w-full max-w-[140px]">
              <span className="font-mono text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                LONGITUDINAL G (Gx)
              </span>
              <div className="flex items-center gap-1.5 my-1">
                <span className={`font-mono text-base font-black tabular-nums ${
                  longG > 0.05 ? 'text-emerald-600' : longG < -0.05 ? 'text-rose-600' : 'text-slate-700'
                }`}>
                  {longG >= 0 ? `+${longG.toFixed(2)}` : longG.toFixed(2)} G
                </span>
              </div>
              {/* Bi-directional horizontal impulse meter */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                {/* Center zero mark */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-400 z-10" />
                {longG >= 0 ? (
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-200 rounded-r-full"
                    style={{ 
                      marginLeft: '50%',
                      width: `${Math.min(50, (longG / 0.6) * 50)}%` 
                    }}
                  />
                ) : (
                  <div 
                    className="h-full bg-rose-500 transition-all duration-200 rounded-l-full ml-auto"
                    style={{ 
                      marginRight: '50%',
                      width: `${Math.min(50, (Math.abs(longG) / 0.6) * 50)}%` 
                    }}
                  />
                )}
              </div>
              <span className="font-mono text-[8px] uppercase font-bold text-slate-500 mt-1">
                {longG > 0.15 ? 'ACCELERATING' : longG < -0.2 ? 'DECELERATING' : 'STEADY CRUISE'}
              </span>
            </div>

            {/* Warning Light Matrix (Illuminates when DTC or issue is triggered) */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              <WarningLight type="engine" active={isCheckEngine} color="amber" size={19} />
              <WarningLight type="oil" active={false} color="red" size={19} />
              <WarningLight type="battery" active={voltage < 12.8} color="red" size={19} />
              <WarningLight type="coolant" active={isCoolantAlert} color="red" size={19} />
              <WarningLight type="brake" active={isSpeedOverLimit} color="amber" size={19} />
              <WarningLight type="abs" active={false} color="amber" size={19} />
            </div>

            {/* Overall Powertrain Health Pill */}
            <span className={`font-mono text-[9px] font-black px-2.5 py-1 rounded-md border text-center shadow-2xs ${
              isSpeedOverLimit
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isCheckEngine
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isSpeedOverLimit ? 'SPEED WARNING' : isCheckEngine ? 'FAULT DETECTED' : 'POWERTRAIN NOMINAL'}
            </span>
          </div>

          {/* Right: Tachometer Dial (Cols 8-12) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <AnalogDial
              value={rpm}
              min={0}
              max={tachMax}
              label="TACHOMETER"
              unit="rpm"
              majorStep={majorStep}
              minorStep={minorStep}
              size={dialSize}
              darkTheme={false}
              bands={tachBands}
              secondaryReadout={rpm > (tachMax * 0.78) ? 'HIGH LOAD' : 'NOMINAL'}
            />
          </div>
        </div>

        {/* Lower Auxiliaries Bar: Luminous Precision Sensor Pods */}
        <div className="mt-4 pt-3 border-t border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Box 1: Thermal Subsystem */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                <ThermometerIcon className={`w-4 h-4 ${isCoolantAlert ? 'text-[#D7263D]' : 'text-blue-600'}`} />
              </div>
              <div>
                <span className="font-mono text-[9.5px] text-slate-500 uppercase font-bold block">
                  {isBev ? 'MOTOR COOLING' : 'COOLANT TEMP'}
                </span>
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {coolant.toFixed(1)}°C
                </span>
              </div>
            </div>
            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
              isCoolantAlert ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {isCoolantAlert ? 'OVERHEAT' : '85°C NORM'}
            </span>
          </div>

          {/* Box 2: Powertrain Specific (Airflow / Inverter / DPF / CNG) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-blue-600">
                <WindIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-[9.5px] text-slate-500 uppercase font-bold block">
                  {isBev ? 'INVERTER TEMP' : isDiesel ? 'DPF SOOT LOAD' : isCng ? 'CNG TANK' : 'MASS AIR FLOW'}
                </span>
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {isBev
                    ? `${(telemetry.inverterTempC || 52).toFixed(1)}°C`
                    : isDiesel
                    ? `${(telemetry.dpfSootPct || 24.2).toFixed(1)}%`
                    : isCng
                    ? `${(telemetry.cngTankBar || 185).toFixed(0)} BAR`
                    : `${maf.toFixed(1)} g/s`}
                </span>
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {isBev ? 'SiC POWER' : isDiesel ? (telemetry.dpfRegenActive ? 'REGEN ON' : 'PASSIVE DPF') : isCng ? (telemetry.fuelMode === 'petrol_fallback' ? 'PETROL BACKUP' : 'CNG ACTIVE') : 'ECU SENSOR'}
            </span>
          </div>

          {/* Box 3: Energy / Battery Bus */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-slate-200 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-emerald-600">
                <PulseDot color="emerald" active={true} />
              </div>
              <div>
                <span className="font-mono text-[9.5px] text-slate-500 uppercase font-bold block">
                  {isBev ? 'TRACTION PACK' : '12V BATTERY BUS'}
                </span>
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {isBev ? `${(telemetry.batterySocPct || 84.5).toFixed(1)}% SOC` : `${voltage.toFixed(2)} V`}
                </span>
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isBev ? `${telemetry.packVoltageV || 360}V NOM` : 'CHARGING'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
