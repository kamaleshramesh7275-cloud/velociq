import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AnalyticsDashboard({ tripHistory }) {
  if (!tripHistory || tripHistory.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 p-6 text-slate-400">
        <p>No trip history available for analytics.</p>
      </div>
    );
  }

  // Reverse history so oldest is first (left to right)
  const chartData = [...tripHistory].reverse().map((trip, index) => ({
    name: `Trip ${index + 1}`,
    score: trip.score,
    efficiency: trip.fuelUsed > 0 ? parseFloat((trip.distance / trip.fuelUsed).toFixed(1)) : 0,
    distance: parseFloat(trip.distance.toFixed(1))
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Driver Score Trends</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} 
                itemStyle={{ color: '#38bdf8' }}
              />
              <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#0284c7' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Fuel Efficiency (km/L)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} 
                itemStyle={{ color: '#34d399' }}
                cursor={{ fill: 'rgba(51, 65, 85, 0.4)' }}
              />
              <Bar dataKey="efficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
