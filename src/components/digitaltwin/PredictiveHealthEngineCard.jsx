import React, { useState } from 'react';
import { Card, SectionLabel, SeverityBadge } from '../ui';
import { PulseDot, SparklesIcon, AlertTriangleIcon, HeartPulseIcon } from '../icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart
} from 'recharts';

export default function PredictiveHealthEngineCard({
  predictiveMetrics,
  anomalyScore = 24.8,
  primaryAlert = null
}) {
  const [activeTab, setActiveTab] = useState('xai'); // 'xai' | 'runways'
  const factorAttributions = predictiveMetrics?.factorAttributions || [];
  const wearRunways = predictiveMetrics?.wearRunways || {};
  const historySeries = predictiveMetrics?.timeSeriesBaselineHistory || [];

  const alert = primaryAlert || {
    title: 'Vehicle Health Alert',
    message: 'Fuel efficiency has decreased 12.4% compared with your 90-day baseline.',
    isAnomaly: true,
    severity: 'warning'
  };

  return (
    <Card cornerBrackets className="p-6 bg-surface/80 backdrop-blur-xl border border-line shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-rose/10 border border-accent-rose/25 shadow-hero-rose">
            <HeartPulseIcon className="w-5 h-5 text-accent-rose" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent-rose font-bold">
                2. PREDICTIVE VEHICLE HEALTH ENGINE
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-violet/15 px-2 py-0.5 text-[9px] font-mono font-bold text-accent-violet border border-accent-violet/30">
                <PulseDot color="violet" active={true} />
                TIME-SERIES ML
              </span>
            </div>
            <h2 className="text-xl font-bold text-text-hi tracking-tight mt-0.5">
              Anomaly Detection & Trend Analytics
            </h2>
            <p className="text-xs font-mono text-text-mid">
              Multi-variate Mahalanobis distance • Rolling 90-day baseline anomaly scoring
            </p>
          </div>
        </div>

        {/* Anomaly Gauge Pill */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-line bg-bg-raised/70 px-4 py-2 flex items-center gap-3">
            <div>
              <span className="text-[9px] font-mono uppercase text-text-lo block">
                Anomaly Index
              </span>
              <span className="text-lg font-bold font-mono text-accent-rose tabular-nums leading-none">
                {anomalyScore}%
              </span>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
              anomalyScore > 50 ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/40' :
              anomalyScore > 20 ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40' :
              'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/40'
            }`}>
              {predictiveMetrics?.healthStatus || 'Deviation Detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Vehicle Health Alert Banner (Matches the exact prompt example) */}
      <div className="relative overflow-hidden rounded-xl border border-accent-amber/40 bg-gradient-to-r from-accent-amber/15 via-accent-amber/5 to-transparent p-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-amber/20 border border-accent-amber/40 text-accent-amber">
            <AlertTriangleIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-amber">
                {alert.title}
              </span>
              <span className="text-[10px] font-mono text-text-mid">
                Time-Series ML Trigger • Continuous Monitor
              </span>
            </div>
            <p className="mt-1 text-base font-bold text-text-hi leading-snug">
              {alert.message}
            </p>
            <p className="mt-1 text-xs font-mono text-text-mid">
              Historical baseline: 17.8 km/L | Current 48h rolling average: 15.6 km/L (-12.4% deficit). Trend indicates actionable calibration deficit.
            </p>
          </div>
        </div>
      </div>

      {/* Time-Series Trend Line Chart */}
      <div className="rounded-xl border border-line bg-bg-raised/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-text-hi">
            Time-Series ML Fuel Efficiency vs Baseline Trend (90-Day Trajectory)
          </span>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-accent-cyan">
              <span className="h-2 w-2 rounded-full bg-accent-cyan" /> 90d Baseline (17.8 km/L)
            </span>
            <span className="flex items-center gap-1.5 text-accent-amber">
              <span className="h-2 w-2 rounded-full bg-accent-amber" /> Observed Efficiency
            </span>
            <span className="flex items-center gap-1.5 text-accent-rose">
              <span className="h-2 w-2 rounded-full bg-accent-rose" /> Anomaly Threshold (-10%)
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" domain={[13, 20]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B1220', borderColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Line type="monotone" dataKey="baseline" stroke="#06B6D4" strokeWidth={2} strokeDasharray="4 4" dot={false} name="90d Baseline" />
              <Line type="monotone" dataKey="anomalyBand" stroke="#F43F5E" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="Anomaly Band" />
              <Area type="monotone" dataKey="observed" stroke="#F59E0B" fill="url(#colorObserved)" strokeWidth={2.5} name="Observed km/L" />
              <defs>
                <linearGradient id="colorObserved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs: Explainable AI Attribution vs Component Runways */}
      <div className="flex border-b border-line gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('xai')}
          className={`pb-2 px-3 font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'xai' 
              ? 'border-accent-rose text-accent-rose' 
              : 'border-transparent text-text-lo hover:text-text-mid'
          }`}
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          Explainable AI (Factor Attribution)
        </button>
        <button
          onClick={() => setActiveTab('runways')}
          className={`pb-2 px-3 font-bold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'runways' 
              ? 'border-accent-rose text-accent-rose' 
              : 'border-transparent text-text-lo hover:text-text-mid'
          }`}
        >
          <HeartPulseIcon className="w-3.5 h-3.5" />
          Predictive Maintenance Runway (RUL)
        </button>
      </div>

      {/* Tab 1: Explainable AI Factor Attribution */}
      {activeTab === 'xai' && (
        <div className="space-y-3">
          <div className="text-[11px] font-mono text-text-mid">
            The AI engine decomposes the 12.4% fuel deficit into root physical factors contributing to the anomaly:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {factorAttributions.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-line bg-bg-raised/50 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#D7263D]">
                      {item.contributionPct}% Contributor
                    </span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 text-[#B45309] font-bold border border-amber-200">
                      {item.risk} Risk
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 leading-tight">
                    {item.factor}
                  </h4>
                  <p className="mt-1 text-[11px] font-mono text-slate-700 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-line/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">Impact:</span>
                  <span className="font-bold text-[#B45309]">{item.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Predictive Component Runways (RUL) */}
      {activeTab === 'runways' && (
        <div className="space-y-3">
          <div className="text-[11px] font-mono text-slate-800 font-semibold">
            Remaining Useful Life (RUL) calculated by time-series wear degradation models:
          </div>
          <div className="space-y-2.5">
            {Object.entries(wearRunways).map(([key, data]) => {
              const label = key === 'brakes' ? 'Brake Pads & Rotors' :
                            key === 'engineOil' ? 'Engine Oil Oxidation' :
                            key === 'battery' ? '12V / Starter Cell Health' :
                            key === 'coolingSystem' ? 'Coolant Fluid & Thermostat' : 'Catalytic Emissions Subsystem';
              return (
                <div key={key} className="rounded-xl border border-line bg-bg-raised/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{label}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                        data.healthPct < 65 ? 'bg-rose-50 text-[#D7263D] border-rose-200' :
                        data.healthPct < 80 ? 'bg-amber-50 text-[#B45309] border-amber-200' :
                        'bg-emerald-50 text-[#047857] border-emerald-200'
                      }`}>
                        {data.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-700 font-medium">
                      Runway: <strong className="text-slate-900">{data.daysRemaining} days</strong> remaining (~{data.kmRemaining?.toLocaleString()} km)
                    </span>
                  </div>

                  <div className="flex-1 max-w-xs flex items-center gap-3">
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        style={{ width: `${data.healthPct}%` }}
                        className={`h-full transition-all duration-500 ${
                          data.healthPct < 65 ? 'bg-[#D7263D]' :
                          data.healthPct < 80 ? 'bg-accent-amber' : 'bg-accent-emerald'
                        }`}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-text-hi tabular-nums min-w-[36px] text-right">
                      {data.healthPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
