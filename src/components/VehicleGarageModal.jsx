import React from 'react';

const garageProfiles = [
  { 
    id: 'sedan', 
    name: 'Sports Sedan', 
    desc: 'Balanced performance and efficiency.',
    specs: { engine: '2.0L Turbo', hp: 250, weight: '1,550 kg', tank: '55 L', maxRpm: 5000 },
    icon: '🏎️'
  },
  { 
    id: 'hatchback', 
    name: 'Eco Hatchback', 
    desc: 'Lightweight for maximum fuel savings.',
    specs: { engine: '1.2L Hybrid', hp: 110, weight: '1,100 kg', tank: '35 L', maxRpm: 3200 },
    icon: '🚗'
  },
  { 
    id: 'suv', 
    name: 'Heavy SUV', 
    desc: 'Large capacity, heavy fuel consumption.',
    specs: { engine: '3.5L V6', hp: 290, weight: '2,200 kg', tank: '80 L', maxRpm: 4200 },
    icon: '🚙'
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
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-3">
          {garageProfiles.map((p) => {
            const isSelected = p.id === selectedProfile;
            return (
              <div 
                key={p.id}
                onClick={() => { onSelectProfile(p.id); onClose(); }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="text-5xl mb-4 text-center">{p.icon}</div>
                <h3 className={`text-center text-lg font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                  {p.name}
                </h3>
                <p className="mt-2 text-center text-xs text-slate-400">{p.desc}</p>
                
                <div className="mt-4 space-y-2 rounded-xl bg-slate-900 p-3 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Engine:</span> <span className="text-slate-300">{p.specs.engine}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Power:</span> <span className="text-slate-300">{p.specs.hp} HP</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Weight:</span> <span className="text-slate-300">{p.specs.weight}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tank:</span> <span className="text-slate-300">{p.specs.tank}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Redline:</span> <span className="text-slate-300">{p.specs.maxRpm} RPM</span></div>
                </div>

                {isSelected && (
                  <div className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-cyan-400">
                    Active Vehicle
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
