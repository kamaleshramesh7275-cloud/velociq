import React, { useMemo } from 'react';

export default function AICoachingPanel({ telemetry, isConnected, speedLimit }) {
  const coachTip = useMemo(() => {
    if (!isConnected) {
      return {
        status: 'offline',
        title: 'Coaching Suspended',
        message: 'ESP32 BLE connection offline. Synchronize hardware stream to receive live advice.',
        color: 'border-slate-800 bg-slate-900/50 text-slate-400',
        badge: 'Offline'
      };
    }

    const { speed, rpm, events } = telemetry;
    const latestEvent = events && events[0] ? events[0].label : '';

    if (speed > speedLimit) {
      return {
        status: 'danger',
        title: 'Speed Limit Alert',
        message: `Exceeding the target limit of ${speedLimit} km/h. High speed increases aerodynamic drag, significantly reducing fuel mileage.`,
        color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        badge: 'Warning'
      };
    }

    if (rpm > 3400 && speed < 70) {
      return {
        status: 'warning',
        title: 'Optimistic Upshift',
        message: 'Engine speed is high for current velocity. Upshift to a higher gear to bring RPM down and optimize fuel intake.',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        badge: 'Efficiency'
      };
    }

    if (latestEvent === 'Harsh Brake' || latestEvent === 'Rapid Accel') {
      return {
        status: 'warning',
        title: 'Aggressive Drive Pattern',
        message: 'Frequent hard braking or rapid acceleration wastes energy. Maintain gaps and practice progressive driving.',
        color: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
        badge: 'Safety'
      };
    }

    if (rpm < 1200 && speed > 20) {
      return {
        status: 'info',
        title: 'Engine Lugging Mismatch',
        message: 'RPM is too low for the current speed. Downshift to prevent engine strain and spark plug soot build-up.',
        color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        badge: 'Mechanical'
      };
    }

    // Default eco driving tip
    return {
      status: 'nominal',
      title: 'Optimal Cruise Active',
      message: 'Excellent driver throttle control. Steady speeds and nominal RPM are boosting your fuel rating today.',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      badge: 'Eco Drive'
    };
  }, [telemetry, isConnected, speedLimit]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">AI Assistant</p>
          <h2 className="text-xl font-semibold text-white">Adaptive Coaching</h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${coachTip.color}`}>
          {coachTip.badge}
        </span>
      </div>

      <div className={`rounded-2xl border p-5 ${coachTip.color} transition-all duration-300`}>
        <h3 className="font-semibold text-lg">{coachTip.title}</h3>
        <p className="mt-2 text-sm leading-relaxed opacity-90">{coachTip.message}</p>
        
        {isConnected && (
          <div className="mt-4 flex items-center gap-4 text-xs opacity-75">
            <div>
              <span className="text-slate-400">Current Trip Score:</span>{' '}
              <span className="font-semibold text-white">{Math.round(telemetry.score)}</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400">Est. Savings:</span>{' '}
              <span className="font-semibold text-emerald-400">+12.4% fuel efficiency</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
