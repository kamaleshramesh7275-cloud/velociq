import React, { useState } from 'react';
import { SimulationContext } from '../context/SimulationContext';
import { Card, SectionLabel, SeverityBadge } from '../components/ui';
import { AnalogDial } from '../components/ui/AnalogDial';
import { PulseDot, ChevronDownIcon, ChevronRightIcon } from '../components/icons';

export default function DriverSafetyPage() {
  const { safetyLog, telemetry } = React.useContext(SimulationContext);
  const score = Math.round(telemetry?.score ?? 94);
  const [whyExpanded, setWhyExpanded] = useState(false);

  // Tiny deduction ledger
  const deductions = [
    { label: 'Harsh Braking', penalty: -3.5, occurrences: 1 },
    { label: 'Rapid Acceleration', penalty: -2.5, occurrences: 1 },
    { label: 'Speeding > Speed Limit', penalty: -0.8, occurrences: 0 },
    { label: 'Overrev Event > 4500 RPM', penalty: -0.5, occurrences: 0 },
    { label: 'Geofence Perimeter Alert', penalty: -2.0, occurrences: 0 },
  ];

  // Default synthetic kinetic waste log table if empty
  const wasteLogs = safetyLog && safetyLog.length > 0 ? safetyLog.map((log) => ({
    time: log.time,
    event: log.type,
    speed: `${log.speed} km/h`,
    dissipated: `${Math.round(log.speed * 4.8)} kJ`,
    severity: log.penalty > 2 ? 'critical' : 'warning'
  })) : [
    { time: '14:22:10', event: 'Harsh Braking at Signal', speed: '58 km/h', dissipated: '278 kJ', severity: 'warning' },
    { time: '14:05:42', event: 'Rapid Acceleration Surge', speed: '72 km/h', dissipated: '345 kJ', severity: 'warning' },
    { time: '13:48:19', event: 'Emergency Deceleration Stop', speed: '84 km/h', dissipated: '512 kJ', severity: 'critical' },
    { time: '13:12:05', event: 'Cornering G-Force Slip', speed: '46 km/h', dissipated: '165 kJ', severity: 'info' }
  ];

  const safetyScoreBands = [
    { from: 0, to: 65, color: '#D7263D' },
    { from: 65, to: 85, color: '#B45309' },
    { from: 85, to: 100, color: '#047857' },
  ];

  return (
    <div className="p-6 md:p-8 flex-1 overflow-auto bg-[#F4F6F9] text-[#0F172A]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Header with 3px Dual Racing Stripe */}
        <header className="relative bg-white border border-[#DDE2EA] rounded-xl p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <SectionLabel label="DRIVER TELEMETRY & BEHAVIORAL SCORING" />
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0F172A] tracking-tight mt-1">
                Driver Safety & Kinetic Telematics
              </h1>
              <p className="mt-1 text-xs text-slate-700 font-medium">
                Continuous 300ms impulse analysis, kinetic energy dissipation monitoring, and prioritized AI safety coaching.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
                Zero False-Positive Filter Active
              </span>
            </div>
          </div>
        </header>

        {/* Top Split: Score Gauge + Deduction Ledger (Left) and AI Coaching (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cols 1-7: Score Gauge & Deduction Ledger in Clean White Showroom Card */}
          <div className="lg:col-span-7">
            <Card className="p-6 bg-white border border-[#DDE2EA] rounded-xl shadow-sm h-full flex flex-col justify-between">
              <div>
                <SectionLabel label="DYNAMIC SAFETY SCORE" />
                <h3 className="text-lg font-heading font-bold text-[#0F172A] mt-1">0–100 Behavioral Safety Index</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6 items-center my-4">
                
                {/* 270° Speedometer Score Dial */}
                <div className="flex flex-col items-center justify-center">
                  <AnalogDial
                    value={score}
                    min={0}
                    max={100}
                    label="SAFETY INDEX"
                    unit="/ 100"
                    majorStep={20}
                    minorStep={5}
                    size={210}
                    darkTheme={false}
                    bands={safetyScoreBands}
                  />
                  <span className={`mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                    score >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    score >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {score >= 85 ? 'Tier 1 Exemplary Driver' : score >= 70 ? 'Caution Review' : 'Critical Coaching'}
                  </span>
                </div>

                {/* Deduction Ledger with Penalty Chips */}
                <div className="flex flex-col gap-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#DDE2EA]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold">REAL-TIME DEDUCTION LEDGER</span>
                    <span className="text-[10px] font-mono text-slate-600 font-semibold">30-Day Window</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {deductions.map((d) => (
                      <div key={d.label} className="flex items-center justify-between text-xs font-mono py-1.5 px-2 rounded-lg bg-white border border-[#E2E8F0]">
                        <span className="text-slate-900 font-sans font-semibold">{d.label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold tabular-nums border ${
                            d.occurrences > 0 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {d.penalty} pts {d.occurrences > 0 ? `(${d.occurrences}x)` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="text-[11px] font-mono text-slate-700 font-medium border-t border-[#E2E8F0] pt-3 flex flex-wrap items-center justify-between gap-2">
                <span>Calculated via 300ms High-Frequency Accelerometer Telemetry</span>
                <span className="text-[#0B3D91] font-bold">Traction Loss & G-Impulse Guard</span>
              </div>
            </Card>
          </div>

          {/* Cols 8-12: AI Coaching Card with Brand Blue */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-white border border-[#DDE2EA] border-l-4 border-l-[#0B3D91] rounded-xl shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#0B3D91] text-xs font-mono font-bold uppercase tracking-wider">
                    <svg className="w-3.5 h-3.5 text-[#0B3D91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    PRIORITIZED AI COACHING
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Confidence 98.4%
                  </span>
                </div>

                <h3 className="text-lg font-heading font-bold text-[#0F172A]">Kinetic Dissipation Pacing</h3>
                <p className="mt-2 text-xs text-slate-700 font-medium leading-relaxed">
                  Smooth the vehicle approach into detected traffic corridors using GLOSA speed advisory. Releasing the accelerator 40 meters earlier eliminates threshold deceleration and preserves brake pad lining.
                </p>
              </div>

              {/* Expandable "Why this matters" */}
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setWhyExpanded(!whyExpanded)}
                  className="w-full flex items-center justify-between text-xs font-mono text-[#0B3D91] hover:text-[#082b68] py-1 font-bold tracking-wide transition-colors"
                >
                  <span className="uppercase">Why this matters</span>
                  {whyExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                </button>

                {whyExpanded && (
                  <div className="mt-2.5 p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs font-sans text-slate-800 leading-relaxed font-medium">
                    <p className="text-[#0B3D91] font-bold font-heading mb-1 text-sm">Financial & Thermal Impact:</p>
                    Every stop from 70 km/h dumps approximately <span className="font-bold text-[#0F172A]">380 kJ</span> of kinetic energy into brake rotors as frictional waste heat. Eliminating just 4 abrupt stops per hour saves <span className="font-bold text-[#047857]">~$48/month</span> in fuel and extends pad life by <span className="font-bold text-[#0B3D91]">24%</span>.
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-700 font-medium pt-3 border-t border-[#E2E8F0]">
                <span>Trained Baseline: 90-Day Telematics</span>
                <span className="text-[#0B3D91] font-bold">Model: DriverBehavior-v2</span>
              </div>
            </Card>
          </div>

        </div>

        {/* Lower Row: Kinetic Waste Log Table in Striped Light Design */}
        <Card className="p-6 bg-white border border-[#DDE2EA] rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <SectionLabel label="KINETIC BRAKING EVENT LOG" />
              <h3 className="text-lg font-heading font-bold text-[#0F172A] mt-1">Dissipated Energy & G-Force Ledger</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800 bg-[#F1F5F9] px-3 py-1 rounded-full border border-[#DDE2EA] self-start sm:self-auto">
              {wasteLogs.length} events logged today
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#DDE2EA] bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DDE2EA] bg-[#F8FAFC] text-slate-700 font-mono text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Telemetry Event</th>
                  <th className="py-3 px-4 font-bold">Incident Velocity</th>
                  <th className="py-3 px-4 font-bold">Kinetic Waste</th>
                  <th className="py-3 px-4 text-right font-bold">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {wasteLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-blue-50/40 text-slate-800 transition-colors font-mono even:bg-[#FAFCFE]">
                    <td className="py-3 px-4 text-[#0F172A] font-medium tabular-nums">{log.time}</td>
                    <td className="py-3 px-4 font-semibold text-[#0F172A] font-sans">{log.event}</td>
                    <td className="py-3 px-4 text-[#0B3D91] font-bold tabular-nums">{log.speed}</td>
                    <td className="py-3 px-4 text-[#B45309] font-bold tabular-nums">{log.dissipated}</td>
                    <td className="py-3 px-4 text-right">
                      <SeverityBadge severity={log.severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}

