import React from 'react';

export default function StatusBar({ isConnected, activeDTCs = [], spiffsCount = 0 }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-4 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* BLE Status */}
        {isConnected ? (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            BLE Connected
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 animate-pulse">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            BLE Offline (Searching...)
          </div>
        )}

        {/* OBD Diagnostics Status */}
        {activeDTCs.length > 0 ? (
          <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-300 animate-pulse">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            Check Engine MIL: {activeDTCs.length} Fault(s)
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            ECU Diagnostics: Healthy
          </div>
        )}

        {/* Sync & SPIFFS Buffering Status */}
        {isConnected ? (
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
            WiFi Sync: Online (last synced just now)
          </div>
        ) : (
          <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 animate-pulse">
            SPIFFS Buffer: {spiffsCount} records offline
          </div>
        )}
      </div>
    </div>
  );
}
