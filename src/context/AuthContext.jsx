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
    scopeBadge: 'FULL AUTHORITY',
    color: '#0B3D91',
    description: 'Full supervisory authority across all 10 cyber-physical modules, immobilizer, settings, and diagnostics.',
    primaryRoute: '/dashboard',
    allowedRoutes: [
      '/dashboard',
      '/split-view',
      '/world',
      '/driver-portal',
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
    permissions: {
      canImmobilize: true,
      canClearDTC: true,
      canInjectFault: true,
      canServiceVehicle: true,
      canRunDynoBench: true,
      canAssignDriver: true,
      canChangeVehicleStatus: true,
      canAuditSafety: true,
      canTunePhysics: true,
      canAccessSecurity: true,
      canExportData: true,
      isDriverCockpit: false,
    },
  },
  dispatcher: {
    id: 'dispatcher',
    label: 'Terminal Dispatcher',
    badge: 'DISPATCH',
    scopeBadge: 'EXPRESSWAY & FLEET',
    color: '#0F9D6B',
    description: 'Fleet coordination, live vehicle tracking, OSRM expressway guidance, route dispatches, and split view.',
    primaryRoute: '/navigation',
    allowedRoutes: [
      '/navigation',
      '/fleet',
      '/dashboard',
      '/split-view',
      '/world',
      '/simulator',
    ],
    permissions: {
      canImmobilize: false,
      canClearDTC: false,
      canInjectFault: false,
      canServiceVehicle: false,
      canRunDynoBench: false,
      canAssignDriver: true,
      canChangeVehicleStatus: true,
      canAuditSafety: false,
      canTunePhysics: true,
      canAccessSecurity: false,
      canExportData: true,
      isDriverCockpit: false,
    },
  },
  safety_officer: {
    id: 'safety_officer',
    label: 'Fleet Safety Officer',
    badge: 'SAFETY',
    scopeBadge: 'SAFETY & AUDIT',
    color: '#B45309',
    description: 'Driver compliance audit, collision telemetry, peer leaderboards, and kinetic waste analytics.',
    primaryRoute: '/safety',
    allowedRoutes: [
      '/safety',
      '/analytics',
      '/digital-twin',
      '/dashboard',
      '/split-view',
    ],
    permissions: {
      canImmobilize: false,
      canClearDTC: false,
      canInjectFault: false,
      canServiceVehicle: false,
      canRunDynoBench: false,
      canAssignDriver: false,
      canChangeVehicleStatus: false,
      canAuditSafety: true,
      canTunePhysics: false,
      canAccessSecurity: false,
      canExportData: true,
      isDriverCockpit: false,
    },
  },
  mechanic: {
    id: 'mechanic',
    label: 'Lead Maintenance Tech',
    badge: 'MAINTENANCE',
    scopeBadge: 'POWERTRAIN & WEAR',
    color: '#D7263D',
    description: 'Predictive component wear, OBD-II pre-trip diagnostics, 3D Engine Twin CAD, and powertrain DTCs.',
    primaryRoute: '/engine-twin',
    allowedRoutes: [
      '/engine-twin',
      '/maintenance',
      '/fleet',
      '/dashboard',
      '/simulator',
      '/split-view',
    ],
    permissions: {
      canImmobilize: false,
      canClearDTC: true,
      canInjectFault: true,
      canServiceVehicle: true,
      canRunDynoBench: true,
      canAssignDriver: false,
      canChangeVehicleStatus: true,
      canAuditSafety: false,
      canTunePhysics: true,
      canAccessSecurity: false,
      canExportData: true,
      isDriverCockpit: false,
    },
  },
  driver: {
    id: 'driver',
    label: 'Driver Portal (Field)',
    badge: 'DRIVER',
    scopeBadge: 'MOBILE COCKPIT',
    color: '#1E88E5',
    description: 'Streamlined mobile cockpit: active route, personal safety score, pre-trip electronic OBD scan, and SOS.',
    primaryRoute: '/driver-portal',
    allowedRoutes: [
      '/driver-portal',
      '/split-view',
      '/world',
      '/navigation',
      '/dashboard',
    ],
    permissions: {
      canImmobilize: false,
      canClearDTC: false,
      canInjectFault: false,
      canServiceVehicle: false,
      canRunDynoBench: false,
      canAssignDriver: false,
      canChangeVehicleStatus: false,
      canAuditSafety: false,
      canTunePhysics: false,
      canAccessSecurity: false,
      canExportData: false,
      isDriverCockpit: true,
    },
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

  const hasPermission = (permissionKey) => {
    if (!permissionKey) return true;
    const role = ROLES[currentRole] || ROLES.admin;
    return !!role.permissions?.[permissionKey];
  };

  const isRouteAllowed = (path) => {
    if (!path) return true;
    const role = ROLES[currentRole] || ROLES.admin;
    if (!role || !role.allowedRoutes) return true;
    const normalized = path === '/dual-view' ? '/split-view' : path;
    return role.allowedRoutes.includes(normalized);
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
        isRouteAllowed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
