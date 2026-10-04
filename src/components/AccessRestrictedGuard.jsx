import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccessRestrictedGuard({ pathname, activeRoleData, ROLES, setRole }) {
  const navigate = useNavigate();

  // Find which roles CAN access this route
  const normalizedPath = pathname === '/dual-view' ? '/split-view' : pathname;
  const authorizedRoles = Object.values(ROLES || {}).filter((r) =>
    r.allowedRoutes?.includes(normalizedPath)
  );
  const suggestedRole = authorizedRoles[0] || ROLES?.admin;

  // Derive friendly page name from pathname
  const pageNameMap = {
    '/dashboard': 'Live Telemetry Dashboard',
    '/split-view': 'Dual Cockpit 3D & App View',
    '/world': '3D Digital Twin City',
    '/driver-portal': 'Driver Cockpit HUD',
    '/navigation': 'GPS Expressway & Route Dispatcher',
    '/simulator': 'What-If Lab & Performance Optimizer',
    '/engine-twin': '3D Engine Twin CAD & Dyno Bench',
    '/maintenance': 'Predictive Component Health & Wear',
    '/fleet': 'Fleet Garage & Asset Management',
    '/safety': 'Driver Safety Scoring & Audit',
    '/security': 'Cybersecurity Defense & Remote Immobilizer',
    '/digital-twin': 'Living Twin & Dynamic Physics Loop',
    '/analytics': 'AI Telematics Analytics & Matrix',
  };

  const moduleName = pageNameMap[normalizedPath] || normalizedPath;

  return (
    <div className="flex-1 p-6 md:p-12 flex items-center justify-center bg-[#F4F6F9] min-h-[70vh]">
      <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 text-center animate-fadeIn relative overflow-hidden">
        {/* Top 3px Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-[#0B3D91]" />

        {/* Shield Lock Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-2">
          <span>ROLE AUTHORIZATION RESTRICTED</span>
        </div>

        <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {moduleName}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Your current persona <span className="font-semibold text-slate-900">({activeRoleData?.label})</span> does not possess access rights for this module.
        </p>

        {/* Authorized Roles Chip List */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-slate-500 block mb-2">
            AUTHORIZED PERSONAS FOR THIS MODULE:
          </span>
          <div className="flex flex-wrap gap-2">
            {authorizedRoles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold text-white uppercase shadow-2xs hover:brightness-110 transition cursor-pointer flex items-center gap-1"
                style={{ backgroundColor: r.color }}
                title={`Switch to ${r.label}`}
              >
                <span>{r.label}</span>
                <span className="text-[8px] bg-black/20 px-1 py-0.2 rounded font-black">+{r.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          {suggestedRole && (
            <button
              type="button"
              onClick={() => setRole(suggestedRole.id)}
              className="flex-1 py-2.5 px-4 rounded-xl text-white font-mono text-xs font-bold shadow-md hover:brightness-110 transition flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: suggestedRole.color }}
            >
              <span>Unlock as {suggestedRole.badge}</span>
              <span>→</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(activeRoleData?.primaryRoute || '/dashboard')}
            className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs font-bold transition cursor-pointer"
          >
            Return to {activeRoleData?.badge} Home
          </button>
        </div>
      </div>
    </div>
  );
}
