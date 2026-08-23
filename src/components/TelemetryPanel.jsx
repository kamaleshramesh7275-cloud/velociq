import React, { useMemo } from 'react';

const gaugeConfig = [
  { key: 'speed', label: 'Vehicle Speed', unit: 'km/h', range: [0, 120], color: 'from-cyan-400 to-sky-500' },
  { key: 'rpm', label: 'Engine RPM', unit: '', range: [700, 6000], color: 'from-fuchsia-500 to-violet-600' },
  { key: 'coolant', label: 'Coolant Temp', unit: '°C', range: [70, 110], color: 'from-amber-400 to-orange-500' },
  { key: 'maf', label: 'MAF Air Flow', unit: 'g/s', range: [2, 25], color: 'from-emerald-400 to-lime-500' },
  { key: 'fuel', label: 'Fuel Level', unit: '%', range: [0, 100], color: 'from-rose-400 to-red-500' },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function TelemetryPanel({ telemetry, isConnected, speedLimit }) {
  const gauges = useMemo(() =>
    gaugeConfig.map((gauge) => {
      const value = telemetry[gauge.key] ?? 0;
      const [min, max] = gauge.range;
      const normalized = (value - min) / (max - min);
      const percent = clamp(Math.round(normalized * 100), 0, 100);
      
      // Dynamic alert triggers
      const isAlert = 
        gauge.key === 'coolant' ? value > 102 : 
        gauge.key === 'fuel' ? value < 15 : 
        gauge.key === 'speed' ? value > speedLimit : 
        false;

      return { ...gauge, value, percent, isAlert };
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gauges.map((gauge) => (
            <div key={gauge.key} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">{gauge.label}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold border ${
                  gauge.isAlert 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : 'bg-slate-800 text-slate-400 border-slate-700/30'
                }`}>
                  {gauge.isAlert ? 'Alert' : 'Nominal'}
                </span>
              </div>
              <div className="relative h-32 overflow-hidden rounded-2xl bg-slate-900/70">
                <div className={`absolute inset-0 bg-gradient-to-r ${gauge.color} opacity-20`} />
                <div className="absolute bottom-0 left-0 h-full w-full rounded-t-2xl border-t border-white/10" />
                <div className="absolute bottom-0 left-0 h-[calc(100%-12px)] w-full">
                  <div className={`absolute bottom-0 left-0 rounded-t-2xl bg-gradient-to-r ${gauge.color}`} style={{ width: `${gauge.percent}%`, height: '100%' }} />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className={`text-3xl font-bold tracking-tight transition-colors duration-200 ${gauge.isAlert && gauge.key === 'speed' ? 'text-rose-400' : 'text-white'}`}>
                    {gauge.key === 'rpm' 
                      ? Math.round(gauge.value).toLocaleString() 
                      : gauge.value.toFixed(gauge.key === 'speed' || gauge.key === 'maf' || gauge.key === 'fuel' ? 1 : 0)
                    }
                    <span className="ml-1 text-sm font-normal text-slate-400">{gauge.unit}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${gauge.color}`} style={{ width: `${gauge.percent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
