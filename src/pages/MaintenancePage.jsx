import React from 'react';
import MaintenanceTracker from '../components/MaintenanceTracker';
import CostComparison from '../components/CostComparison';
import { SectionLabel } from '../components/ui';

export default function MaintenancePage({ telemetry, handleServicePart, modelState, aiMechanicEnabled, setAiMechanicEnabled }) {
  return (
    <div className="p-6 md:p-8 flex-1 overflow-auto bg-[#F4F6F9] text-[#0F172A]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Header with 3px Racing Stripe */}
        <header className="relative bg-white border border-[#DDE2EA] rounded-xl p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <SectionLabel label="PREDICTIVE FLEET MECHANIC & PROGNOSTICS" />
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0F172A] tracking-tight mt-1">
                Subsystem Health & Degradation Prognostics
              </h1>
              <p className="mt-1 text-xs text-[#475569]">
                Four-point physical wear simulation, predictive failure horizons, and closed-loop maintenance resets.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-blue-50 text-[#0B3D91] border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-[#0B3D91] animate-pulse" />
                Fleet Mechanic AI Ready
              </span>
            </div>
          </div>
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

