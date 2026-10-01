import React, { useEffect } from 'react';
import { useFleet } from '../context/FleetContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Self-contained Vector SVG vehicle status glyphs (Zero external image dependencies)
const createStatusMarkerIcon = (status, isMonitored) => {
  const colorMap = {
    Active: { border: 'border-emerald-400', bg: 'bg-emerald-400', ping: 'bg-emerald-400/30' },
    Idle: { border: 'border-amber-400', bg: 'bg-amber-400', ping: '' },
    Maintenance: { border: 'border-rose-400', bg: 'bg-rose-400', ping: '' },
  };
  const cfg = colorMap[status] || colorMap.Idle;
  const monitoredClass = isMonitored ? 'ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.9)]' : 'shadow-lg';

  return L.divIcon({
    className: 'custom-fleet-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4">
        ${cfg.ping ? `<div class="absolute inset-0 rounded-full ${cfg.ping} animate-ping"></div>` : ''}
        <div class="relative w-7 h-7 rounded-full bg-slate-950 border-2 ${cfg.border} ${monitoredClass} flex items-center justify-center">
          <div class="w-3 h-3 rounded-full ${cfg.bg}"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Automatic Leaflet container dimension invalidator
function MapFix({ center }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    const t3 = setTimeout(() => map.invalidateSize(), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center?.[0], center?.[1], map]);

  return null;
}

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
          <div className="border-b border-slate-700 bg-slate-900/50 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Live Fleet Map</h2>
              <p className="text-xs text-slate-400">Real-time GPS telemetry of all regional fleet assets</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Idle</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Maintenance</span>
            </div>
          </div>
          <div className="h-[440px] w-full relative">
            <MapContainer 
              center={[28.6200, 77.2050]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', minHeight: '440px' }}
              zoomControl={true}
            >
              <MapFix center={[28.6200, 77.2050]} />
              {/* Clean Dark Canvas Basemap (100% Free, Zero Key, No Watermark) */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap'
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
                opacity={0.85}
              />
              {vehicles.map(v => {
                const isMonitored = v.id === activeVehicleId;
                const icon = createStatusMarkerIcon(v.status, isMonitored);
                return (
                  <Marker key={v.id} position={[v.lat || 28.6139, v.lon || 77.2090]} icon={icon}>
                    <Popup>
                      <div className="font-sans text-xs p-1">
                        <strong className="text-sm font-bold text-slate-900">{v.name}</strong><br />
                        <span className="font-mono text-slate-600 font-semibold">{v.licensePlate}</span><br />
                        <span className="text-slate-500">Status: </span>
                        <span className={`font-bold ${v.status === 'Active' ? 'text-emerald-600' : v.status === 'Idle' ? 'text-amber-600' : 'text-rose-600'}`}>
                          {v.status}
                        </span><br />
                        {isMonitored && <div className="mt-1 font-bold text-cyan-600">Currently Monitored in Telemetry</div>}
                        {!isMonitored && (
                          <button 
                            onClick={(e) => { e.preventDefault(); handleMonitor(v.id); }}
                            className="mt-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold px-3 py-1.5 text-xs text-white shadow-sm transition"
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
                          <option key={d.id} value={d.id}>{d.name} (Rating: {d.rating} / 5.0)</option>
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
