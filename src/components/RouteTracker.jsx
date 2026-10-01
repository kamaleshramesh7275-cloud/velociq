import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  DEFAULT_ROAD_COORDINATES, 
  DEFAULT_MANEUVERS, 
  interpolateRoadPosition,
  fetchLiveOsrmRoute
} from '../utils/osrmRouting';

// Fix Leaflet marker icon issue in Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Self-contained Vector SVG POI markers (No external URL dependencies)
const createPoiMarkerIcon = (type) => {
  const isGas = type === 'gas';
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div class="relative flex items-center justify-center w-7 h-7 -ml-3.5 -mt-3.5">
        <div class="w-6 h-6 rounded-full bg-slate-900 border ${isGas ? 'border-amber-400 text-amber-300' : 'border-emerald-400 text-emerald-300'} flex items-center justify-center shadow-md">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            ${isGas 
              ? '<path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.22v5.72c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>'
              : '<path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.5c.49 0 .73.3.4.78L11 21z"/>'
            }
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};
const gasIcon = createPoiMarkerIcon('gas');
const evIcon = createPoiMarkerIcon('ev');

// Custom Directional Vehicle Glyph with dynamic rotation
const createVehicleMarkerIcon = (headingDeg = 0) => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="transform: rotate(${headingDeg}deg); transition: transform 0.4s ease-out;" class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5">
        <div class="absolute inset-0 rounded-full bg-cyan-400/25 animate-ping"></div>
        <div class="relative w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center">
          <svg class="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Geofence Coordinates (Delhi Fleet Corridor: Connaught Place to IGI Airport)
export const GEOFENCE_COORDS = [
  [28.6450, 77.0800],
  [28.6450, 77.2400],
  [28.5400, 77.2400],
  [28.5400, 77.0800],
];

// Static POIs
const POI_STATIONS = [
  { id: 'g1', type: 'gas', lat: 28.6145, lon: 77.2095, name: 'Bharat Petroleum' },
  { id: 'g2', type: 'ev', lat: 28.6180, lon: 77.2150, name: 'Tata Power EV Hub' },
  { id: 'g3', type: 'gas', lat: 28.5835, lon: 77.1590, name: 'IndianOil Dhaula Kuan' },
  { id: 'g4', type: 'ev', lat: 28.5640, lon: 77.1210, name: 'Aerocity Supercharger' },
];

// Distance helper
function getDistanceKM(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  const y = (lat2 - lat1);
  return Math.sqrt(x * x + y * y) * R * Math.PI / 180;
}

// Center updater & dimension invalidator
function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 450);
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

// Available Map Tile Providers (100% Free, Zero Key, No Watermark)
const TILE_PROVIDERS = {
  esri_dark: {
    id: 'esri_dark',
    name: 'Esri Dark Canvas (No Key)',
    tag: 'Default Clean Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    refUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 16,
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap'
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap (No Key)',
    tag: 'Civic Standard Clean',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
  },
  esri_satellite: {
    id: 'esri_satellite',
    name: 'Esri Satellite (No Key)',
    tag: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
  },
  tomtom: {
    id: 'tomtom',
    name: 'TomTom Live Flow (Key)',
    tag: 'Free Key Traffic Layer',
    requiresKey: true,
    url: 'https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key={key}',
    trafficUrl: 'https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key={key}',
    subdomains: 'abc',
    maxZoom: 18,
    attribution: '&copy; <a href="https://tomtom.com">TomTom</a>'
  }
};

export default function RouteTracker({ route, speed, aiNavigatorEnabled, weather }) {
  const { startName, endName, progress, lat, lon, etaMinutes, heading = 0 } = route;

  // Map Provider selection state (auto-migrate legacy carto_ to esri_dark)
  const [activeProvider, setActiveProvider] = useState(() => {
    const saved = localStorage.getItem('velociq_map_provider');
    if (!saved || saved.startsWith('carto_')) {
      return 'esri_dark';
    }
    return saved;
  });

  const [tomtomApiKey, setTomtomApiKey] = useState(() => {
    return localStorage.getItem('velociq_tomtom_key') || '';
  });

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [roadCoordinates, setRoadCoordinates] = useState(DEFAULT_ROAD_COORDINATES);

  // Fetch real road route geometry from OSRM on load
  useEffect(() => {
    let isMounted = true;
    const loadRoute = async () => {
      const res = await fetchLiveOsrmRoute([28.6315, 77.2167], [28.5562, 77.1000]);
      if (isMounted && res.coordinates && res.coordinates.length > 5) {
        setRoadCoordinates(res.coordinates);
      }
    };
    loadRoute();
    return () => { isMounted = false; };
  }, []);

  // Filter POIs within 2.5km of active vehicle location
  const visiblePOIs = useMemo(() => {
    return POI_STATIONS.filter(poi => getDistanceKM(lat, lon, poi.lat, poi.lon) <= 2.5);
  }, [lat, lon]);

  // Current road path slice (traveled vs remaining)
  const { traveledPath, remainingPath } = useMemo(() => {
    const splitIndex = Math.max(1, Math.floor((progress / 100) * roadCoordinates.length));
    return {
      traveledPath: roadCoordinates.slice(0, splitIndex),
      remainingPath: roadCoordinates.slice(Math.max(0, splitIndex - 1))
    };
  }, [progress, roadCoordinates]);

  // Active upcoming maneuver
  const currentManeuver = useMemo(() => {
    const next = DEFAULT_MANEUVERS.find(m => m.atProgress >= progress) || DEFAULT_MANEUVERS[DEFAULT_MANEUVERS.length - 1];
    return next;
  }, [progress]);

  // Handle provider switch
  const handleSelectProvider = (key) => {
    if (key === 'tomtom' && !tomtomApiKey) {
      setShowKeyModal(true);
      return;
    }
    setActiveProvider(key);
    localStorage.setItem('velociq_map_provider', key);
  };

  const handleSaveTomtomKey = (keyVal) => {
    const trimmed = keyVal.trim();
    setTomtomApiKey(trimmed);
    localStorage.setItem('velociq_tomtom_key', trimmed);
    if (trimmed) {
      setActiveProvider('tomtom');
      localStorage.setItem('velociq_map_provider', 'tomtom');
    }
    setShowKeyModal(false);
  };

  // Resolve tile layer URL
  const selectedTileConfig = TILE_PROVIDERS[activeProvider] || TILE_PROVIDERS.carto_dark;
  const tileUrl = selectedTileConfig.requiresKey
    ? selectedTileConfig.url.replace('{key}', tomtomApiKey)
    : selectedTileConfig.url;

  const vehicleMarkerIcon = useMemo(() => createVehicleMarkerIcon(heading), [heading]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur flex flex-col min-h-[580px]">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400 font-semibold">Real-Road GPS Telematics</p>
          <h2 className="text-xl font-bold text-white">Live Expressway Navigation</h2>
        </div>

        {/* Top Controls: Tile Switcher & Status */}
        <div className="flex items-center gap-2">
          {/* Map Layer Switcher Dropdown */}
          <div className="relative">
            <select
              value={activeProvider}
              onChange={(e) => handleSelectProvider(e.target.value)}
              className="appearance-none rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-1.5 pr-8 text-xs font-bold text-slate-200 outline-none transition focus:border-cyan-400 cursor-pointer"
            >
              <option value="esri_dark">Esri Dark Canvas (No Key)</option>
              <option value="osm">OpenStreetMap Standard (No Key)</option>
              <option value="esri_satellite">Esri Satellite (No Key)</option>
              <option value="tomtom">TomTom Traffic Flow (Key)</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            title="Configure Map API Keys"
            className="p-2 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            speed > 0 
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 animate-pulse' 
              : 'bg-slate-800 text-slate-400 border-slate-700/30'
          }`}>
            {speed > 0 ? 'Transit Active' : 'Stationary'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-4 flex flex-col flex-1 relative overflow-hidden">
        {/* Turn-by-Turn Navigation Strip */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-3 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Next Maneuver ({currentManeuver.distMeters}m)</span>
              <p className="text-sm font-extrabold text-white">
                {currentManeuver.instruction}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase text-slate-500 tracking-wider">Dynamic ETA</span>
            <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
              {progress >= 100 
                ? 'Arrived at Destination' 
                : speed === 0 
                  ? 'Paused (Stationary)' 
                  : `${Math.ceil(etaMinutes)} mins remaining`
              }
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 rounded-xl overflow-hidden relative border border-slate-800/40 z-0 min-h-[420px] h-[420px] w-full">
          <MapContainer 
            center={[lat, lon]} 
            zoom={13} 
            style={{ height: '100%', width: '100%', minHeight: '420px' }} 
            zoomControl={false}
          >
            {/* Active Base Map Layer */}
            <TileLayer
              key={activeProvider}
              attribution={selectedTileConfig.attribution}
              url={tileUrl}
              subdomains={selectedTileConfig.subdomains || 'abc'}
              maxZoom={selectedTileConfig.maxZoom || 18}
              className="map-tiles"
            />

            {/* Clean Esri Dark Canvas Reference Labels Layer */}
            {activeProvider === 'esri_dark' && (
              <TileLayer
                url={TILE_PROVIDERS.esri_dark.refUrl}
                maxZoom={16}
                opacity={0.85}
              />
            )}

            {/* Optional TomTom Live Traffic Flow Overlay if Key is provided */}
            {activeProvider === 'tomtom' && tomtomApiKey && (
              <TileLayer
                url={TILE_PROVIDERS.tomtom.trafficUrl.replace('{key}', tomtomApiKey)}
                opacity={0.7}
              />
            )}

            {/* Geofence Boundary */}
            <Polygon positions={GEOFENCE_COORDS} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 1.5, dashArray: '5 5' }} />

            {/* Complete Planned Road Polyline (Cyan Glow) */}
            <Polyline 
              positions={roadCoordinates} 
              pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.45 }} 
            />

            {/* Traveled Highway Polyline (Solid Emerald) */}
            {traveledPath.length > 1 && (
              <Polyline 
                positions={traveledPath} 
                pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }} 
              />
            )}
            
            {/* Nearby POIs */}
            {visiblePOIs.map(poi => (
              <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={poi.type === 'gas' ? gasIcon : evIcon}>
                <Popup>
                  <div className="font-sans text-xs">
                    <span className="font-bold">{poi.name}</span>
                    <span className="block text-slate-500 font-mono uppercase text-[9px] mt-0.5">{poi.type} Station</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Directional Heading Vehicle Marker */}
            <Marker position={[lat, lon]} icon={vehicleMarkerIcon}>
              <Popup>
                <div className="font-sans text-xs p-1">
                  <div className="font-bold text-slate-900">Fleet Transport Unit #01</div>
                  <div className="text-cyan-700 font-mono font-semibold mt-1">Velocity: {speed.toFixed(1)} km/h</div>
                  <div className="text-slate-600 font-mono text-[10px]">Bearing: {heading}° Azimuth</div>
                  <div className="text-emerald-700 font-bold mt-1">Route Progress: {Math.round(progress)}%</div>
                </div>
              </Popup>
            </Marker>

            <MapUpdater center={[lat, lon]} />
          </MapContainer>
        </div>

        {/* Live HUD telemetry over map */}
        <div className="absolute bottom-5 left-5 right-5 pointer-events-none z-10">
          <div className="grid grid-cols-3 gap-2 mb-2 pointer-events-auto">
            <div className="rounded-xl bg-slate-900/85 backdrop-blur border border-slate-800/60 p-2.5">
              <p className="text-[9px] uppercase font-bold text-slate-400">Position</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-slate-200 truncate">
                {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/85 backdrop-blur border border-slate-800/60 p-2.5">
              <p className="text-[9px] uppercase font-bold text-slate-400">Bearing</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-cyan-300">
                {heading}° ({heading <= 45 || heading >= 315 ? 'North' : heading <= 135 ? 'East' : heading <= 225 ? 'South' : 'West'})
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/85 backdrop-blur border border-slate-800/60 p-2.5">
              <p className="text-[9px] uppercase font-bold text-slate-400">Road Corridor</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-emerald-400 truncate">
                {currentManeuver.street}
              </p>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div className="bg-slate-900/85 backdrop-blur p-2.5 rounded-xl pointer-events-auto border border-slate-800/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Expressway progress:</span>
              <span className="font-semibold text-slate-200">{Math.round(progress)}% ({ (progress * 0.248).toFixed(1) } / 24.8 km)</span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Free API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Live Fleet Map & Traffic Settings</h3>
                <p className="text-xs text-slate-400">Configure map tile providers and free developer keys.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-300">
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                <span className="font-bold text-cyan-400">Default Keyless Provider: </span>
                <span>CartoDB Dark Matter & OpenStreetMap operate with 100% free unlimited requests without any key.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1" htmlFor="tomtom-key">
                  TomTom Developer Key (For Live Traffic Congestion Flow)
                </label>
                <input
                  id="tomtom-key"
                  type="text"
                  placeholder="Paste your free TomTom key here..."
                  value={tomtomApiKey}
                  onChange={(e) => setTomtomApiKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Get a free key at <a href="https://developer.tomtom.com/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">developer.tomtom.com</a> (2,500 free calls/day, no credit card required).
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveTomtomKey(tomtomApiKey)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition shadow-md"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
