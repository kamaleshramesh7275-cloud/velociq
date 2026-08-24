import React from 'react';
import TelemetryPanel from '../components/TelemetryPanel';
import AlertsFeed from '../components/AlertsFeed';
import ECUDiagnostics from '../components/ECUDiagnostics';
import StatusBar from '../components/StatusBar';

export default function TelemetryPage({ telemetry, isConnected, speedLimit, activeDTCs, spiffsCount, handleClearDTCs, handleTriggerDTC }) {
  return (
    <div className="p-8 text-slate-100 flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Live Telemetry</h1>
          <p className="mt-2 text-slate-400">Real-time diagnostics and sensor data from the vehicle.</p>
        </header>

        <StatusBar isConnected={isConnected} activeDTCs={activeDTCs} spiffsCount={spiffsCount} />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-6">
            <TelemetryPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} />
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
