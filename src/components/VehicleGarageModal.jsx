import React from 'react';

function SportsSedanIcon({ className = "w-12 h-12 text-cyan-400" }) {
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

function EcoHatchbackIcon({ className = "w-12 h-12 text-emerald-400" }) {
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

function HeavySuvIcon({ className = "w-12 h-12 text-amber-400" }) {
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
    desc: 'Balanced performance and efficiency.',
    specs: { engine: '2.0L Turbo', hp: 250, weight: '1,550 kg', tank: '55 L', maxRpm: 5000 },
    Icon: SportsSedanIcon,
    accent: 'cyan'
  },
  { 
    id: 'hatchback', 
    name: 'Eco Hatchback', 
    desc: 'Lightweight for maximum fuel savings.',
    specs: { engine: '1.2L Hybrid', hp: 110, weight: '1,100 kg', tank: '35 L', maxRpm: 3200 },
    Icon: EcoHatchbackIcon,
    accent: 'emerald'
  },
  { 
    id: 'suv', 
    name: 'Heavy SUV', 
    desc: 'Large capacity, heavy fuel consumption.',
    specs: { engine: '3.5L V6', hp: 290, weight: '2,200 kg', tank: '80 L', maxRpm: 4200 },
    Icon: HeavySuvIcon,
    accent: 'amber'
  }
];

export default function VehicleGarageModal({ isOpen, onClose, selectedProfile, onSelectProfile }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Vehicle Garage</h2>
            <p className="text-sm text-slate-400">Select your active fleet vehicle to update simulation physics.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">
          {garageProfiles.map((p) => {
            const isSelected = p.id === selectedProfile;
            const { Icon } = p;
            return (
              <div 
                key={p.id}
                onClick={() => { onSelectProfile(p.id); onClose(); }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-center mb-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <Icon className="w-14 h-14" />
                  </div>
                  <h3 className={`text-center text-lg font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                    {p.name}
                  </h3>
                  <p className="mt-2 text-center text-xs text-slate-400">{p.desc}</p>
                </div>
                
                <div>
                  <div className="mt-4 space-y-2 rounded-xl bg-slate-900 p-3 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Engine:</span> <span className="text-slate-300 font-mono">{p.specs.engine}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Power:</span> <span className="text-slate-300 font-mono">{p.specs.hp} HP</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Weight:</span> <span className="text-slate-300 font-mono">{p.specs.weight}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tank:</span> <span className="text-slate-300 font-mono">{p.specs.tank}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Redline:</span> <span className="text-slate-300 font-mono">{p.specs.maxRpm} RPM</span></div>
                  </div>

                  {isSelected ? (
                    <div className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-cyan-400">
                      Active Vehicle
                    </div>
                  ) : (
                    <div className="mt-4 text-center text-xs text-slate-500 hover:text-slate-300">
                      Click to Select
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
