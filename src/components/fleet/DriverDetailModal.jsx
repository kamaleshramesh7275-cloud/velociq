import React from 'react';
import { BrainIcon, CloseIcon, ShieldCheckIcon } from '../icons';

export default function DriverDetailModal({
  isOpen,
  onClose,
  driver,
  assignedVehicle,
  vehicles = [],
  onAssignDriver
}) {
  if (!isOpen || !driver) return null;

  const documents = driver.documents || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl relative overflow-hidden my-auto shrink-0">
        
        {/* Top 3px Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0284C7] to-[#059669]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <BrainIcon className="w-5 h-5 text-[#0B3D91]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold">
                  DRIVER QUALIFICATION FILE & TELEMATICS PROFILE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Certified Active
                </span>
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900 mt-0.5">
                {driver.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs font-mono">
          
          {/* Driver Hero Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#0B3D91] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                {driver.avatar || 'DR'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-slate-900 text-base">{driver.name}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0B3D91] font-bold text-[10px] border border-blue-200">
                    {driver.license}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                  Experience: <strong className="text-slate-800">{driver.experience || '5 Years'}</strong> • Dispatch Rating: <strong className="text-amber-600">{driver.rating} ★ / 5.0</strong>
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex flex-wrap gap-3">
                  <span>📞 {driver.phone || '+1 (555) 234-5678'}</span>
                  <span>✉️ {driver.email || 'driver@velociq.fleet'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">OVERALL SAFETY SCORE</span>
              <span className="text-3xl font-extrabold font-mono text-[#0F9D6B] tabular-nums">
                {driver.safetyScore}%
              </span>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tier-1 Preferred Operator
              </span>
            </div>
          </div>

          {/* Performance & Eco Telematics Scoreboard */}
          <div>
            <span className="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              TELEMETRICS & ECO-EFFICIENCY METRICS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">SAFETY SCORE</span>
                <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block tabular-nums">
                  {driver.safetyScore}%
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">0 Harsh Braking Events</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">FUEL EFFICIENCY</span>
                <span className="text-lg font-bold text-[#0B3D91] font-mono mt-0.5 block tabular-nums">
                  {driver.fuelEfficiency}%
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">+12% vs Fleet Average</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">ON-TIME COMPLIANCE</span>
                <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block tabular-nums">
                  {driver.onTimeCompliance}%
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">98/100 Routes Delivered</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">WEEKLY FUEL SAVED</span>
                <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block tabular-nums">
                  {driver.weeklyFuelSavedLiters} L
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">{driver.stopsAvoided} Stops Avoided</span>
              </div>
            </div>
          </div>

          {/* Assigned Vehicle Pairing */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shrink-0">
                <CarSilhouette profile={assignedVehicle?.profile || 'sedan'} view="side" className="w-14 h-7 text-[#0B3D91]" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  ASSIGNED FLEET ASSET
                </span>
                <span className="text-sm font-bold text-slate-900 block font-heading">
                  {assignedVehicle ? assignedVehicle.name : 'Currently Unassigned (Standby)'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {assignedVehicle ? `${assignedVehicle.licensePlate} • ${assignedVehicle.type} • ${assignedVehicle.mileage.toLocaleString()} km` : 'Driver available for active dispatch assignment.'}
                </span>
              </div>
            </div>

            {assignedVehicle && (
              <PlateBadge plate={assignedVehicle.licensePlate} country="IND" size="sm" />
            )}
          </div>

          {/* DOT / FMCSA Driver Qualification File (DQF) Credentials */}
          <div>
            <span className="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              DOT DRIVER QUALIFICATION FILE (DQF) & CREDENTIALS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(documents).map(([key, doc]) => (
                <div key={key} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">{doc.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Doc: {doc.docNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5 font-mono">Exp: {doc.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
