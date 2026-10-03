import React, { useState } from 'react';
import { Card, SectionLabel, SeverityBadge, WarningLight } from './ui';
import { CheckCircleIcon, RefreshIcon } from './icons';

const dtcLookup = {
  P0300: { name: 'Random/Multiple Misfire', desc: 'Random cylinder misfire detected in Bank 1. Rough idle & catalytic stress.', severity: 'HIGH', icon: 'engine' },
  P0171: { name: 'System Too Lean (Bank 1)', desc: 'Fuel trim exceeds +22% lean threshold. Suspect intake vacuum leak.', severity: 'MEDIUM', icon: 'fuel' },
  P0420: { name: 'Catalyst Efficiency Below Threshold', desc: 'Downstream O2 sensor indicates low catalytic conversion efficiency.', severity: 'MEDIUM', icon: 'engine' },
};

export default function ECUDiagnostics({ activeDTCs = [], onClearDTCs, onTriggerDTC }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  return (
    <Card className="p-4 sm:p-6 aerogel-card border border-slate-200/90 shadow-lg flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                CAN-FD BUS CONTROLLER
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
              Powertrain Fault Code & Network Topology
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {activeDTCs.length > 0 ? (
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300 bg-rose-50 text-rose-700 shadow-2xs">
                MIL ACTIVE ({activeDTCs.length})
              </span>
            ) : (
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 shadow-2xs">
                ALL BUSES NOMINAL
              </span>
            )}
          </div>
        </div>

        {/* Interactive Controller Network Topology Strip */}
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-[10.5px] uppercase font-bold text-slate-600 tracking-wider">
              HIGH-SPEED 500 KBPS CAN-FD NETWORK NODES
            </span>
            <span className="font-mono text-[9px] text-slate-500 font-bold">MODE $03 DIAGNOSTIC STREAM</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'ECM', name: 'Engine Module', status: activeDTCs.length > 0 ? 'ALERT' : 'OK', color: activeDTCs.length > 0 ? 'rose' : 'emerald' },
              { id: 'TCM', name: 'Transmission', status: 'OK', color: 'emerald' },
              { id: 'ABS', name: 'Brake Stability', status: 'OK', color: 'emerald' },
              { id: 'BCM', name: 'Body Controller', status: 'OK', color: 'emerald' },
            ].map(node => (
              <div key={node.id} className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${node.color === 'rose' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                  <span className="font-mono text-xs font-black text-slate-800">{node.id}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-0.5">{node.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live CAN-Bus Differential Waveform Oscilloscope Screen */}
        <div className="mb-4 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="font-display text-[10.5px] uppercase font-bold tracking-wider text-slate-700">
                CAN-H / CAN-L DIFFERENTIAL SIGNAL OSCILLOSCOPE
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[9.5px]">
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B3D91] font-bold border border-blue-200">
                CH1: CAN-H (3.5V)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                CH2: CAN-L (1.5V)
              </span>
            </div>
          </div>

          {/* Oscilloscope Grid Canvas Container */}
          <div className="relative w-full h-24 rounded-xl bg-slate-900 border border-slate-700 p-1 overflow-hidden">
            {/* Graticule Reticle Lines */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)',
                backgroundSize: '24px 16px'
              }}
            />
            {/* Live Waveform SVG */}
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 80">
              {/* CAN-H Trace (Cyan) */}
              <path
                d="M 0,30 L 30,30 L 35,16 L 65,16 L 70,30 L 105,30 L 110,16 L 135,16 L 140,30 L 180,30 L 185,16 L 210,16 L 215,30 L 255,30 L 260,16 L 290,16 L 295,30 L 335,30 L 340,16 L 375,16 L 380,30 L 400,30"
                fill="none"
                stroke="#00C0F0"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-pulse"
              />
              {/* CAN-L Trace (Emerald) */}
              <path
                d="M 0,50 L 30,50 L 35,64 L 65,64 L 70,50 L 105,50 L 110,64 L 135,64 L 140,50 L 180,50 L 185,64 L 210,64 L 215,50 L 255,50 L 260,64 L 290,64 L 295,50 L 335,50 L 340,64 L 375,64 L 380,50 L 400,50"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-1 right-2 font-mono text-[8px] text-cyan-400 font-bold">
              TIMEBASE: 25 μs/DIV • AUTO TRIGGER
            </div>
          </div>
        </div>

        {/* Action Controls Strip */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 font-mono text-xs font-bold text-[#0B3D91] hover:bg-blue-100 transition disabled:opacity-50 shadow-2xs"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#0B3D91]' : ''}`} />
            <span>{isScanning ? `SCANNING (${scanProgress}%)` : 'POLL CAN BUS'}</span>
          </button>

          <button
            type="button"
            onClick={onTriggerDTC}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white font-mono text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            INJECT FAULT
          </button>

          {activeDTCs.length > 0 && (
            <button
              type="button"
              onClick={onClearDTCs}
              className="ml-auto px-3.5 py-1.5 rounded-xl border border-rose-300 bg-rose-50 font-mono text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs"
            >
              CLEAR DTC CODES
            </button>
          )}
        </div>

        {/* Progress Bar during scan */}
        {isScanning && (
          <div className="mb-4 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
              <div className="h-full bg-[#0B3D91] transition-all duration-150" style={{ width: `${scanProgress}%` }} />
            </div>
            <span className="font-mono text-[10px] text-slate-500 block text-right">
              Querying CAN-Bus OBD Mode $03 Diagnostic Registers...
            </span>
          </div>
        )}

        {/* DTC Table / List */}
        <div className="space-y-2.5">
          {activeDTCs.length === 0 ? (
            <div className="p-6 rounded-xl border border-line bg-bg-sunken/40 text-center font-mono text-xs text-text-lo flex flex-col items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-[#0F9D6B] mb-2" />
              <span className="text-text-hi font-bold text-sm">ECU Diagnostic Registers Clean</span>
              <span className="text-[11px] mt-0.5">All monitored powertrain PIDs report within normal OEM baseline thresholds.</span>
            </div>
          ) : (
            activeDTCs.map((code) => {
              const dtc = dtcLookup[code] || { name: 'Unknown DTC', desc: 'Diagnostic fault record.', severity: 'LOW', icon: 'engine' };
              return (
                <div
                  key={code}
                  className="p-3.5 rounded-xl border border-slate-200 bg-bg-sunken/40 flex items-start gap-3"
                >
                  <WarningLight type={dtc.icon || 'engine'} active={true} color="red" size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Plate-style chip */}
                        <span className="font-mono text-xs font-black tracking-wider text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-400 shadow-xs">
                          {code}
                        </span>
                        <span className="font-display text-sm font-bold text-text-hi">{dtc.name}</span>
                      </div>
                      <SeverityBadge severity={dtc.severity} />
                    </div>
                    <p className="font-mono text-[11px] text-text-mid mt-1">{dtc.desc}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
