import React, { useState } from 'react';
import AIModelTuner from '../components/AIModelTuner';
import AICoachingPanel from '../components/AICoachingPanel';
import CostSavingsCalculator from '../components/CostSavingsCalculator';
import DriverScore from '../components/DriverScore';
import CustomReportBuilder from '../components/reporting/CustomReportBuilder';
import { useFleet } from '../context/FleetContext';
import { Card, SectionLabel } from '../components/ui';

export default function AnalyticsPage({ 
  modelState, handleTrainingComplete, aiAgentOptimized, setAiAgentOptimized, 
  telemetry, isConnected, speedLimit, fuelPrice, setFuelPrice, activeDriver 
}) {
  const { activeVehicle } = useFleet();
  const vehicleProfile = activeVehicle?.profile || 'sedan';
  const [activeTab, setActiveTab] = useState('optimization'); // 'optimization' | 'reports'

  return (
    <div className="p-6 md:p-8 text-text-hi flex-1 overflow-auto bg-[#F4F6F9]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <SectionLabel label="INTELLIGENCE / AI ANALYTICS & REPORTING" />
            <h1 className="text-2xl md:text-3xl font-bold text-text-hi font-heading tracking-tight mt-1">
              AI Analytics & Fleet Intelligence
            </h1>
            <p className="mt-1 text-xs text-text-mid">
              Neural network training, speed-tier economics, RFC 4180 reporting, and fleet-wide exports.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('optimization')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'optimization'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🧠 AI Optimization Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>📊 Custom Reports & Exports</span>
            </button>
          </div>
        </header>

        {activeTab === 'reports' ? (
          <CustomReportBuilder />
        ) : (
          <>

        {/* HERO KPI ROW: Fleet avg km/L, Safety trend, CO2 reduction, Cost saved */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-text-lo">FLEET AVG MILEAGE</span>
            <div className="text-2xl font-bold font-mono text-[#0B3D91] tabular-nums mt-1">
              18.4 <span className="text-xs font-normal text-text-lo">km/L</span>
            </div>
            <p className="text-[10px] font-mono text-[#0F9D6B] font-semibold mt-0.5">+14.2% vs Baseline</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-text-lo">SAFETY TREND</span>
            <div className="text-2xl font-bold font-mono text-[#0F9D6B] tabular-nums mt-1">
              96.8 <span className="text-xs font-normal text-text-lo">/ 100</span>
            </div>
            <p className="text-[10px] font-mono text-text-lo mt-0.5">Top 5% Commercial Tier</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-text-lo">CO2 REDUCTION</span>
            <div className="text-2xl font-bold font-mono text-[#0F9D6B] tabular-nums mt-1">
              -38.6 <span className="text-xs font-normal text-text-lo">kg/mo</span>
            </div>
            <p className="text-[10px] font-mono text-text-lo mt-0.5">Aero Sweet-Spot Pacing</p>
          </div>

          <div className="bg-white rounded-2xl border border-line p-4 shadow-sm relative overflow-hidden">
            <div className="racing-stripe" />
            <span className="text-[10px] font-mono uppercase text-text-lo">TOTAL COST SAVED</span>
            <div className="text-2xl font-bold font-mono text-[#0B3D91] tabular-nums mt-1">
              $1,420 <span className="text-xs font-normal text-text-lo">USD</span>
            </div>
            <p className="text-[10px] font-mono text-[#0F9D6B] font-semibold mt-0.5">Optimized VoT Dispatch</p>
          </div>
        </div>

        {/* 2-Column Split: AI Model Tuner (Left) & Cost Savings Calculator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIModelTuner 
            modelState={modelState} 
            onTrainingComplete={handleTrainingComplete} 
            aiAgentOptimized={aiAgentOptimized} 
            onToggleAIAgent={() => setAiAgentOptimized(!aiAgentOptimized)} 
          />

          <CostSavingsCalculator 
            fuelUsed={telemetry.activeFuelUsed} 
            fuelPrice={fuelPrice} 
            setFuelPrice={setFuelPrice} 
            currentSpeed={telemetry.speed}
            vehicleProfile={vehicleProfile}
            activeDistance={25}
          />
        </div>

        {/* Lower Row: Driver Score & AI Coaching */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DriverScore telemetry={telemetry} driver={activeDriver} />
          <AICoachingPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} driverModel={modelState.driver} />
        </div>
        </>
        )}

      </div>
    </div>
  );
}
