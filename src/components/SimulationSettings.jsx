import React, { useState } from 'react';
import VehicleGarageModal from './VehicleGarageModal';

const profiles = [
  { id: 'sedan', name: 'Sports Sedan', desc: 'Higher RPM range, moderate mileage' },
  { id: 'hatchback', name: 'Eco Hatchback', desc: 'Low fuel consumption, conservative RPM' },
  { id: 'suv', name: 'Heavy SUV', desc: 'High fuel consumption, higher air flow' }
];

export default function SimulationSettings({
  isConnected,
  setIsConnected,
  vehicleProfile,
  setVehicleProfile,
  speedLimit,
  setSpeedLimit
}) {
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const activeProfile = profiles.find((p) => p.id === vehicleProfile) || profiles[0];

  return (
    <>
      <section className="flex flex-col gap-4 border-t border-slate-800 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Simulation</p>
          <h2 className="text-sm font-semibold text-white">ESP32 & Tuning</h2>
        </div>

        <div className="flex flex-col gap-3">
          {/* BLE Connection Switch */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-300">Hardware Stream</h3>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-[10px] font-medium ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isConnected ? 'BLE Connected' : 'BLE Disconnected'}
              </span>
              <button
                type="button"
                onClick={() => setIsConnected(!isConnected)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 outline-none ${
                  isConnected ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-slate-950 transition-transform duration-300 ${
                    isConnected ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Speed Limit Adjuster */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-300">Speed Limit</h3>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Limit: <span className="font-semibold text-cyan-400">{speedLimit} km/h</span></span>
              </div>
              <input
                type="range"
                min="50"
                max="140"
                step="5"
                value={speedLimit}
                onChange={(e) => setSpeedLimit(Number(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
              />
            </div>
          </div>
        </div>
      </section>

      <VehicleGarageModal 
        isOpen={isGarageOpen} 
        onClose={() => setIsGarageOpen(false)} 
        selectedProfile={vehicleProfile} 
        onSelectProfile={setVehicleProfile} 
      />
    </>
  );
}
