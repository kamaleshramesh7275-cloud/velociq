import React from 'react';

const statusConfig = {
  oil: { name: 'Engine Oil Life', desc: 'Degrades with engine workload and distance.' },
  brakes: { name: 'Brake Pad Integrity', desc: 'Decreased by distance and hard braking events.' },
  battery: { name: 'Battery Health Index', desc: 'Evaluates chemical storage stability.' },
  coolant: { name: 'Coolant Fluid Quality', desc: 'Impacted by peak temperature workloads.' }
};

export default function MaintenanceTracker({ partsWear, predictedFailureDays, onServicePart, maintenanceModel, aiMechanicEnabled, setAiMechanicEnabled }) {
  const { trained, accuracy, type } = maintenanceModel || { trained: false, accuracy: 50, type: 'None' };

  const getStatusColor = (val) => {
    if (val >= 70) return 'from-emerald-400 to-teal-500 text-emerald-300 border-emerald-500/20';
    if (val >= 20) return 'from-amber-400 to-orange-500 text-amber-300 border-amber-500/20';
    return 'from-rose-500 to-red-600 text-rose-300 border-rose-500/20 animate-pulse';
  };

  const getStatusText = (val) => {
    if (val >= 70) return 'Good';
    if (val >= 20) return 'Service Soon';
    return 'CRITICAL - REPLACE';
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Diagnostics</p>
          <h2 className="text-xl font-semibold text-white">Parts Wear & Lifecycles</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-full border ${
            trained 
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' 
              : 'border-slate-800 bg-slate-950 text-slate-500'
          }`}>
            {trained ? `AI Forecast: Active (${accuracy.toFixed(0)}%)` : 'AI: Untrained (50%)'}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${aiMechanicEnabled ? 'text-cyan-400' : 'text-slate-500'}`}>
              Mechanic AI
            </span>
            <button
              type="button"
              onClick={() => setAiMechanicEnabled(!aiMechanicEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 outline-none ${
                aiMechanicEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-slate-950 transition-transform duration-300 ${
                  aiMechanicEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(partsWear).map(([key, value]) => {
          const config = statusConfig[key] || { name: key, desc: '' };
          const colorClass = getStatusColor(value);
          const statusText = getStatusText(value);

          return (
            <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-slate-200">{config.name}</h3>
                  <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 rounded-full ${colorClass}`}>
                    {statusText}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-3">{config.desc}</p>
              </div>

              <div>
                <div className="flex items-end justify-between text-xs text-slate-400 mb-1.5">
                  <span>Health: <span className="font-bold text-slate-200">{Math.round(value)}%</span></span>
                  {aiMechanicEnabled && (
                    <span className="text-[10px] font-medium text-cyan-400">
                      Fail in: <span className="font-bold">{predictedFailureDays?.[key] || '?'} Days</span>
                    </span>
                  )}
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onServicePart(key)}
                  className={`w-full rounded-xl py-1.5 text-xs font-semibold transition border ${
                    value < 20 
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Service / Reset Part
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
