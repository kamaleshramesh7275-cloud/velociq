import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const ROLES = {
  admin: {
    id: 'admin',
    label: 'Fleet Administrator',
    badge: 'ADMIN',
    color: '#0B3D91',
    description: 'Full supervisory authority across all 10 cyber-physical modules, immobilizer, and settings.',
    allowedRoutes: [
      '/dashboard',
      '/navigation',
      '/simulator',
      '/engine-twin',
      '/maintenance',
      '/fleet',
      '/safety',
      '/security',
      '/digital-twin',
      '/analytics',
    ],
  },
  dispatcher: {
    id: 'dispatcher',
    label: 'Terminal Dispatcher',
    badge: 'DISPATCH',
    color: '#0F9D6B',
    description: 'Fleet coordination, live vehicle tracking, OSRM expressway guidance, and route dispatches.',
    allowedRoutes: [
      '/dashboard',
      '/navigation',
      '/fleet',
      '/simulator',
    ],
  },
  safety_officer: {
    id: 'safety_officer',
    label: 'Fleet Safety Officer',
    badge: 'SAFETY',
    color: '#B45309',
    description: 'Driver compliance audit, collision telemetry, peer leaderboards, and kinetic waste analytics.',
    allowedRoutes: [
      '/dashboard',
      '/safety',
      '/analytics',
      '/digital-twin',
    ],
  },
  mechanic: {
    id: 'mechanic',
    label: 'Lead Maintenance Tech',
    badge: 'MAINTENANCE',
    color: '#D7263D',
    description: 'Predictive component wear, OBD-II pre-trip diagnostics, 3D Engine Twin CAD, and powertrain DTCs.',
    allowedRoutes: [
      '/dashboard',
      '/engine-twin',
      '/maintenance',
      '/fleet',
    ],
  },
  driver: {
    id: 'driver',
    label: 'Driver Portal (Field)',
    badge: 'DRIVER',
    color: '#1E88E5',
    description: 'Streamlined mobile cockpit: active route, personal safety score, pre-trip electronic OBD scan, and SOS.',
    allowedRoutes: [
      '/driver-portal',
      '/dashboard',
      '/navigation',
    ],
  },
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => {
    return sessionStorage.getItem('velociq_active_role') || 'admin';
  });

  useEffect(() => {
    sessionStorage.setItem('velociq_active_role', currentRole);
  }, [currentRole]);

  const activeRoleData = ROLES[currentRole] || ROLES.admin;

  const hasPermission = (routePath) => {
    if (currentRole === 'admin') return true;
    return activeRoleData.allowedRoutes.some(r => routePath.startsWith(r));
  };

  const setRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRole(roleKey);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        activeRoleData,
        ROLES,
        setRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
