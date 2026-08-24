import { useFleet } from '../context/FleetContext';
import { useNavigate } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for status
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};
const activeIcon = createIcon('green');
const idleIcon = createIcon('orange');
const maintIcon = createIcon('red');

export default function FleetManager() {
  const { vehicles, drivers, assignments, assignDriver, removeDriver, setVehicleStatus, monitorVehicle, activeVehicleId } = useFleet();
  const navigate = useNavigate();

  const handleMonitor = (vehicleId) => {
    monitorVehicle(vehicleId);
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),linear-gradient(135deg,#020617_0%,#030712_100%)] p-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Fleet Garage</h1>
            <p className="mt-2 text-slate-400">Manage vehicles, monitor statuses, and assign drivers.</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-center">
              <div className="text-sm text-slate-400">Total Vehicles</div>
              <div className="text-xl font-semibold text-white">{vehicles.length}</div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-center">
              <div className="text-sm text-slate-400">Active Drivers</div>
              <div className="text-xl font-semibold text-white">{Object.keys(assignments).length} / {drivers.length}</div>
            </div>
          </div>
        </header>

        {/* Multi-Vehicle Map */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/40 shadow-2xl backdrop-blur">
          <div className="border-b border-slate-700 bg-slate-900/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Live Fleet Map</h2>
          </div>
          <div className="h-[400px] w-full">
            <MapContainer center={[28.6200, 77.2050]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {vehicles.map(v => {
                const isMonitored = v.id === activeVehicleId;
                const icon = v.status === 'Active' ? activeIcon : v.status === 'Idle' ? idleIcon : maintIcon;
                return (
                  <Marker key={v.id} position={[v.lat || 28.6139, v.lon || 77.2090]} icon={icon}>
                    <Popup>
                      <div className="font-sans">
                        <strong className="text-slate-800">{v.name}</strong><br />
                        <span className="text-slate-500">{v.licensePlate}</span><br />
                        Status: {v.status}<br />
                        {isMonitored && <span className="font-bold text-emerald-600">Currently Monitored</span>}
                        {!isMonitored && (
                          <button 
                            onClick={(e) => { e.preventDefault(); handleMonitor(v.id); }}
                            className="mt-2 rounded bg-cyan-600 px-3 py-1 text-xs text-white"
                          >
                            Monitor Live
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Vehicles Grid */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-3">Vehicle Roster</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.map((v) => {
                const driverId = assignments[v.id];
                const driver = drivers.find((d) => d.id === driverId);

                return (
                  <div key={v.id} className="flex flex-col rounded-2xl border border-slate-700 bg-slate-800/40 p-5 backdrop-blur transition hover:border-cyan-500/30 hover:bg-slate-800/60">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-white">{v.name}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${
                            v.status === 'Active' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                            v.status === 'Idle' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' :
                            'border-rose-500/30 bg-rose-500/10 text-rose-300'
                          }`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{v.type} • {v.licensePlate} • {v.mileage.toLocaleString()} mi</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-1 flex-col justify-end">
                      <label className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Driver</label>
                      <select
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        value={driverId || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            assignDriver(v.id, e.target.value);
                            setVehicleStatus(v.id, 'Active');
                          } else {
                            removeDriver(v.id);
                            setVehicleStatus(v.id, 'Idle');
                          }
                        }}
                      >
                        <option value="">-- No Driver Assigned --</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.rating} ⭐)</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-5 border-t border-slate-700 pt-5">
                      <button
                        onClick={() => handleMonitor(v.id)}
                        disabled={!driver}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Monitor Live Telemetry
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drivers Sidebar List */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-3">Available Drivers</h2>
            <div className="flex flex-col gap-3">
              {drivers.map(d => {
                const assignedVehicle = vehicles.find(v => assignments[v.id] === d.id);
                return (
                  <div key={d.id} className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/40 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                      {d.avatar}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="truncate font-medium text-slate-200">{d.name}</div>
                      <div className="truncate text-xs text-slate-400">Rating: {d.rating} ⭐ • Exp: {d.experience}</div>
                    </div>
                    {assignedVehicle ? (
                      <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                        Assigned
                      </span>
                    ) : (
                      <span className="rounded-lg bg-slate-700 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Available
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
