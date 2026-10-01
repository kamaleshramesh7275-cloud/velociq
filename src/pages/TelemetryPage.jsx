import React from 'react';
import TelemetryPanel from '../components/TelemetryPanel';
import AlertsFeed from '../components/AlertsFeed';
import ECUDiagnostics from '../components/ECUDiagnostics';
import StatusBar from '../components/StatusBar';
import FuelMileageCard from '../components/FuelMileageCard';
import AeroSweetSpotRadar from '../components/AeroSweetSpotRadar';
import { useFleet } from '../context/FleetContext';

export default function TelemetryPage({ 
  telemetry, 
  isConnected, 
  speedLimit, 
  activeDTCs, 
  spiffsCount, 
  handleClearDTCs, 
  handleTriggerDTC,
  weather,
  fuelPrice = 95
}) {
  const { activeVehicle } = useFleet();
  const vehicleProfile = activeVehicle?.profile || 'sedan';

  return (
    <div className="p-8 text-slate-100 flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Live Telemetry & Aerodynamics</h1>
          <p className="mt-2 text-slate-400">Real-time diagnostics, speed-to-mileage parabolic radar, and ECU telemetry.</p>
        </header>

        <StatusBar isConnected={isConnected} activeDTCs={activeDTCs} spiffsCount={spiffsCount} />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-6">
            <TelemetryPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} />
            <AeroSweetSpotRadar 
              currentSpeed={telemetry.speed} 
              vehicleProfile={vehicleProfile} 
              weather={weather} 
              fuelPrice={fuelPrice} 
            />
            <FuelMileageCard telemetry={telemetry} />
            <ECUDiagnostics activeDTCs={activeDTCs} onClearDTCs={handleClearDTCs} onTriggerDTC={handleTriggerDTC} />
          </div>
          <div className="flex flex-col gap-6">
            <AlertsFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
