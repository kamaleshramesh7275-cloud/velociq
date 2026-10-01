import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Card, SectionLabel } from './ui';

const data = [
  { name: 'VelocIQ AI', cost: 490, isHighlight: true },
  { name: 'Generic OBD', cost: 1600, isHighlight: false },
  { name: 'Legacy GPS', cost: 3200, isHighlight: false },
  { name: 'OEM Scanner', cost: 22000, isHighlight: false },
];

export default function CostComparison() {
  return (
    <Card className="p-6 bg-white border border-[#DDE2EA] rounded-xl shadow-sm">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <SectionLabel label="ENTERPRISE VALUE ANALYSIS" />
          <h3 className="text-lg font-heading font-bold text-[#0F172A] mt-1">Total Cost of Ownership vs. Legacy Hardware</h3>
        </div>
        <div className="self-start sm:self-auto rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-700">
          88% Hardware Cost Reduction
        </div>
      </div>
      <div className="h-64 rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#0F172A', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700 }} 
            />
            <YAxis 
              tickFormatter={(val) => `$${val >= 1000 ? `${val / 1000}k` : val}`} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 600 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                borderColor: '#CBD5E1', 
                borderRadius: '8px', 
                fontSize: '11px', 
                fontFamily: 'JetBrains Mono',
                color: '#0F172A',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
              }}
              formatter={(val) => [`$${val.toLocaleString()}`, 'Annual Cost']} 
            />
            <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isHighlight ? '#0B3D91' : '#64748B'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

