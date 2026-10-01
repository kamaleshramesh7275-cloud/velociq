import React from 'react';
import { AnalogDial } from './ui/AnalogDial';
import { WarningLight } from './ui/WarningLight';
import { PulseDot, ThermometerIcon, WindIcon } from './icons';

export default function TelemetryPanel({
  telemetry = {},
  isConnected = true,
  speedLimit = 90,
  activeDTCs = [],
}) {
  const {
    speed = 0,
    rpm = 0,
    coolant = 85.8,
    maf = 9.4,
    voltage = 13.9,
  } = telemetry;

  const isSpeedOverLimit = speed > speedLimit;
  const isCoolantAlert = coolant > 100;
  const isCheckEngine = activeDTCs && activeDTCs.length > 0;

  // Approximate gear from speed
  const currentGear = speed === 0 ? 'P' : speed < 25 ? 'D1' : speed < 45 ? 'D2' : speed < 65 ? 'D3' : speed < 85 ? 'D4' : 'D5';

  return (
    <div className="relative rounded-3xl p-1 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 shadow-[0_8px_30px_rgba(15,23,42,0.15)]">
      {/* Carbon-fiber Textured Dash Binnacle Behind Bezel (Permitted 10% dark hero) */}
      <div className="carbon-cluster rounded-[22px] p-6 text-white border border-slate-800/90 shadow-cluster flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Ambient Reflected Light Across Top of Cluster Glass */}
        <div className="pointer-events-none absolute -top-12 left-1/4 right-1/4 h-24 bg-gradient-to-b from-white/10 to-transparent rounded-full blur-md" />

        {/* Top Status Bar Inside Cluster */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs uppercase font-bold tracking-[0.2em] text-slate-400">
              INSTRUMENT BINNACLE
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-4">
            {/* Speed Limit Sign (Real European/International Circular Road Sign) */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">SIGN:</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#D7263D] bg-white text-slate-900 font-mono text-[11px] font-black shadow-sm">
                {speedLimit}
              </div>
            </div>

            {/* Live Streaming Indicator */}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 font-mono text-[10px] text-slate-300">
              <PulseDot color={isConnected ? 'emerald' : 'amber'} active={true} />
              <span>{isConnected ? 'CAN-BUS SYNC' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        {/* Dual Analog Dials & Center Warning Lamp Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-2">
          {/* Left: Speedometer Dial (Cols 1-5) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <AnalogDial
              value={speed}
              min={0}
              max={140}
              label="SPEED"
              unit="km/h"
              speedLimit={speedLimit}
              size={230}
              darkTheme={true}
              bands={[
                { from: 0, to: 55, color: '#0B3D91' },
                { from: 55, to: 65, color: '#0F9D6B' }, // Sweet Spot
                { from: 65, to: 80, color: '#1E88E5' },
                { from: 80, to: 100, color: '#F2A900' },
                { from: 100, to: 140, color: '#D7263D' }, // Redline
              ]}
              secondaryReadout={
                speed >= 55 && speed <= 65 ? 'SWEET SPOT' : isSpeedOverLimit ? 'SPEEDING' : null
              }
            />
          </div>

          {/* Center: Gear Readout & Dashboard Warning Lights (Cols 6-7) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center py-2 space-y-4">
            {/* Gear Indicator Window */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-2 shadow-inner">
              <span className="font-mono text-[8px] uppercase tracking-widest text-slate-400">GEAR</span>
              <span className="font-mono text-2xl font-black text-white tabular-nums tracking-wide">
                {currentGear}
              </span>
            </div>

            {/* Warning Light Matrix (Illuminates when DTC or issue is triggered) */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <WarningLight type="engine" active={isCheckEngine} color="amber" size={22} />
              <WarningLight type="oil" active={false} color="red" size={22} />
              <WarningLight type="battery" active={voltage < 12.8} color="red" size={22} />
              <WarningLight type="coolant" active={isCoolantAlert} color="red" size={22} />
              <WarningLight type="brake" active={isSpeedOverLimit} color="amber" size={22} />
              <WarningLight type="abs" active={false} color="amber" size={22} />
            </div>

            {/* Status Flag */}
            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border text-center ${
              isSpeedOverLimit
                ? 'bg-[#D7263D]/20 text-[#D7263D] border-[#D7263D]/40'
                : isCheckEngine
                ? 'bg-[#F2A900]/20 text-[#F2A900] border-[#F2A900]/40'
                : 'bg-[#0F9D6B]/20 text-[#0F9D6B] border-[#0F9D6B]/40'
            }`}>
              {isSpeedOverLimit ? 'LIMIT EXCEEDED' : isCheckEngine ? 'CHECK ENGINE' : 'POWERTRAIN NOMINAL'}
            </span>
          </div>

          {/* Right: Tachometer Dial (Cols 8-12) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <AnalogDial
              value={rpm}
              min={0}
              max={6000}
              label="TACHOMETER"
              unit="rpm"
              majorStep={1000}
              minorStep={200}
              size={230}
              darkTheme={true}
              bands={[
                { from: 0, to: 1500, color: '#64748B' },
                { from: 1500, to: 3200, color: '#0F9D6B' }, // Optimal powerband
                { from: 3200, to: 4500, color: '#1E88E5' },
                { from: 4500, to: 5200, color: '#F2A900' },
                { from: 5200, to: 6000, color: '#D7263D' }, // Redline
              ]}
              secondaryReadout={rpm > 4500 ? 'HIGH LOAD' : 'NOMINAL'}
            />
          </div>
        </div>

        {/* Lower Auxiliaries Bar Beneath Gauges */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Coolant */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <ThermometerIcon className={`w-4 h-4 ${isCoolantAlert ? 'text-[#D7263D]' : 'text-slate-400'}`} />
              <div>
                <span className="font-mono text-[9px] text-slate-400 uppercase block">COOLANT TEMP</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {coolant.toFixed(1)}°C
                </span>
              </div>
            </div>
            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
              isCoolantAlert ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-emerald-400'
            }`}>
              {isCoolantAlert ? 'OVERHEAT' : '85°C NORM'}
            </span>
          </div>

          {/* Mass Air Flow */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <WindIcon className="w-4 h-4 text-blue-400" />
              <div>
                <span className="font-mono text-[9px] text-slate-400 uppercase block">MASS AIR FLOW</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {maf.toFixed(1)} g/s
                </span>
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-300">
              ECU SENSOR
            </span>
          </div>

          {/* Voltage */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2">
              <PulseDot color="emerald" active={false} />
              <div>
                <span className="font-mono text-[9px] text-slate-400 uppercase block">12V BATTERY BUS</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  {voltage.toFixed(2)} V
                </span>
              </div>
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400">
              CHARGING
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
