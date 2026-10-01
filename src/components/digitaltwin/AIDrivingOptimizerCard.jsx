import React, { useState } from 'react';
import { Card, SectionLabel, SeverityBadge } from '../ui';
import { PulseDot, SparklesIcon, ShieldCheckIcon, FlameIcon, WrenchIcon, LayersIcon } from '../icons';

export default function AIDrivingOptimizerCard({
  optimizerData,
  onApplyRecommendation,
  onWhatIfChange
}) {
  const [whatIf, setWhatIf] = useState({
    throttleSmoothing: 0,
    coastingBonus: 0,
    corneringSmoothing: 0
  });

  const handleSliderChange = (key, val) => {
    const updated = { ...whatIf, [key]: parseFloat(val) };
    setWhatIf(updated);
    if (onWhatIfChange) {
      onWhatIfChange(updated);
    }
  };

  const insight = optimizerData?.todaysInsight || {
    headline: "Today's Driving Insight",
    observation: "Your average acceleration was 18% higher than your normal pattern.",
    metrics: {
      fuelEfficiencyImpact: -7,
      drivingSmoothnessImpact: -12,
      vehicleStress: 'increased'
    },
    recommendation: 'Use smoother acceleration during the first 10 minutes of your trip.',
    reasoning: 'Reduces thermal shock on turbo bearing seals and saves cold-enrichment fuel.'
  };

  const pillars = optimizerData?.pillars || {};
  const vehicle = optimizerData?.vehicle || {};
  const driver = optimizerData?.driver || {};

  return (
    <Card cornerBrackets className="p-6 bg-surface/80 backdrop-blur-xl border border-line shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-emerald/10 border border-accent-emerald/25 shadow-hero-emerald">
            <SparklesIcon className="w-5 h-5 text-accent-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent-emerald font-bold">
                4. AI DRIVING OPTIMIZER
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-cyan/15 px-2 py-0.5 text-[9px] font-mono font-bold text-accent-cyan border border-accent-cyan/30">
                <PulseDot color="cyan" active={true} />
                SYNTHESIS ENGINE
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-hi tracking-tight mt-0.5">
              Personalized Driver $\times$ Vehicle Intelligence
            </h2>
            <p className="text-xs font-mono text-text-mid">
              Synthesizing <span className="text-text-hi font-bold">{driver?.name}</span> with <span className="text-accent-cyan font-bold">{vehicle?.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-line bg-bg-raised/70 px-3 py-1.5 text-right">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-lo block">
              Driver-Vehicle Synergy
            </span>
            <span className="text-xs font-mono font-bold text-accent-emerald">
              91.4% Optimal Coupling
            </span>
          </div>
        </div>
      </div>

      {/* Visual ASCII / Node Architecture Diagram (Matches prompt diagram) */}
      <div className="hidden md:block rounded-xl border border-line/80 bg-slate-950/70 p-4 font-mono text-[11px] text-text-mid">
        <div className="flex items-center justify-between text-xs text-text-lo uppercase tracking-widest pb-2 mb-2 border-b border-line/40">
          <span>AI Intelligence Synthesis Pipeline</span>
          <span className="text-accent-cyan">Dual-Twin Fusion</span>
        </div>
        <div className="grid grid-cols-5 items-center text-center gap-2">
          <div className="p-2 rounded-lg border border-accent-violet/40 bg-accent-violet/10 text-accent-violet font-bold">
            DRIVER DIGITAL TWIN<br/><span className="text-[9px] font-normal text-text-mid">Behavioral Model</span>
          </div>
          <div className="text-accent-cyan font-bold text-lg">+</div>
          <div className="p-2 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan font-bold">
            VEHICLE DIGITAL TWIN<br/><span className="text-[9px] font-normal text-text-mid">Mechanical Baseline</span>
          </div>
          <div className="text-accent-emerald font-bold text-lg">──▶</div>
          <div className="p-2 rounded-lg border border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald font-bold">
            AI OPTIMIZER<br/><span className="text-[9px] font-normal text-text-mid">Tri-Pillar Targeting</span>
          </div>
        </div>
      </div>

      {/* Hero Today's Driving Insight (Matches exact prompt example) */}
      <div className="relative overflow-hidden rounded-xl border border-accent-cyan/40 bg-gradient-to-br from-bg-raised via-bg-surface to-accent-cyan/5 p-5 shadow-hero-cyan">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-cyan animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-cyan">
                {insight.headline}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-text-hi leading-snug">
              {insight.observation}
            </h3>

            {/* Estimated Impact Grid (Exact Prompt Values) */}
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-lo block mb-1.5 font-bold">
                Estimated Impact:
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-3 py-1 text-xs font-mono">
                  <span className="text-text-lo">Fuel efficiency:</span>{' '}
                  <span className="font-bold text-accent-rose">
                    {insight.metrics.fuelEfficiencyImpact > 0 ? `+${insight.metrics.fuelEfficiencyImpact}%` : `${insight.metrics.fuelEfficiencyImpact}%`}
                  </span>
                </div>

                <div className="rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-3 py-1 text-xs font-mono">
                  <span className="text-text-lo">Driving smoothness:</span>{' '}
                  <span className="font-bold text-accent-amber">
                    {insight.metrics.drivingSmoothnessImpact > 0 ? `+${insight.metrics.drivingSmoothnessImpact}%` : `${insight.metrics.drivingSmoothnessImpact}%`}
                  </span>
                </div>

                <div className="rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-3 py-1 text-xs font-mono">
                  <span className="text-text-lo">Vehicle stress:</span>{' '}
                  <span className="font-bold text-accent-rose uppercase">
                    {insight.metrics.vehicleStress}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="mt-3 rounded-lg border border-accent-emerald/40 bg-accent-emerald/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-emerald">
                  AI Tailored Recommendation
                </span>
                <span className="text-[9px] font-mono text-text-lo">Non-Generic Insight</span>
              </div>
              <p className="mt-1 text-sm font-bold text-text-hi">
                "{insight.recommendation}"
              </p>
              <p className="mt-1 text-xs font-mono text-text-mid">
                {insight.reasoning}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[140px] shrink-0">
            <button
              type="button"
              onClick={onApplyRecommendation}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0B3D91] px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-[#082b68] transition shadow-sm"
            >
              <SparklesIcon className="w-4 h-4 text-white" />
              Apply to Twin
            </button>
            <span className="text-[10px] font-mono text-center text-slate-600 font-semibold">
              Propagates to Vehicle & Driver Models
            </span>
          </div>
        </div>
      </div>

      {/* 3 Outcome Pillars: SAFETY, EFFICIENCY, HEALTH (Matches prompt tri-pillar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: SAFETY */}
        <div className="rounded-xl border border-line bg-bg-raised/50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B3D91]">
                Pillar 1: SAFETY
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0B3D91] font-bold border border-blue-200">
                {pillars.safety?.status || 'Elite Safe'}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] font-mono text-slate-700 font-bold block">Dynamic Driving Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-[#0F172A] tabular-nums">
                  {pillars.safety?.drivingScore ?? 94}
                </span>
                <span className="text-xs font-mono text-[#047857] font-bold">
                  {pillars.safety?.scoreDelta > 0 ? `+${pillars.safety.scoreDelta} pts` : 'Optimized'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-line/60 text-xs font-mono text-slate-800 font-medium">
            Collision Risk Mitigation: <span className="text-[#047857] font-bold">-{pillars.safety?.collisionRiskReductionPct ?? 18}%</span>
          </div>
        </div>

        {/* Pillar 2: EFFICIENCY */}
        <div className="rounded-xl border border-line bg-bg-raised/50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#047857]">
                Pillar 2: EFFICIENCY
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#047857] font-bold border border-emerald-200">
                Fuel Saving
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] font-mono text-slate-700 font-bold block">Projected Monthly Savings</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-[#047857] tabular-nums">
                  +{pillars.efficiency?.fuelSavingPct ?? 7.4}%
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  ({pillars.efficiency?.monthlyLitersSaved ?? 34} L / mo)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-line/60 text-xs font-mono text-slate-800 font-medium flex items-center justify-between">
            <span>Cash Saved: <strong className="text-[#0B3D91]">${pillars.efficiency?.monthlySavingsUsd ?? 42}/mo</strong></span>
            <span>CO2: <strong className="text-[#047857]">-{pillars.efficiency?.co2ReductionKg ?? 78} kg</strong></span>
          </div>
        </div>

        {/* Pillar 3: HEALTH */}
        <div className="rounded-xl border border-line bg-bg-raised/50 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5CF6]">
                Pillar 3: HEALTH
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-50 text-[#8B5CF6] font-bold border border-purple-200">
                Maintenance Prediction
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] font-mono text-slate-700 font-bold block">Mechanical Stress Buffer</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-[#8B5CF6] tabular-nums">
                  -{pillars.health?.stressReductionPct ?? 14}%
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  Component Stress
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-line/60 text-xs font-mono text-slate-800 font-medium flex items-center justify-between">
            <span>Brake Life: <strong className="text-slate-900 font-bold">+{pillars.health?.brakePadExtensionDays ?? 32}d</strong></span>
            <span>Oil Life: <strong className="text-slate-900 font-bold">+{pillars.health?.oilLifeExtensionDays ?? 21}d</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Behavioral Simulator Tuning Deck */}
      <div className="rounded-xl border border-line bg-bg-raised/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-text-hi flex items-center gap-2">
            <LayersIcon className="w-3.5 h-3.5 text-accent-cyan" />
            Interactive Behavioral Tuning Simulator (What-If Driver Adjustments)
          </span>
          <span className="text-[10px] font-mono text-text-lo">
            Simulate behavior change and watch outcomes update in real-time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Slider 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-text-mid">Throttle Smoothing:</span>
              <span className="font-bold text-accent-cyan">+{Math.round(whatIf.throttleSmoothing * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={whatIf.throttleSmoothing}
              onChange={(e) => handleSliderChange('throttleSmoothing', e.target.value)}
              className="w-full accent-accent-cyan h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] font-mono text-text-lo block">Dampens initial 10-min cold throttle ramp</span>
          </div>

          {/* Slider 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-text-mid">Predictive Coasting:</span>
              <span className="font-bold text-accent-emerald">+{Math.round(whatIf.coastingBonus * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={whatIf.coastingBonus}
              onChange={(e) => handleSliderChange('coastingBonus', e.target.value)}
              className="w-full accent-accent-emerald h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] font-mono text-text-lo block">Early throttle release before traffic decelerations</span>
          </div>

          {/* Slider 3 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-text-mid">Cornering Gentleness:</span>
              <span className="font-bold text-accent-violet">+{Math.round(whatIf.corneringSmoothing * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={whatIf.corneringSmoothing}
              onChange={(e) => handleSliderChange('corneringSmoothing', e.target.value)}
              className="w-full accent-accent-violet h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] font-mono text-text-lo block">Reduces lateral G-load and tire sidewall scrubbing</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
