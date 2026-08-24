import React from 'react';
import RouteTracker from '../components/RouteTracker';
import WeatherWidget from '../components/WeatherWidget';
import TripLogger from '../components/TripLogger';

export default function NavigationPage({ telemetry, weather, tripHistory, handleEndTrip, handleClearHistory, aiNavigatorEnabled, setAiNavigatorEnabled, aiThoughtLogs }) {
  return (
    <div className="p-8 text-slate-100 flex-1 overflow-auto">
      <div className="mx-auto max-w-6xl flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-white">GPS & Navigation</h1>
          <p className="mt-2 text-slate-400">Live route tracking, geofencing, and historical trip logs.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-6">
            <RouteTracker route={telemetry.route} speed={telemetry.speed} aiNavigatorEnabled={aiNavigatorEnabled} weather={weather} />
            
            {/* AI Navigator Control Panel */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Autonomous</p>
                  <h2 className="text-xl font-semibold text-white">AI Dispatch & Routing</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${aiNavigatorEnabled ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {aiNavigatorEnabled ? 'Navigator Active' : 'Manual Mode'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiNavigatorEnabled(!aiNavigatorEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 outline-none ${
                      aiNavigatorEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform duration-300 ${
                        aiNavigatorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {aiNavigatorEnabled && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Thought Log</h3>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                    {aiThoughtLogs?.map((log, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <span className="text-cyan-500 font-mono text-xs mt-0.5 whitespace-nowrap">[{log.time}]</span>
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
          <div className="flex flex-col gap-6">
            <WeatherWidget weather={weather} />
            <TripLogger 
              tripHistory={tripHistory} 
              onEndTrip={handleEndTrip} 
              onClearHistory={handleClearHistory} 
              activeStats={{
                duration: telemetry.activeDuration,
                distance: telemetry.tripMileage,
                avgSpeed: telemetry.activeDuration > 0 ? (telemetry.tripMileage / (telemetry.activeDuration / 3600)) : 0,
                fuelUsed: telemetry.activeFuelUsed,
                co2: telemetry.co2,
                score: telemetry.score
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
