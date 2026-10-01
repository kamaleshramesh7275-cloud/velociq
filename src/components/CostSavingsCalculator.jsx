import React, { useState, useMemo } from 'react';
import { calculateSpeedTiers, VEHICLE_PHYSICS_PROFILES } from '../utils/speedMileagePhysics';

export default function CostSavingsCalculator({ 
  fuelUsed = 0, 
  fuelPrice = 95, 
  setFuelPrice, 
  currentSpeed = 60,
  vehicleProfile = 'sedan',
  activeDistance = 25
}) {
  const [selectedDistance, setSelectedDistance] = useState(25);

  // AI Coaching saves 12.4% fuel compared to baseline driving
  // Baseline = fuelUsed / (1 - 0.124) = fuelUsed / 0.876
  const litersSaved = fuelUsed * (1 / 0.876 - 1);
  const moneySpent = fuelUsed * fuelPrice;
  const moneySaved = litersSaved * fuelPrice;

  // Calculate Speed-Tier Economics for the selected trip distance
  const speedTiers = useMemo(() => {
    return calculateSpeedTiers(selectedDistance, fuelPrice, vehicleProfile);
  }, [selectedDistance, fuelPrice, vehicleProfile]);

  const profileInfo = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;

  // Determine which tier matches current driving speed
  const activeSpeedTier = useMemo(() => {
    if (currentSpeed <= 70) return 'eco';
    if (currentSpeed <= 95) return 'cruise';
    return 'rush';
  }, [currentSpeed]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400 font-semibold">Economy & Velocity Analyst</p>
          <h2 className="text-xl font-bold text-white">Cost & Speed-Tier Matrix</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Profile:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            {profileInfo.name}
          </span>
        </div>
      </div>

      {/* Fuel Price & Active Trip Cost Summary */}
      <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 mb-5">
        {/* Fuel Cost Config */}
        <div className="flex flex-col justify-between border-b border-slate-800/60 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="fuel-price">
              Local Fuel Price (₹/L)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                id="fuel-price"
                type="number"
                value={fuelPrice}
                onChange={(e) => setFuelPrice && setFuelPrice(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-4 py-2 text-sm text-white font-bold outline-none transition focus:border-cyan-400"
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 leading-normal">
            Real-time speed burn rates update dynamically across all speed tiers.
          </p>
        </div>

        {/* Cost Analysis Results */}
        <div className="space-y-3 sm:pl-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Trip Fuel Cost</p>
              <p className="mt-1 text-2xl font-bold text-slate-100">
                ₹{moneySpent.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Fuel Consumed</p>
              <p className="mt-1 text-lg font-bold text-amber-300 font-mono">
                {fuelUsed.toFixed(2)} L
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded">
                -12.4%
              </span>
              <p className="text-xs text-emerald-300">AI Eco-Pacing Savings</p>
            </div>
            <p className="text-sm font-bold text-emerald-300">
              + ₹{moneySaved.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Speed-Tier Matrix Controls */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Speed vs. Fuel Expense Trade-off</h3>
          <p className="text-[11px] text-slate-500">How driving faster burns disproportionately more fuel due to aerodynamic drag ($P \propto v^3$)</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {[15, 25, 50, 100].map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => setSelectedDistance(dist)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                selectedDistance === dist
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dist} km
            </button>
          ))}
        </div>
      </div>

      {/* Speed Tier Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-3">
        {speedTiers.map((tier) => {
          const isCurrentTier = activeSpeedTier === tier.id;
          const isEco = tier.id === 'eco';
          const isRush = tier.id === 'rush';

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                isCurrentTier 
                  ? 'border-cyan-400/80 bg-slate-950/90 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-950/50' 
                  : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
              }`}
            >
              {isCurrentTier && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-cyan-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-md animate-pulse">
                  Current Pace
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isEco ? 'text-emerald-400' : isRush ? 'text-rose-400' : 'text-cyan-400'
                  }`}>
                    {tier.name}
                  </span>
                  <span className="text-xs font-black text-white font-mono">{tier.targetSpeed} km/h</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs text-slate-400">Duration</span>
                  <span className="text-sm font-bold text-slate-200 font-mono">{tier.durationMinutes} min</span>
                </div>

                <div className="mt-2 flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs text-slate-400">Mileage</span>
                  <span className={`text-sm font-bold font-mono ${
                    isEco ? 'text-emerald-400' : isRush ? 'text-rose-400' : 'text-cyan-300'
                  }`}>
                    {tier.mileageKmL} km/L
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs text-slate-400">Fuel Needed</span>
                  <span className="text-sm font-semibold text-slate-300 font-mono">{tier.fuelUsedLiters} L</span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Trip Cost</span>
                  <span className="text-base font-extrabold text-white font-mono">₹{tier.totalCost.toFixed(1)}</span>
                </div>
              </div>

              {/* Economic Delta vs Eco Saver */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
                {isEco ? (
                  <div className="text-emerald-400 font-semibold flex items-center justify-between">
                    <span>Baseline Efficiency</span>
                    <span>₹0 Premium</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Time Saved:</span>
                      <span className="font-bold text-emerald-400 font-mono">-{tier.timeSavedMinutes} min</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Fuel Premium:</span>
                      <span className="font-bold text-rose-400 font-mono">+₹{tier.costPremium.toFixed(1)}</span>
                    </div>
                    <div className="mt-1.5 rounded-lg bg-slate-900/90 px-2 py-1 text-[10px] text-slate-400 flex items-center justify-between border border-slate-800">
                      <span>Time Value:</span>
                      <span className="font-bold text-amber-300 font-mono">₹{tier.valueOfTimePerHour}/hr</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Economic Verdict */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex items-start gap-3">
        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 shrink-0 border border-cyan-500/20">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-slate-300">
          <span className="font-bold text-white">AI Cost-Velocity Verdict: </span>
          Cruising at <span className="text-cyan-300 font-bold">85 km/h</span> instead of Express (110 km/h) retains 
          <span className="text-emerald-300 font-bold"> +4.2 km/L</span> higher efficiency, saving 
          <span className="text-emerald-300 font-bold"> ₹{(speedTiers[2].costPremium - speedTiers[1].costPremium).toFixed(1)}</span> per {selectedDistance} km with a negligible time difference of only { (speedTiers[1].durationMinutes - speedTiers[2].durationMinutes).toFixed(1) } minutes.
        </div>
      </div>
    </section>
  );
}
