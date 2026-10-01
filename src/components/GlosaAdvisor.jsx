import React, { useMemo } from 'react';
import { calculateGlosaTarget } from '../utils/speedMileagePhysics';

export default function GlosaAdvisor({
  speed = 55,
  trafficSignal = { distanceMeters: 380, phase: 'GREEN', timeRemainingSec: 18, cycleTotal: 30 },
  kineticWaste = { stopsCount: 2, energyDissipatedKj: 388, fuelWastedLiters: 0.052, costPenalty: 4.94 },
  onSimulateStop
}) {
  const { distanceMeters, phase, timeRemainingSec } = trafficSignal;

  const glosa = useMemo(() => {
    return calculateGlosaTarget(distanceMeters, phase, timeRemainingSec, speed);
  }, [distanceMeters, phase, timeRemainingSec, speed]);

  const speedDiff = Math.round(speed - glosa.targetSpeedKmh);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-400 font-semibold">GLOSA & Kinetic Recovery</p>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              Green-Wave Sync
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Traffic Signal Speed Advisory</h2>
        </div>

        {/* Quick Simulation Trigger */}
        {onSimulateStop && (
          <button
            type="button"
            onClick={onSimulateStop}
            className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Simulate Braking Stop
          </button>
        )}
      </div>

      {/* Main Signal Display & Advisory HUD */}
      <div className="grid gap-4 sm:grid-cols-[1fr_1.8fr] rounded-2xl border border-slate-800 bg-slate-950/70 p-4 mb-5">
        {/* Visual Traffic Signal Box */}
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Upcoming Signal</div>
          
          {/* Signal Housing */}
          <div className="flex gap-2.5 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-inner">
            {/* Red Light */}
            <div className={`h-8 w-8 rounded-full transition-all duration-300 flex items-center justify-center ${
              phase === 'RED' 
                ? 'bg-rose-500 shadow-lg shadow-rose-500/80 ring-2 ring-rose-400 scale-105' 
                : 'bg-rose-950/40 opacity-30'
            }`}>
              {phase === 'RED' && <span className="text-[10px] font-black text-slate-950">{timeRemainingSec}</span>}
            </div>

            {/* Yellow Light */}
            <div className={`h-8 w-8 rounded-full transition-all duration-300 flex items-center justify-center ${
              phase === 'YELLOW' 
                ? 'bg-amber-400 shadow-lg shadow-amber-400/80 ring-2 ring-amber-300 scale-105' 
                : 'bg-amber-950/40 opacity-30'
            }`}>
              {phase === 'YELLOW' && <span className="text-[10px] font-black text-slate-950">{timeRemainingSec}</span>}
            </div>

            {/* Green Light */}
            <div className={`h-8 w-8 rounded-full transition-all duration-300 flex items-center justify-center ${
              phase === 'GREEN' 
                ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80 ring-2 ring-emerald-300 scale-105' 
                : 'bg-emerald-950/40 opacity-30'
            }`}>
              {phase === 'GREEN' && <span className="text-[10px] font-black text-slate-950">{timeRemainingSec}</span>}
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="font-mono text-base font-extrabold text-white">{Math.round(distanceMeters)}</span>
            <span className="text-xs text-slate-400 ml-1">meters ahead</span>
          </div>
        </div>

        {/* Advisory Target Speed HUD */}
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Recommended GLOSA Velocity</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-300 font-mono">
                  {glosa.targetSpeedKmh}
                </span>
                <span className="text-sm font-semibold text-slate-400">km/h target</span>
                <span className="text-xs text-slate-500 font-mono">
                  (Current: {Math.round(speed)} km/h)
                </span>
              </div>
            </div>

            <div className="text-right">
              {speedDiff > 5 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                  Ease Throttle: -{speedDiff} km/h
                </span>
              ) : speedDiff < -5 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                  Accelerate: +{Math.abs(speedDiff)} km/h
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  Optimal Speed Locked
                </span>
              )}
            </div>
          </div>

          {/* Coaching Guidance Bar */}
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="7" y="2" width="10" height="20" rx="3" strokeWidth="2" />
                <circle cx="12" cy="7" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="17" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div className="text-xs text-slate-200">
              <span className="font-bold text-white">AI Speed Guidance: </span>
              {glosa.coastingAdvisory}
            </div>
          </div>
        </div>
      </div>

      {/* Kinetic Stop-and-Go Tax Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Kinetic Energy & Stop-and-Go Mileage Penalty
            </h3>
            <p className="text-[11px] text-slate-500">
              Physical energy dissipated into brake pad friction: <span className="font-mono">Ek = 0.5 · m · v²</span>
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Efficiency Drain
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Full Stops Logged</span>
            <div className="mt-1 text-xl font-black text-white font-mono">
              {kineticWaste.stopsCount}
            </div>
            <p className="text-[10px] text-slate-500">Avoidable red light stops</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Kinetic Energy Lost</span>
            <div className="mt-1 text-xl font-black text-amber-300 font-mono">
              {kineticWaste.energyDissipatedKj} <span className="text-xs font-normal text-slate-400">kJ</span>
            </div>
            <p className="text-[10px] text-slate-500">Dissipated into brake heat</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Re-acceleration Fuel</span>
            <div className="mt-1 text-xl font-black text-rose-400 font-mono">
              {kineticWaste.fuelWastedLiters.toFixed(3)} <span className="text-xs font-normal text-slate-400">L</span>
            </div>
            <p className="text-[10px] text-slate-500">Burned to regain momentum</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Monetary Penalty</span>
            <div className="mt-1 text-xl font-black text-rose-300 font-mono">
              ₹{kineticWaste.costPenalty.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500">Direct wallet loss</p>
          </div>
        </div>
      </div>
    </section>
  );
}
