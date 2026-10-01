import React, { useMemo } from 'react';
import { calculateGlosaTarget } from '../utils/speedMileagePhysics';
import { Card, SectionLabel, StatusPill } from './ui';
import { PulseDot, AlertTriangleIcon } from './icons';

export default function GlosaAdvisor({
  speed = 55,
  trafficSignal = { distanceMeters: 380, phase: 'GREEN', timeRemainingSec: 18, cycleTotal: 30 },
  kineticWaste = { stopsCount: 2, energyDissipatedKj: 388, fuelWastedLiters: 0.052, costPenalty: 4.94 },
  onSimulateStop
}) {
  const { distanceMeters, phase, timeRemainingSec, cycleTotal = 30 } = trafficSignal;

  const glosa = useMemo(() => {
    return calculateGlosaTarget(distanceMeters, phase, timeRemainingSec, speed);
  }, [distanceMeters, phase, timeRemainingSec, speed]);

  const speedDiff = Math.round(speed - glosa.targetSpeedKmh);

  // SVG Circular countdown ring metrics
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, Math.max(0, timeRemainingSec / Math.max(1, cycleTotal)));
  const strokeDashoffset = circumference - progressRatio * circumference;

  const phaseColor = {
    GREEN: {
      text: 'text-emerald-400',
      stroke: '#10B981',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    YELLOW: {
      text: 'text-amber-400',
      stroke: '#F59E0B',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    RED: {
      text: 'text-rose',
      stroke: '#F43F5E',
      bg: 'bg-rose/10',
      border: 'border-rose/30',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      badge: 'bg-rose/15 text-rose border-rose/30'
    }
  }[phase] || {
    text: 'text-emerald-400',
    stroke: '#10B981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: '',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  };

  const plainLanguageAdvice = useMemo(() => {
    if (glosa.targetSpeedKmh >= 50 && phase === 'GREEN') {
      return `Coast at ${glosa.targetSpeedKmh} km/h to pass on GREEN`;
    }
    if (phase === 'RED') {
      return `Slow down to ${glosa.targetSpeedKmh} km/h to arrive as light turns GREEN`;
    }
    return `Maintain ${glosa.targetSpeedKmh} km/h for green-wave arrival`;
  }, [glosa.targetSpeedKmh, phase]);

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm p-5 relative overflow-hidden">
      <div className="racing-stripe" />
      
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <SectionLabel label="GLOSA & GREEN-WAVE ADVISORY" />
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${phaseColor.badge}`}>
              Signal: {phase}
            </span>
          </div>
          <h3 className="text-lg font-bold text-text-hi font-heading mt-1">Traffic Signal Speed Synchronization</h3>
        </div>

        {/* Quick Simulation Trigger */}
        {onSimulateStop && (
          <button
            type="button"
            onClick={onSimulateStop}
            className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-[#D7263D] hover:bg-red-100 text-xs font-bold transition flex items-center gap-1.5"
          >
            <AlertTriangleIcon className="w-3.5 h-3.5" />
            Simulate Stop
          </button>
        )}
      </div>

      {/* Main Signal Housing (The Permitted Dark Element) + Advisory */}
      <div className="grid gap-4 sm:grid-cols-[140px_1fr] rounded-2xl border border-line bg-slate-50 p-4 mb-4">
        
        {/* Real Traffic Signal Housing (Small Dark Element) */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-[#0A0F1C] border-2 border-slate-700/80 rounded-2xl p-2.5 shadow-bezel flex flex-col items-center gap-2 w-20">
            {/* Red Light Lens */}
            <div className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
              phase === 'RED'
                ? 'bg-[#D7263D] border-red-400 shadow-[0_0_12px_#D7263D] animate-pulse'
                : 'bg-red-950/40 border-red-900/60 opacity-40'
            }`}>
              {phase === 'RED' && <span className="text-[10px] font-mono font-bold text-white tabular-nums">{timeRemainingSec}s</span>}
            </div>

            {/* Amber Light Lens */}
            <div className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
              phase === 'YELLOW'
                ? 'bg-[#F2A900] border-amber-300 shadow-[0_0_12px_#F2A900] animate-pulse'
                : 'bg-amber-950/40 border-amber-900/60 opacity-40'
            }`}>
              {phase === 'YELLOW' && <span className="text-[10px] font-mono font-bold text-slate-900 tabular-nums">{timeRemainingSec}s</span>}
            </div>

            {/* Green Light Lens */}
            <div className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
              phase === 'GREEN'
                ? 'bg-[#0F9D6B] border-emerald-400 shadow-[0_0_12px_#0F9D6B] animate-pulse'
                : 'bg-emerald-950/40 border-emerald-900/60 opacity-40'
            }`}>
              {phase === 'GREEN' && <span className="text-[10px] font-mono font-bold text-white tabular-nums">{timeRemainingSec}s</span>}
            </div>
          </div>

          <div className="mt-2 text-center font-mono text-xs text-text-mid">
            <span className="text-[#0B3D91] font-bold tabular-nums">{Math.round(distanceMeters)}</span>m ahead
          </div>
        </div>

        {/* Advisory Target Speed + Plain Language Advice */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-text-lo">RECOMMENDED GLOSA SPEED</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#0B3D91] tabular-nums">
                {glosa.targetSpeedKmh}
              </span>
              <span className="text-xs text-text-mid font-mono">km/h target</span>
              <span className="text-xs text-text-lo font-mono">
                (Live: {Math.round(speed)} km/h)
              </span>
            </div>
          </div>

          {/* Plain language banner */}
          <div className={`mt-3 rounded-xl border p-3 flex items-center gap-2 ${
            phase === 'GREEN' 
              ? 'bg-emerald-50 border-emerald-200 text-[#047857]'
              : phase === 'YELLOW'
                ? 'bg-amber-50 border-amber-200 text-[#B45309]'
                : 'bg-red-50 border-red-200 text-[#D7263D]'
          }`}>
            <span className="font-heading font-bold text-xs">
              {plainLanguageAdvice}
            </span>
          </div>
        </div>

      </div>

      {/* Kinetic Stop Tax summary */}
      <div className="flex items-center justify-between text-xs font-mono border-t border-line pt-3 text-slate-800">
        <span className="text-slate-600 font-semibold">Kinetic Stops: <strong className="text-slate-900 font-bold">{kineticWaste?.stopsCount ?? 0}</strong></span>
        <span>Dissipated: <strong className="text-[#B45309] font-bold">{Math.round(kineticWaste?.energyDissipatedKj ?? 0)} kJ</strong></span>
        <span>Fuel Tax: <strong className="text-[#D7263D] font-bold">{Number(kineticWaste?.fuelWastedLiters ?? 0).toFixed(3)} L</strong></span>
      </div>
    </div>
  );
}
