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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl rounded-2xl border border-line bg-white shadow-2xl relative overflow-hidden">
        {/* 3px Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />

        <div className="flex items-center justify-between border-b border-line bg-slate-50/70 p-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold">
              PHYSICS TELEMETRY CONFIGURATION
            </div>
            <h2 className="text-2xl font-bold font-heading text-[#0F172A] mt-0.5">Vehicle Garage Roster</h2>
            <p className="text-xs text-slate-700 font-medium">Select your active fleet vehicle to update simulation physics and drag coefficient.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-white p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition border border-line shadow-xs"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-3">
          {garageProfiles.map((p) => {
            const isSelected = p.id === selectedProfile;
            const { Icon } = p;
            return (
              <div 
                key={p.id}
                onClick={() => { onSelectProfile(p.id); onClose(); }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#0B3D91] bg-blue-50/60 shadow-md ring-2 ring-[#0B3D91]/20' 
                    : 'border-slate-200 bg-slate-50/60 hover:border-slate-400 hover:bg-white shadow-xs'
                }`}
              >
                <div>
                  <div className="flex justify-center mb-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <Icon className="w-14 h-14" />
                  </div>
                  <h3 className={`text-center text-base font-bold font-heading ${isSelected ? 'text-[#0B3D91]' : 'text-[#0F172A]'}`}>
                    {p.name}
                  </h3>
                  <p className="mt-1 text-center text-xs text-slate-700 font-medium leading-relaxed">{p.desc}</p>
                </div>
                
                <div>
                  <div className="mt-4 space-y-2 rounded-xl bg-white border border-slate-200 p-3 text-xs font-mono">
                    <div className="flex justify-between"><span className="text-slate-700 font-semibold">Engine:</span> <span className="text-slate-900 font-bold">{p.specs.engine}</span></div>
                    <div className="flex justify-between"><span className="text-slate-700 font-semibold">Power:</span> <span className="text-slate-900 font-bold">{p.specs.hp} HP</span></div>
                    <div className="flex justify-between"><span className="text-slate-700 font-semibold">Weight:</span> <span className="text-slate-900 font-bold">{p.specs.weight}</span></div>
                    <div className="flex justify-between"><span className="text-slate-700 font-semibold">Tank:</span> <span className="text-slate-900 font-bold">{p.specs.tank}</span></div>
                    <div className="flex justify-between"><span className="text-slate-700 font-semibold">Redline:</span> <span className="text-slate-900 font-bold">{p.specs.maxRpm} RPM</span></div>
                  </div>

                  {isSelected ? (
                    <div className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-[#0B3D91] bg-blue-100 py-1.5 rounded-lg border border-blue-200">
                      Active Profile
                    </div>
                  ) : (
                    <div className="mt-4 text-center text-xs font-bold text-slate-700 hover:text-[#0B3D91] py-1.5">
                      Click to Select &rarr;
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

