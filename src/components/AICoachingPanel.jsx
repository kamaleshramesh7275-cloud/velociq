import React, { useMemo } from 'react';
import { SectionLabel } from './ui';
import { SparklesIcon, AlertTriangleIcon } from './icons';

export default function AICoachingPanel({ telemetry = {}, isConnected = true, speedLimit = 90, driverModel }) {
  const { trained = false, accuracy = 50, isErratic = false, type = 'None' } = driverModel || {};

  const coachTip = useMemo(() => {
    if (!isConnected) {
      return {
        status: 'offline',
        title: 'Coaching Suspended',
        message: 'ESP32 BLE connection offline. Synchronize hardware stream to receive live advice.',
        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-300',
        cardStyle: 'bg-slate-50 border-line text-slate-800',
        badge: 'Offline Buffer'
      };
    }

    if (trained && isErratic) {
      return {
        status: 'danger',
        title: 'Model Gradient Divergence (NaN)',
        message: 'High learning rate caused network weight divergence. System auto-reverting to baseline safe weights.',
        badgeStyle: 'bg-red-50 text-[#D7263D] border-red-200',
        cardStyle: 'bg-red-50/70 border-red-200 text-slate-900',
        badge: 'Loss Anomaly'
      };
    }

    const { speed = 0, rpm = 0, events = [] } = telemetry;
    const latestEvent = events && events[0] ? events[0].label : '';

    if (speed > speedLimit) {
      return {
        status: 'danger',
        title: 'Expressway Speed Limit Alert',
        message: `Current velocity exceeds target cap of ${speedLimit} km/h. Aerodynamic drag increases cubically past 90 km/h, causing fuel penalty.`,
        badgeStyle: 'bg-red-50 text-[#D7263D] border-red-200',
        cardStyle: 'bg-red-50/60 border-red-200 text-slate-900',
        badge: trained ? `AI: Speed Warn (${accuracy.toFixed(0)}%)` : 'Speed Warning'
      };
    }

    if (rpm > 3400 && speed < 70) {
      return {
        status: 'warning',
        title: 'Gear Upshift Recommended',
        message: 'High engine speed (RPM) detected at low velocity. Shift to higher gear to lower BSFC consumption and reduce carbon footprint.',
        badgeStyle: 'bg-amber-50 text-[#B45309] border-amber-200',
        cardStyle: 'bg-amber-50/60 border-amber-200 text-slate-900',
        badge: trained ? `AI: Efficiency (${accuracy.toFixed(0)}%)` : 'Efficiency Tip'
      };
    }

    if (latestEvent === 'Harsh Brake' || latestEvent === 'Rapid Accel') {
      return {
        status: 'warning',
        title: 'Impulse Surge Detected',
        message: 'Aggressive deceleration or throttle pedal surges detected. Smoother pedal feathering saves up to 18% kinetic energy.',
        badgeStyle: 'bg-amber-50 text-[#B45309] border-amber-200',
        cardStyle: 'bg-amber-50/60 border-amber-200 text-slate-900',
        badge: trained ? `AI: Safety (${accuracy.toFixed(0)}%)` : 'Safety Notice'
      };
    }

    if (rpm < 1200 && speed > 20) {
      return {
        status: 'info',
        title: 'Engine Lugging Warning',
        message: 'RPM too low for active load. Downshift to prevent engine lugging and spark plug unburnt fuel buildup.',
        badgeStyle: 'bg-blue-50 text-[#0B3D91] border-blue-200',
        cardStyle: 'bg-blue-50/60 border-blue-200 text-slate-900',
        badge: trained ? `AI: Mechanical (${accuracy.toFixed(0)}%)` : 'Mechanical'
      };
    }

    return {
      status: 'nominal',
      title: 'Optimal Laminar Cruise Active',
      message: 'Smooth throttle application. Cruise speed matches vehicle aerodynamic sweet spot, maximizing km/L efficiency.',
      badgeStyle: 'bg-emerald-50 text-[#047857] border-emerald-200',
      cardStyle: 'bg-emerald-50/60 border-emerald-200 text-slate-900',
      badge: trained ? `AI: Eco (${accuracy.toFixed(0)}%)` : 'Eco Mode'
    };
  }, [telemetry, isConnected, speedLimit, trained, isErratic, accuracy]);

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm p-5 relative overflow-hidden flex flex-col justify-between">
      <div className="racing-stripe" />

      {/* Header */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <SectionLabel label="AI ASSISTANT / ADAPTIVE COACHING" />
            <h3 className="text-lg font-bold text-text-hi font-heading mt-1">Driving Strategy Advisor</h3>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${coachTip.badgeStyle}`}>
            {coachTip.badge}
          </span>
        </div>

        {/* Dynamic Coach Card */}
        <div className={`rounded-xl border p-4 transition-all duration-300 ${coachTip.cardStyle}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <SparklesIcon className="w-4 h-4 text-[#0B3D91]" />
            <h4 className="font-heading font-bold text-sm text-text-hi">{coachTip.title}</h4>
          </div>
          <p className="text-xs font-mono text-slate-800 leading-relaxed font-medium">
            {coachTip.message}
          </p>
          
          {isConnected && (
            <div className="mt-3.5 flex flex-col gap-2 border-t border-slate-200/80 pt-2.5 sm:flex-row sm:items-center sm:justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">Active Trip Score:</span>
                <span className="font-bold text-[#0B3D91] tabular-nums">{Math.round(telemetry.score ?? 95)} / 100</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">Model Status:</span>
                <span className="font-bold text-[#047857]">
                  {trained ? `${type} (${accuracy.toFixed(1)}% acc)` : 'Heuristic Baseline (Active)'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
