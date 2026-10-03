import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DashboardIcon,
  NavigationIcon,
  EngineTwinIcon,
  DigitalTwinIcon,
  FleetIcon,
  SafetyIcon,
  MaintenanceIcon,
} from './icons';

export default function MobileBottomNav({ onOpenMenu, totalAlerts = 0 }) {
  const { currentRole, hasPermission } = useAuth();

  const allPossibleItems = [
    ...(currentRole === 'driver' ? [{ path: '/driver-portal', label: 'Driver HUD', Icon: DashboardIcon }] : []),
    { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
    { path: '/navigation', label: 'Expressway', Icon: NavigationIcon },
    { path: '/fleet', label: 'Fleet', Icon: FleetIcon },
    { path: '/engine-twin', label: '3D Twin', Icon: EngineTwinIcon },
    { path: '/digital-twin', label: 'AI Optimizer', Icon: DigitalTwinIcon },
    { path: '/maintenance', label: 'Predictive', Icon: MaintenanceIcon },
    { path: '/safety', label: 'Safety', Icon: SafetyIcon },
  ];

  const navItems = allPossibleItems.filter(item => hasPermission(item.path)).slice(0, 4);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#0B3D91] font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            <item.Icon className="w-5 h-5 mb-0.5" />
            <span className="font-mono text-[10px] tracking-tight">{item.label}</span>
          </NavLink>
        ))}

        {/* Menu Drawer Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-600 hover:text-slate-950 transition"
          title="Open Full Menu"
        >
          {totalAlerts > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#D7263D] animate-ping" />
          )}
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="font-mono text-[10px] tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
