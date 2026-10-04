import React from 'react';

function SportsSedanIcon({ className = "w-12 h-12 text-[#0B3D91]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {/* Aerodynamic sports sedan contour */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="1.8" 
        d="M2.5 14.5l1.5-2.5 4-3h6l3.5 2.5 3.5.5c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1h-1.5M4 16.5H2c-.6 0-1-.4-1-1v-1M8.5 16.5h7" 
      />
      <circle cx="6" cy="16.5" r="2" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />
      <circle cx="17" cy="16.5" r="2" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />
      <path strokeLinecap="round" strokeWidth="1.5" d="M8 9.5l-.5 2.5h4.5M12 9.5l-.5 2.5h3" />
    </svg>
  );
}

function EcoHatchbackIcon({ className = "w-12 h-12 text-[#047857]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {/* Compact aerodynamic hatchback contour */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="1.8" 
        d="M3 14.5l2-4 5-2.5h4l4 3.5 2 .5c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1h-1.5M4.5 16.5H2c-.6 0-1-.4-1-1v-1M8 16.5h7" 
      />
      <circle cx="6.5" cy="16.5" r="2" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />
      <circle cx="16.5" cy="16.5" r="2" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />
      <path strokeLinecap="round" strokeWidth="1.5" d="M9 8.5l-.5 3h4M12.5 8.5l-.5 3h3" />
    </svg>
  );
}

function HeavySuvIcon({ className = "w-12 h-12 text-[#B45309]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {/* Tall rugged high-clearance SUV contour */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="1.8" 
        d="M2 14.5l1-5h12l4 3.5 2.5.5c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1h-1M4 16.5H1c-.6 0-1-.4-1-1v-1M8 16.5h7.5" 
      />
      <path strokeLinecap="round" strokeWidth="1.5" d="M5 8h10" />
      <circle cx="6" cy="16.5" r="2.2" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />
      <circle cx="17" cy="16.5" r="2.2" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />
      <path strokeLinecap="round" strokeWidth="1.5" d="M8 9.5v2.5h3.5M11.5 9.5v2.5h3.5" />
    </svg>
  );
}

const garageProfiles = [
  { 
    id: 'sedan', 
    name: 'Sports Sedan', 
    desc: 'Balanced performance and aerodynamic efficiency.',
    specs: { engine: '2.0L Turbo', hp: 250, weight: '1,550 kg', tank: '55 L', maxRpm: 5000 },
    Icon: SportsSedanIcon,
    accent: '#0B3D91'
  },
  { 
    id: 'hatchback', 
    name: 'Eco Hatchback', 
    desc: 'Lightweight chassis optimized for maximum fuel savings.',
    specs: { engine: '1.2L Hybrid', hp: 110, weight: '1,100 kg', tank: '35 L', maxRpm: 3200 },
    Icon: EcoHatchbackIcon,
    accent: '#047857'
  },
  { 
    id: 'suv', 
    name: 'Heavy SUV', 
    desc: 'Higher aerodynamic drag and higher mass displacement.',
    specs: { engine: '3.5L V6', hp: 290, weight: '2,200 kg', tank: '80 L', maxRpm: 4200 },
    Icon: HeavySuvIcon,
    accent: '#B45309'
  }
];

export default function VehicleGarageModal({ isOpen, onClose, selectedProfile, onSelectProfile }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border border-line bg-white shadow-2xl relative overflow-hidden my-auto shrink-0">
        {/* 3px Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />

        <div className="flex items-center justify-between border-b border-line bg-slate-50/80 px-4 py-3 shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold">
              PHYSICS TELEMETRY CONFIGURATION
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-[#0F172A]">Connected Fleet Asset</h2>
            <p className="text-[11px] text-slate-600 font-medium">Hardware telematics stream and 3D aerodynamic engine locked to primary vehicle.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-white p-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition border border-line shadow-xs cursor-pointer shrink-0"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto">
          <div className="rounded-xl border border-[#0B3D91] bg-blue-50/50 p-4 shadow-sm ring-1 ring-[#0B3D91]/20 flex flex-col justify-between">
            <div>
              <div className="flex justify-center mb-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <SportsSedanIcon className="w-14 h-14 text-[#0B3D91]" />
              </div>
              <div className="text-center">
                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                  ● ACTIVE LIVE ASSET
                </span>
                <h3 className="text-lg font-black font-heading text-[#0B3D91] mt-1.5">
                  Alpha Cruiser
                </h3>
                <div className="inline-block mt-0.5">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white shadow-2xs">
                    NY-482-XA
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-600 font-medium leading-relaxed">
                  2.0L I-4 DOHC Turbocharged Powertrain with 270° Chronometer Flight Binnacle & 3D Vector Aerodynamics.
                </p>
              </div>
            </div>
            
            <div className="mt-3.5 space-y-1.5 rounded-xl bg-white border border-slate-200 p-3 text-[11px] font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-600 font-semibold">Vehicle Profile:</span> <span className="text-slate-900 font-bold">Aerodynamic Sports Sedan</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-600 font-semibold">Engine / Powertrain:</span> <span className="text-slate-900 font-bold">2.0L I-4 Turbo (250 HP)</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-600 font-semibold">Curb Weight / Payload:</span> <span className="text-slate-900 font-bold">1,550 kg / 600 kg Max</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-600 font-semibold">Fuel Capacity:</span> <span className="text-slate-900 font-bold">55 Liters (Petrol)</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-600 font-semibold">Drag Coefficient (Cd):</span> <span className="text-slate-900 font-bold text-[#0B3D91]">0.28 (Aero Tuned)</span></div>
              <div className="flex justify-between"><span className="text-slate-600 font-semibold">Telemetry Protocol:</span> <span className="text-emerald-700 font-bold">CAN-FD 500kbps 60Hz</span></div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-3.5 w-full py-2 rounded-xl bg-[#0B3D91] hover:bg-[#082b68] text-white font-mono text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Close Asset Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

