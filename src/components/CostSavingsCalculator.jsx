import React, { useState, useMemo } from 'react';
import { calculateSpeedTiers, VEHICLE_PHYSICS_PROFILES } from '../utils/speedMileagePhysics';
import { Card, SectionLabel } from './ui';

export default function CostSavingsCalculator({ 
  fuelUsed = 0, 
  fuelPrice = 95, 
  setFuelPrice, 
  currentSpeed = 60,
  vehicleProfile = 'sedan',
  activeDistance = 25
}) {
  const [selectedDistance, setSelectedDistance] = useState(25);
  const [valueOfTime, setValueOfTime] = useState(30); // $/hr or ₹/hr equivalent

  // Speed-Tier Economics for the selected trip distance
  const speedTiers = useMemo(() => {
    return calculateSpeedTiers(selectedDistance, fuelPrice, vehicleProfile);
  }, [selectedDistance, fuelPrice, vehicleProfile]);

  const profileInfo = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;

  // Recommended tier based on VoT vs marginal cost
  const recommendedTier = useMemo(() => {
    if (valueOfTime > 45) return 'rush';
    if (valueOfTime > 20) return 'cruise';
    return 'eco';
  }, [valueOfTime]);

  const verdictJustified = valueOfTime >= 35;

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm p-5 relative overflow-hidden">
      <div className="racing-stripe" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <SectionLabel label="FINANCIAL MATRIX & SPEED TIERS" />
          <h3 className="text-lg font-bold text-text-hi font-heading mt-1">Cost vs. Time Trade-Off Optimization</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-lo">Profile:</span>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[#0B3D91]">
            {profileInfo.name}
          </span>
        </div>
      </div>

      {/* Fuel Price & VoT Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 border border-line p-3 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-text-lo block">Fuel Price</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm font-mono text-text-mid">$</span>
            <input
              type="number"
              value={fuelPrice}
              onChange={(e) => setFuelPrice && setFuelPrice(Math.max(1, Number(e.target.value)))}
              className="w-full bg-transparent font-mono font-bold text-base text-text-hi outline-none tabular-nums"
            />
          </div>
        </div>

        <div className="bg-slate-50 border border-line p-3 rounded-xl">
          <span className="text-[10px] font-mono uppercase text-text-lo block">Value of Time (VoT)</span>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm font-mono text-text-mid">$/hr</span>
            <input
              type="number"
              value={valueOfTime}
              onChange={(e) => setValueOfTime(Math.max(0, Number(e.target.value)))}
              className="w-full bg-transparent font-mono font-bold text-base text-[#0B3D91] outline-none tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* 3-Tier Matrix: Eco (70) / Cruise (95) / Rush (120) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Tier 1: Eco 70 */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
          recommendedTier === 'eco'
            ? 'border-[#0F9D6B] bg-emerald-50/70 shadow-sm ring-2 ring-[#0F9D6B]/30'
            : 'border-line bg-slate-50/70'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F9D6B] font-heading">Eco 70</span>
              {recommendedTier === 'eco' && (
                <span className="text-[9px] font-mono font-bold bg-[#0F9D6B] text-white px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-lo font-mono mt-0.5">70 km/h cruising</p>

            <div className="mt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-lo">Fuel Burn:</span>
                <span className="text-text-hi font-bold tabular-nums">{(speedTiers.eco?.fuelBurnLiters || 1.4).toFixed(2)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-lo">Fuel Cost:</span>
                <span className="text-[#0F9D6B] font-bold tabular-nums">${(speedTiers.eco?.fuelCost || 3.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-lo">Trip Duration:</span>
                <span className="text-text-mid tabular-nums">{Math.round(speedTiers.eco?.timeMinutes || 21)} mins</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-line text-[10px] font-mono text-text-lo">
            Baseline Efficiency
          </div>
        </div>

        {/* Tier 2: Cruise 95 */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
          recommendedTier === 'cruise'
            ? 'border-[#0F9D6B] bg-emerald-50/70 shadow-sm ring-2 ring-[#0F9D6B]/30'
            : 'border-line bg-slate-50/70'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B3D91] font-heading">Cruise 95</span>
              {recommendedTier === 'cruise' && (
                <span className="text-[9px] font-mono font-bold bg-[#0F9D6B] text-white px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-lo font-mono mt-0.5">95 km/h standard</p>

            <div className="mt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-lo">Fuel Burn:</span>
                <span className="text-text-hi font-bold tabular-nums">{(speedTiers.cruise?.fuelBurnLiters || 1.8).toFixed(2)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-lo">Fuel Cost:</span>
                <span className="text-[#0B3D91] font-bold tabular-nums">${(speedTiers.cruise?.fuelCost || 4.0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-lo">Time Saved:</span>
                <span className="text-[#0F9D6B] font-bold tabular-nums">-{Math.round(speedTiers.cruise?.timeSavedMinutes || 5.2)} mins</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-line text-[10px] font-mono text-text-mid flex justify-between">
            <span>Marginal Cost:</span>
            <span className="text-[#0B3D91] font-bold tabular-nums">${(speedTiers.cruise?.marginalCostPerMinSaved || 0.17).toFixed(2)} / min</span>
          </div>
        </div>

        {/* Tier 3: Rush 120 */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
          recommendedTier === 'rush'
            ? 'border-[#0F9D6B] bg-emerald-50/70 shadow-sm ring-2 ring-[#0F9D6B]/30'
            : 'border-line bg-slate-50/70'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D7263D] font-heading">Rush 120</span>
              {recommendedTier === 'rush' && (
                <span className="text-[9px] font-mono font-bold bg-[#0F9D6B] text-white px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-[10px] text-text-lo font-mono mt-0.5">120 km/h expressway</p>

            <div className="mt-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-lo">Fuel Burn:</span>
                <span className="text-text-hi font-bold tabular-nums">{(speedTiers.rush?.fuelBurnLiters || 2.4).toFixed(2)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-lo">Fuel Cost:</span>
                <span className="text-[#D7263D] font-bold tabular-nums">${(speedTiers.rush?.fuelCost || 5.3).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-lo">Time Saved:</span>
                <span className="text-[#0F9D6B] font-bold tabular-nums">-{Math.round(speedTiers.rush?.timeSavedMinutes || 8.4)} mins</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-line text-[10px] font-mono text-text-mid flex justify-between">
            <span>Marginal Cost:</span>
            <span className="text-[#D7263D] font-bold tabular-nums">${(speedTiers.rush?.marginalCostPerMinSaved || 0.41).toFixed(2)} / min</span>
          </div>
        </div>

      </div>

      {/* Economic Verdict Banner */}
      <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
        verdictJustified 
          ? 'bg-blue-50 border-blue-200 text-[#0B3D91]' 
          : 'bg-amber-50 border-amber-200 text-[#925a00]'
      }`}>
        <span className="font-semibold">
          VERDICT: {verdictJustified 
            ? `Rushing is economically justified at your VoT of $${valueOfTime}/hr.` 
            : `Rushing is NOT economically justified at $${valueOfTime}/hr (Cubic drag penalty exceeds time value).`}
        </span>
        <button 
          onClick={() => setValueOfTime(verdictJustified ? 25 : 50)}
          className="font-bold underline cursor-pointer hover:opacity-80"
        >
          {verdictJustified ? 'Simulate Low VoT' : 'Simulate High VoT'}
        </button>
      </div>
    </div>
  );
}
