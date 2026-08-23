import React from 'react';

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
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Simulation Control Panel</p>
        <h2 className="text-xl font-semibold text-white">ESP32 & ECU Tuning</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* BLE Connection Switch */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">ESP32 Hardware Stream</h3>
            <p className="mt-1 text-xs text-slate-500">Enable or disable simulated Bluetooth Low Energy data broadcast.</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isConnected ? 'BLE Connected' : 'BLE Disconnected'}
            </span>
            <button
              type="button"
              onClick={() => setIsConnected(!isConnected)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 outline-none ${
                isConnected ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform duration-300 ${
                  isConnected ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Vehicle Profile Selection */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold text-slate-300">Vehicle Profile</h3>
          <p className="mt-1 text-xs text-slate-500">Alters baseline telemetry calculations (RPM range, MAF, and economy).</p>
          <div className="mt-3">
            <select
              value={vehicleProfile}
              onChange={(e) => setVehicleProfile(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] text-slate-400 italic">
              {profiles.find((p) => p.id === vehicleProfile)?.desc}
            </p>
          </div>
        </div>

        {/* Speed Limit Adjuster */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Speed Limit Threshold</h3>
            <p className="mt-1 text-xs text-slate-500">Triggers visual alerts & speed penalty event when exceeded.</p>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Limit: <span className="font-semibold text-cyan-400">{speedLimit} km/h</span></span>
            </div>
            <input
              type="range"
              min="50"
              max="140"
              step="5"
              value={speedLimit}
              onChange={(e) => setSpeedLimit(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
