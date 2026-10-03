import React, { useState, useRef, useEffect } from 'react';
import { useFleet } from '../../context/FleetContext';
import { SectionLabel, PlateBadge } from '../ui';

const INSPECTION_CATEGORIES = [
  { id: 'brakes', name: 'Brakes & Air Lines', desc: 'Pads, rotors, line pressure, air reservoirs, parking brake hold' },
  { id: 'tires', name: 'Tires & Wheels', desc: 'Tread depth, inflation pressure, lug nuts torque, sidewall cuts' },
  { id: 'steering', name: 'Steering & Suspension', desc: 'Power steering fluid, steering column play, tie rods, struts' },
  { id: 'lights', name: 'Lights & Turn Signals', desc: 'Headlamps, high beams, brake lamps, hazard flashers, reflectors' },
  { id: 'glass', name: 'Windshield & Wipers', desc: 'Wiper blades, washer fluid spray, glass chips, defroster vents' },
  { id: 'fluids', name: 'Fluid Levels & Leaks', desc: 'Engine oil, coolant reservoir, brake fluid, transmission fluid' },
  { id: 'safety', name: 'Emergency Safety Kit', desc: 'Fire extinguisher charge, DOT warning triangles, first-aid kit' },
];

export default function DVIRInspectionModal({ isOpen, onClose, vehicle, driver }) {
  const { submitInspection } = useFleet();
  const [type, setType] = useState('PRE_TRIP');
  const [odometer, setOdometer] = useState(vehicle?.mileage || 12450);
  const [notes, setNotes] = useState('');
  const [results, setResults] = useState(() => {
    const init = {};
    INSPECTION_CATEGORIES.forEach(c => {
      init[c.id] = { status: 'PASS', comment: '' };
    });
    return init;
  });

  // HTML5 Canvas Signature Pad
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0B3D91';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleStatusChange = (catId, newStatus) => {
    setResults(prev => ({
      ...prev,
      [catId]: { ...prev[catId], status: newStatus }
    }));
  };

  const handleCommentChange = (catId, comment) => {
    setResults(prev => ({
      ...prev,
      [catId]: { ...prev[catId], comment }
    }));
  };

  const hasCritical = Object.values(results).some(r => r.status === 'CRITICAL');
  const hasMinor = Object.values(results).some(r => r.status === 'MINOR');
  const overallStatus = hasCritical ? 'CRITICAL_DEFECT' : hasMinor ? 'MINOR_DEFECT' : 'PASSED';

  const handleSubmit = (e) => {
    e.preventDefault();
    const signatureDataUrl = canvasRef.current ? canvasRef.current.toDataURL() : null;

    const report = {
      id: `dvir-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      vehicleId: vehicle?.id || 'v1',
      vehicleName: vehicle?.name || 'Alpha Cruiser',
      licensePlate: vehicle?.licensePlate || 'NY-482-XA',
      driverId: driver?.id || 'd1',
      driverName: driver?.name || 'Assigned Driver',
      odometer: Number(odometer),
      overallStatus,
      results,
      notes,
      signature: signatureDataUrl,
      certified: true
    };

    if (submitInspection) {
      submitInspection(vehicle?.id || 'v1', report);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Racing Stripe Accent */}
        <div className="h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <SectionLabel label="FMCSA / DOT COMPLIANCE INSPECTION" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
              Digital Vehicle Inspection Report (DVIR)
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-slate-700 font-bold">{vehicle?.name}</span>
              <PlateBadge plate={vehicle?.licensePlate || 'NY-482-XA'} size="sm" />
              <span className="font-mono text-xs text-slate-500">• Driver: {driver?.name || 'Sarah Jenkins'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-slate-700 block mb-1">
                Inspection Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('PRE_TRIP')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition ${
                    type === 'PRE_TRIP'
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  Pre-Trip
                </button>
                <button
                  type="button"
                  onClick={() => setType('POST_TRIP')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-xs font-bold transition ${
                    type === 'POST_TRIP'
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-300'
                  }`}
                >
                  Post-Trip
                </button>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-slate-700 block mb-1">
                Odometer Reading (km)
              </label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full py-1.5 px-3 rounded-lg bg-white border border-slate-300 font-mono text-xs font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {/* 7 Inspection Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-800">
                Safety Checklist (Walkaround Items)
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Critical defects trigger automatic vehicle grounding
              </span>
            </div>

            {INSPECTION_CATEGORIES.map((cat) => {
              const currentStatus = results[cat.id]?.status || 'PASS';
              return (
                <div
                  key={cat.id}
                  className={`p-3 rounded-xl border transition ${
                    currentStatus === 'CRITICAL'
                      ? 'bg-red-50/60 border-red-300'
                      : currentStatus === 'MINOR'
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-display font-bold text-xs sm:text-sm text-slate-900 block">
                        {cat.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 block leading-tight">
                        {cat.desc}
                      </span>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(cat.id, 'PASS')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition ${
                          currentStatus === 'PASS'
                            ? 'bg-[#0F9D6B] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ✓ PASS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(cat.id, 'MINOR')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition ${
                          currentStatus === 'MINOR'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ▲ MINOR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(cat.id, 'CRITICAL')}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition ${
                          currentStatus === 'CRITICAL'
                            ? 'bg-[#D7263D] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        ✕ CRITICAL
                      </button>
                    </div>
                  </div>

                  {/* Comment field if non-pass */}
                  {currentStatus !== 'PASS' && (
                    <input
                      type="text"
                      placeholder={`Describe ${currentStatus.toLowerCase()} defect found on ${cat.name.toLowerCase()}...`}
                      value={results[cat.id]?.comment || ''}
                      onChange={(e) => handleCommentChange(cat.id, e.target.value)}
                      className="mt-2 w-full px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-sans text-xs text-slate-800 placeholder-slate-400"
                      required={currentStatus === 'CRITICAL'}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Remarks */}
          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-slate-700 block mb-1">
              General Remarks / Corrective Actions Needed
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Recommended front brake pad renewal at next 500 km service..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-sans text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* HTML5 Canvas Signature Certification */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-xs font-bold uppercase text-slate-800 block">
                  Driver Certification Signature
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  I certify that the above vehicle has been physically inspected.
                </span>
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="font-mono text-[10px] font-bold text-[#D7263D] hover:underline"
              >
                Clear Signature
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={560}
              height={100}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-24 bg-white border border-slate-300 rounded-lg cursor-crosshair touch-none"
            />
          </div>

          {/* Warning Banner if Critical */}
          {hasCritical && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div className="text-xs font-mono">
                <strong>OUT OF SERVICE WARNING:</strong> Submitting this DVIR with a critical defect will automatically ground <strong>{vehicle?.name}</strong> and set status to <strong>Maintenance</strong>.
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-mono text-xs font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-white transition shadow-sm ${
                hasCritical
                  ? 'bg-[#D7263D] hover:bg-red-700'
                  : 'bg-[#0B3D91] hover:bg-[#082b68]'
              }`}
            >
              {hasCritical ? 'Ground Vehicle & Submit DVIR' : 'Sign & Certify DVIR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
