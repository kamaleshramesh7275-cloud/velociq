import React, { useMemo } from 'react';

const gaugeConfig = [
  { key: 'speed', label: 'Vehicle Speed', unit: 'km/h', range: [0, 120], colorClass: 'text-cyan-400', glowClass: 'shadow-cyan-500/20' },
  { key: 'rpm', label: 'Engine RPM', unit: '', range: [700, 6000], colorClass: 'text-fuchsia-500', glowClass: 'shadow-fuchsia-500/20' },
  { key: 'coolant', label: 'Coolant Temp', unit: '°C', range: [70, 110], colorClass: 'text-amber-500', glowClass: 'shadow-amber-500/20' },
  { key: 'maf', label: 'MAF Air Flow', unit: 'g/s', range: [2, 25], colorClass: 'text-emerald-400', glowClass: 'shadow-emerald-500/20' },
  { key: 'fuel', label: 'Fuel Level', unit: '%', range: [0, 100], colorClass: 'text-rose-500', glowClass: 'shadow-rose-500/20' },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Circular Gauge Component
function CircularGauge({ percent, label, value, unit, colorClass, isAlert, glowClass }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Make it a 3/4 circle (gauge style)
  const strokeDasharray = `${circumference * 0.75} ${circumference * 0.25}`;
  const strokeDashoffset = circumference * 0.75 - (percent / 100) * (circumference * 0.75);

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 p-6 ${isAlert ? 'border-rose-500/50 shadow-lg shadow-rose-500/20' : ''}`}>
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-bold border ${
          isAlert 
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse' 
            : 'bg-slate-800/50 text-slate-500 border-slate-700/30'
        }`}>
          {isAlert ? 'Alert' : 'Nominal'}
        </span>
      </div>

      <div className="relative mt-8 flex items-center justify-center">
        {/* Background Track */}
        <svg className="w-36 h-36 -rotate-[-135deg] transform" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-800"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
          {/* Active Progress */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className={`${isAlert ? 'text-rose-500' : colorClass} transition-all duration-300 ease-out`}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              filter: `drop-shadow(0 0 8px currentColor)`
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${isAlert ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
            {value}
          </span>
          <span className="text-xs font-medium text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function TelemetryPanel({ telemetry, isConnected, speedLimit }) {
  const gauges = useMemo(() =>
    gaugeConfig.map((gauge) => {
      const rawValue = telemetry[gauge.key] ?? 0;
      const [min, max] = gauge.range;
      const normalized = (rawValue - min) / (max - min);
      const percent = clamp(Math.round(normalized * 100), 0, 100);
      
      const isAlert = 
        gauge.key === 'coolant' ? rawValue > 102 : 
        gauge.key === 'fuel' ? rawValue < 15 : 
        gauge.key === 'speed' ? rawValue > speedLimit : 
        false;

      const formattedValue = gauge.key === 'rpm' 
        ? Math.round(rawValue).toLocaleString() 
        : rawValue.toFixed(gauge.key === 'speed' || gauge.key === 'maf' || gauge.key === 'fuel' ? 1 : 0);

      return { ...gauge, value: formattedValue, percent, isAlert };
    }),
    [telemetry, speedLimit]
  );

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Live Telemetry</p>
          <h2 className="text-xl font-semibold text-white">OBD-II PID Gauges</h2>
        </div>
        <div className={`rounded-full px-3 py-1 text-sm font-medium border ${
          isConnected 
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 animate-pulse' 
            : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
        }`}>
          {isConnected ? 'Live stream' : 'Stream frozen'}
        </div>
      </div>
      
      <div className="relative min-h-[350px]">
        {/* Frozen Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-950/85 border border-rose-500/20 backdrop-blur-[2px] text-center p-6 transition-all duration-300">
            <span className="text-rose-400 text-3xl font-bold tracking-widest uppercase animate-pulse">
              ⚡ BLE LINK OFFLINE
            </span>
            <p className="mt-2 text-sm text-slate-400 max-w-sm leading-relaxed">
              Telemetry pipeline frozen. Reconnect the ESP32 transmitter in the control deck below to resume live ECU broadcast.
            </p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {gauges.map((gauge) => (
            <CircularGauge key={gauge.key} {...gauge} />
          ))}
        </div>
      </div>
    </section>
  );
}
