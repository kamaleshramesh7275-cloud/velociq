import React, { useState, useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { SimulationContext } from '../context/SimulationContext';
import { Card, SectionLabel, SeverityBadge } from '../components/ui';
import { 
  PulseDot, 
  DigitalTwinIcon, 
  BrainIcon, 
  CarIcon, 
  HeartPulseIcon, 
  SparklesIcon, 
  LoopIcon,
  ChevronDownIcon
} from '../components/icons';

import LivingVehicleTwinCard from '../components/digitaltwin/LivingVehicleTwinCard';
import PredictiveHealthEngineCard from '../components/digitaltwin/PredictiveHealthEngineCard';
import AIDriverTwinCard from '../components/digitaltwin/AIDriverTwinCard';
import AIDrivingOptimizerCard from '../components/digitaltwin/AIDrivingOptimizerCard';
import ClosedLoopFeedbackEngine from '../components/digitaltwin/ClosedLoopFeedbackEngine';

import {
  VEHICLE_BASELINES,
  DRIVER_BEHAVIORAL_PROFILES,
  computePredictiveHealthMetrics,
  computeAiDrivingOptimizer,
  INITIAL_LEARNING_EPOCHS,
  CLOSED_LOOP_STAGES
} from '../utils/digitalTwinEngine';

export default function LivingDigitalTwinPage() {
  const { vehicles, drivers, activeVehicleId, monitorVehicle, activeVehicle, activeDriver } = useFleet();
  const { telemetry } = React.useContext(SimulationContext) || {};

  // Active Selected Vehicle and Driver
  const [selectedVehicleId, setSelectedVehicleId] = useState(activeVehicleId || 'v1');
  const [selectedDriverId, setSelectedDriverId] = useState(activeDriver?.id || 'd1');

  // Navigation View Tab: 'all', 'vehicle', 'health', 'driver', 'optimizer', 'loop'
  const [activeTab, setActiveTab] = useState('all');

  // What-If Tuning state
  const [whatIfSliders, setWhatIfSliders] = useState({
    throttleSmoothing: 0,
    coastingBonus: 0,
    corneringSmoothing: 0
  });

  // Closed Loop Self-Learning State
  const [activeLoopStage, setActiveLoopStage] = useState(1);
  const [isCycling, setIsCycling] = useState(false);
  const [learningEpochs, setLearningEpochs] = useState(INITIAL_LEARNING_EPOCHS);
  const [notification, setNotification] = useState(null);

  // Sync with FleetContext changes
  useEffect(() => {
    if (activeVehicleId) setSelectedVehicleId(activeVehicleId);
  }, [activeVehicleId]);

  useEffect(() => {
    if (activeDriver?.id) setSelectedDriverId(activeDriver.id);
  }, [activeDriver]);

  const fleetVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Compute live multi-variate states
  const predictiveMetrics = computePredictiveHealthMetrics(telemetry, selectedVehicleId);
  const optimizerData = computeAiDrivingOptimizer({
    vehicleId: selectedVehicleId,
    driverId: selectedDriverId,
    liveTelemetry: telemetry,
    whatIfSliders
  });

  // Handle vehicle change
  const handleVehicleChange = (id) => {
    setSelectedVehicleId(id);
    monitorVehicle(id);
  };

  // Handle "Apply Recommendation to Twin"
  const handleApplyRecommendation = () => {
    setWhatIfSliders({
      throttleSmoothing: 0.8,
      coastingBonus: 0.6,
      corneringSmoothing: 0.5
    });

    setNotification({
      title: 'Recommendation Applied to Digital Twin',
      message: 'Throttle ramp smoothed by 80%. Dynamic baseline adjusted and component stress reduced.',
      type: 'success'
    });

    setTimeout(() => setNotification(null), 5000);
  };

  // Run the 6-stage self-learning closed loop cycle
  const handleRunLearningCycle = () => {
    if (isCycling) return;
    setIsCycling(true);

    let stage = 1;
    setActiveLoopStage(stage);

    const interval = setInterval(() => {
      stage += 1;
      if (stage <= 6) {
        setActiveLoopStage(stage);
      } else {
        clearInterval(interval);
        setIsCycling(false);
        setActiveLoopStage(1);

        // Append new epoch
        setLearningEpochs((prev) => [
          {
            epoch: prev.length + 1,
            timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            trigger: 'Autonomous AI Feedback Convergence',
            driverJerk: 1.48,
            vehicleEfficiency: 18.2,
            healthAnomalyScore: 8.5,
            synergyScore: 96,
            action: 'Driver adapted acceleration ramp; fuel flow reduced 15%'
          },
          ...prev
        ]);

        setNotification({
          title: 'Closed-Loop Self-Learning Iteration Complete',
          message: 'Vehicle data changed ➔ AI updated baselines ➔ Driver-Vehicle synergy increased to 96%.',
          type: 'success'
        });

        setTimeout(() => setNotification(null), 6000);
      }
    }, 1200);
  };

  const currentVehicleObj = VEHICLE_BASELINES[selectedVehicleId] || VEHICLE_BASELINES.v1;
  const currentDriverObj = DRIVER_BEHAVIORAL_PROFILES[selectedDriverId] || DRIVER_BEHAVIORAL_PROFILES.d1;

  return (
    <div className="p-6 md:p-8 text-text-hi flex-1 overflow-auto bg-[#F4F6F9]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-3 rounded-xl border border-accent-emerald/40 bg-bg-surface/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
            <PulseDot color="emerald" active={true} />
            <div>
              <span className="font-mono text-xs font-bold text-accent-emerald block">
                {notification.title}
              </span>
              <span className="font-mono text-[11px] text-text-mid">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* Master Header with 3px Racing Stripe */}
        <header className="relative bg-white border border-[#DDE2EA] rounded-xl p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <SectionLabel label="INTELLIGENCE / SELF-LEARNING TWINS" />
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#0B3D91] border border-blue-200">
                  CLOSED-LOOP ACTIVE
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0F172A] tracking-tight mt-1 flex items-center gap-2.5">
                <DigitalTwinIcon className="w-7 h-7 text-[#0B3D91]" />
                Living Digital Twin & AI Driving Optimizer
              </h1>
              <p className="mt-1 text-xs text-[#475569] max-w-3xl">
                Virtual automotive twin continuously learning mechanical baselines and driver behavioral patterns, dynamically synthesized to predict component health and optimize efficiency.
              </p>
            </div>

            {/* Quick Selectors for Active Twin Pairing */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Vehicle Selector */}
              <div className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-2 px-3 shadow-xs">
                <CarIcon className="w-4 h-4 text-[#0B3D91] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase text-slate-700 font-bold">Vehicle Twin</span>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="bg-transparent font-mono text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id} className="bg-white text-[#0F172A]">
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Driver Selector */}
              <div className="flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-2 px-3 shadow-xs">
                <BrainIcon className="w-4 h-4 text-[#0B3D91] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase text-slate-700 font-bold">Driver Twin</span>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="bg-transparent font-mono text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id} className="bg-white text-[#0F172A]">
                        {d.name} ({DRIVER_BEHAVIORAL_PROFILES[d.id]?.persona || 'Driver'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* HERO KPI ROW: 4 Core Dimension Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-[#CBD5E1] rounded-xl shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">90D BASELINE FUEL</span>
            <div className="text-2xl font-bold font-mono text-[#0B3D91] tabular-nums mt-1">
              {currentVehicleObj?.normalBaseline90d?.fuelEfficiencyKmL} <span className="text-xs font-semibold text-slate-600">km/L</span>
            </div>
            <p className="text-[10px] font-mono text-[#D7263D] mt-0.5 font-bold">
              Live: {predictiveMetrics.currentMetrics.kmL} km/L ({predictiveMetrics.currentMetrics.fuelEfficiencyDeltaPct}%)
            </p>
          </Card>

          <Card className="p-4 bg-white border border-[#CBD5E1] rounded-xl shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">HEALTH ANOMALY INDEX</span>
            <div className="text-2xl font-bold font-mono text-[#D7263D] tabular-nums mt-1">
              {predictiveMetrics.anomalyScore}% <span className="text-xs font-semibold text-slate-600">Risk</span>
            </div>
            <p className="text-[10px] font-mono text-[#B45309] mt-0.5 font-bold">
              {predictiveMetrics.healthStatus}
            </p>
          </Card>

          <Card className="p-4 bg-white border border-[#CBD5E1] rounded-xl shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">DRIVER PERSONA & JERK</span>
            <div className="text-xl font-bold font-mono text-[#0F172A] tabular-nums mt-1 truncate">
              {currentDriverObj?.persona}
            </div>
            <p className="text-[10px] font-mono text-slate-600 mt-0.5 font-medium">
              Jerk: {currentDriverObj?.behaviorMetrics?.avgAccelerationJerk} m/s³ (+18% today)
            </p>
          </Card>

          <Card className="p-4 bg-white border border-[#CBD5E1] rounded-xl shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-700 font-bold">AI OPTIMIZER SYNERGY</span>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
              91.4% <span className="text-xs font-semibold text-slate-600">Optimal</span>
            </div>
            <p className="text-[10px] font-mono text-emerald-700 mt-0.5 font-bold">
              +{optimizerData.pillars?.efficiency?.fuelSavingPct}% Fuel Saving Ready
            </p>
          </Card>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-[#DDE2EA] gap-2 overflow-x-auto text-xs font-mono pb-2">
          {[
            { id: 'all', label: 'Panoramic Command Deck', icon: DigitalTwinIcon },
            { id: 'vehicle', label: '1. Living Vehicle Twin', icon: CarIcon },
            { id: 'health', label: '2. Predictive Health Engine', icon: HeartPulseIcon },
            { id: 'driver', label: '3. AI Driver Twin', icon: BrainIcon },
            { id: 'optimizer', label: '4. AI Driving Optimizer', icon: SparklesIcon },
            { id: 'loop', label: '5. Closed-Loop Innovation', icon: LoopIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-[#0B3D91] border border-blue-200 shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panoramic Command Deck (Tab: 'all') */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Top Row: Living Vehicle Twin + Predictive Health Engine */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LivingVehicleTwinCard
                vehicle={currentVehicleObj}
                baseline={currentVehicleObj.normalBaseline90d}
                currentMetrics={predictiveMetrics.currentMetrics}
                healthStatus={predictiveMetrics.healthStatus}
              />

              <PredictiveHealthEngineCard
                predictiveMetrics={predictiveMetrics}
                anomalyScore={predictiveMetrics.anomalyScore}
                primaryAlert={predictiveMetrics.primaryAlert}
              />
            </div>

            {/* Middle Row: AI Driver Twin + AI Driving Optimizer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIDriverTwinCard
                driver={currentDriverObj}
                driverProfiles={DRIVER_BEHAVIORAL_PROFILES}
              />

              <AIDrivingOptimizerCard
                optimizerData={optimizerData}
                onApplyRecommendation={handleApplyRecommendation}
                onWhatIfChange={(updated) => setWhatIfSliders(updated)}
              />
            </div>

            {/* Bottom Row: Closed-Loop Feedback Engine (The Innovation) */}
            <ClosedLoopFeedbackEngine
              activeStageId={activeLoopStage}
              onStageSelect={(stgId) => setActiveLoopStage(stgId)}
              onRunLearningCycle={handleRunLearningCycle}
              learningEpochs={learningEpochs}
              isCycling={isCycling}
            />
          </div>
        )}

        {/* Single Tab Views */}
        {activeTab === 'vehicle' && (
          <LivingVehicleTwinCard
            vehicle={currentVehicleObj}
            baseline={currentVehicleObj.normalBaseline90d}
            currentMetrics={predictiveMetrics.currentMetrics}
            healthStatus={predictiveMetrics.healthStatus}
          />
        )}

        {activeTab === 'health' && (
          <PredictiveHealthEngineCard
            predictiveMetrics={predictiveMetrics}
            anomalyScore={predictiveMetrics.anomalyScore}
            primaryAlert={predictiveMetrics.primaryAlert}
          />
        )}

        {activeTab === 'driver' && (
          <AIDriverTwinCard
            driver={currentDriverObj}
            driverProfiles={DRIVER_BEHAVIORAL_PROFILES}
          />
        )}

        {activeTab === 'optimizer' && (
          <AIDrivingOptimizerCard
            optimizerData={optimizerData}
            onApplyRecommendation={handleApplyRecommendation}
            onWhatIfChange={(updated) => setWhatIfSliders(updated)}
          />
        )}

        {activeTab === 'loop' && (
          <ClosedLoopFeedbackEngine
            activeStageId={activeLoopStage}
            onStageSelect={(stgId) => setActiveLoopStage(stgId)}
            onRunLearningCycle={handleRunLearningCycle}
            learningEpochs={learningEpochs}
            isCycling={isCycling}
          />
        )}

      </div>
    </div>
  );
}
