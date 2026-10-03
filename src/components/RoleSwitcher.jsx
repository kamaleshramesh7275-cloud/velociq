import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RoleSwitcher({ compact = false }) {
  const { currentRole, activeRoleData, ROLES, setRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition px-2.5 py-1.5 ${
          compact ? 'text-xs' : 'text-xs sm:text-sm'
        }`}
        title="Switch User Role / Persona"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: activeRoleData.color }}
        />
        <div className="flex flex-col items-start min-w-0">
          <span className="font-mono text-[9px] uppercase font-bold text-slate-700 tracking-wider">
            ROLE:
          </span>
          <span className="font-display font-bold text-slate-900 truncate leading-none">
            {activeRoleData.label}
          </span>
        </div>
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shrink-0 ml-1"
          style={{ backgroundColor: activeRoleData.color }}
        >
          {activeRoleData.badge}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 animate-fadeIn space-y-1">
          <div className="px-3 py-2 border-b border-slate-100">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Persona / Access Control
            </span>
            <span className="font-mono text-[10px] text-slate-600 block mt-0.5">
              Simulate role-specific permissions and navigation
            </span>
          </div>

          <div className="space-y-1 pt-1 max-h-72 overflow-y-auto">
            {Object.values(ROLES).map((role) => {
              const isSelected = role.id === currentRole;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setRole(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-slate-100/90 border border-slate-300'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: role.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-display text-xs font-bold text-slate-900 truncate">
                        {role.label}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.2 font-mono text-[8px] font-bold text-white uppercase"
                        style={{ backgroundColor: role.color }}
                      >
                        {role.badge}
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                      {role.description}
                    </p>
                    <span className="font-mono text-[9px] text-[#0B3D91] mt-1 block">
                      {role.allowedRoutes.length} Accessible Module(s)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
