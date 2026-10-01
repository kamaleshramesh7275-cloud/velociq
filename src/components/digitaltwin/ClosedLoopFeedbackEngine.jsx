import React, { useState, useEffect } from 'react';
import { Card, SectionLabel, SeverityBadge } from '../ui';
import { PulseDot, LoopIcon, SparklesIcon, CarIcon, BrainIcon, HeartPulseIcon } from '../icons';
import { CLOSED_LOOP_STAGES, INITIAL_LEARNING_EPOCHS } from '../../utils/digitalTwinEngine';

export default function ClosedLoopFeedbackEngine({
  activeStageId = 1,
  onStageSelect,
  onRunLearningCycle,
  learningEpochs = INITIAL_LEARNING_EPOCHS,
  isCycling = false
}) {
  const [selectedStageId, setSelectedStageId] = useState(activeStageId);

  useEffect(() => {
    setSelectedStageId(activeStageId);
  }, [activeStageId]);

  const selectedStage = CLOSED_LOOP_STAGES.find(s => s.id === selectedStageId) || CLOSED_LOOP_STAGES[0];

  return (
    <Card cornerBrackets className="p-6 bg-surface/80 backdrop-blur-xl border border-line shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-amber/10 border border-accent-amber/25 shadow-hero-amber">
            <LoopIcon className="w-5 h-5 text-accent-amber" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent-amber font-bold">
                5. THE CORE INNOVATION: CLOSED-LOOP FEEDBACK ENGINE
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-amber/15 px-2 py-0.5 text-[9px] font-mono font-bold text-accent-amber border border-accent-amber/30">
                <PulseDot color="amber" active={true} />
                SELF-LEARNING CYCLE
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-hi tracking-tight mt-0.5">
              Continuous Automotive Intelligence Feedback Loop
            </h2>
            <p className="text-xs font-mono text-text-mid">
              Vehicle learns ➔ Driver learns ➔ AI analyzes both ➔ AI predicts ➔ Driver changes behavior ➔ Vehicle data changes ➔ AI learns again.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isCycling}
            onClick={onRunLearningCycle}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold transition shadow-sm ${
              isCycling 
                ? 'bg-slate-800 text-slate-300 cursor-wait' 
                : 'bg-[#B45309] text-white hover:bg-[#92400e] active:scale-95'
            }`}
          >
            <LoopIcon className={`w-4 h-4 ${isCycling ? 'animate-spin' : ''}`} />
            {isCycling ? 'Propagating Loop...' : 'Trigger Learning Cycle'}
          </button>
        </div>
      </div>

      {/* Interactive 6-Stage Cyclic Node Ribbon */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-700">
          <span>Click any stage in the cycle to inspect data flow:</span>
          <span className="text-[#B45309] font-bold">Stage {selectedStage.id} of 6: {selectedStage.shortTitle}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CLOSED_LOOP_STAGES.map((stg) => {
            const isSelected = selectedStageId === stg.id;
            const isCurrentCycle = isCycling && activeStageId === stg.id;

            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => {
                  setSelectedStageId(stg.id);
                  if (onStageSelect) onStageSelect(stg.id);
                }}
                className={`relative flex flex-col p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'border-[#B45309] bg-amber-50 shadow-sm ring-1 ring-[#B45309]' 
                    : isCurrentCycle
                    ? 'border-[#0B3D91] bg-blue-50 animate-pulse'
                    : 'border-line bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'text-[#B45309]' : 'text-slate-600'
                  }`}>
                    0{stg.id}
                  </span>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B45309] animate-ping" />
                  )}
                </div>
                <span className="mt-1 font-mono text-xs font-bold text-text-hi leading-tight">
                  {stg.shortTitle}
                </span>
                <span className="mt-1 text-[10px] font-mono text-text-lo line-clamp-2">
                  {stg.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Callout Panel */}
      <div className="rounded-xl border border-line bg-bg-raised/50 p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-amber" />
            <span className="text-xs font-mono font-bold text-text-hi uppercase tracking-wider">
              {selectedStage.label}
            </span>
          </div>
          <span className="text-[10px] font-mono text-accent-cyan">
            Active Data Bus Stream
          </span>
        </div>
        <p className="text-xs font-mono text-text-mid">
          {selectedStage.description}
        </p>
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-line/50 font-mono text-[11px] text-accent-cyan overflow-x-auto">
          <code>{selectedStage.dataFlow}</code>
        </div>
      </div>

      {/* Self-Learning Convergence Ledger */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-text-hi flex items-center gap-2">
            <SparklesIcon className="w-3.5 h-3.5 text-accent-amber" />
            Self-Learning Evolution Ledger (Epochs & Synergy Convergence)
          </span>
          <span className="text-[10px] font-mono text-text-lo">
            Dynamic Baseline Re-Calibration
          </span>
        </div>

        <div className="space-y-2">
          {learningEpochs.map((ep) => (
            <div 
              key={ep.epoch}
              className="rounded-xl border border-line bg-bg-raised/40 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#B45309] font-bold text-[10px] border border-amber-200">
                  E{ep.epoch}
                </span>
                <div>
                  <span className="font-bold text-slate-900">{ep.trigger}</span>
                  <span className="text-[10px] text-slate-700 font-semibold block">{ep.timestamp} • {ep.action}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                <div>
                  <span className="text-slate-700 block text-[9px] uppercase font-bold">Driver Jerk</span>
                  <span className="font-bold text-slate-900">{ep.driverJerk} m/s³</span>
                </div>
                <div>
                  <span className="text-slate-700 block text-[9px] uppercase font-bold">Efficiency</span>
                  <span className="font-bold text-[#047857]">{ep.vehicleEfficiency} km/L</span>
                </div>
                <div>
                  <span className="text-slate-700 block text-[9px] uppercase font-bold">Anomaly</span>
                  <span className={`font-bold ${ep.healthAnomalyScore > 30 ? 'text-[#D7263D]' : 'text-[#047857]'}`}>
                    {ep.healthAnomalyScore}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-700 block text-[9px] uppercase font-bold">Synergy</span>
                  <span className="font-bold text-[#0B3D91]">{ep.synergyScore}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
