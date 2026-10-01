import React from 'react';
import TelemetryPanel from '../components/TelemetryPanel';
import FuelMileageCard from '../components/FuelMileageCard';
import AeroSweetSpotRadar from '../components/AeroSweetSpotRadar';
import ECUDiagnostics from '../components/ECUDiagnostics';
import AITerminalFeed from '../components/AITerminalFeed';
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
}) {
  const { activeVehicle } = useFleet();
  const vehicleProfile = activeVehicle?.profile || 'sedan';

  return (
    <div className="p-6 md:p-8 flex-1 overflow-auto bg-[#F4F6F9] text-[#0F172A]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        {/* Page Header with 3px Racing Stripe */}
        <header className="relative bg-white border border-[#DDE2EA] rounded-xl p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <SectionLabel label="REAL-TIME TELEMETRY & FLIGHT DECK" />
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight mt-1">
                Cockpit Instruments & Sweet-Spot Radar
              </h1>
              <p className="mt-1 font-mono text-xs text-[#475569]">
                Continuous 300ms CAN-bus streaming, 270° dual analog dial binnacle, and cubic aerodynamic drag mapping.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-700 font-bold">ASSET:</span>
              <span className="font-heading font-bold text-[#0F172A] text-sm">{activeVehicle?.name}</span>
              <PlateBadge plate={activeVehicle?.licensePlate || 'DL-01-AB-1234'} region="IND" size="md" />
            </div>
          </div>
        </header>


        {/* Row 1: Cockpit Panel (cols 1-8) & Fuel Mileage Card (cols 9-12) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8">
            <TelemetryPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} />
          </div>
          <div className="lg:col-span-4">
            <FuelMileageCard telemetry={telemetry} />
          </div>
        </div>

        {/* Row 2: Signature AeroSweetSpotRadar (12 cols) */}
        <AeroSweetSpotRadar
          currentSpeed={telemetry.speed}
          vehicleProfile={vehicleProfile}
          weather={weather}
          fuelPrice={fuelPrice}
        />

        {/* Row 3: Diagnostics & AI Terminal Feed (2 columns) */}
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
