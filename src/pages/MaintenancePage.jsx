import React from 'react';
import MaintenanceTracker from '../components/MaintenanceTracker';
import CostComparison from '../components/CostComparison';

export default function MaintenancePage({ telemetry, handleServicePart, modelState, aiMechanicEnabled, setAiMechanicEnabled }) {
  return (
    <div className="p-8 text-slate-100 flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-white">Maintenance Hub</h1>
          <p className="mt-2 text-slate-400">Track vehicle wear and tear and service parts.</p>
        </header>

        <div className="grid gap-6">
          <MaintenanceTracker 
            partsWear={telemetry.partsWear} 
            predictedFailureDays={telemetry.predictedFailureDays}
            onServicePart={handleServicePart} 
            maintenanceModel={modelState.maintenance} 
            aiMechanicEnabled={aiMechanicEnabled}
            setAiMechanicEnabled={setAiMechanicEnabled}
          />
          <CostComparison />
        </div>
      </div>
    </div>
  );
}
