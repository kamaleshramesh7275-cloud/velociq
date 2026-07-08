import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function FuelMileageCard() {
  const [telemetry, setTelemetry] = useState({ maf: 9.4, fuel: 40.1 });
  const [history, setHistory] = useState(
    Array.from({ length: 8 }, (_, index) => ({ name: `${index + 1}`, voltage: 13.9 + index * 0.04 }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        maf: Math.max(2, prev.maf + (Math.random() - 0.5) * 0.7),
        fuel: Math.max(0, prev.fuel - 0.02),
      }));

      setHistory((prev) => {
        const next = [...prev.slice(-7), { name: `${prev.length + 1}`, voltage: 13.8 + Math.random() * 0.35 }];
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const kmPerL = useMemo(() => {
    const maf = telemetry.maf;
    return (maf > 0 ? (100 / maf) * 1.5 : 0).toFixed(1);
  }, [telemetry.maf]);

  const tripMileage = useMemo(() => (parseFloat(kmPerL) * (100 - telemetry.fuel) / 10).toFixed(1), [kmPerL, telemetry.fuel]);
  const co2 = useMemo(() => (parseFloat(tripMileage) * 0.192).toFixed(1), [tripMileage]);

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
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-400">Live km/L</p>
              <div className="mt-2 text-4xl font-semibold text-emerald-300">{kmPerL}</div>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>Trip mileage</p>
              <p className="text-xl font-semibold text-white">{tripMileage} km</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm text-slate-400">CO2 this trip</p>
              <p className="mt-1 text-2xl font-semibold text-white">{co2} kg</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-sm text-slate-400">Fuel reserve</p>
              <p className="mt-1 text-2xl font-semibold text-white">{telemetry.fuel.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-400">Alternator Voltage</p>
          <div className="mt-3 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[13.4, 14.2]} hide />
                <Tooltip />
                <Line type="monotone" dataKey="voltage" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
