import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import {
  BellIcon,
  PulseDot,
  ThermometerIcon,
  CloseIcon,
  AlertTriangleIcon,
} from './icons';
import { Drawer, CommandPalette, SeverityBadge, StatusPill, WarningLight, RacingStripe } from './ui';
import RoleSwitcher from './RoleSwitcher';

export default function CommandBar({
  isConnected,
  spiffsCount = 0,
  weather,
  aiThoughtLogs = [],
  activeDTCs = [],
  securityState,
  telemetry,
  onToggleMobileMenu,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeVehicle, activeDriver } = useFleet();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAlertTrayOpen, setIsAlertTrayOpen] = useState(false);

  // Map route to breadcrumb label
  const breadcrumbMap = {
    '/dashboard': { section: 'DRIVE', page: 'LIVE TELEMETRY' },
    '/navigation': { section: 'DRIVE', page: 'GPS EXPRESSWAY' },
    '/simulator': { section: 'DRIVE', page: 'WHAT-IF LAB' },
    '/engine-twin': { section: 'ENGINE', page: '3D ENGINE TWIN' },
    '/maintenance': { section: 'ENGINE', page: 'PREDICTIVE WEAR' },
    '/fleet': { section: 'FLEET', page: 'FLEET GARAGE' },
    '/safety': { section: 'FLEET', page: 'DRIVER SAFETY' },
    '/security': { section: 'FLEET', page: 'THREAT DEFENSE' },
    '/digital-twin': { section: 'INSIGHTS', page: 'LIVING TWIN & OPTIMIZER' },
    '/analytics': { section: 'INSIGHTS', page: 'AI ANALYTICS' },
  };

  const currentCrumb = breadcrumbMap[location.pathname] || { section: 'DRIVE', page: 'OVERVIEW' };
  const totalAlerts = (activeDTCs?.length || 0) + (securityState?.anomalies?.length || 0) + (securityState?.isGeofenceBreached ? 1 : 0);

  return (
    <>
      <header className="relative h-14 sm:h-16 border-b border-line bg-white px-3 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none shadow-xs">
        {/* Mobile Hamburger & Breadcrumb & Global Search Button */}
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition"
            title="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs min-w-0">
            <span className="font-display font-black text-sm tracking-wider text-[#0B3D91] shrink-0">VELOCIQ</span>
            <span className="text-slate-300 font-bold hidden sm:inline">/</span>
            <span className="text-[#0B3D91] font-bold hidden sm:inline">{currentCrumb.section}</span>
            <span className="text-slate-300 font-bold">/</span>
            <span className="text-slate-900 font-black tracking-wide truncate">
              {currentCrumb.page}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-2.5 rounded-xl border border-slate-300 bg-bg-sunken px-3.5 py-1.5 font-mono text-xs text-slate-700 hover:text-slate-950 hover:border-slate-400 transition"
          >
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-medium text-slate-700">Search telematics or command...</span>
            <kbd className="rounded border border-slate-400 bg-white px-1.5 py-0.2 text-[10px] text-slate-800 font-mono font-bold shadow-xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Status Indicators & Action Chips */}
        <div className="flex items-center gap-3">
          {/* Real-World Digital Twin Stream Pill */}
          {telemetry?.isRealWorldLive && (Date.now() - (telemetry?.lastRealWorldUpdate || 0) < 4000) ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400 bg-emerald-50 text-emerald-800 font-mono text-xs font-bold shadow-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              <span>REAL-WORLD 60Hz LIVE</span>
            </div>
          ) : (
            <StatusPill
              label={isConnected ? 'BLE STREAM' : 'OFFLINE BUFFER'}
              status={isConnected ? 'active' : 'idle'}
              pulse={isConnected}
            />
          )}

          {/* SPIFFS Packet Queue */}
          {!isConnected && spiffsCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 font-mono text-xs font-semibold text-amber-800">
              <span className="tabular-nums font-bold">{spiffsCount}</span> SPIFFS
            </span>
          )}

          {/* Ambient Weather Chip */}
          {weather && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-300 bg-bg-sunken px-3 py-1 font-mono text-xs text-slate-800">
              <ThermometerIcon className="w-3.5 h-3.5 text-[#0B3D91]" />
              <span className="text-slate-900 font-bold tabular-nums">{weather.temperature}°C</span>
              <span className="text-slate-600 font-medium text-[10px]">({weather.windspeed} km/h wind)</span>
            </div>
          )}

          {/* AI Agent Status Chip (Automotive Blue Chip) */}
          <div className="flex items-center gap-1.5 rounded-full border border-[#0B3D91]/20 bg-[#0B3D91]/10 px-3 py-1 font-mono text-xs text-[#0B3D91]">
            <svg className="w-3.5 h-3.5 text-[#0B3D91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2" />
              <circle cx="9" cy="9" r="1.5" fill="currentColor" />
              <circle cx="15" cy="9" r="1.5" fill="currentColor" />
              <path d="M9 15h6" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-[11px]">AI AGENT</span>
          </div>

          {/* Role Persona Switcher */}
          <RoleSwitcher compact />

          {/* Alert Notification Bell with Warning Light Icon Badge */}
          <button
            type="button"
            onClick={() => setIsAlertTrayOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-text-lo hover:text-text-hi hover:bg-slate-50 transition"
            title="Open Diagnostic Warnings"
          >
            <BellIcon className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D7263D] text-[9px] font-mono font-bold text-white shadow-sm">
                {totalAlerts}
              </span>
            )}
          </button>
        </div>

        {/* 3px Racing Stripe directly beneath the top bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <RacingStripe orientation="horizontal" />
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={setIsCommandOpen}
        onNavigate={(path) => navigate(path)}
      />

      {/* Slide-out Diagnostic Alert Tray using Warning-Light vocabulary */}
      <Drawer
        isOpen={isAlertTrayOpen}
        onClose={() => setIsAlertTrayOpen(false)}
        title="Vehicle Diagnostic Alerts & ECU Logs"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono border-b border-line pb-2">
            <span className="text-text-lo">ACTIVE DTC WARNINGS</span>
            <span className="font-bold text-[#D7263D]">{activeDTCs.length} Trouble Codes</span>
          </div>

          {activeDTCs.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-[#0F9D6B] rounded-xl bg-[#0F9D6B]/10 border border-[#0F9D6B]/20">
              Zero active OBD-II diagnostic fault codes. Powertrain nominal.
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeDTCs.map((dtc) => (
                <div
                  key={dtc}
                  className="rounded-xl border border-line bg-slate-50 p-3.5 flex items-start gap-3"
                >
                  <WarningLight
                    type={dtc === 'P0300' ? 'engine' : 'fuel'}
                    active={true}
                    color="red"
                    size={24}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 px-1.5 py-0.5 rounded bg-white border border-slate-300">
                        DTC: {dtc}
                      </span>
                      <SeverityBadge severity="HIGH" />
                    </div>
                    <p className="mt-1 font-mono text-xs text-text-mid">
                      {dtc === 'P0300'
                        ? 'Random / Multiple Cylinder Misfire Detected in Bank 1'
                        : 'System Too Lean (Fuel Trim Correction > +22%)'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Thought Logs */}
          <div className="pt-3 border-t border-line">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-text-lo block mb-2">
              Autonomous AI Telemetry Log
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {aiThoughtLogs.map((log, i) => (
                <div key={i} className="text-[11px] font-mono p-2 rounded-lg bg-bg-sunken border border-line/60">
                  <span className="text-slate-400 mr-2">{log.time}</span>
                  <span className="text-text-hi font-medium">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
