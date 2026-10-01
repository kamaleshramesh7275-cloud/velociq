import React from 'react';
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
      <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-slate-50 p-6 text-slate-700 font-mono text-xs">
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
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B3D91]">
            Driver Score Trends (0–100 Index)
          </h3>
          <span className="text-[10px] font-mono text-slate-700 font-semibold">Historical Telemetry</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#475569" fontSize={11} fontFamily="monospace" />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} fontFamily="monospace" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }} 
                itemStyle={{ color: '#0B3D91', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="score" stroke="#0B3D91" strokeWidth={3} dot={{ r: 4, fill: '#0B3D91' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#047857]">
            Fuel Efficiency (km/L)
          </h3>
          <span className="text-[10px] font-mono text-slate-700 font-semibold">CAN-Bus Burn Rate</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#475569" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#475569" fontSize={11} fontFamily="monospace" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }} 
                itemStyle={{ color: '#047857', fontWeight: 'bold' }}
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
              />
              <Bar dataKey="efficiency" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

