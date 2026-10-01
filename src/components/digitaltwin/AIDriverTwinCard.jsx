import React from 'react';
import { Card, SectionLabel, SeverityBadge } from '../ui';
import { PulseDot, BrainIcon, SparklesIcon } from '../icons';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';

export default function AIDriverTwinCard({ 
  driver, 
  driverProfiles = {} 
}) {
  const currentDriver = driver || driverProfiles?.d1 || {};
  const skillRadar = currentDriver?.skillRadar || [];
  const patterns = currentDriver?.contextualPatterns || [];
  const metrics = currentDriver?.behaviorMetrics || {};
  const timeOfDay = currentDriver?.timeOfDayDistributions || [];

  return (
    <Card cornerBrackets className="p-6 bg-surface/80 backdrop-blur-xl border border-line shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-violet/10 border border-accent-violet/25 shadow-hero-violet">
            <BrainIcon className="w-5 h-5 text-accent-violet" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent-violet font-bold">
                3. AI DRIVER DIGITAL TWIN
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-emerald/15 px-2 py-0.5 text-[9px] font-mono font-bold text-accent-emerald border border-accent-emerald/30">
                <PulseDot color="emerald" active={true} />
                BEHAVIORAL MODEL ACTIVE
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-hi tracking-tight mt-0.5">
              {currentDriver?.name || 'Sarah Jenkins'}
            </h2>
            <p className="text-xs font-mono text-text-mid">
              Driver Persona: <span className="text-accent-violet font-bold">{currentDriver?.persona || 'Dynamic Commuter'}</span> • {currentDriver?.experienceYears ?? 8} Years Telemetric Ingestion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-line bg-bg-raised/70 px-3 py-1.5 text-right">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-lo block">
              Behavioral Consistency
            </span>
            <span className="text-xs font-mono font-bold text-text-hi">
              σ = {metrics.speedVarianceKmh ?? 4.2} km/h • Jerk {metrics.avgAccelerationJerk ?? 1.84} m/s³
            </span>
          </div>
        </div>
      </div>

      {/* Split: 6-Axis Behavioral Radar (Left) + Behavioral Telematics (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-text-hi">
              6-Axis Behavioral Skill Model
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-accent-violet">
                <span className="h-2 w-2 rounded-full bg-accent-violet" /> Observed Driver
              </span>
              <span className="flex items-center gap-1 text-text-lo">
                <span className="h-2 w-2 rounded-full bg-text-lo" /> Baseline Model
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadar}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="axis" stroke="#1E293B" tick={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 9 }} />
                <Radar name="Observed" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} strokeWidth={2} />
                <Radar name="Baseline" dataKey="baseline" stroke="#475569" fill="#475569" fillOpacity={0.15} strokeDasharray="3 3" />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: '#0F172A', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavioral Metrics Ledger (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="rounded-xl border border-line bg-bg-raised/50 p-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-bold">Acceleration Jerk:</span>
              <span className="font-bold text-[#B45309] tabular-nums">
                {metrics.avgAccelerationJerk ?? 1.84} m/s³ <span className="text-[10px] text-[#D7263D] font-semibold">(+18% vs normal)</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#B45309]" style={{ width: '74%' }} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-bg-raised/50 p-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-bold">Peak Deceleration:</span>
              <span className="font-bold text-[#0F172A] tabular-nums">
                {metrics.brakingDecelPeakG ?? 0.42} G <span className="text-[10px] text-slate-600 font-semibold">(Baseline: 0.35 G)</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#D7263D]" style={{ width: '68%' }} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-bg-raised/50 p-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-bold">Cornering Stability:</span>
              <span className="font-bold text-[#047857] tabular-nums">
                {metrics.corneringLateralG ?? 0.28} G <span className="text-[10px] text-[#047857] font-semibold">(High Stability)</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#047857]" style={{ width: '88%' }} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-bg-raised/50 p-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 font-bold">Trip Distribution:</span>
              <span className="font-bold text-[#0F172A] tabular-nums">
                {metrics.shortCityTripsCount ?? 42} Urban / {metrics.longHighwayTripsCount ?? 28} Express
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#0B3D91]" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Patterns Discovered by AI (Matches the exact prompt examples) */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-text-hi flex items-center gap-2">
          <SparklesIcon className="w-3.5 h-3.5 text-accent-cyan" />
          Discovered Behavioral Habit Patterns
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patterns.map((pat) => (
            <div key={pat.id} className="rounded-xl border border-line bg-bg-raised/40 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-lo font-bold">
                    {pat.title}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    pat.severity === 'warning' ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/30' :
                    pat.severity === 'critical' ? 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30' :
                    'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                  }`}>
                    {pat.condition}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-text-hi leading-snug">
                  "{pat.highlight}"
                </p>
              </div>
              <p className="mt-2 text-[10px] font-mono text-text-lo pt-2 border-t border-line/50">
                {pat.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Time-of-Day Patterns Heat Matrix */}
      <div className="rounded-xl border border-line bg-bg-raised/20 p-3.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-lo font-bold block mb-2">
          Temporal Habit Evolution (Aggression vs Eco by Time of Day)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {timeOfDay.map((tod, idx) => (
            <div key={idx} className="rounded-lg bg-bg-surface/70 border border-line/60 p-2.5">
              <span className="text-[11px] font-mono font-bold text-text-hi block truncate">
                {tod.period}
              </span>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                <span className="text-text-lo">Aggression:</span>
                <span className={`font-bold tabular-nums ${tod.aggressionIndex > 70 ? 'text-accent-rose' : 'text-text-mid'}`}>
                  {tod.aggressionIndex}/100
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                <span className="text-text-lo">Eco Score:</span>
                <span className="font-bold text-accent-emerald tabular-nums">
                  {tod.ecoScore}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
