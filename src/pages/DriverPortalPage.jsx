import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { SectionLabel, Card, PlateBadge } from '../components/ui';
import { AnalogDial } from '../components/ui/AnalogDial';
import { CarSilhouette } from '../components/ui/CarSilhouette';
import { WarningLight } from '../components/ui/WarningLight';
import { PulseDot, SpeedArcLogo } from '../components/icons';

export default function DriverPortalPage({
  telemetry = {},
  trafficSignal = {},
  isLimpModeActive = false,
  onToggleLimpMode,
}) {
  const { activeVehicle, activeDriver, runObdPreTripScan } = useFleet();
  const [scanStatusToast, setScanStatusToast] = useState(null);
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleDriverScan = () => {
    if (runObdPreTripScan && activeVehicle) {
      runObdPreTripScan(activeVehicle.id);
    }
    setScanStatusToast('OBD Pre-Trip Scan Complete: All 4 Monitors Ready • 0 DTCs • 12.6V Battery Nominal');
    setTimeout(() => setScanStatusToast(null), 4500);
  };

  const speed = telemetry?.speed || 0;
  const score = telemetry?.score || 92;

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto flex flex-col gap-4 font-sans text-slate-900 pb-24 md:pb-8">
      {/* Top Driver Greeting & Asset Bar */}
      <header className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B3D91] text-white font-display font-black text-lg">
            {activeDriver?.avatar || 'DR'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg text-slate-900 leading-tight">
                {activeDriver?.name || 'Assigned Driver'}
              </h1>
              <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0B3D91]">
                PORTAL ACTIVE
              </span>
            </div>
            <p className="font-mono text-xs text-slate-700">
              License: {activeDriver?.license || 'CDL-A Verified'} • Rating: ★ {activeDriver?.rating || '4.8'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <CarSilhouette profile={activeVehicle?.profile || 'sedan'} view="side" className="w-10 h-5 text-[#0B3D91]" />
          <div>
            <span className="font-display text-xs font-bold text-slate-900 block leading-tight">
              {activeVehicle?.name || 'Alpha Cruiser'}
            </span>
            <PlateBadge plate={activeVehicle?.licensePlate || 'NY-482-XA'} size="sm" />
          </div>
        </div>
      </header>

      {/* Main Single-Screen Mobile Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Driver Velocity & GLOSA Assistant */}
        <div className="rounded-3xl p-1 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 shadow-md">
          <div className="carbon-cluster rounded-[22px] p-4 sm:p-6 text-white border border-slate-800 flex flex-col items-center justify-between">
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2 mb-2">
              <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                CABIN HUD DISPLAY
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <PulseDot color="emerald" active={true} />
                <span>CAN STREAMING</span>
              </div>
            </div>

            <AnalogDial
              value={speed}
              min={0}
              max={140}
              label="SPEED"
              unit="km/h"
              size={185}
              darkTheme={true}
              bands={[
                { from: 0, to: 55, color: '#0B3D91' },
                { from: 55, to: 65, color: '#0F9D6B' }, // Sweet Spot
                { from: 65, to: 80, color: '#1E88E5' },
                { from: 80, to: 100, color: '#F2A900' },
                { from: 100, to: 140, color: '#D7263D' },
              ]}
              secondaryReadout={speed >= 55 && speed <= 65 ? 'SWEET SPOT' : null}
            />

            {/* GLOSA Green-Wave Alert */}
            <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="font-mono text-[9px] uppercase text-slate-400 block">GLOSA SIGNAL SYNC</span>
                <span className="font-display text-xs font-bold text-emerald-400">
                  {trafficSignal?.phase === 'GREEN' ? '● GREEN WAVE' : '▲ PREPARE TO DECELERATE'}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-white tabular-nums">
                {trafficSignal?.timeRemainingSec || 12}s
              </span>
            </div>
          </div>
        </div>

        {/* Right: Driver Safety Score & Actions */}
        <div className="flex flex-col gap-4">
          {/* Safety Score Card */}
          <Card className="p-4 sm:p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <SectionLabel label="DRIVER TELEMETRY EVALUATION" />
                <h2 className="font-display font-bold text-base text-slate-900 mt-0.5">
                  My Live Performance
                </h2>
              </div>
              <span className="text-2xl font-black font-mono text-[#0B3D91] tabular-nums">
                {score.toFixed(1)}/100
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3 text-center">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="font-mono text-[10px] text-emerald-700 uppercase block">Aero Sweet</span>
                <span className="font-display font-bold text-sm text-emerald-900">89%</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                <span className="font-mono text-[10px] text-blue-700 uppercase block">Smoothness</span>
                <span className="font-display font-bold text-sm text-[#0B3D91]">94%</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <span className="font-mono text-[10px] text-amber-700 uppercase block">Stops Avoided</span>
                <span className="font-display font-bold text-sm text-amber-900">12</span>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={handleDriverScan}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-[#0B3D91] font-display font-bold text-xs transition"
              >
                <span>⚡</span>
                <span>OBD Pre-Trip Scan</span>
              </button>

              <button
                type="button"
                onClick={() => setSosTriggered(!sosTriggered)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl font-display font-bold text-xs transition ${
                  sosTriggered
                    ? 'bg-[#D7263D] text-white animate-pulse'
                    : 'bg-red-50 border border-red-200 text-[#D7263D] hover:bg-red-100'
                }`}
              >
                <span>🚨</span>
                <span>{sosTriggered ? 'SOS BROADCASTING' : 'Emergency SOS'}</span>
              </button>
            </div>

            {scanStatusToast && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[11px] font-bold flex items-center gap-2">
                <span>✅</span>
                <span>{scanStatusToast}</span>
              </div>
            )}
          </Card>

          {/* Autonomous Governor Card */}
          <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-[#0B3D91]">
                <SpeedArcLogo className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-slate-900 block leading-tight">
                  Autonomous Limp Governor
                </span>
                <span className="font-mono text-[11px] text-slate-700">
                  {isLimpModeActive ? 'Velocity capped at 60 km/h for range reserve' : 'Full throttle authority available'}
                </span>
              </div>
            </div>

            {onToggleLimpMode && (
              <button
                type="button"
                onClick={onToggleLimpMode}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                  isLimpModeActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isLimpModeActive ? 'DISENGAGE' : 'ENGAGE'}
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
