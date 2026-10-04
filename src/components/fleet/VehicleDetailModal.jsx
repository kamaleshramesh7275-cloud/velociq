import React, { useState } from 'react';
import { PlateBadge, CarSilhouette, StatusPill, SeverityBadge } from '../ui';
import { CarIcon, WrenchIcon, SparklesIcon, CloseIcon, ShieldCheckIcon } from '../icons';

export default function VehicleDetailModal({
  isOpen,
  onClose,
  vehicle,
  assignedDriver,
  drivers = [],
  onAssignDriver,
  onChangeStatus,
  onMonitor,
  onRunObdScan,
  onDeleteVehicle
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !vehicle) return null;

  const carProfile = vehicle.profile || (vehicle.type === 'Heavy Truck' ? 'truck' : vehicle.type === 'Cargo Van' ? 'suv' : 'sedan');
  const documents = vehicle.documents || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl relative overflow-hidden my-auto shrink-0">
        
        {/* Top 3px Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0284C7] to-[#059669]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <CarIcon className="w-5 h-5 text-[#0B3D91]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold">
                  FLEET ASSET TELEMETRY DOSSIER
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                  vehicle.status === 'Active' ? 'bg-emerald-50 text-[#0F9D6B] border-emerald-200' :
                  vehicle.status === 'Idle' ? 'bg-amber-50 text-[#B45309] border-amber-200' :
                  'bg-red-50 text-[#D7263D] border-red-200'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900 mt-0.5">
                {vehicle.name}
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs font-mono">
          
          {/* Hero Banner: Silhouette, Plate & Key Telemetry */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-24 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-xs shrink-0">
                <CarSilhouette profile={carProfile} view="side" className="w-20 h-10 text-[#0B3D91]" />
              </div>
              <div>
                <span className="font-heading font-black text-slate-900 text-base">{vehicle.name}</span>
                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                  VIN: <code className="text-slate-800 font-bold">{vehicle.vin || '1HGCR2F83HA019482'}</code>
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Category: {vehicle.type} • Engine Architecture: {vehicle.engineTypeId || 'i4_petrol'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <PlateBadge plate={vehicle.licensePlate} country="IND" size="md" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold">STATUS:</span>
                <select
                  value={vehicle.status}
                  onChange={(e) => onChangeStatus && onChangeStatus(vehicle.id, e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-[11px] font-bold text-slate-800 cursor-pointer focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Idle">Idle</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div>
            <span className="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              TECHNICAL SPECIFICATIONS & HARDWARE ENVELOPE
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">POWERTRAIN</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                  {vehicle.engineTypeId === 'bev_pmsm' ? 'BEV PMSM Motor' : vehicle.engineTypeId === 'v8_petrol' ? '4.5L V8 Turbodiesel' : '2.0L I-4 Turbo'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">PEAK OUTPUT</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {vehicle.maxPowerHp || 248} HP
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">TANK / BATTERY</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {vehicle.fuelCapacityL || 55} {vehicle.engineTypeId === 'bev_pmsm' ? 'kWh' : 'Liters'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">CURB WEIGHT</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  {vehicle.curbWeightKg ? `${vehicle.curbWeightKg} kg` : '1,550 kg'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry & Location */}
          <div>
            <span className="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              LIVE CAN TELEMETRY & REGIONAL POSITION
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">ODOMETER MILEAGE</span>
                <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block tabular-nums">
                  {vehicle.mileage?.toLocaleString()} km
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">GPS COORDINATES</span>
                <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block tabular-nums">
                  {vehicle.lat?.toFixed(4)}, {vehicle.lon?.toFixed(4)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9.5px] text-slate-400 uppercase font-bold block">OBD-II PRE-TRIP STATUS</span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {vehicle.lastDvirStatus || 'PASSED'} • 0 DTCs
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Driver Card & Reassignment */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0B3D91] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {assignedDriver?.avatar || 'UD'}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  ASSIGNED FLEET OPERATOR
                </span>
                <span className="text-sm font-bold text-slate-900 block font-heading">
                  {assignedDriver?.name || 'No Driver Assigned'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {assignedDriver ? `${assignedDriver.license} • Rating: ${assignedDriver.rating}★ • Safety: ${assignedDriver.safetyScore}%` : 'Vehicle is currently idle in staging lot.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={assignedDriver?.id || ''}
                onChange={(e) => onAssignDriver && onAssignDriver(vehicle.id, e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
              >
                <option value="">-- Unassign Driver --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.license})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Regulatory Compliance & DQF Documents */}
          <div>
            <span className="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              REGULATORY COMPLIANCE & FMCSA / DOT DOCUMENTS
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
                      Valid
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5 font-mono">Exp: {doc.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 mt-2">
            <div>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-red-600 hover:text-red-800 font-bold underline cursor-pointer"
                >
                  Retire Asset from Fleet
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-700 font-bold">Are you sure?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteVehicle && onDeleteVehicle(vehicle.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-xs shadow-xs"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded-lg border border-slate-300 text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onRunObdScan && onRunObdScan(vehicle.id);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold transition flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Run OBD Diagnostic Scan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onMonitor && onMonitor(vehicle.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white font-bold shadow-md transition flex items-center gap-1.5"
              >
                <span>🚀</span>
                <span>Open Cockpit Telemetry</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
