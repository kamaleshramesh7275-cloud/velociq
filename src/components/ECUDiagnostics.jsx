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
    <Card className="p-3.5 sm:p-6 bg-white border border-line shadow-showroom flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
          <div>
            <SectionLabel label="OBD-II DIAGNOSTICS & ECU" />
            <h3 className="font-display text-lg font-bold text-text-hi mt-0.5 tracking-tight">
              Powertrain Fault Code Monitor
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {activeDTCs.length > 0 ? (
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border border-[#D7263D]/30 bg-[#D7263D]/10 text-[#D7263D]">
                MIL ALERT ({activeDTCs.length})
              </span>
            ) : (
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border border-[#0F9D6B]/30 bg-[#0F9D6B]/10 text-[#0F9D6B]">
                REGISTERS CLEAN
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Strip */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-bg-sunken font-mono text-xs font-bold text-slate-800 hover:border-slate-400 hover:bg-slate-200/80 transition disabled:opacity-50"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#0B3D91]' : ''}`} />
            <span>{isScanning ? `SCANNING (${scanProgress}%)` : 'SCAN REGISTERS'}</span>
          </button>

          <button
            type="button"
            onClick={onTriggerDTC}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            SIMULATE FAULT
          </button>

          {activeDTCs.length > 0 && (
            <button
              type="button"
              onClick={onClearDTCs}
              className="ml-auto px-3.5 py-2 rounded-xl border border-[#D7263D]/30 bg-[#D7263D]/10 font-mono text-xs font-bold text-[#D7263D] hover:bg-[#D7263D]/20 transition"
            >
              CLEAR FAULTS
            </button>
          )}
        </div>

        {/* Progress Bar during scan */}
        {isScanning && (
          <div className="mb-4 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden border border-line">
              <div className="h-full bg-[#0B3D91] transition-all duration-150" style={{ width: `${scanProgress}%` }} />
            </div>
            <span className="font-mono text-[10px] text-text-lo block text-right">
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
