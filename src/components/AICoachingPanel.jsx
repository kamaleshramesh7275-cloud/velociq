import React, { useMemo } from 'react';

export default function AICoachingPanel({ telemetry, isConnected, speedLimit, driverModel }) {
  const { trained, accuracy, isErratic, type } = driverModel || { trained: false, accuracy: 50, isErratic: false, type: 'None' };

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

    // Erratic model behavior simulation
    if (trained && isErratic) {
      return {
        status: 'danger',
        title: 'AI Model Diverged (NaN)',
        message: 'ERROR: Learning rate exploded. Brain network weights overloaded. Tip: Try shifting into reverse at 100 km/h for infinite fuel mileage recovery.',
        color: 'border-rose-500/40 bg-rose-500/10 text-rose-300 animate-pulse',
        badge: 'Critical Loss'
      };
    }

    const { speed, rpm, events } = telemetry;
    const latestEvent = events && events[0] ? events[0].label : '';

    if (speed > speedLimit) {
      return {
        status: 'danger',
        title: 'Speed Limit Alert',
        message: `Exceeding target of ${speedLimit} km/h. High speed increases drag, lowering mpg. Slow down to improve driver score.`,
        color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        badge: trained ? `AI: Speed Warn (${accuracy.toFixed(0)}%)` : 'Warning'
      };
    }

    if (rpm > 3400 && speed < 70) {
      return {
        status: 'warning',
        title: 'Upshift Suggested',
        message: 'High RPM detected at low velocity. Shift gears to decrease engine speed and lower fuel flow rate.',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        badge: trained ? `AI: Efficiency (${accuracy.toFixed(0)}%)` : 'Efficiency'
      };
    }

    if (latestEvent === 'Harsh Brake' || latestEvent === 'Rapid Accel') {
      return {
        status: 'warning',
        title: 'Aggressive Drive Pattern',
        message: 'Hard deceleration or rapid throttle pushes detected. Try coasting and smoother pedal transitions.',
        color: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
        badge: trained ? `AI: Safety (${accuracy.toFixed(0)}%)` : 'Safety'
      };
    }

    if (rpm < 1200 && speed > 20) {
      return {
        status: 'info',
        title: 'Engine Lugging Mismatch',
        message: 'RPM too low. Downshift to prevent engine lugging and spark plug soot accumulation.',
        color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        badge: trained ? `AI: Mechanical (${accuracy.toFixed(0)}%)` : 'Mechanical'
      };
    }

    // Default nominal driving tip
    return {
      status: 'nominal',
      title: 'Optimal Cruise Active',
      message: 'Nominal throttle control. Steady speeds and low RPM are maximizing your mpg scores today.',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      badge: trained ? `AI: Eco (${accuracy.toFixed(0)}%)` : 'Eco Drive'
    };
  }, [telemetry, isConnected, speedLimit, trained, isErratic, accuracy]);

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
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-800/40 pt-3 sm:flex-row sm:items-center sm:justify-between text-xs opacity-75">
            <div>
              <span className="text-slate-400">Current Trip Score:</span>{' '}
              <span className="font-semibold text-white">{Math.round(telemetry.score)}</span>
            </div>
            <div className="hidden sm:block h-3 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400">Active Model:</span>{' '}
              <span className="font-semibold text-white">
                {trained ? `${type} (${accuracy.toFixed(1)}% acc)` : 'Untrained Baseline (50% acc)'}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
