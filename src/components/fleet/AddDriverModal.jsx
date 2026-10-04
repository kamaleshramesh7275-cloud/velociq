import React, { useState } from 'react';
import { BrainIcon, CloseIcon } from '../icons';

export default function AddDriverModal({ isOpen, onClose, onAddDriver }) {
  const [formData, setFormData] = useState({
    name: '',
    license: '',
    experience: '5 Years',
    phone: '',
    email: '',
    rating: 4.8,
    safetyScore: 92,
    fuelEfficiency: 90
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Driver Name is required';
    if (!formData.license.trim()) newErrors.license = 'CDL license is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddDriver(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl relative overflow-hidden my-auto shrink-0">
        
        {/* 3px Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0284C7] to-[#059669]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <BrainIcon className="w-4 h-4 text-[#0B3D91]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold block">
                FLEET DRIVER RECRUITMENT & ONBOARDING
              </span>
              <h2 className="text-lg font-bold font-heading text-[#0F172A] leading-tight">
                Add Driver to Fleet
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
          
          <div>
            <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
              Driver Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Johnathan Miller"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Commercial Driver's License (CDL) *
              </label>
              <input
                type="text"
                placeholder="e.g. CDL-A 88291"
                value={formData.license}
                onChange={(e) => {
                  setFormData({ ...formData, license: e.target.value.toUpperCase() });
                  if (errors.license) setErrors({ ...errors, license: null });
                }}
                className={`w-full px-3 py-2 rounded-xl border bg-white text-slate-900 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/20 ${
                  errors.license ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.license && <span className="text-[10px] text-red-600 mt-0.5 block">{errors.license}</span>}
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Experience
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none"
              >
                <option value="1-2 Years">1-2 Years (Junior)</option>
                <option value="3-5 Years">3-5 Years (Mid-Level)</option>
                <option value="8 Years">8 Years (Experienced)</option>
                <option value="10+ Years">10+ Years (Senior Veteran)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="driver@velociq.fleet"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
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
              <span>Register Driver</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
