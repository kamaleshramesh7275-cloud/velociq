import React from 'react';
import RouteTracker from '../components/RouteTracker';
import WeatherWidget from '../components/WeatherWidget';
import TripLogger from '../components/TripLogger';
import RangeVelocityGovernor from '../components/RangeVelocityGovernor';
import GlosaAdvisor from '../components/GlosaAdvisor';
import { useFleet } from '../context/FleetContext';
import { SectionLabel, Card, Toggle } from '../components/ui';
import { PulseDot } from '../components/icons';

export default function NavigationPage({ 
  telemetry, 
  weather, 
  tripHistory, 
  handleEndTrip, 
  handleClearHistory, 
  aiNavigatorEnabled, 
  setAiNavigatorEnabled, 
  aiThoughtLogs,
  isLimpModeActive = false,
  onToggleLimpMode,
  trafficSignal,
  kineticWaste,
  onSimulateStop
}) {
  const { activeVehicle } = useFleet();
  const vehicleProfile = activeVehicle?.profile || 'sedan';
  const remainingDistance = Math.max(0, 25 - (telemetry?.tripMileage || 0));

  return (
    <div className="p-6 md:p-8 text-text-hi flex-1 overflow-auto bg-[#F4F6F9]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Page Header with 3px Racing Stripe */}
        <header className="relative bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <SectionLabel label="EXPRESSWAY & TRAFFIC DISPATCH" />
              <h1 className="text-2xl md:text-3xl font-heading font-black text-[#0A0F1D] tracking-tight mt-1">
                GPS Navigation & GLOSA Range Governor
              </h1>
              <p className="mt-1 text-xs text-slate-700 font-medium">
                Autonomous green-wave synchronization, Esri World Light Gray expressway telematics, and velocity-dependent limp-home governor.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* AI Dispatch Mode Toggle */}
              <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-line shadow-xs">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-700 font-bold block">AI NAVIGATOR</span>
                  <span className={`text-xs font-mono font-bold ${aiNavigatorEnabled ? 'text-[#0B3D91]' : 'text-slate-700'}`}>
                    {aiNavigatorEnabled ? 'AUTONOMOUS' : 'MANUAL'}
                  </span>
                </div>
                <Toggle checked={aiNavigatorEnabled} onChange={() => setAiNavigatorEnabled(!aiNavigatorEnabled)} />
              </div>
            </div>
          </div>
        </header>

        {/* 12-Column Grid Layout: Map (Cols 1-8) & Guidance (Cols 9-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cols 1-8: Tall Map Tracker */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <RouteTracker 
              route={telemetry?.route} 
              speed={telemetry?.speed} 
              aiNavigatorEnabled={aiNavigatorEnabled} 
              weather={weather} 
            />

            {/* AI Navigator Reasoning Drawer if active */}
            {aiNavigatorEnabled && (
              <div className="rounded-2xl border border-line bg-white p-4 shadow-sm relative overflow-hidden">
                <div className="racing-stripe" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0B3D91] animate-pulse" />
                    <span className="text-xs font-heading font-bold uppercase text-[#0B3D91] tracking-wider">
                      AUTONOMOUS DISPATCH REASONING LOG
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-lo">GLOSA SYNC ONLINE</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-2 font-mono text-xs">
                  {aiThoughtLogs?.slice(-4).map((log, idx) => (
                    <div key={idx} className="flex gap-2.5 text-text-mid">
                      <span className="text-[#0B3D91] font-semibold tabular-nums shrink-0">[{log.time}]</span>
                      <span className="text-text-hi">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cols 9-12: GLOSA Advisor + Range Velocity Governor */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <GlosaAdvisor 
              speed={telemetry?.speed ?? 55}
              trafficSignal={trafficSignal}
              kineticWaste={kineticWaste}
              onSimulateStop={onSimulateStop}
            />

            <RangeVelocityGovernor 
              fuelPercent={telemetry?.fuel ?? 40}
              currentSpeed={telemetry?.speed ?? 55}
              vehicleProfile={vehicleProfile}
              remainingDistance={remainingDistance}
              isLimpModeActive={isLimpModeActive}
              onToggleLimpMode={onToggleLimpMode}
            />
          </div>

        </div>

        {/* Lower Row: Weather Widget and Trip Logger Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <WeatherWidget weather={weather} />
          </div>

          <div className="lg:col-span-8">
            <TripLogger 
              tripHistory={tripHistory} 
              onEndTrip={handleEndTrip} 
              onClearHistory={handleClearHistory} 
              activeStats={{
                duration: telemetry?.activeDuration || 0,
                distance: telemetry?.tripMileage || 0,
                avgSpeed: (telemetry?.activeDuration || 0) > 0 ? ((telemetry?.tripMileage || 0) / ((telemetry?.activeDuration || 1) / 3600)) : 0,
                fuelUsed: telemetry?.activeFuelUsed || 0,
                co2: telemetry?.co2 || 0,
                score: telemetry?.score ?? 100
              }} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
