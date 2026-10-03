import React from 'react';
import { PlateBadge } from '../ui/PlateBadge';

export default function DVIRHistoryTable({ inspections = [], onSelectInspection }) {
  if (!inspections || inspections.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-mono text-xs">
        No inspection records registered. Drivers can perform pre-trip walkarounds from the Fleet Garage or Driver Portal.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Vehicle</th>
            <th className="py-3 px-4">Inspector / Driver</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Odometer</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Signature</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {inspections.map((insp) => {
            const isCritical = insp.overallStatus === 'CRITICAL_DEFECT';
            const isMinor = insp.overallStatus === 'MINOR_DEFECT';

            return (
              <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-900 font-medium whitespace-nowrap">
                  {new Date(insp.timestamp).toLocaleDateString()} {new Date(insp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{insp.vehicleName}</span>
                    <PlateBadge plate={insp.licensePlate} size="sm" />
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                  {insp.driverName}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    insp.type === 'PRE_TRIP' ? 'bg-blue-50 text-[#0B3D91] border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {insp.type === 'PRE_TRIP' ? 'PRE-TRIP' : 'POST-TRIP'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 tabular-nums whitespace-nowrap">
                  {insp.odometer?.toLocaleString()} km
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isCritical
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : isMinor
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isCritical ? '✕ OUT OF SERVICE' : isMinor ? '▲ DEFECT NOTED' : '✓ PASSED'}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {insp.signature ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>CERTIFIED</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Unsigned</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
