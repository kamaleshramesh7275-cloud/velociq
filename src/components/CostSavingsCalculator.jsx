import React from 'react';

export default function CostSavingsCalculator({ fuelUsed, fuelPrice, setFuelPrice }) {
  // AI Coaching saves 12.4% fuel compared to baseline driving
  // Baseline = fuelUsed / (1 - 0.124) = fuelUsed / 0.876
  // Liters saved = Baseline - fuelUsed = fuelUsed * (1 / 0.876 - 1)
  const litersSaved = fuelUsed * (1 / 0.876 - 1);
  const moneySpent = fuelUsed * fuelPrice;
  const moneySaved = litersSaved * fuelPrice;

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Economy Analyst</p>
        <h2 className="text-xl font-semibold text-white">Cost & Savings Calculator</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        {/* Fuel Cost Config */}
        <div className="flex flex-col justify-between border-b border-slate-800/60 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5" htmlFor="fuel-price">
              Local Fuel Price (₹/L)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                id="fuel-price"
                type="number"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-4 py-2 text-sm text-white font-bold outline-none transition focus:border-cyan-400"
              />
            </div>
          </div>
          <p className="mt-3 text-[10px] text-slate-500 leading-normal">
            Input local gasoline or diesel pricing per liter to estimate monetary usage.
          </p>
        </div>

        {/* Cost Analysis Results */}
        <div className="space-y-3 sm:pl-2">
          <div>
            <p className="text-xs text-slate-400">Total Fuel Cost</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">
              ₹{moneySpent.toFixed(2)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-slate-400">AI Coaching Savings</p>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                -12.4%
              </span>
            </div>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              + ₹{moneySaved.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
