import React from 'react';

export default function TripLogger({ tripHistory = [], onEndTrip, onClearHistory, activeStats }) {
  const { duration, distance, avgSpeed, fuelUsed, co2, score } = activeStats;

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
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trip Management</p>
          <h2 className="text-xl font-semibold text-white">Odometer & Trip Logs</h2>
        </div>
        
        <button
          type="button"
          onClick={onEndTrip}
          disabled={distance === 0}
          className={`rounded-full px-5 py-2 text-xs font-bold transition duration-300 ${
            distance > 0 
              ? 'bg-rose-500 text-slate-950 hover:bg-rose-400' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30'
          }`}
        >
          End Current Trip
        </button>
      </div>

      {/* Active Trip Dashboard Summary */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 mb-4">
        <div>
          <p className="text-xs text-slate-400">Current Trip Odometer</p>
          <p className="mt-1 text-lg font-bold text-white">{distance.toFixed(2)} km</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Trip Duration</p>
          <p className="mt-1 text-lg font-bold text-white">{formatDuration(duration)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Avg Speed</p>
          <p className="mt-1 text-lg font-bold text-white">{avgSpeed.toFixed(1)} km/h</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Current Fuel Burned</p>
          <p className="mt-1 text-lg font-bold text-emerald-300">{fuelUsed.toFixed(2)} L</p>
        </div>
      </div>

      {/* Historical Logs List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">Historical Trip Index</h3>
          {tripHistory.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[10px] uppercase tracking-wider text-rose-400 hover:text-rose-300 font-semibold"
            >
              Wipe Logs
            </button>
          )}
        </div>

        <div className="max-h-60 overflow-y-auto pr-1">
          {tripHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No historical trip data found. End a trip to register a log.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="py-2 px-1">Date</th>
                    <th className="py-2 px-1">Distance</th>
                    <th className="py-2 px-1">Avg Speed</th>
                    <th className="py-2 px-1">Fuel Consumed</th>
                    <th className="py-2 px-1 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {tripHistory.map((trip, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-900/30 text-slate-300 transition-colors">
                      <td className="py-2 px-1 whitespace-nowrap">{trip.date}</td>
                      <td className="py-2 px-1 font-semibold text-white">{trip.distance.toFixed(2)} km</td>
                      <td className="py-2 px-1">{trip.avgSpeed.toFixed(1)} km/h</td>
                      <td className="py-2 px-1 text-emerald-400">{trip.fuelUsed.toFixed(2)} L</td>
                      <td className="py-2 px-1 text-right font-bold text-cyan-400">{Math.round(trip.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
