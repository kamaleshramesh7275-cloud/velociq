import React, { useState, useContext } from 'react';
import { SimulationContext } from '../context/SimulationContext';
import DigitalCityWorld from '../components/DigitalCityWorld';
import TelemetryPage from './TelemetryPage';
import { SectionLabel, PlateBadge } from '../components/ui';
import { useFleet } from '../context/FleetContext';
import { useTheme } from '../context/ThemeContext';

export default function DualCockpitPage() {
  const sim = useContext(SimulationContext);
  const { activeVehicle } = useFleet();
  const { theme } = useTheme();

  // Layout split mode: '50-50' | '65-35' | '35-65'
  const [splitMode, setSplitMode] = useState('50-50');

  const splitClasses = {
    '50-50': {
      world: 'w-full lg:w-1/2 h-[480px] lg:h-full',
      dashboard: 'w-full lg:w-1/2 h-auto lg:h-full',
    },
    '65-35': {
      world: 'w-full lg:w-[65%] h-[520px] lg:h-full',
      dashboard: 'w-full lg:w-[35%] h-auto lg:h-full',
    },
    '35-65': {
      world: 'w-full lg:w-[35%] h-[420px] lg:h-full',
      dashboard: 'w-full lg:w-[65%] h-auto lg:h-full',
    },
  }[splitMode] || {
    world: 'w-full lg:w-1/2 h-[480px] lg:h-full',
    dashboard: 'w-full lg:w-1/2 h-auto lg:h-full',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0A0E17]">
      {/* ── Top Dual Cockpit Toolbar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-[#0F1420] border-b border-[#1E293B] shrink-0 z-10 text-white overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-heading font-black text-xs sm:text-sm tracking-wide text-cyan-400 uppercase">
              DUAL COCKPIT
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              3D + APP
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-700/80 pl-2.5">
            <span className="text-[10px] font-mono text-slate-400 font-semibold">ASSET:</span>
            <span className="text-xs font-bold text-slate-200">{activeVehicle?.name || 'Alpha Cruiser'}</span>
            <PlateBadge plate={activeVehicle?.licensePlate || 'NY-482-XA'} size="sm" />
          </div>
        </div>

        {/* Center / Driving Guidance */}
        <div className="hidden 2xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-800 shrink-0">
          <span className="text-cyan-400 font-bold">W/S/A/D</span> Drive
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-bold">SPACE</span> Handbrake
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-bold">P/R/N/D/S</span> Gears
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">Live 60Hz Dials</span>
        </div>

        {/* Right Split Ratio Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase hidden md:inline">RATIO:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setSplitMode('50-50')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                splitMode === '50-50'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              50 : 50
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('65-35')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                splitMode === '65-35'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Cinematic 3D World (65% World / 35% Dashboard)"
            >
              65 : 35
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('35-65')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                splitMode === '35-65'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Telemetry Heavy (35% World / 65% Dashboard)"
            >
              35 : 65
            </button>
          </div>
        </div>
      </div>

      {/* ── Split Dual Viewports ─────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 w-full h-full min-h-0 overflow-hidden">
        {/* Left: 3D Twin City World */}
        <div className={`relative ${splitClasses.world} border-b lg:border-b-0 lg:border-r border-[#1E293B] overflow-hidden transition-all duration-200`}>
          <DigitalCityWorld />
        </div>

        {/* Right: Live Telemetry App Dashboard */}
        <div className={`${splitClasses.dashboard} overflow-y-auto overflow-x-hidden bg-[#F4F6F9] transition-all duration-200`}>
          <TelemetryPage 
            telemetry={sim.telemetry} 
            isConnected={sim.isConnected} 
            speedLimit={sim.speedLimit} 
            activeDTCs={sim.activeDTCs} 
            spiffsCount={sim.spiffsCount}
            handleClearDTCs={sim.handleClearDTCs} 
            handleTriggerDTC={sim.handleTriggerDTC} 
            weather={sim.weather}
            fuelPrice={sim.fuelPrice}
            aiThoughtLogs={sim.aiThoughtLogs}
            isDualCockpit={true}
          />
        </div>
      </div>
    </div>
  );
}
