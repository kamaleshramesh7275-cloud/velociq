import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PlayIcon, PauseIcon, CloseIcon } from './icons';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ReplayAnimation({ path, isPlaying, progress, setProgress, speedMultiplier }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 450);
    if (path.length > 0) {
      map.fitBounds(path);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [path, map]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      const stepInterval = Math.max(30, 200 / speedMultiplier);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          const next = prev + 1;
          return next > 100 ? 100 : next;
        });
      }, stepInterval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, setProgress]);

  if (path.length === 0) return null;

  const currentIndex = Math.min(
    path.length - 1,
    Math.floor((progress / 100) * (path.length - 1))
  );

  return (
    <>
      <Polyline positions={path} color="#0B3D91" weight={4} opacity={0.8} />
      <Marker position={path[currentIndex]} />
    </>
  );
}

export default function TripReplayModal({ trip, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  if (!trip) return null;
  const hasPath = trip.path && trip.path.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl relative">
        <div className="racing-stripe" />
        
        <div className="flex items-center justify-between border-b border-line bg-slate-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-text-hi font-heading">Trip Historical Replay</h2>
            <p className="text-xs text-text-mid font-mono">{trip.date}</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-text-mid hover:bg-slate-200 hover:text-text-hi transition border border-line"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 grid grid-cols-4 gap-3 rounded-xl bg-slate-50 p-4 border border-line">
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Distance</p>
              <p className="font-bold font-mono text-slate-900 mt-0.5">{trip.distance.toFixed(2)} km</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Avg Speed</p>
              <p className="font-bold font-mono text-slate-900 mt-0.5">{trip.avgSpeed.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Fuel Burned</p>
              <p className="font-bold font-mono text-[#047857] mt-0.5">{trip.fuelUsed.toFixed(2)} L</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-700 font-bold">Score</p>
              <p className="font-bold font-mono text-[#0B3D91] mt-0.5">{Math.round(trip.score)} / 100</p>
            </div>
          </div>

          <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-line bg-slate-100">
            {!hasPath ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-700 font-mono font-medium">
                No GPS coordinate sequence recorded for this trip.
              </div>
            ) : (
              <MapContainer style={{ height: '100%', width: '100%', minHeight: '400px' }} zoomControl={false}>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={16}
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={16}
                  opacity={0.85}
                />
                <ReplayAnimation 
                  path={trip.path} 
                  isPlaying={isPlaying} 
                  progress={progress} 
                  setProgress={setProgress} 
                  speedMultiplier={speedMultiplier} 
                />
              </MapContainer>
            )}

            {/* Playback Controls & Interactive Scrubber Overlay */}
            {hasPath && (
              <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-col gap-2 rounded-xl border border-line bg-white/95 p-3.5 backdrop-blur-xl shadow-lg">
                
                {/* Timeline Scrubber slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-700 font-bold w-8">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(progress)}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B3D91]"
                  />
                  <span className="text-xs font-mono font-bold text-[#0B3D91] w-10 text-right tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* Buttons and Speed selectors */}
                <div className="flex items-center justify-between pt-1">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-8 px-4 items-center justify-center gap-2 rounded-xl bg-[#0B3D91] text-white font-bold text-xs transition shadow-xs hover:bg-[#093276]"
                  >
                    {isPlaying ? <PauseIcon className="w-3.5 h-3.5" /> : <PlayIcon className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-line">
                    {[0.5, 1.0, 2.0, 4.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeedMultiplier(s)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                          speedMultiplier === s
                            ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
