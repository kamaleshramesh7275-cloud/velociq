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

  return (
    <>
      <section className="flex flex-col gap-4 border-t border-[#DDE2EA] pt-4">
        <div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#0B3D91] font-bold">Simulation</p>
          <h2 className="text-sm font-heading font-bold text-[#0F172A]">ESP32 & Speed Governor</h2>
        </div>

        <div className="flex flex-col gap-3">
          {/* BLE Connection Switch */}
          <div className="rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] p-3 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-xs font-heading font-bold text-[#0F172A]">Hardware Telemetry Stream</h3>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-[11px] font-mono font-bold ${isConnected ? 'text-[#047857]' : 'text-slate-600'}`}>
                {isConnected ? '● BLE Connected' : '○ Standalone Mode'}
              </span>
              <button
                type="button"
                onClick={() => setIsConnected(!isConnected)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 outline-none ${
                  isConnected ? 'bg-[#047857]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-300 ${
                    isConnected ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Speed Limit Adjuster */}
          <div className="rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] p-3 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="text-xs font-heading font-bold text-[#0F172A]">Cruise Speed Governor</h3>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-bold mb-1">
                <span>Governed Limit:</span>
                <span className="font-bold text-[#0B3D91]">{speedLimit} km/h</span>
              </div>
              <input
                type="range"
                min="50"
                max="140"
                step="5"
                value={speedLimit}
                onChange={(e) => setSpeedLimit(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#0B3D91]"
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

