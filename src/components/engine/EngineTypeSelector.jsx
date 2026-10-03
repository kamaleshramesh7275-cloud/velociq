/**
 * src/components/engine/EngineTypeSelector.jsx
 * 
 * Interactive Powertrain & Engine Type Selector for VelocIQ.
 * Allows instant live switching between all 10 engine families with visual category filtering,
 * key architectural specs, and real-time active indicators.
 */

import React, { useState, useMemo } from 'react';
import { listEngineTypes, ENGINE_CATEGORIES } from '../../config/engineTypes';
import {
  EngineI4Icon,
  EngineTurboIcon,
  EngineV6Icon,
  EngineV8Icon,
  EngineBoxerIcon,
  EngineDieselIcon,
  EngineSingleIcon,
  EngineCngIcon,
  EngineHybridIcon,
  EngineBevIcon,
  ChevronDownIcon
} from '../icons';

const ICON_MAP = {
  engine_i4: EngineI4Icon,
  engine_turbo: EngineTurboIcon,
  engine_v6: EngineV6Icon,
  engine_v8: EngineV8Icon,
  engine_boxer: EngineBoxerIcon,
  engine_diesel: EngineDieselIcon,
  engine_single: EngineSingleIcon,
  engine_cng: EngineCngIcon,
  engine_hybrid: EngineHybridIcon,
  engine_bev: EngineBevIcon
};

export default function EngineTypeSelector({
  selectedEngineId = 'i4_petrol',
  onSelectEngine,
  allowedEngineIds = null,
  compact = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const allEngines = useMemo(() => {
    const list = listEngineTypes();
    if (!allowedEngineIds || allowedEngineIds.length === 0) return list;
    return list.filter((e) => allowedEngineIds.includes(e.id));
  }, [allowedEngineIds]);

  const filteredEngines = useMemo(() => {
    if (activeCategory === 'ALL') return allEngines;
    return allEngines.filter((e) => e.category === activeCategory);
  }, [allEngines, activeCategory]);

  const activeEngine = useMemo(() => {
    return allEngines.find((e) => e.id === selectedEngineId) || allEngines[0];
  }, [allEngines, selectedEngineId]);

  const ActiveIcon = ICON_MAP[activeEngine?.iconKey] || EngineI4Icon;

  const handleSelect = (engineId) => {
    onSelectEngine(engineId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3.5 rounded-xl border border-line bg-white hover:bg-slate-50 text-text-hi shadow-xs flex items-center justify-between gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            activeEngine.category === 'BEV'
              ? 'bg-sky-50 text-[#0284C7]'
              : activeEngine.category === 'HYBRID'
              ? 'bg-emerald-50 text-[#047857]'
              : 'bg-blue-50 text-[#0B3D91]'
          }`}>
            <ActiveIcon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-xs font-heading font-bold text-text-hi block leading-tight">
              {activeEngine.shortLabel}
            </span>
            <span className="text-[10px] font-mono text-text-lo block leading-tight">
              {activeEngine.badgeText}
            </span>
          </div>
        </div>

        <ChevronDownIcon className={`w-4 h-4 text-text-lo transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-96 rounded-2xl bg-white border border-line shadow-2xl p-3 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header & Category Filters */}
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-text-lo">
                SELECT POWERTRAIN ARCHITECTURE
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                {['ALL', 'ICE', 'HYBRID', 'BEV'].map((cat) => (
                  <button
                    key={cat}
                    onClick={(e) => { e.stopPropagation(); setActiveCategory(cat); }}
                    className={`px-2 py-0.5 rounded-md transition ${
                      activeCategory === cat ? 'bg-white text-[#0B3D91] shadow-xs' : 'text-text-mid hover:text-text-hi'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Engine Cards */}
            <div className="max-h-80 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {filteredEngines.map((engine) => {
                const IconComponent = ICON_MAP[engine.iconKey] || EngineI4Icon;
                const isSelected = engine.id === selectedEngineId;

                return (
                  <button
                    key={engine.id}
                    onClick={() => handleSelect(engine.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-[#0B3D91] bg-blue-50/60 shadow-xs ring-1 ring-[#0B3D91]/20'
                        : 'border-slate-100 hover:border-line hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      engine.category === 'BEV'
                        ? 'bg-sky-100 text-[#0284C7]'
                        : engine.category === 'HYBRID'
                        ? 'bg-emerald-100 text-[#047857]'
                        : 'bg-blue-100 text-[#0B3D91]'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-heading font-bold text-text-hi truncate">
                          {engine.label}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                          engine.category === 'BEV'
                            ? 'bg-sky-50 text-[#0284C7] border border-sky-200'
                            : engine.category === 'HYBRID'
                            ? 'bg-emerald-50 text-[#047857] border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {engine.category}
                        </span>
                      </div>

                      <p className="text-[10px] text-text-lo line-clamp-1 mt-0.5">
                        {engine.description}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-text-mid">
                        <span>{engine.peakPowerKw} kW ({Math.round(engine.peakPowerKw * 1.341)} HP)</span>
                        <span>•</span>
                        <span>{engine.peakTorqueNm} Nm</span>
                        <span>•</span>
                        <span>{engine.mileageUnit}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
