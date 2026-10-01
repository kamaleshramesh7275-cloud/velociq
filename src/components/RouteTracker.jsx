import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  DEFAULT_ROAD_COORDINATES, 
  DEFAULT_MANEUVERS, 
  GEOFENCE_COORDS,
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

// Custom Directional Vehicle Glyph with dynamic rotation and top-view car SVG
const createVehicleMarkerIcon = (headingDeg = 0) => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="transform: rotate(${headingDeg}deg); transition: transform 0.4s ease-out;" class="relative flex items-center justify-center w-12 h-12 -ml-6 -mt-6">
        <div class="absolute inset-0 rounded-full bg-[#1E88E5]/25 animate-ping"></div>
        <div class="relative w-9 h-9 rounded-full bg-white border-2 border-[#0B3D91] shadow-md flex items-center justify-center">
          <svg class="w-5 h-5 text-[#0B3D91]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};


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
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  useEffect(() => {
    if (center && typeof center[0] === 'number' && typeof center[1] === 'number' && !isNaN(center[0]) && !isNaN(center[1])) {
      // Use panTo with animate: false to prevent Leaflet animation queue thrashing at 300ms intervals
      map.panTo(center, { animate: false });
    }
  }, [center?.[0], center?.[1], map]);

  return null;
}

// Available Map Tile Providers (100% Free, Zero Key, No Watermark)
// Default is Esri World Light Gray Canvas per showroom precision spec
const TILE_PROVIDERS = {
  esri_light: {
    id: 'esri_light',
    name: 'Esri World Light Gray Canvas',
    tag: 'Default Light Gray',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    refUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
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
  const { 
    startName = 'Fleet Hub (Connaught Place)', 
    endName = 'Airport Cargo Terminal (IGI)', 
    progress = 0, 
    lat = 28.6315, 
    lon = 77.2167, 
    etaMinutes = 30, 
    heading = 0 
  } = route || {};

  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 28.6315;
  const safeLon = typeof lon === 'number' && !isNaN(lon) ? lon : 77.2167;
  const safeSpeed = typeof speed === 'number' && !isNaN(speed) ? speed : 0;
  const safeProgress = typeof progress === 'number' && !isNaN(progress) ? progress : 0;
  const safeEta = typeof etaMinutes === 'number' && !isNaN(etaMinutes) ? etaMinutes : 30;

  // Map Provider selection state (defaults to esri_light)
  const [activeProvider, setActiveProvider] = useState(() => {
    const saved = localStorage.getItem('velociq_map_provider');
    if (saved && TILE_PROVIDERS[saved]) {
      return saved;
    }
    return 'esri_light';
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

  // Resolve tile layer URL safely with fallback
  const selectedTileConfig = (activeProvider && TILE_PROVIDERS[activeProvider]) || TILE_PROVIDERS.esri_light;
  const tileUrl = selectedTileConfig.requiresKey
    ? selectedTileConfig.url.replace('{key}', tomtomApiKey)
    : selectedTileConfig.url;

  const vehicleMarkerIcon = useMemo(() => createVehicleMarkerIcon(heading), [heading]);

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm flex flex-col min-h-[580px]">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#0B3D91] font-heading font-bold">Real-Road GPS Telematics</p>
          <h2 className="text-xl font-bold text-text-hi font-heading">Live Expressway Navigation</h2>
        </div>

        {/* Top Controls: Tile Switcher & Status */}
        <div className="flex items-center gap-2">
          {/* Map Layer Segmented Control (Light / Street / Satellite / Traffic) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line">
            {[
              { id: 'esri_light', label: 'Light' },
              { id: 'osm', label: 'Street' },
              { id: 'esri_satellite', label: 'Satellite' },
              { id: 'tomtom', label: 'Traffic' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProvider(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeProvider === p.id
                    ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                    : 'text-text-mid hover:text-text-hi'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            title="Configure Map API Keys"
            className="p-1.5 rounded-xl border border-line bg-slate-50 text-text-lo hover:text-[#0B3D91] hover:border-slate-300 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <div className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            speed > 0 
              ? 'bg-emerald-50 text-[#0F9D6B] border-emerald-200 animate-pulse' 
              : 'bg-slate-100 text-text-lo border-line'
          }`}>
            {speed > 0 ? 'Transit Active' : 'Stationary'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-slate-50 p-0 flex flex-col flex-1 relative overflow-hidden">
        {/* Map Container with Floating Glass Turn-by-Turn HUD */}
        <div className="flex-1 rounded-2xl overflow-hidden relative border border-line z-0 min-h-[500px] h-[520px] w-full">
          
          {/* FLOATING TURN-BY-TURN HUD (WHITE CARD DIRECTLY OVER MAP) */}
          <div className="absolute top-3 inset-x-3 z-[1000] pointer-events-none flex justify-center">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-line px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-6 max-w-xl w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0B3D91] border border-blue-200 shadow-xs">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold font-mono text-[#0B3D91] tabular-nums">
                      {currentManeuver.distMeters}m
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-700 font-bold">AHEAD</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">
                    {currentManeuver.instruction}
                  </p>
                </div>
              </div>

              <div className="text-right pl-4 border-l border-line shrink-0">
                <span className="text-[9px] uppercase font-mono text-slate-700 font-bold block">DYNAMIC ETA</span>
                <span className="text-xs font-bold font-mono text-[#047857] tabular-nums">
                  {progress >= 100 
                    ? 'ARRIVED' 
                    : speed === 0 
                      ? 'PAUSED' 
                      : `${Math.ceil(etaMinutes)} MINS`}
                </span>
              </div>
            </div>
          </div>

          <MapContainer 
            center={[safeLat, safeLon]} 
            zoom={13} 
            style={{ height: '100%', width: '100%', minHeight: '500px' }} 
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

            {/* Clean Esri Light Canvas Reference Labels Layer */}
            {activeProvider === 'esri_light' && (
              <TileLayer
                url={TILE_PROVIDERS.esri_light.refUrl}
                maxZoom={16}
                opacity={0.9}
              />
            )}

            {/* Optional TomTom Live Traffic Flow Overlay if Key is provided */}
            {activeProvider === 'tomtom' && tomtomApiKey && (
              <TileLayer
                url={TILE_PROVIDERS.tomtom.trafficUrl.replace('{key}', tomtomApiKey)}
                opacity={0.7}
              />
            )}

            {/* Geofence Boundary as Red Dashed Polygon */}
            <Polygon 
              positions={GEOFENCE_COORDS} 
              pathOptions={{ color: '#D7263D', fillColor: '#D7263D', fillOpacity: 0.06, weight: 2, dashArray: '6 6' }} 
            />

            {/* Planned Road Route (Blue) */}
            <Polyline 
              positions={roadCoordinates} 
              pathOptions={{ color: '#0B3D91', weight: 4.5, opacity: 0.85 }} 
            />

            {/* Traveled Highway Polyline (Solid British Racing Green) */}
            {traveledPath.length > 1 && (
              <Polyline 
                positions={traveledPath} 
                pathOptions={{ color: '#0F9D6B', weight: 5, opacity: 0.95 }} 
              />
            )}

            {/* Nearby POIs */}
            {visiblePOIs.map(poi => (
              <Marker key={poi.id} position={[poi.lat, poi.lon]} icon={poi.type === 'gas' ? gasIcon : evIcon}>
                <Popup>
                  <div className="font-sans text-xs">
                    <span className="font-bold text-text-hi">{poi.name}</span>
                    <span className="block text-text-mid font-mono uppercase text-[9px] mt-0.5">{poi.type} Station</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Directional Heading Vehicle Marker */}
            <Marker position={[safeLat, safeLon]} icon={vehicleMarkerIcon}>
              <Popup>
                <div className="font-sans text-xs p-1">
                  <div className="font-bold text-slate-900">Fleet Transport Unit #01</div>
                  <div className="text-[#0B3D91] font-mono font-semibold mt-1">Velocity: {safeSpeed.toFixed(1)} km/h</div>
                  <div className="text-slate-600 font-mono text-[10px]">Bearing: {heading}° Azimuth</div>
                  <div className="text-[#0F9D6B] font-bold mt-1">Route Progress: {Math.round(safeProgress)}%</div>
                </div>
              </Popup>
            </Marker>

            <MapUpdater center={[safeLat, safeLon]} />
          </MapContainer>
        </div>

        {/* Live HUD telemetry over map */}
        <div className="absolute bottom-5 left-5 right-5 pointer-events-none z-10">
          <div className="grid grid-cols-3 gap-2 mb-2 pointer-events-auto">
            <div className="rounded-xl bg-white/95 backdrop-blur border border-line p-2.5 shadow-sm">
              <p className="text-[9px] uppercase font-bold text-slate-700">Position</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-slate-900 truncate">
                {safeLat.toFixed(4)}°N, {safeLon.toFixed(4)}°E
              </p>
            </div>
            <div className="rounded-xl bg-white/95 backdrop-blur border border-line p-2.5 shadow-sm">
              <p className="text-[9px] uppercase font-bold text-slate-700">Bearing</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-[#0B3D91]">
                {heading}° ({heading <= 45 || heading >= 315 ? 'North' : heading <= 135 ? 'East' : heading <= 225 ? 'South' : 'West'})
              </p>
            </div>
            <div className="rounded-xl bg-white/95 backdrop-blur border border-line p-2.5 shadow-sm">
              <p className="text-[9px] uppercase font-bold text-slate-700">Road Corridor</p>
              <p className="mt-0.5 font-mono text-xs font-bold text-[#047857] truncate">
                {currentManeuver?.street || 'Expressway'}
              </p>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div className="bg-white/95 backdrop-blur p-2.5 rounded-xl pointer-events-auto border border-line shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-700 font-medium mb-1">
              <span>Expressway progress:</span>
              <span className="font-bold text-slate-900 font-mono">{Math.round(safeProgress)}% ({ (safeProgress * 0.248).toFixed(1) } / 24.8 km)</span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#0B3D91] to-[#047857] transition-all duration-300"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Free API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-2xl relative overflow-hidden">
            <div className="racing-stripe" />
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">Live Fleet Map & Traffic Settings</h3>
                <p className="text-xs text-slate-700 font-medium">Configure map tile providers and free developer keys.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-800">
              <div className="rounded-xl bg-blue-50/60 p-3.5 border border-blue-200">
                <span className="font-bold text-[#0B3D91]">Default Keyless Provider: </span>
                <span className="text-slate-700">CartoDB Voyager & OpenStreetMap operate with 100% free unlimited requests without any key.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5" htmlFor="tomtom-key">
                  TomTom Developer Key (For Live Traffic Congestion Flow)
                </label>
                <input
                  id="tomtom-key"
                  type="text"
                  placeholder="Paste your free TomTom key here..."
                  value={tomtomApiKey}
                  onChange={(e) => setTomtomApiKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] font-mono shadow-xs"
                />
                <p className="mt-1.5 text-[11px] text-slate-600">
                  Get a free key at <a href="https://developer.tomtom.com/" target="_blank" rel="noreferrer" className="text-[#0B3D91] font-semibold underline">developer.tomtom.com</a> (2,500 free calls/day, no credit card required).
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveTomtomKey(tomtomApiKey)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0B3D91] text-white hover:bg-[#093276] transition shadow-sm"
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
