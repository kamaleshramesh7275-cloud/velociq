import React, { useState } from 'react';
import { PlateBadge, CarSilhouette } from '../ui';
import { CarIcon, SparklesIcon, CloseIcon } from '../icons';

const ENGINE_OPTIONS = [
  { id: 'i4_petrol', name: '2.0L I-4 DOHC Turbo', category: 'ICE Petrol', hp: 248, defaultFuel: 55 },
  { id: 'bev_pmsm', name: 'Permanent Magnet Synchronous BEV', category: 'Electric', hp: 320, defaultFuel: 85 },
  { id: 'v8_petrol', name: '4.5L V8 Turbodiesel / Heavy Duty', category: 'Diesel / V8', hp: 385, defaultFuel: 120 },
  { id: 'i3_turbo', name: '1.0L Inline-3 Turbo Urban Compact', category: 'Eco Petrol', hp: 135, defaultFuel: 42 },
  { id: 'i4_diesel', name: '6.0L Commercial Industrial Diesel', category: 'Commercial Diesel', hp: 410, defaultFuel: 140 },
];

const VEHICLE_TYPES = [
  { type: 'Sedan', profile: 'sedan', label: 'Executive Sports Sedan' },
  { type: 'Heavy Truck', profile: 'truck', label: 'Commercial Heavy Truck' },
  { type: 'Cargo Van', profile: 'suv', label: 'Transit Cargo Van' },
  { type: 'SUV', profile: 'suv', label: 'High-Clearance Utility SUV' },
  { type: 'Urban Compact', profile: 'sedan', label: 'Agile Urban Compact' },
];

export default function AddVehicleModal({ isOpen, onClose, onAddVehicle, drivers = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Sedan',
    profile: 'sedan',
    engineTypeId: 'i4_petrol',
    licensePlate: '',
    vin: '',
    mileage: '',
    status: 'Active',
    driverId: '',
    curbWeightKg: 1550,
    fuelCapacityL: 55
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleTypeChange = (selectedType) => {
    const matched = VEHICLE_TYPES.find(t => t.type === selectedType) || VEHICLE_TYPES[0];
    setFormData(prev => ({
      ...prev,
      type: matched.type,
      profile: matched.profile
    }));
  };

  const handleEngineChange = (engineId) => {
    const matched = ENGINE_OPTIONS.find(e => e.id === engineId);
    setFormData(prev => ({
      ...prev,
      engineTypeId: engineId,
      fuelCapacityL: matched?.defaultFuel || 55
    }));
  };

  const generateRandomVin = () => {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const generatedVin = `1HGCR2F8${randomHex}9`;
    setFormData(prev => ({ ...prev, vin: generatedVin }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Asset Name is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      vin: formData.vin.trim() || `1HGCR2F8${Math.floor(100000000 + Math.random() * 900000000)}`,
      mileage: Number(formData.mileage) || 0,
      curbWeightKg: Number(formData.curbWeightKg) || 1600,
      fuelCapacityL: Number(formData.fuelCapacityL) || 55,
      maxPowerHp: ENGINE_OPTIONS.find(e => e.id === formData.engineTypeId)?.hp || 250
    };

    onAddVehicle(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl relative overflow-hidden my-auto shrink-0">
        
        {/* Top 3px Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0284C7] to-[#059669]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <CarIcon className="w-4 h-4 text-[#0B3D91]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold block">
                FLEET ASSET REGISTRATION
              </span>
              <h2 className="text-lg font-bold font-heading text-[#0F172A] leading-tight">
                Add Vehicle to Fleet
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex flex-col gap-4 text-xs font-mono">
          
          {/* Live Preview Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1">
                <CarSilhouette profile={formData.profile} view="side" className="w-14 h-7 text-[#0B3D91]" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block font-heading">
                  {formData.name || 'New Fleet Asset'}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {formData.type} • {ENGINE_OPTIONS.find(e => e.id === formData.engineTypeId)?.name}
                </span>
              </div>
            </div>

            <PlateBadge plate={formData.licensePlate || 'FL-NEW-01'} country="IND" size="md" />
          </div>

          {/* Row 1: Vehicle Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Alpha Cruiser, Volt Transit"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                className={`w-full px-3 py-2 rounded-xl border bg-white text-slate-900 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 ${
                  errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.name && <span className="text-[10px] text-red-600 mt-0.5 block">{errors.name}</span>}
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Vehicle Category
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              >
                {VEHICLE_TYPES.map(t => (
                  <option key={t.type} value={t.type}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: License Plate & VIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                License Plate *
              </label>
              <input
                type="text"
                placeholder="e.g. NY-482-XA or DL-01-AB-1234"
                value={formData.licensePlate}
                onChange={(e) => {
                  setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() });
                  if (errors.licensePlate) setErrors({ ...errors, licensePlate: null });
                }}
                className={`w-full px-3 py-2 rounded-xl border bg-white text-slate-900 font-mono text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 ${
                  errors.licensePlate ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.licensePlate && <span className="text-[10px] text-red-600 mt-0.5 block">{errors.licensePlate}</span>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block">
                  VIN (Chassis Number)
                </label>
                <button
                  type="button"
                  onClick={generateRandomVin}
                  className="text-[9.5px] text-[#0B3D91] hover:underline font-bold"
                >
                  ⚡ Auto-Gen
                </button>
              </div>
              <input
                type="text"
                placeholder="17-Digit VIN"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
              />
            </div>
          </div>

          {/* Row 3: Powertrain & Engine */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
              Powertrain / Engine Architecture
            </label>
            <select
              value={formData.engineTypeId}
              onChange={(e) => handleEngineChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20"
            >
              {ENGINE_OPTIONS.map(eng => (
                <option key={eng.id} value={eng.id}>
                  {eng.name} ({eng.hp} HP • {eng.category})
                </option>
              ))}
            </select>
          </div>

          {/* Row 4: Initial Odometer & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Odometer (km)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Tank / Battery (L or kWh)
              </label>
              <input
                type="number"
                min="10"
                value={formData.fuelCapacityL}
                onChange={(e) => setFormData({ ...formData, fuelCapacityL: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none"
              >
                <option value="Active">Active (Ready)</option>
                <option value="Idle">Idle (Lot Standby)</option>
                <option value="Maintenance">Maintenance Bay</option>
              </select>
            </div>
          </div>

          {/* Row 5: Assign Driver (Optional) */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
              Assign Fleet Driver (Optional)
            </label>
            <select
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none"
            >
              <option value="">-- No Driver Assigned (Idle Lot) --</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.license} • Rating: {d.rating}★)
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0B3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white font-bold shadow-md transition flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Register Car to Fleet</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
