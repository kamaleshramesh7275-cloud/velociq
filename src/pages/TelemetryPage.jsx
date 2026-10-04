import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TelemetryPanel from '../components/TelemetryPanel';
import FuelMileageCard from '../components/FuelMileageCard';
import AeroSweetSpotRadar from '../components/AeroSweetSpotRadar';
import ECUDiagnostics from '../components/ECUDiagnostics';
import AITerminalFeed from '../components/AITerminalFeed';
import ChassisHeatmapDeck from '../components/ChassisHeatmapDeck';
import { useFleet } from '../context/FleetContext';
import { SectionLabel } from '../components/ui';
import { PlateBadge } from '../components/ui/PlateBadge';

export default function TelemetryPage({
  telemetry,
  isConnected,
  speedLimit = 90,
  activeDTCs = [],
  handleClearDTCs,
  handleTriggerDTC,
  weather,
  fuelPrice = 95,
  aiThoughtLogs = [],
  isDualCockpit = false,
}) {
  const { activeVehicle } = useFleet();
  const navigate = useNavigate();
  const vehicleProfile = activeVehicle?.profile || 'sedan';

  const [canFdBurst, setCanFdBurst] = useState(true);

  return (
    <div className={`${isDualCockpit ? 'p-2.5 sm:p-4' : 'p-3 sm:p-5 md:p-8'} flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#F4F6F9] via-[#EDF2F7] to-[#F1F5F9] text-[#0F172A] w-full`}>
      <div className={`mx-auto max-w-7xl flex flex-col ${isDualCockpit ? 'gap-3 sm:gap-4' : 'gap-4 sm:gap-6'}`}>
        {/* Page Header: Minimal strip in Dual Cockpit mode, Full Hero card in standard mode */}
        {isDualCockpit ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="font-bold text-slate-800 uppercase tracking-wide">LIVE FLIGHT BINNACLE · 60Hz</span>
              <span className="text-slate-300 font-bold hidden sm:inline">|</span>
              <span className="text-slate-600 font-semibold hidden sm:inline">{activeVehicle?.name || 'Alpha Cruiser'}</span>
              <PlateBadge plate={activeVehicle?.licensePlate || 'NY-482-XA'} region="USA" size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                CAN-FD 100ms
              </span>
            </div>
          </div>
        ) : (
          <header className="relative aerogel-card rounded-2xl p-4 sm:p-6 shadow-md overflow-hidden border border-slate-200/90">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0284C7] to-[#059669]" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="font-mono text-[10.5px] uppercase font-bold text-slate-500 tracking-widest">
                    FLIGHT DECK & TELEMETRY HUB
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {canFdBurst ? 'CAN-FD BURST 100ms' : 'LIVE STREAM ACTIVE'}
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                  Luminous Cockpit & Aero Dynamic Vector Engine
                </h1>
                <p className="mt-1 font-mono text-xs text-slate-600 leading-relaxed max-w-2xl">
                  Real-time 300ms CAN-bus streaming, 270° titanium-chronometer flight binnacle, and 3D isometric chassis tire pressure deck.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-xs font-mono text-slate-500 font-bold">ACTIVE ASSET:</span>
                <span className="font-heading font-black text-[#0F172A] text-sm">{activeVehicle?.name || 'Alpha Cruiser'}</span>
                <PlateBadge plate={activeVehicle?.licensePlate || 'NY-482-XA'} region="USA" size="sm" />
                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#0B3D91] font-mono text-[11px] font-bold">
                  {activeVehicle?.engineTypeId === 'bev_pmsm' ? 'PMSM BEV' : '2.0L I-4 Turbo'}
                </span>

                {/* Quick Split View Button */}
                <button
                  type="button"
                  onClick={() => navigate('/split-view')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-sm transition ml-auto sm:ml-0"
                  title="View 3D World and Dashboard side-by-side"
                >
                  <svg className="w-3.5 h-3.5 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span>SPLIT 3D WORLD</span>
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Row 1: Cockpit Panel (cols 1-8) & Fuel Mileage Card (cols 9-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <TelemetryPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} />
          </div>
          <div className="lg:col-span-4 flex flex-col justify-between">
            <FuelMileageCard telemetry={telemetry} />
          </div>
        </div>

        {/* Row 2: 3D Isometric Chassis & Dynamic Tire Deck */}
        <ChassisHeatmapDeck
          telemetry={telemetry}
        />

        {/* Row 3: Signature AeroSweetSpotRadar with Virtual Wind Tunnel */}
        <AeroSweetSpotRadar
          currentSpeed={telemetry.speed}
          vehicleProfile={vehicleProfile}
          weather={weather}
          fuelPrice={fuelPrice}
        />

        {/* Row 4: Diagnostics with Real-Time CAN Waveform Oscilloscope & AI Terminal Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <ECUDiagnostics
            activeDTCs={activeDTCs}
            onClearDTCs={handleClearDTCs}
            onTriggerDTC={handleTriggerDTC}
          />
          <AITerminalFeed aiThoughtLogs={aiThoughtLogs} />
        </div>
      </div>
    </div>
  );
}
