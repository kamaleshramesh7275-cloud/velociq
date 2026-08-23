import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function FuelMileageCard({ telemetry }) {
  const { speed, maf, fuel, tripMileage, co2, history } = telemetry;

  // Real-world physical conversion:
  // Fuel rate (L/h) ~ MAF (g/s) * 3600 / (14.7 * 740 g/L) ~ MAF * 0.33 L/h
  // km/L ~ Speed (km/h) / Fuel rate (L/h)
  const fuelRateLPerHour = useMemo(() => (maf * 0.33), [maf]);
  
  const kmPerL = useMemo(() => {
    if (speed < 1 || fuelRateLPerHour <= 0) return '0.0';
    return (speed / fuelRateLPerHour).toFixed(1);
  }, [speed, fuelRateLPerHour]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Fuel & Range</p>
          <h2 className="text-xl font-semibold text-white">Mileage Intelligence</h2>
        </div>
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
          Eco mode
        </div>
      </div>
      
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Stats Block */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-400">
                {speed > 0 ? 'Live Economy (km/L)' : 'Idle Consumption'}
              </p>
              <div className="mt-2 text-4xl font-bold text-emerald-300">
                {speed > 0 ? `${kmPerL} km/L` : `${fuelRateLPerHour.toFixed(1)} L/h`}
              </div>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>Trip Mileage</p>
              <p className="text-xl font-semibold text-white">{tripMileage.toFixed(2)} km</p>
            </div>
          </div>
          
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm text-slate-400">CO2 Released</p>
              <p className="mt-1 text-2xl font-semibold text-white">{co2.toFixed(3)} kg</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm text-slate-400">Fuel Tank</p>
              <p className="mt-1 text-2xl font-semibold text-white">{fuel.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Right Chart Block */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400 mb-2">Alternator Voltage (Live ECU)</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[13.4, 14.3]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#22d3ee' }}
                  formatter={(value) => [`${parseFloat(value).toFixed(2)} V`, 'Alternator']}
                />
                <Line type="monotone" dataKey="voltage" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
