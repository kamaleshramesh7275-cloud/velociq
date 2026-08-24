import React from 'react';
import { SimulationContext } from '../context/SimulationContext';

export default function SecurityPage() {
  const { securityState, setSecurityState, isConnected } = React.useContext(SimulationContext);
  const { threatLevel, anomalies, isGeofenceBreached, isImmobilized } = securityState;

  const handleKillSwitch = () => {
    setSecurityState(s => ({ ...s, isImmobilized: !s.isImmobilized, threatLevel: s.isImmobilized ? 'Secure' : 'CRITICAL' }));
  };

  return (
    <div className="p-8 text-slate-100 flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Security & Anomaly Detection</h1>
            <p className="mt-2 text-slate-400">Live threat monitoring, geofence status, and remote immobilization.</p>
          </div>
          <div className={`px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest ${
            threatLevel === 'Secure' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            threatLevel === 'Alert' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
          }`}>
            Status: {threatLevel}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Geofence Status */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Geofence Monitor</h2>
            
            <div className={`h-32 w-32 rounded-full border-[6px] flex items-center justify-center mb-6 transition-colors duration-500 ${
              isGeofenceBreached ? 'border-rose-500/50 bg-rose-500/10' : 'border-emerald-500/50 bg-emerald-500/10'
            }`}>
              <svg className={`h-12 w-12 ${isGeofenceBreached ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isGeofenceBreached ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              {isGeofenceBreached ? 'Geofence Breached' : 'Inside Authorized Zone'}
            </h3>
            <p className="text-slate-400 text-sm">
              {isGeofenceBreached 
                ? 'Vehicle has exited the Central Delhi operating zone. Please contact driver immediately.' 
                : 'Vehicle is currently operating within the designated Central Delhi geofence boundary.'}
            </p>
          </div>

          {/* Kill Switch */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl flex flex-col items-center text-center justify-center">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Remote Immobilizer</h2>
            
            <button
              onClick={handleKillSwitch}
              disabled={!isConnected && !isImmobilized}
              className={`group relative h-40 w-40 rounded-full border-8 transition-all duration-300 ${
                isImmobilized 
                  ? 'border-rose-900 bg-rose-600 shadow-[0_0_60px_rgba(225,29,72,0.6)] hover:bg-rose-500' 
                  : 'border-slate-800 bg-slate-900 hover:border-rose-900 hover:bg-rose-950 hover:shadow-[0_0_30px_rgba(225,29,72,0.2)]'
              } ${!isConnected && !isImmobilized ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`absolute inset-0 flex flex-col items-center justify-center font-bold uppercase tracking-widest transition-colors ${
                isImmobilized ? 'text-white' : 'text-rose-500 group-hover:text-rose-400'
              }`}>
                {isImmobilized ? 'Reactivate' : 'Kill Engine'}
              </span>
            </button>
            
            <p className="mt-8 text-sm text-slate-400 max-w-sm">
              {isImmobilized 
                ? 'Engine has been remotely immobilized. Simulation frozen.' 
                : 'Warning: This will instantly cut fuel delivery to the engine. Only use in case of verified theft.'}
            </p>
          </div>
        </div>

        {/* Anomaly Log */}
        <div className="mt-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">System Anomalies & Alerts</h2>
          
          {anomalies.length === 0 ? (
            <div className="text-center text-slate-500 py-12">No anomalies detected in the current session.</div>
          ) : (
            <div className="space-y-4">
              {anomalies.map(anomaly => (
                <div key={anomaly.id} className="flex gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
                  <div className="mt-1 flex-shrink-0">
                    <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-bold">{anomaly.type} <span className="text-xs text-slate-400 ml-2 font-normal">{anomaly.time}</span></h4>
                    <p className="text-slate-300 text-sm mt-1">{anomaly.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
