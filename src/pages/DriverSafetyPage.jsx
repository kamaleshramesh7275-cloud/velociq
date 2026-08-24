import React from 'react';
import { SimulationContext } from '../context/SimulationContext';

export default function DriverSafetyPage() {
  const { safetyLog, telemetry } = React.useContext(SimulationContext);
  const score = Math.round(telemetry.score);

  return (
    <div className="p-8 text-slate-100 flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Driver Safety & Coaching</h1>
          <p className="mt-2 text-slate-400">AI-driven safety analytics and harsh driving detection.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Score Card */}
          <div className="lg:col-span-1 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Current Driver Score</h2>
            <div className="relative">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="none" className="text-slate-800" />
                <circle 
                  cx="96" cy="96" r="80" 
                  stroke="currentColor" strokeWidth="12" fill="none" 
                  strokeDasharray="502"
                  strokeDashoffset={502 - (score / 100) * 502}
                  className={`transition-all duration-1000 ease-out ${
                    score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-500'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold text-white">{score}</span>
                <span className="text-sm text-slate-400 mt-1">/ 100</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-400">
              {score >= 90 ? 'Excellent driving behavior. Keep it up!' : 
               score >= 70 ? 'Good driving, but room for improvement.' : 
               'Critical safety risks detected. Coaching required.'}
            </p>
          </div>

          {/* Timeline & AI Coach */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* AI Coach Panel */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6 flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">AI Safety Coach</h3>
                <p className="text-sm text-cyan-100/80 leading-relaxed">
                  {safetyLog.length === 0 
                    ? "Driving is perfectly smooth. No aggressive events detected recently." 
                    : `I've detected ${safetyLog.length} aggressive driving events. Focusing on smoother braking could improve your brake pad lifespan by an estimated 14% and prevent safety infractions.`}
                </p>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex-1">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Incident Timeline</h3>
              
              {safetyLog.length === 0 ? (
                <div className="text-center text-slate-500 py-10">No recent incidents.</div>
              ) : (
                <div className="space-y-4">
                  {safetyLog.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                        <div>
                          <p className="font-bold text-white text-sm">{log.type}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{log.time} • Occurred at {log.speed} km/h</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-rose-400">-{log.penalty} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
