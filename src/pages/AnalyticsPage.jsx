import React from 'react';
import AIModelTuner from '../components/AIModelTuner';
import AICoachingPanel from '../components/AICoachingPanel';
import CostSavingsCalculator from '../components/CostSavingsCalculator';
import DriverScore from '../components/DriverScore';

export default function AnalyticsPage({ 
  modelState, handleTrainingComplete, aiAgentOptimized, setAiAgentOptimized, 
  telemetry, isConnected, speedLimit, fuelPrice, setFuelPrice, activeDriver 
}) {
  return (
    <div className="p-8 text-slate-100 flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-white">AI Tuning & Analytics</h1>
          <p className="mt-2 text-slate-400">Train neural networks, monitor driver coaching, and calculate savings.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <DriverScore telemetry={telemetry} driver={activeDriver} />
            <AICoachingPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} driverModel={modelState.driver} />
          </div>
          <div className="flex flex-col gap-6">
            <AIModelTuner 
              modelState={modelState} 
              onTrainingComplete={handleTrainingComplete} 
              aiAgentOptimized={aiAgentOptimized} 
              onToggleAIAgent={() => setAiAgentOptimized(!aiAgentOptimized)} 
            />
            <CostSavingsCalculator fuelUsed={telemetry.activeFuelUsed} fuelPrice={fuelPrice} setFuelPrice={setFuelPrice} aiAgentOptimized={aiAgentOptimized} />
          </div>
        </div>
      </div>
    </div>
  );
}
