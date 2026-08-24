import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createPoiIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};
const gasIcon = createPoiIcon('red');
const evIcon = createPoiIcon('green');

// Geofence Coordinates (Delhi Central)
export const GEOFENCE_COORDS = [
  [28.6300, 77.1900],
  [28.6300, 77.2300],
  [28.5900, 77.2300],
  [28.5900, 77.1900],
];

// Static POIs
const POI_STATIONS = [
  { id: 'g1', type: 'gas', lat: 28.6145, lon: 77.2095, name: 'Bharat Petroleum' },
  { id: 'g2', type: 'ev', lat: 28.6180, lon: 77.2150, name: 'Tata Power EV' },
  { id: 'g3', type: 'gas', lat: 28.6100, lon: 77.2050, name: 'IndianOil' },
  { id: 'g4', type: 'ev', lat: 28.6250, lon: 77.2200, name: 'ChargePoint Station' },
];

// Helper to calc distance (approx flat earth for small distances)
function getDistanceKM(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  const y = (lat2 - lat1);
  return Math.sqrt(x * x + y * y) * R * Math.PI / 180;
}

// Component to dynamically update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function RouteTracker({ route, speed, aiNavigatorEnabled, weather }) {
  const { startName, endName, progress, lat, lon, etaMinutes } = route;

  let isBadWeather = false;
  if (weather) {
     const code = weather.weathercode;
     if (code >= 51 || code === 45 || code === 48) {
       isBadWeather = true;
     }
  }

  // Filter POIs within 1.5km
  const visiblePOIs = useMemo(() => {
    return POI_STATIONS.filter(poi => getDistanceKM(lat, lon, poi.lat, poi.lon) <= 1.5);
  }, [lat, lon]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur flex flex-col h-[500px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Navigation</p>
          <h2 className="text-xl font-semibold text-white">Live GPS Route & ETA</h2>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${
          speed > 0 
            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 animate-pulse' 
            : 'bg-slate-800 text-slate-400 border-slate-700/30'
        }`}>
          {speed > 0 ? 'Transit Active' : 'Stationary'}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 flex flex-col flex-1 relative overflow-hidden">
        {/* Destination & ETA Stats */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-3 z-10 relative">
          <div>
            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Active Route</span>
            <div className="text-sm font-semibold text-white mt-0.5">
              {startName} ➜ <span className="text-cyan-400">{endName}</span>
            </div>
            {aiNavigatorEnabled && isBadWeather && (
               <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                 <svg className="h-3 w-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 AI Rerouting: Weather Avoidance
               </div>
            )}
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Estimated Arrival</span>
            <div className="text-lg font-bold text-white mt-0.5">
              {progress >= 100 
                ? 'Arrived' 
                : speed === 0 
                  ? 'Paused (No Speed)' 
                  : `${Math.ceil(etaMinutes)} mins remaining`
              }
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 rounded-xl overflow-hidden relative border border-slate-800/40 z-0">
          <MapContainer center={[lat, lon]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              className="map-tiles"
            />
            {/* Geofence */}
            <Polygon positions={GEOFENCE_COORDS} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1, weight: 2 }} />
            
            {/* Nearby POIs */}
            {visiblePOIs.map(poi => (
              <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={poi.type === 'gas' ? gasIcon : evIcon}>
                <Popup>{poi.name} ({poi.type.toUpperCase()})</Popup>
              </Marker>
            ))}

            {/* Vehicle Marker */}
            <Marker position={[lat, lon]}>
              <Popup>
                Current Speed: {speed.toFixed(1)} km/h
              </Popup>
            </Marker>
            <MapUpdater center={[lat, lon]} />
          </MapContainer>
        </div>

        {/* HUD over map */}
        <div className="absolute bottom-5 left-5 right-5 pointer-events-none z-10">
          <div className="grid grid-cols-2 gap-3 mb-3 pointer-events-auto">
            <div className="rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800/40 p-3">
              <p className="text-[10px] uppercase text-slate-400">Latitude</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-200">
                {lat.toFixed(6)}° N
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800/40 p-3">
              <p className="text-[10px] uppercase text-slate-400">Longitude</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-200">
                {lon.toFixed(6)}° E
              </p>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div className="bg-slate-900/80 backdrop-blur p-3 rounded-xl pointer-events-auto border border-slate-800/40">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Route progress:</span>
              <span className="font-semibold text-slate-200">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              {progress < 100 && progress > 0 && (
                <span 
                  className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white shadow-md animate-ping"
                  style={{ left: `calc(${progress}% - 4px)` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
