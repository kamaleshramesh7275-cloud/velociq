import React, { useState } from 'react';

const dtcLookup = {
  P0300: { name: 'Random Misfire', desc: 'Random/multiple cylinder misfire detected. Can cause engine stumbling and cat damage.', type: 'Powertrain' },
  P0171: { name: 'System Too Lean', desc: 'Air-fuel ratio is too lean on Bank 1. Likely vacuum leak or dirty MAF sensor.', type: 'Powertrain' },
  P0420: { name: 'Catalyst Efficiency', desc: 'Catalytic converter efficiency is below threshold. Check oxygen sensor outputs.', type: 'Powertrain' }
};

export default function ECUDiagnostics({ activeDTCs, onClearDTCs, onTriggerDTC }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setHasScanned(false);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setHasScanned(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleClear = () => {
    onClearDTCs();
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">OBD-II Diagnostics</p>
          <h2 className="text-xl font-semibold text-white">ECU DTC Scanner</h2>
        </div>
        <div className="flex gap-2">
          {activeDTCs.length > 0 && (
            <span className="rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs text-orange-300 animate-pulse font-semibold">
              MIL Active ({activeDTCs.length})
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        {isScanning ? (
          <div className="space-y-4 py-4 text-center">
            <p className="text-sm text-slate-300">Querying OBD PID registers & MIL logs...</p>
            <div className="mx-auto h-2 max-w-xs rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-150" style={{ width: `${scanProgress}%` }} />
            </div>
            <p className="text-xs text-slate-500">{scanProgress}% complete</p>
          </div>
        ) : hasScanned ? (
          <div>
            {activeDTCs.length === 0 ? (
              <div className="py-4 text-center">
                <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-2 text-3xl text-emerald-400 mb-3">✓</span>
                <h3 className="font-semibold text-slate-200">No Fault Codes Detected</h3>
                <p className="mt-1 text-sm text-slate-400">All ECU systems are responding with status: Nominal.</p>
                <button
                  type="button"
                  onClick={handleScan}
                  className="mt-4 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                >
                  Scan Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {activeDTCs.map((code) => {
                    const info = dtcLookup[code] || { name: 'Unknown Code', desc: 'Generic diagnostic fault detected by ECU.', type: 'Unknown' };
                    return (
                      <div key={code} className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex gap-4 items-start">
                        <div className="rounded-lg bg-orange-500/20 px-3 py-1 text-sm font-mono font-bold text-orange-400">
                          {code}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-200 text-sm">{info.name}</h4>
                            <span className="text-[10px] uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                              {info.type}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 leading-relaxed">{info.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleScan}
                    className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-slate-200"
                  >
                    Rescan
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-full bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/30"
                  >
                    Clear OBD-II Codes
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-slate-400">Scan standard OBD-II trouble logs to inspect check engine diagnostics.</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleScan}
                className="rounded-full bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Scan ECU Systems
              </button>
              {activeDTCs.length === 0 && (
                <button
                  type="button"
                  onClick={onTriggerDTC}
                  className="rounded-full border border-slate-800 text-slate-400 px-3 py-2.5 text-xs font-medium hover:border-orange-500/40 hover:text-orange-300"
                >
                  Simulate Misfire (DTC)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
