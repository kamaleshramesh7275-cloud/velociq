import React from 'react';

export default function RouteTracker({ route, speed }) {
  const { startName, endName, progress, lat, lon, etaMinutes } = route;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Navigation</p>
          <h2 className="text-xl font-semibold text-white">Live GPS Route & ETA</h2>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${
          speed > 0 
            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 animate-pulse' 
            : 'bg-slate-800 text-slate-400 border-slate-700/30'
        }`}>
          {speed > 0 ? 'Transit Active' : 'Stationary'}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
        {/* Destination & ETA Stats */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-3">
          <div>
            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Active Route</span>
            <div className="text-sm font-semibold text-white mt-0.5">
              {startName} ➜ <span className="text-cyan-400">{endName}</span>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Estimated Arrival</span>
            <div className="text-lg font-bold text-white mt-0.5">
              {progress >= 100 
                ? 'Arrived' 
                : speed === 0 
                  ? 'Paused (No Speed)' 
                  : `${Math.ceil(etaMinutes)} mins remaining`
              }
            </div>
          </div>
        </div>

        {/* GPS Coordinates HUD */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/40 p-3">
            <p className="text-[10px] uppercase text-slate-400">Latitude</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-200">
              {lat.toFixed(6)}° N
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/40 p-3">
            <p className="text-[10px] uppercase text-slate-400">Longitude</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-200">
              {lon.toFixed(6)}° E
            </p>
          </div>
        </div>

        {/* Progress bar visualizer */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Route progress:</span>
            <span className="font-semibold text-slate-200">{Math.round(progress)}%</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            {progress < 100 && progress > 0 && (
              <span 
                className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white shadow-md animate-ping"
                style={{ left: `calc(${progress}% - 4px)` }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
