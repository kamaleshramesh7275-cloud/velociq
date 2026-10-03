import React from 'react';

// Synthesized mechanical click sound via Web Audio API
function playHapticClick(isEngaged) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isEngaged ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isEngaged ? 780 : 540, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Audio Context blocked or not supported
  }
}

export default function AviationToggleBar({
  sportMode,
  setSportMode,
  launchControl,
  setLaunchControl,
  activeAero,
  setActiveAero,
  canFdBurst,
  setCanFdBurst
}) {
  const switches = [
    {
      id: 'sport',
      label: 'SPORT MODE',
      sublabel: 'DYNAMIC MAP',
      active: sportMode,
      toggle: () => {
        const next = !sportMode;
        playHapticClick(next);
        setSportMode(next);
      },
      color: '#E11D48'
    },
    {
      id: 'launch',
      label: 'LAUNCH CTRL',
      sublabel: 'PRE-BOOST',
      active: launchControl,
      toggle: () => {
        const next = !launchControl;
        playHapticClick(next);
        setLaunchControl(next);
      },
      color: '#F59E0B'
    },
    {
      id: 'aero',
      label: 'ACTIVE AERO',
      sublabel: 'WING DEPLOY',
      active: activeAero,
      toggle: () => {
        const next = !activeAero;
        playHapticClick(next);
        setActiveAero(next);
      },
      color: '#0284C7'
    },
    {
      id: 'can',
      label: 'CAN BURST',
      sublabel: '100ms POLL',
      active: canFdBurst,
      toggle: () => {
        const next = !canFdBurst;
        playHapticClick(next);
        setCanFdBurst(next);
      },
      color: '#059669'
    }
  ];

  return (
    <div className="w-full rounded-2xl p-3 sm:p-4 bg-gradient-to-r from-slate-100 via-white to-slate-100 border border-slate-200 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-display text-xs font-black uppercase tracking-[0.2em] text-slate-800">
            AEROSPACE PHYSICAL SWITCHBOARD
          </span>
          <span className="font-mono text-[9.5px] text-slate-500 font-bold hidden sm:inline-block">
            CNC MILLED HAPTIC BUS
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 font-semibold">
          LIVE RELAY FEEDBACK ENABLED
        </span>
      </div>

      {/* 4 Tactile Machined Toggle Switches */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {switches.map((sw) => (
          <div
            key={sw.id}
            onClick={sw.toggle}
            className={`cursor-pointer group select-none p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-between ${
              sw.active
                ? 'bg-white border-blue-300 shadow-md transform -translate-y-0.5'
                : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-xs'
            }`}
          >
            {/* Status LED Beacon */}
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-mono text-[8.5px] uppercase font-bold text-slate-400">
                {sw.sublabel}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    sw.active ? 'shadow-[0_0_8px] animate-pulse' : 'bg-slate-300'
                  }`}
                  style={{
                    backgroundColor: sw.active ? sw.color : '#CBD5E1',
                    color: sw.color
                  }}
                />
                <span className="font-mono text-[8.5px] font-black" style={{ color: sw.active ? sw.color : '#94A3B8' }}>
                  {sw.active ? 'ENGAGED' : 'ARMED'}
                </span>
              </div>
            </div>

            {/* Realistic Machined Aluminum Toggle Lever SVG */}
            <div className="my-1 py-1">
              <svg width="42" height="46" viewBox="0 0 42 46" className="drop-shadow-sm">
                <defs>
                  {/* Metal Lever Gradient */}
                  <linearGradient id={`leverGrad-${sw.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="#CBD5E1" />
                    <stop offset="70%" stopColor="#64748B" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  {/* Base Ring Gradient */}
                  <radialGradient id={`baseGrad-${sw.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="70%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#64748B" />
                  </radialGradient>
                </defs>

                {/* Recessed Switch Plate Collar */}
                <circle cx="21" cy="23" r="18" fill={`url(#baseGrad-${sw.id})`} stroke="#94A3B8" strokeWidth="1" />
                <circle cx="21" cy="23" r="14" fill="#0F172A" />

                {/* Knurled Hex Nut */}
                <polygon
                  points="21,11 29,15 29,25 21,29 13,25 13,15"
                  fill="#CBD5E1"
                  stroke="#475569"
                  strokeWidth="0.75"
                />

                {/* Physical Lever: Flips UP when active, DOWN when inactive */}
                <g className="transition-transform duration-200 ease-out origin-[21px_23px]">
                  {sw.active ? (
                    // Toggle UP (Active)
                    <g>
                      <path
                        d="M 19 23 L 18 8 C 18 5 24 5 24 8 L 23 23 Z"
                        fill={`url(#leverGrad-${sw.id})`}
                        stroke="#475569"
                        strokeWidth="0.8"
                      />
                      <circle cx="21" cy="7" r="5" fill={sw.color} stroke="#FFFFFF" strokeWidth="1" />
                    </g>
                  ) : (
                    // Toggle DOWN (Inactive)
                    <g>
                      <path
                        d="M 19 23 L 18 36 C 18 39 24 39 24 36 L 23 23 Z"
                        fill={`url(#leverGrad-${sw.id})`}
                        stroke="#475569"
                        strokeWidth="0.8"
                      />
                      <circle cx="21" cy="37" r="4.5" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
                    </g>
                  )}
                </g>
              </svg>
            </div>

            {/* Switch Label */}
            <span className="font-display text-xs font-black text-slate-800 tracking-wider mt-1 text-center">
              {sw.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
