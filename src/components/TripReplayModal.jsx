import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ReplayAnimation({ path, isPlaying, setProgress }) {
  const map = useMap();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (path.length > 0) {
      map.fitBounds(path);
    }
  }, [path, map]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentIndex < path.length - 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          setProgress((next / (path.length - 1)) * 100);
          return next;
        });
      }, 200); // Fast forward replay speed
    } else if (currentIndex >= path.length - 1) {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, path.length, setProgress]);

  if (path.length === 0) return null;

  return (
    <>
      <Polyline positions={path} color="cyan" weight={3} opacity={0.6} />
      <Marker position={path[currentIndex]} />
    </>
  );
}

export default function TripReplayModal({ trip, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!trip) return null;

  const hasPath = trip.path && trip.path.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/40 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">Trip Replay</h2>
            <p className="text-sm text-slate-400">{trip.date}</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-slate-700 p-2 text-slate-300 hover:bg-slate-600 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 grid grid-cols-4 gap-4 rounded-xl bg-slate-950 p-4 border border-slate-800/50">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Distance</p>
              <p className="font-bold text-white">{trip.distance.toFixed(2)} km</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Avg Speed</p>
              <p className="font-bold text-white">{trip.avgSpeed.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Fuel Used</p>
              <p className="font-bold text-emerald-400">{trip.fuelUsed.toFixed(2)} L</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Score</p>
              <p className="font-bold text-cyan-400">{Math.round(trip.score)}</p>
            </div>
          </div>

          <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
            {!hasPath ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No GPS data available for this trip.
              </div>
            ) : (
              <MapContainer style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <ReplayAnimation path={trip.path} isPlaying={isPlaying} setProgress={setProgress} />
              </MapContainer>
            )}

            {/* Playback Controls Overlay */}
            {hasPath && (
              <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/90 p-3 backdrop-blur">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-white transition hover:bg-cyan-500"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
