import React, { useState } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import TripReplayModal from './TripReplayModal';
import { Card, SectionLabel } from './ui';
import { PlayIcon } from './icons';

export default function TripLogger({ tripHistory = [], onEndTrip, onClearHistory, activeStats }) {
  const { duration, distance, avgSpeed, fuelUsed, score } = activeStats;
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'analytics'
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Helper to format duration (seconds) into hh:mm:ss
  const formatDuration = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  return (
    <div className="bg-white rounded-2xl border border-line shadow-sm p-5 relative overflow-hidden">
      <div className="racing-stripe" />
      
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <SectionLabel label="HISTORICAL TELEMETRY LOGS" />
          <h3 className="text-lg font-bold text-text-hi font-heading mt-1">Odometer & Trip Records</h3>
        </div>
        
        <button
          type="button"
          onClick={onEndTrip}
          disabled={distance === 0}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition duration-200 ${
            distance > 0 
              ? 'bg-[#D7263D] text-white shadow-xs hover:bg-[#b81d31]' 
              : 'bg-slate-100 text-text-lo cursor-not-allowed border border-line'
          }`}
        >
          End Current Trip
        </button>
      </div>

      {/* Active Trip Dashboard Summary */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 rounded-xl border border-line bg-slate-50 p-3.5 mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase text-slate-700 font-bold">Current Trip Odometer</p>
          <p className="mt-1 text-base font-bold font-mono text-[#0B3D91] tabular-nums">{Number(distance ?? 0).toFixed(2)} km</p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase text-slate-700 font-bold">Trip Duration</p>
          <p className="mt-1 text-base font-bold font-mono text-slate-900 tabular-nums">{formatDuration(duration || 0)}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase text-slate-700 font-bold">Avg Speed</p>
          <p className="mt-1 text-base font-bold font-mono text-slate-900 tabular-nums">{Number(avgSpeed ?? 0).toFixed(1)} km/h</p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase text-slate-700 font-bold">Fuel Burned</p>
          <p className="mt-1 text-base font-bold font-mono text-[#047857] tabular-nums">{Number(fuelUsed ?? 0).toFixed(2)} L</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-line">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'list' ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Logs Index
          </button>
          <button 
            onClick={() => setViewMode('analytics')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'analytics' ? 'bg-white text-[#0B3D91] shadow-xs border border-slate-200' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Analytics View
          </button>
        </div>

        {viewMode === 'list' && tripHistory.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[10px] uppercase font-mono tracking-wider text-[#D7263D] hover:underline font-bold"
          >
            Clear Historical Logs
          </button>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="rounded-xl border border-line bg-slate-50 p-3">
          <div className="max-h-60 overflow-y-auto pr-1">
            {tripHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-700 font-mono font-medium">
                No historical trip data recorded yet. End an active trip to generate a telemetry log.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line text-slate-700 font-mono text-[10px] uppercase font-bold">
                      <th className="py-2 px-2">Date & Time</th>
                      <th className="py-2 px-2">Distance</th>
                      <th className="py-2 px-2">Avg Speed</th>
                      <th className="py-2 px-2">Fuel Used</th>
                      <th className="py-2 px-2 text-right">Safety Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripHistory.map((trip, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-line/60 hover:bg-white text-slate-800 transition-colors cursor-pointer group"
                        onClick={() => setSelectedTrip(trip)}
                      >
                        <td className="py-2.5 px-2 whitespace-nowrap font-mono text-slate-900 flex items-center gap-1.5 font-medium">
                          <span>{trip.date}</span>
                          {trip.path?.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[9px] uppercase font-mono tracking-widest text-[#0B3D91] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                              <PlayIcon className="w-2.5 h-2.5" /> Replay
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-900 font-medium tabular-nums">{trip.distance.toFixed(2)} km</td>
                        <td className="py-2.5 px-2 font-mono text-slate-900 font-medium tabular-nums">{trip.avgSpeed.toFixed(1)} km/h</td>
                        <td className="py-2.5 px-2 font-mono text-[#047857] font-bold tabular-nums">{trip.fuelUsed.toFixed(2)} L</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-[#0B3D91] tabular-nums">{Math.round(trip.score)} / 100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AnalyticsDashboard tripHistory={tripHistory} />
      )}

      {selectedTrip && (
        <TripReplayModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}
    </div>
  );
}
