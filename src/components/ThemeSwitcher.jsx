import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher({ compact = false }) {
  const { themeId, setTheme, theme, allThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 transition shadow-xs select-none"
        title="Switch Automotive Color Theme"
      >
        {/* Active Theme Color Swatch Pill */}
        <div className="flex items-center -space-x-1">
          <span className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: theme.primary }} />
          <span className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: theme.secondary }} />
        </div>
        {!compact && (
          <span className="font-mono text-xs font-bold text-slate-800 tracking-tight">
            {theme.name}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-mono">
          <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
              COLOR PALETTES
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              6 THEMES
            </span>
          </div>

          <div className="space-y-1">
            {allThemes.map((t) => {
              const isActive = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-slate-100 border border-slate-300 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {/* Swatch Trio */}
                  <div className="flex items-center -space-x-1 shrink-0 p-1 rounded-lg bg-slate-900 shadow-inner">
                    {t.swatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-full border border-slate-800 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{t.name}</span>
                      {isActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: t.primary, boxShadow: `0 0 6px ${t.primary}` }}
                        />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-700 truncate font-sans">
                      {t.tagline}
                    </div>
                  </div>

                  {isActive && (
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
