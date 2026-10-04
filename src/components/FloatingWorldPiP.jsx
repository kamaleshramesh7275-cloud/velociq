import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SimulationContext } from '../context/SimulationContext';
import DigitalCityWorld from './DigitalCityWorld';
import { setWorldControl } from '../services/worldPhysicsEngine';

export default function FloatingWorldPiP() {
  const navigate = useNavigate();
  const location = useLocation();
  const sim = useContext(SimulationContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Do not render PiP if user is already on /world or /split-view
  if (!sim?.isPiPActive || location.pathname === '/world' || location.pathname === '/split-view') {
    return null;
  }

  const speed = Math.round(sim?.telemetry?.speed || 0);
  const rpm = Math.round(sim?.telemetry?.rpm || 0);
  const gear = sim?.telemetry?.gear || 'D';

  const handleCruise = (e) => {
    e.stopPropagation();
    setWorldControl({ engineOn: true, throttle: 0.35, brake: 0, handbrake: false });
  };

  const handleStop = (e) => {
    e.stopPropagation();
    setWorldControl({ throttle: 0, brake: 1.0 });
  };

  return (
    <div
      className={`fixed bottom-20 right-4 z-40 bg-[#0A0E17]/95 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 ${
        isMinimized
          ? 'w-72 h-14'
          : isExpanded
          ? 'w-[480px] h-[340px]'
          : 'w-[360px] h-[250px]'
      }`}
      style={{
        boxShadow: '0 20px 50px rgba(0,0,0,0.65), 0 0 20px rgba(0, 212, 255, 0.15)',
      }}
    >
      {/* ── PiP Header Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0F1422] border-b border-slate-800 text-white select-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] font-heading font-black tracking-wider text-cyan-400">
            3D TWIN PiP
          </span>
          <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 font-bold">
            {speed} km/h · {gear}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Quick Drive Controls in PiP */}
          {!isMinimized && (
            <div className="flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={handleCruise}
                className="px-1.5 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[9px] font-mono font-bold border border-cyan-600/40 transition"
                title="Cruise 35% throttle"
              >
                ⚡ GAS
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="px-1.5 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[9px] font-mono font-bold border border-rose-600/40 transition"
                title="Emergency stop"
              >
                🛑 STOP
              </button>
            </div>
          )}

          {/* Jump to Split-Screen */}
          <button
            type="button"
            onClick={() => navigate('/split-view')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Open Split View (3D World + Dashboard)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>

          {/* Expand / Shrink */}
          {!isMinimized && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isExpanded ? 'Shrink PiP' : 'Expand PiP'}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10H4m0 0V4m0 6l-7-7m17 7h-6m0 0V4m0 6l7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
          )}

          {/* Minimize / Restore */}
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isMinimized ? 'Restore PiP' : 'Minimize PiP'}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Close PiP */}
          <button
            type="button"
            onClick={() => sim.setIsPiPActive(false)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Close PiP"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 3D Twin Canvas Viewport ───────────────────────────────────── */}
      {!isMinimized && (
        <div className="relative w-full h-[calc(100%-37px)] overflow-hidden bg-black">
          <DigitalCityWorld />
        </div>
      )}
    </div>
  );
}
