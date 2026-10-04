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
import ThemeSwitcher from './ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function CommandBar({
  isConnected,
  spiffsCount = 0,
  weather,
  aiThoughtLogs = [],
  activeDTCs = [],
  securityState,
  telemetry,
  isPiPActive = false,
  onTogglePiP,
  onToggleMobileMenu,
}) {
  const { theme } = useTheme();
  const { activeRoleData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeVehicle, activeDriver } = useFleet();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAlertTrayOpen, setIsAlertTrayOpen] = useState(false);

  // Map route to breadcrumb label
  const breadcrumbMap = {
    '/split-view': { section: 'DRIVE', page: 'DUAL COCKPIT (3D + APP)' },
    '/dual-view': { section: 'DRIVE', page: 'DUAL COCKPIT (3D + APP)' },
    '/world': { section: 'DRIVE', page: '3D TWIN CITY' },
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
      <header className="relative h-14 sm:h-16 border-b border-line bg-white px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 select-none shadow-xs gap-2 sm:gap-4">
        {/* Mobile Hamburger & Breadcrumb & Global Search Button */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 overflow-hidden">
          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition shrink-0"
            title="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb Navigation - Non-overlapping & Responsive */}
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs shrink-0">
            {/* Show VELOCIQ brand prefix only on mobile where persistent sidebar is hidden */}
            <span className="font-display font-black text-sm tracking-wider shrink-0 md:hidden" style={{ color: theme.secondary || theme.primary }}>
              VELOCIQ
            </span>
            <span className="text-slate-300 font-bold md:hidden">/</span>
            <span className="font-bold hidden sm:inline shrink-0" style={{ color: theme.secondary || theme.primary }}>
              {currentCrumb.section}
            </span>
            <span className="text-slate-300 font-bold hidden sm:inline shrink-0">/</span>
            <span className="text-slate-900 font-black tracking-wide truncate max-w-[110px] sm:max-w-[150px] lg:max-w-none shrink-0">
              {currentCrumb.page}
            </span>
          </div>

          {/* Desktop Search Command Palette Button (Single-line, non-wrapping, fixed responsive width) */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-2 rounded-xl border border-slate-300 bg-bg-sunken px-3 py-1.5 font-mono text-xs text-slate-700 hover:text-slate-950 hover:border-slate-400 transition cursor-pointer w-36 lg:w-44 xl:w-56 shrink-0 whitespace-nowrap overflow-hidden"
            title="Open Command Palette (Ctrl+K)"
          >
            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-medium text-slate-600 truncate flex-1 text-left">Search or command...</span>
            <kbd className="rounded border border-slate-400 bg-white px-1.5 py-0.2 text-[10px] text-slate-700 font-mono font-bold shadow-2xs shrink-0">
              Ctrl+K
            </kbd>
          </button>

          {/* Mobile search icon button */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="md:hidden flex items-center justify-center p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition cursor-pointer shrink-0"
            title="Search telematics or command..."
            aria-label="Search"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Quick Direct Link to Dual Cockpit (Split View: 3D + Dashboard) */}
          {location.pathname !== '/split-view' && location.pathname !== '/dual-view' && (
            <button
              type="button"
              onClick={() => navigate('/split-view')}
              className="hidden 2xl:flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/10 px-2.5 py-1.5 font-mono text-xs text-cyan-900 font-bold hover:bg-cyan-500/25 hover:border-cyan-600 transition shadow-xs whitespace-nowrap shrink-0"
              title="Open Dual-Cockpit Split View (3D World + App Dashboard)"
            >
              <svg className="w-3.5 h-3.5 text-cyan-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span className="whitespace-nowrap">DUAL VIEW</span>
            </button>
          )}

          {/* Quick PiP Toggle Button */}
          {location.pathname !== '/split-view' && location.pathname !== '/dual-view' && location.pathname !== '/world' && (
            <button
              type="button"
              onClick={onTogglePiP}
              className={`hidden xl:flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0 ${
                isPiPActive
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
              }`}
              title="Toggle 3D Floating Picture-in-Picture window"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isPiPActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="whitespace-nowrap">{isPiPActive ? 'PiP ACTIVE' : '3D PiP'}</span>
            </button>
          )}

          {/* Quick Direct Link to 3D Digital World */}
          {location.pathname !== '/world' && location.pathname !== '/split-view' && location.pathname !== '/dual-view' && (
            <button
              type="button"
              onClick={() => navigate('/world')}
              className="hidden 2xl:flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-2.5 py-1.5 font-mono text-xs text-cyan-800 font-bold hover:bg-cyan-500/20 hover:border-cyan-500 transition shadow-xs whitespace-nowrap shrink-0"
              title="Open 3D Digital Twin City"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">3D WORLD</span>
            </button>
          )}
        </div>

        {/* Status Indicators & Action Chips - Neatly organized & responsive */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Real-World Digital Twin Stream Pill */}
          {telemetry?.isRealWorldLive && (Date.now() - (telemetry?.lastRealWorldUpdate || 0) < 4000) ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-400 bg-emerald-50 text-emerald-800 font-mono text-xs font-bold shadow-xs shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] shrink-0" />
              <span className="hidden sm:inline">REAL-WORLD 60Hz</span>
              <span className="sm:hidden">60Hz</span>
            </div>
          ) : (
            <div className="shrink-0">
              <StatusPill
                label={isConnected ? 'BLE STREAM' : 'OFFLINE BUFFER'}
                status={isConnected ? 'active' : 'idle'}
                pulse={isConnected}
              />
            </div>
          )}

          {/* SPIFFS Packet Queue (Only visible during offline buffer) */}
          {!isConnected && spiffsCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 font-mono text-xs font-semibold text-amber-800 shrink-0 whitespace-nowrap">
              <span className="tabular-nums font-bold">{spiffsCount}</span> SPIFFS
            </span>
          )}

          {/* Ambient Weather Chip (Visible on wide screens) */}
          {weather && (
            <div className="hidden 2xl:flex items-center gap-1.5 rounded-full border border-slate-300 bg-bg-sunken px-2.5 py-1 font-mono text-xs text-slate-800 shrink-0 whitespace-nowrap">
              <ThermometerIcon className="w-3.5 h-3.5 text-[#0B3D91] shrink-0" />
              <span className="text-slate-900 font-bold tabular-nums">{weather.temperature}°C</span>
              <span className="text-slate-600 font-medium text-[10px]">({weather.windspeed} km/h)</span>
            </div>
          )}

          {/* Theme Color Switcher */}
          <ThemeSwitcher compact />

          {/* Role Persona Switcher */}
          <RoleSwitcher compact />

          {/* Active Role Privilege Scope Pill */}
          {activeRoleData && (
            <span
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-xl font-mono text-[9px] font-bold border shrink-0 uppercase select-none transition-all shadow-2xs"
              style={{
                backgroundColor: `${activeRoleData.color}10`,
                color: activeRoleData.color,
                borderColor: `${activeRoleData.color}35`,
              }}
              title={`Active Authority: ${activeRoleData.label} (${activeRoleData.scopeBadge})`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeRoleData.color }} />
              <span className="truncate max-w-[95px] xl:max-w-none">{activeRoleData.scopeBadge}</span>
            </span>
          )}

          {/* Alert Notification Bell with Warning Light Icon Badge */}
          <button
            type="button"
            onClick={() => setIsAlertTrayOpen(true)}
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-line bg-white text-text-lo hover:text-text-hi hover:bg-slate-50 transition shrink-0 cursor-pointer"
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
