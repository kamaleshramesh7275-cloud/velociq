import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { SectionLabel } from '../ui';

// Calculate composite score
export function calculateCompositeScore(driver) {
  const safety = driver.safetyScore ?? 85;
  const fuel = driver.fuelEfficiency ?? 85;
  const onTime = driver.onTimeCompliance ?? 90;
  return Math.round((0.45 * safety) + (0.35 * fuel) + (0.20 * onTime));
}

// Get tier styling and metadata
export function getDriverTier(compositeScore) {
  if (compositeScore >= 95) {
    return {
      label: 'Master Tier',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-400/20',
      icon: '👑',
      accentColor: '#7C3AED'
    };
  }
  if (compositeScore >= 90) {
    return {
      label: 'Gold Tier',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '🥇',
      accentColor: '#D97706'
    };
  }
  if (compositeScore >= 80) {
    return {
      label: 'Silver Tier',
      badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
      icon: '🥈',
      accentColor: '#64748B'
    };
  }
  return {
    label: 'Bronze Tier',
    badgeClass: 'bg-amber-800/10 text-amber-900 border-amber-800/20',
    icon: '🥉',
    accentColor: '#B45309'
  };
}

export default function FleetLeaderboard({ onSelectDriver }) {
  const { drivers } = useFleet();
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' | 'month' | 'all'

  // Enrich and sort drivers by composite score
  const rankedDrivers = [...(drivers || [])].map((d) => {
    const composite = calculateCompositeScore(d);
    const tier = getDriverTier(composite);
    return {
      ...d,
      compositeScore: composite,
      tier
    };
  }).sort((a, b) => b.compositeScore - a.compositeScore);

  const totalFuelSaved = rankedDrivers.reduce((acc, d) => acc + (d.weeklyFuelSavedLiters || 0), 0);
  const totalStopsAvoided = rankedDrivers.reduce((acc, d) => acc + (d.stopsAvoided || 0), 0);
  const avgFleetScore = Math.round(rankedDrivers.reduce((acc, d) => acc + d.compositeScore, 0) / (rankedDrivers.length || 1));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Gamification KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <SectionLabel label="TOP PERFORMER" />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl">🏆</span>
            <div>
              <p className="font-display font-bold text-sm text-slate-900 truncate">
                {rankedDrivers[0]?.name || 'Elena Rodriguez'}
              </p>
              <span className="font-mono text-xs text-purple-700 font-bold">
                {rankedDrivers[0]?.compositeScore || 96} Pts • {rankedDrivers[0]?.tier?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <SectionLabel label="FLEET COMPOSITE AVG" />
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-slate-900">{avgFleetScore}</span>
            <span className="font-mono text-xs text-slate-500">/ 100</span>
          </div>
          <p className="font-mono text-[11px] text-emerald-600 mt-1">▲ +3.4 pts vs previous cycle</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <SectionLabel label="AERO & FUEL SAVED" />
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-emerald-600">{totalFuelSaved.toFixed(1)}</span>
            <span className="font-mono text-xs text-slate-500">Liters</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500 mt-1">GLOSA green wave & steady throttle</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <SectionLabel label="STOPS AVOIDED (GLOSA)" />
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-[#0B3D91]">{totalStopsAvoided}</span>
            <span className="font-mono text-xs text-slate-500">Signals</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500 mt-1">~{Math.round(totalStopsAvoided * 0.18)} kg brake pad wear prevented</p>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header Strip */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <SectionLabel label="COMPOSITE PERFORMANCE RANKING" />
            <h3 className="font-display font-bold text-base text-slate-900 mt-0.5">
              VelocIQ Driver Fleet Leaderboard
            </h3>
            <p className="font-mono text-xs text-slate-500 mt-0.5">
              Weighted: 45% Safety Telematics + 35% Aerodynamic Fuel Efficiency + 20% On-Time Precision
            </p>
          </div>

          {/* Timeframe Presets */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition ${
                timeFilter === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition ${
                timeFilter === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition ${
                timeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All-Time
            </button>
          </div>
        </div>

        {/* Driver Rows */}
        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Driver Profile</th>
                <th className="py-3 px-4">Tier Badge</th>
                <th className="py-3 px-4 text-center">Safety (45%)</th>
                <th className="py-3 px-4 text-center">Fuel & Aero (35%)</th>
                <th className="py-3 px-4 text-center">On-Time (20%)</th>
                <th className="py-3 px-4 text-right">Fuel Saved</th>
                <th className="py-3 px-4 text-right">Stops Avoided</th>
                <th className="py-3 px-4 text-center">Composite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedDrivers.map((driver, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                return (
                  <tr
                    key={driver.id}
                    onClick={() => onSelectDriver && onSelectDriver(driver)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    {/* Rank & Movement */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs ${
                          rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          rank === 2 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                          rank === 3 ? 'bg-amber-800/10 text-amber-900 border border-amber-800/20' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {isTop3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : `#${rank}`}
                        </span>

                        {/* Movement */}
                        <span className={`text-[10px] font-bold ${
                          driver.rankMovement > 0 ? 'text-emerald-600' :
                          driver.rankMovement < 0 ? 'text-rose-600' :
                          'text-slate-400'
                        }`}>
                          {driver.rankMovement > 0 ? `▲+${driver.rankMovement}` :
                           driver.rankMovement < 0 ? `▼${driver.rankMovement}` : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Driver Profile */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B3D91] text-white font-display font-bold text-xs">
                          {driver.avatar}
                        </div>
                        <div>
                          <span className="font-display font-bold text-sm text-slate-900 block leading-tight">
                            {driver.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {driver.license} • {driver.experience}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${driver.tier.badgeClass}`}>
                        <span>{driver.tier.icon}</span>
                        <span>{driver.tier.label}</span>
                      </span>
                    </td>

                    {/* Safety Score */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`font-bold ${driver.safetyScore >= 90 ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {driver.safetyScore}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${driver.safetyScore}%` }}
                        />
                      </div>
                    </td>

                    {/* Fuel Efficiency */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`font-bold ${driver.fuelEfficiency >= 90 ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {driver.fuelEfficiency}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${driver.fuelEfficiency}%` }}
                        />
                      </div>
                    </td>

                    {/* On-Time Compliance */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`font-bold ${driver.onTimeCompliance >= 90 ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {driver.onTimeCompliance}%
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${driver.onTimeCompliance}%` }}
                        />
                      </div>
                    </td>

                    {/* Fuel Saved */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      +{driver.weeklyFuelSavedLiters} L
                    </td>

                    {/* Stops Avoided */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0B3D91] whitespace-nowrap">
                      {driver.stopsAvoided}
                    </td>

                    {/* Composite Score */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-sm shadow-xs">
                        {driver.compositeScore}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
