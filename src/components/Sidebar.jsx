import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import {
  SpeedArcLogo,
  DashboardIcon,
  NavigationIcon,
  SimulatorIcon,
  EngineTwinIcon,
  FleetIcon,
  SafetyIcon,
  SecurityIcon,
  MaintenanceIcon,
  AnalyticsIcon,
  DigitalTwinIcon,
  LogoutIcon,
  ChevronRightIcon,
  PulseDot,
} from './icons';
import { CarSilhouette, PlateBadge } from './ui';
import VehicleGarageModal from './VehicleGarageModal';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({
  isConnected,
  setIsConnected,
  vehicleProfile,
  setVehicleProfile,
  speedLimit,
  setSpeedLimit,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const { activeVehicle, monitorVehicle, vehicles } = useFleet();
  const { hasPermission, currentRole, activeRoleData, isRouteAllowed } = useAuth();

  const navGroups = [
    {
      group: 'DRIVE',
      items: [
        { path: '/split-view', label: 'Dual Cockpit (3D + App)', Icon: DashboardIcon, badge: 'DUAL' },
        { path: '/world', label: '3D Twin City (Drive)', Icon: DigitalTwinIcon, badge: '3D LIVE' },
        { path: '/driver-portal', label: 'Driver Cockpit HUD', Icon: DashboardIcon, badge: 'HUD' },
        { path: '/dashboard', label: 'Live Telemetry', Icon: DashboardIcon },
        { path: '/navigation', label: 'GPS Expressway', Icon: NavigationIcon },
        { path: '/simulator', label: 'What-If Lab', Icon: SimulatorIcon, badge: 'BENCH' },
      ],
    },
    {
      group: 'ENGINE',
      items: [
        { path: '/engine-twin', label: '3D Engine Twin', Icon: EngineTwinIcon },
        { path: '/maintenance', label: 'Predictive Wear', Icon: MaintenanceIcon },
      ],
    },
    {
      group: 'FLEET',
      items: [
        { path: '/fleet', label: 'Fleet Garage', Icon: FleetIcon },
        { path: '/safety', label: 'Driver Safety', Icon: SafetyIcon },
        { path: '/security', label: 'Threat Defense', Icon: SecurityIcon },
      ],
    },
    {
      group: 'INSIGHTS',
      items: [
        { path: '/world', label: 'Digital Twin City', Icon: DigitalTwinIcon, badge: '3D LIVE' },
        { path: '/digital-twin', label: 'Living Twin & Optimizer', Icon: DigitalTwinIcon, badge: 'AI LOOP' },
        { path: '/analytics', label: 'AI Analytics', Icon: AnalyticsIcon },
      ],
    },
  ];

  const currentProfile = activeVehicle?.profile || vehicleProfile || 'sedan';

  const filteredNavGroups = navGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((item) => isRouteAllowed(item.path)),
    }))
    .filter((grp) => grp.items.length > 0);

  const renderNavContent = (isMobile = false) => (
    <>
      {/* Grouped Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Quick 3D Digital World Launch Card */}
        {(!isCollapsed || isMobile) && isRouteAllowed('/world') && (
          <NavLink
            to="/world"
            onClick={isMobile ? onCloseMobile : undefined}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white font-mono text-xs font-bold shadow-md hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all border border-cyan-400/40 group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black tracking-wide text-cyan-300 flex items-center gap-1">
                <span>ENTER 3D WORLD</span>
                <span className="text-[9px] bg-cyan-400/20 px-1 py-0.2 rounded text-cyan-200">LIVE</span>
              </div>
              <div className="text-[9px] text-slate-400 truncate">Phone & Keyboard Driving</div>
            </div>
            <span className="text-cyan-400 text-sm group-hover:translate-x-0.5 transition-transform">→</span>
          </NavLink>
        )}

        {filteredNavGroups.map((grp) => (
          <div key={grp.group} className="space-y-1">
            {(!isCollapsed || isMobile) && (
              <div className="px-3 pb-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isMobile ? onCloseMobile : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? 'font-bold shadow-xs'
                      : 'text-text-mid hover:text-text-hi hover:bg-slate-100/70'
                  } ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        backgroundColor: theme.badgeBg,
                        color: theme.secondary || theme.primary,
                        borderLeft: `3px solid ${theme.primary}`,
                        boxShadow: `0 2px 8px ${theme.glow}`,
                      }
                    : {}
                }
                title={isCollapsed && !isMobile ? item.label : undefined}
              >
                <item.Icon className="w-4 h-4 shrink-0 transition-colors" style={{ color: theme.primary }} />
                {(!isCollapsed || isMobile) && (
                  <span className="flex-1 truncate tracking-tight">{item.label}</span>
                )}
                {(!isCollapsed || isMobile) && item.badge && (
                  <span
                    className="rounded px-1.5 py-0.2 font-mono text-[9px] font-bold"
                    style={{
                      backgroundColor: theme.badgeBg,
                      border: `1px solid ${theme.cardBorder}`,
                      color: theme.badgeText || theme.primary,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Download Native Android APK Card */}
      <div className="px-3 pb-2 pt-1 border-t border-line/60">
        <a
          href="/downloads/VelocIQ.apk"
          download="VelocIQ.apk"
          className={`group flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-left hover:bg-emerald-500/20 hover:border-emerald-500/50 transition shadow-xs ${
            isCollapsed && !isMobile ? 'justify-center p-2' : ''
          }`}
          title="Download Native Android APK (9.1 MB)"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125s-3.5902.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
            </svg>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-display text-xs font-bold text-emerald-950 truncate">
                  Android APK
                </span>
                <span className="rounded bg-emerald-600 px-1.5 py-0.2 font-mono text-[9px] font-bold text-white uppercase">
                  v1.0
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 mt-0.5 text-[10px] text-emerald-700 font-mono">
                <span>9.1 MB</span>
                <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  ↓ Get APK
                </span>
              </div>
            </div>
          )}
        </a>
      </div>

      {/* Active Persona Privilege Badge */}
      {(!isCollapsed || isMobile) && activeRoleData && (
        <div className="px-3 pt-2 pb-1 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeRoleData.color }}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[8px] uppercase font-bold text-slate-500 tracking-wider">
                  ROLE PRIVILEGE
                </span>
                <span className="font-display text-xs font-bold text-slate-900 truncate">
                  {activeRoleData.label}
                </span>
              </div>
            </div>
            <span
              className="px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold text-white uppercase shrink-0"
              style={{ backgroundColor: activeRoleData.color }}
            >
              {activeRoleData.badge}
            </span>
          </div>
        </div>
      )}

      {/* Active Vehicle Card at Bottom */}
      <div className="p-3 border-t border-line bg-slate-50/80">
        <button
          type="button"
          onClick={() => setIsGarageOpen(true)}
          className={`w-full flex items-center gap-2.5 rounded-xl border border-line bg-white p-2.5 text-left hover:border-slate-400 hover:shadow-sm transition group ${
            isCollapsed && !isMobile ? 'justify-center p-1.5' : ''
          }`}
          title="Connected Fleet Asset · Alpha Cruiser [NY-482-XA]"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 group-hover:border-blue-300">
            <CarSilhouette profile={currentProfile} view="side" className="w-8 h-4 text-[#0B3D91]" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-display text-xs font-bold text-text-hi truncate">
                  {activeVehicle?.name || 'Alpha Cruiser'}
                </span>
                <PulseDot color="emerald" active={true} />
              </div>
              <div className="mt-1">
                <PlateBadge plate={activeVehicle?.licensePlate || 'NY-482-XA'} size="sm" />
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Sign Out CTA */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('velociq_logged_in');
            window.location.href = '/';
          }}
          className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-slate-700 font-semibold hover:text-[#D7263D] hover:bg-[#D7263D]/10 transition ${
            isCollapsed && !isMobile ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogoutIcon className="w-4 h-4" />
          {(!isCollapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          {/* Drawer Content Container */}
          <div className="relative z-10 w-[280px] max-w-[85vw] h-full flex flex-col bg-white shadow-2xl">
            {/* Header with Close Button */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-900">
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs"
                  style={{ backgroundColor: theme.badgeBg, borderColor: theme.cardBorder }}
                >
                  <SpeedArcLogo className="w-4 h-4" style={{ color: theme.primary }} />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-sm font-black tracking-wider text-slate-900">VELOCIQ</span>
                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: theme.secondary || theme.primary }}>
                    Mobile Cockpit
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {renderNavContent(true)}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex relative z-30 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-md shadow-xs transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? 'w-[72px]' : 'w-[264px]'
        }`}
      >
        {/* Brand & Collapse Header - Luminous Aerospace Design */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/80 text-slate-900">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-xs"
              style={{ backgroundColor: theme.badgeBg, borderColor: theme.cardBorder }}
            >
              <SpeedArcLogo className="w-5 h-5" style={{ color: theme.primary }} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display text-base font-black tracking-wider text-slate-900">
                  VELOCIQ
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color: theme.secondary || theme.primary }}>
                  Precision Telematics
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-white transition shadow-2xs"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {renderNavContent(false)}
      </aside>

      {/* Vehicle Switcher Garage Modal */}
      <VehicleGarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        activeProfile={currentProfile}
        onSelectProfile={(p) => {
          if (typeof setVehicleProfile === 'function') {
            setVehicleProfile(p);
          }
          const matched = vehicles?.find((v) => v.profile === p);
          if (matched && typeof monitorVehicle === 'function') {
            monitorVehicle(matched.id);
          }
        }}
      />
    </>
  );
}
