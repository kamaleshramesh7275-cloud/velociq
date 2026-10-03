import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { SectionLabel } from '../ui';

const BADGE_DEFINITIONS = [
  {
    id: 'iron_brake',
    title: 'Iron Brake',
    category: 'Kinetic Safety',
    icon: '🛡️',
    description: 'Zero harsh braking events (>0.35G) across 500+ kilometers of corridor transit.',
    target: '500 km clean',
    accentColor: 'from-amber-500/20 to-amber-700/10 border-amber-400'
  },
  {
    id: 'aero_whisperer',
    title: 'Aero Whisperer',
    category: 'Fuel Aerodynamics',
    icon: '💨',
    description: 'Maintained >90% aerodynamic drag efficiency rating and gentle cruise throttle at speeds >80 km/h.',
    target: '>90% Aero index',
    accentColor: 'from-blue-500/20 to-blue-700/10 border-blue-400'
  },
  {
    id: 'glosa_virtuoso',
    title: 'GLOSA Virtuoso',
    category: 'Traffic AI Harmony',
    icon: '🟢',
    description: 'Passed 15+ consecutive V2X traffic signals on Green Wave without bringing vehicle to full zero stop.',
    target: '15 green waves',
    accentColor: 'from-emerald-500/20 to-emerald-700/10 border-emerald-400'
  },
  {
    id: 'limp_survivor',
    title: 'Limp-Home Survivor',
    category: 'Powertrain Resilience',
    icon: '🔧',
    description: 'Managed critical thermal / fault alert safely by engaging limp governor and parking safely at depot.',
    target: '1 safe recovery',
    accentColor: 'from-purple-500/20 to-purple-700/10 border-purple-400'
  },
  {
    id: 'dvir_hawk',
    title: 'Pre-Trip Hawk',
    category: 'DOT Compliance',
    icon: '📋',
    description: 'Submitted 25 consecutive pre-trip DVIRs with complete 7-point safety check and certified signature.',
    target: '25 certified checks',
    accentColor: 'from-cyan-500/20 to-cyan-700/10 border-cyan-400'
  },
  {
    id: 'night_owl',
    title: 'Nocturnal Master',
    category: 'Transit Precision',
    icon: '🌙',
    description: 'Zero speed exceedance or headway violations recorded during night shifts (22:00 - 05:00).',
    target: '100% clean nights',
    accentColor: 'from-indigo-500/20 to-indigo-700/10 border-indigo-400'
  }
];

const COACHING_DRILLS = [
  {
    id: 'drill-1',
    title: 'Progressive Brake Feathering',
    objective: 'Eliminate peak kinetic deceleration shock by applying 60% braking early and easing off before complete halt.',
    duration: '15 min simulation',
    xpReward: '+150 Safety XP',
    tag: 'Braking Physics',
    status: 'Ready'
  },
  {
    id: 'drill-2',
    title: 'GLOSA Green Wave Speed Matching',
    objective: 'Read downstream signal countdowns and modulate cruise speed within the 42–48 km/h target corridor to avoid stopping.',
    duration: '20 min interactive',
    xpReward: '+200 Eco XP',
    tag: 'V2X Optimization',
    status: 'In Progress'
  },
  {
    id: 'drill-3',
    title: 'Highway Aero-Drag Conservation',
    objective: 'Observe live Cd drag resistance meter and practice draft separation distance and gradual throttle transitions.',
    duration: '10 min review',
    xpReward: '+100 Aero XP',
    tag: 'Aerodynamics',
    status: 'Completed'
  }
];

export default function DriverBadges() {
  const { drivers, activeDriver } = useFleet();
  const [selectedDriverId, setSelectedDriverId] = useState(activeDriver?.id || 'd1');
  const [activeDrillModal, setActiveDrillModal] = useState(null);
  const [completedDrills, setCompletedDrills] = useState({ 'drill-3': true });

  const currentDriver = drivers?.find(d => d.id === selectedDriverId) || drivers?.[0];

  // Synthetic unlocked map per driver
  const driverBadgeMap = {
    'd1': { iron_brake: true, aero_whisperer: true, glosa_virtuoso: true, dvir_hawk: true },
    'd2': { iron_brake: true, aero_whisperer: false, limp_survivor: true, night_owl: true },
    'd3': { iron_brake: true, aero_whisperer: true, glosa_virtuoso: true, limp_survivor: true, dvir_hawk: true, night_owl: true },
    'd4': { dvir_hawk: true }
  };

  const unlockedSet = driverBadgeMap[selectedDriverId] || { iron_brake: true, glosa_virtuoso: true };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Driver Selector Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <SectionLabel label="ACHIEVEMENTS & TARGETED COACHING" />
          <h3 className="font-display font-bold text-base text-slate-900 mt-0.5">
            Driver Mastery Vault & Micro-Coaching Drills
          </h3>
          <p className="font-mono text-xs text-slate-500 mt-0.5">
            Gamified safety credentials, physics-based telemetry badges, and interactive driving optimization modules.
          </p>
        </div>

        {/* Driver Select Dropdown */}
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-slate-600 font-bold whitespace-nowrap">Driver:</label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 font-bold focus:ring-2 focus:ring-[#0B3D91] focus:outline-hidden"
          >
            {drivers?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.license})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display font-bold text-sm text-slate-900">
            Earned Accreditations & Badges
          </h4>
          <span className="font-mono text-xs text-[#0B3D91] font-bold">
            {Object.values(unlockedSet).filter(Boolean).length} of {BADGE_DEFINITIONS.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = !!unlockedSet[badge.id];
            return (
              <div
                key={badge.id}
                className={`relative rounded-xl border p-4 transition duration-200 flex flex-col justify-between ${
                  isUnlocked
                    ? `bg-gradient-to-br ${badge.accentColor} border-slate-300 shadow-xs`
                    : 'bg-slate-50/60 border-slate-200 opacity-60 grayscale'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl p-2 rounded-xl bg-white/80 shadow-xs">{badge.icon}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                      isUnlocked ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isUnlocked ? 'Unlocked ✓' : 'In Progress'}
                    </span>
                  </div>

                  <h5 className="font-display font-bold text-sm text-slate-900 mt-3">
                    {badge.title}
                  </h5>
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                    {badge.category}
                  </span>
                  <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Requirement:</span>
                  <span className="font-bold text-slate-800">{badge.target}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Micro-Coaching Drills Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <SectionLabel label="TELEMETRY-TARGETED COACHING" />
          <h4 className="font-display font-bold text-base text-slate-900 mt-0.5">
            Active Micro-Coaching Drills for {currentDriver?.name}
          </h4>
          <p className="font-mono text-xs text-slate-500 mt-0.5">
            Personalized physics exercises auto-assigned based on recent kinematic log deductions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COACHING_DRILLS.map((drill) => {
            const isDone = !!completedDrills[drill.id];
            return (
              <div
                key={drill.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {drill.tag}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600">
                      {drill.xpReward}
                    </span>
                  </div>

                  <h5 className="font-display font-bold text-sm text-slate-900">
                    {drill.title}
                  </h5>
                  <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed">
                    {drill.objective}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">
                    ⏱️ {drill.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDone) {
                        setCompletedDrills(prev => ({ ...prev, [drill.id]: true }));
                      } else {
                        setCompletedDrills(prev => {
                          const copy = { ...prev };
                          delete copy[drill.id];
                          return copy;
                        });
                      }
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-[#0B3D91] text-white hover:bg-blue-800 shadow-xs'
                    }`}
                  >
                    {isDone ? 'Completed ✓' : 'Complete Drill'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
