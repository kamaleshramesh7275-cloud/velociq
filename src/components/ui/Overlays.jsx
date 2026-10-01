import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { CloseIcon } from '../icons';

/**
 * Showroom Precision Modal
 */
export function Modal({
  isOpen = false,
  onClose,
  title = '',
  subtitle = '',
  children,
  maxWidth = 'max-w-xl',
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidth} rounded-2xl bg-white border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Header with Racing Stripe Accent */}
        <div className="relative border-b border-line bg-slate-50/70 p-4 sm:p-5 flex items-center justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-blue via-brand-blue to-brand-red" />
          <div>
            <h3 className="font-display text-lg font-bold text-text-hi leading-none">{title}</h3>
            {subtitle && <p className="font-mono text-xs text-text-lo mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-text-lo hover:text-text-hi hover:bg-slate-100 transition"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/**
 * Slide-in Right Drawer (Alert Tray / Diagnostics)
 */
export function Drawer({
  isOpen = false,
  onClose,
  title = '',
  children,
  width = 'max-w-md',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`h-full w-full ${width} bg-white border-l border-line shadow-2xl flex flex-col animate-in slide-in-from-right duration-200`}
      >
        <div className="relative p-4 border-b border-line flex items-center justify-between bg-slate-50">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-blue to-brand-red" />
          <h3 className="font-display text-base font-bold text-text-hi">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-text-lo hover:text-text-hi hover:bg-slate-100 transition"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

/**
 * Precision Automotive Tooltip
 */
export function Tooltip({ content, children, className = '' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-[11px] shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in duration-100 border border-slate-700">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

/**
 * CommandPalette (Ctrl+K Launcher)
 */
export function CommandPalette({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dashboard', label: 'Live Telemetry Dashboard', category: 'Drive', path: '/dashboard' },
    { id: 'navigation', label: 'GPS Expressway & GLOSA Advisor', category: 'Drive', path: '/navigation' },
    { id: 'simulator', label: 'What-If Lab & Speed-Mileage Optimizer', category: 'Drive', path: '/simulator' },
    { id: 'digital-twin', label: 'Living Digital Twin & AI Optimizer', category: 'Insights', path: '/digital-twin' },
    { id: 'engine-twin', label: '3D Engine Digital Twin & Dyno', category: 'Engine', path: '/engine-twin' },
    { id: 'maintenance', label: 'Predictive Component Wear', category: 'Engine', path: '/maintenance' },
    { id: 'fleet', label: 'Fleet Garage & Asset Management', category: 'Fleet', path: '/fleet' },
    { id: 'safety', label: 'Driver Safety & Behavioral Telematics', category: 'Fleet', path: '/safety' },
    { id: 'security', label: 'Threat Defense & Remote Immobilizer', category: 'Fleet', path: '/security' },
    { id: 'analytics', label: 'AI Analytics & Financial Matrix', category: 'Insights', path: '/analytics' },
  ];

  const filtered = query.trim() === ''
    ? commands
    : commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="relative border-b border-line p-3 flex items-center gap-3 bg-slate-50">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-blue via-brand-blue to-brand-red" />
          <svg className="w-5 h-5 text-slate-600 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or route... (e.g. Simulator, Twin, Fleet)"
            className="w-full bg-transparent font-sans text-sm text-[#0F172A] placeholder:text-slate-500 focus:outline-none font-medium"
          />
          <kbd className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 shadow-xs">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-slate-700 font-medium">
              No matching automotive telemetry modules found.
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate?.(item.path);
                  onClose?.(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-semibold text-slate-900 group-hover:text-brand-blue">
                    {item.label}
                  </span>
                </div>
                <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0B3D91] border border-blue-200">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
