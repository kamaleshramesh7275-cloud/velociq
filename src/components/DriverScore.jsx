import React, { useMemo } from 'react';

const gradeFromScore = (score) => {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

const gradeColors = {
  A: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  B: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  C: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  D: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function DriverScore({ telemetry }) {
  const { score, events } = telemetry;
  
  const grade = useMemo(() => gradeFromScore(Math.round(score)), [score]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Driver Score</p>
          <h2 className="text-xl font-semibold text-white">Trip Performance</h2>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors duration-300 ${gradeColors[grade]}`}>
          Grade {grade}
        </div>
      </div>
      
      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-400">Trip Score</p>
            <div className="mt-2 text-5xl font-bold text-white transition-all duration-300">
              {Math.round(score)}
            </div>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>Adaptive coaching</p>
            <p className="mt-1 text-emerald-300">Target: +12% efficiency</p>
          </div>
        </div>
        
        <div className="mt-5 h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-500" 
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }} 
          />
        </div>
        
        <div className="mt-6 space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              No driving incidents recorded on this trip.
            </div>
          ) : (
            events.map((event, idx) => (
              <div 
                key={`${event.label}-${idx}`} 
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm"
              >
                <span className="text-slate-200 font-medium">{event.label}</span>
                <div className="flex items-center gap-3">
                  {event.delta !== 0 && (
                    <span className={`text-xs font-semibold ${event.delta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {event.delta < 0 ? '' : '+'}{event.delta} pts
                    </span>
                  )}
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    {idx === 0 ? 'Live' : 'Recent'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
