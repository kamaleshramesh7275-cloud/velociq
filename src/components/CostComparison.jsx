import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'VelocIQ', cost: 490 },
  { name: 'Generic OBD', cost: 1600 },
  { name: 'GPS Tracker', cost: 3200 },
  { name: 'Workshop Scanner', cost: 22000 },
];

const formatCurrency = (value) => `₹${value.toLocaleString()}`;

export default function CostComparison() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Cost Comparison</p>
          <h2 className="text-xl font-semibold text-white">Value Snapshot</h2>
        </div>
        <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
          ROI focus
        </div>
      </div>
      <div className="h-72 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="cost" fill="#38bdf8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
