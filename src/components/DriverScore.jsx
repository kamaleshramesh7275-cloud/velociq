import React, { useMemo } from 'react';
import { Card, SectionLabel } from './ui';
import { ShieldIcon, SparklesIcon } from './icons';

const gradeFromScore = (score) => {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

const gradeStyles = {
  A: 'bg-emerald-50 text-[#047857] border-emerald-200',
  B: 'bg-blue-50 text-[#0B3D91] border-blue-200',
  C: 'bg-amber-50 text-[#B45309] border-amber-200',
  D: 'bg-rose-50 text-[#D7263D] border-rose-200',
};

export default function DriverScore({ telemetry = {}, driver }) {
  const { score = 95, events = [] } = telemetry;
  
  const numericScore = Math.round(score);
  const grade = useMemo(() => gradeFromScore(numericScore), [numericScore]);

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="racing-stripe" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <SectionLabel label="DRIVER TELEMETRY & SCORING" />
            <h3 className="text-lg font-bold text-text-hi font-heading mt-1">Trip Performance Index</h3>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${gradeStyles[grade]}`}>
            Grade {grade}
          </span>
        </div>

        {/* Driver Profile Chip */}
        {driver && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-line">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-bold text-[#0B3D91] border border-blue-200 font-mono">
              {driver.avatar || 'DR'}
            </div>
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text-hi">{driver.name}</p>
                <p className="text-[10px] font-mono text-slate-600 font-medium">Lic: {driver.license} • Exp: {driver.experience}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-mono text-slate-600 block font-bold">Global Rating</span>
                <span className="text-xs font-bold font-mono text-[#047857] tabular-nums">
                  {driver.rating} / 5.0
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Score Readout Box */}
        <div className="rounded-xl border border-line bg-slate-50 p-4 mb-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-700 font-bold block">CURRENT TRIP SCORE</span>
              <div className="text-4xl font-black font-mono text-[#0B3D91] tabular-nums mt-0.5">
                {numericScore}
                <span className="text-xs font-normal text-slate-600 ml-1">/ 100</span>
              </div>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-600 block text-[10px] uppercase font-semibold">Adaptive Target</span>
              <span className="font-bold text-[#047857]">+14.2% Efficiency</span>
            </div>
          </div>

          {/* Precision Gradient Bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden border border-slate-300">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#0B3D91] via-[#0284C7] to-[#047857] transition-all duration-500" 
              style={{ width: `${Math.max(0, Math.min(100, numericScore))}%` }} 
            />
          </div>
        </div>

        {/* Event Logs */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-700 font-bold block">
            Recent Telemetry Events
          </span>
          {events.length === 0 ? (
            <div className="text-center py-3 text-xs text-slate-600 font-mono bg-slate-50 rounded-xl border border-line">
              Zero negative driving events recorded on this trip.
            </div>
          ) : (
            events.slice(0, 3).map((event, idx) => (
              <div 
                key={`${event.label}-${idx}`} 
                className="flex items-center justify-between rounded-xl border border-line bg-white px-3 py-2 text-xs font-mono"
              >
                <span className="text-text-hi font-bold">{event.label}</span>
                <div className="flex items-center gap-2">
                  {event.delta !== 0 && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      event.delta < 0 ? 'bg-red-50 text-[#D7263D] border border-red-200' : 'bg-emerald-50 text-[#047857] border border-emerald-200'
                    }`}>
                      {event.delta < 0 ? '' : '+'}{event.delta} pts
                    </span>
                  )}
                  <span className="text-[9px] text-slate-600 uppercase font-semibold">
                    {idx === 0 ? 'Latest' : 'Logged'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
