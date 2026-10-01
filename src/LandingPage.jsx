import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SpeedArcLogo, DashboardIcon, SimulatorIcon, EngineTwinIcon, NavigationIcon, FleetIcon, AnalyticsIcon, SafetyIcon, SecurityIcon } from './components/icons';
import { Card, SectionLabel } from './components/ui';
import { CarSilhouette } from './components/ui/CarSilhouette';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLaunch = (path = '/dashboard') => {
    sessionStorage.setItem('velociq_logged_in', 'true');
    navigate(path);
  };

  const statCounters = [
    { value: '2.37x', label: 'Cubic Drag Tax Dissipated', desc: 'Aerodynamic power mitigated from 90 to 120 km/h', color: '#D7263D' },
    { value: '300ms', label: 'Physics Telemetry Tick', desc: 'High-frequency CAN-bus sensor streaming', color: '#0B3D91' },
    { value: '100%', label: 'Offline SPIFFS Resiliency', desc: 'Zero data loss during cellular carrier dropouts', color: '#0F9D6B' }
  ];

  const modules = [
    {
      title: 'Cockpit & Dual Gauges',
      path: '/dashboard',
      icon: DashboardIcon,
      tag: 'DRIVE / CLUSTER',
      desc: 'Authentic 270° dual analog speed & RPM dials in dark carbon binnacle with chrome bezel, aero sweet-spot radar, and ECU diagnostics.'
    },
    {
      title: 'What-If Physics Simulator',
      path: '/simulator',
      icon: SimulatorIcon,
      tag: 'LAB / SIMULATION',
      desc: 'Cubic aerodynamic drag modeling, gear selector velocity presets, airflow streamline visualization, and 3-tier value of time matrix.'
    },
    {
      title: '3D WebGL Digital Twin',
      path: '/engine-twin',
      icon: EngineTwinIcon,
      tag: 'ENGINE / 3D CAD',
      desc: 'Full-bleed 65% dark studio stage with 2.0L turbocharged engine, dynamic timeline playback scrubber, and real warning light injection.'
    },
    {
      title: 'Expressway GLOSA & Range',
      path: '/navigation',
      icon: NavigationIcon,
      tag: 'DRIVE / GLOSA',
      desc: 'Green-wave traffic signal synchronization, Esri World Light Gray road canvas, top-view rotating car marker, and limp-home governor.'
    },
    {
      title: 'Fleet Garage & Asset Map',
      path: '/fleet',
      icon: FleetIcon,
      tag: 'FLEET / OPERATIONS',
      desc: 'Regional vehicle roster with license plate badges, gear selector status filters, Esri light regional map, and instant telemetry switching.'
    },
    {
      title: 'AI Analytics & Hyperparameters',
      path: '/analytics',
      icon: AnalyticsIcon,
      tag: 'INSIGHTS / TUNER',
      desc: 'Neural network training lab with empirical loss curves, accuracy rings, and 3-tier enterprise financial speed matrix.'
    },
    {
      title: 'Driver Safety & Coaching',
      path: '/safety',
      icon: SafetyIcon,
      tag: 'INSIGHTS / SAFETY',
      desc: 'Speedometer 0-100 score gauge with deduction ledger, kinetic energy dissipation log, and prioritized AI coaching tips.'
    },
    {
      title: 'Threat Defense & Immobilizer',
      path: '/security',
      icon: SecurityIcon,
      tag: 'FLEET / DEFENSE',
      desc: 'Car-alarm style status strip, sweeping perimeter radar, fuel siphoning anomaly log, and guarded remote engine lockout.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F172A] flex flex-col font-sans selection:bg-[#0B3D91]/20 relative overflow-hidden">
      
      {/* 3px Dual Racing Stripe at the Very Top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D] z-50" />

      {/* Top Navbar */}
      <nav className="fixed top-[3px] left-0 right-0 z-40 border-b border-[#DDE2EA] bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <SpeedArcLogo className="w-7 h-7 text-[#0B3D91]" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-heading font-black tracking-widest text-[#0F172A]">VELOCIQ</span>
              <span className="text-[10px] font-mono font-bold uppercase bg-blue-50 text-[#0B3D91] border border-blue-200 px-2 py-0.5 rounded-full">
                SHOWROOM PRECISION v2.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleLaunch('/dashboard')} 
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#0B3D91] hover:bg-[#082b68] transition shadow-sm"
            >
              Mission Control
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-36 pb-16 px-6 text-center max-w-5xl mx-auto relative z-10">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-mono font-bold text-[#0B3D91] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#0B3D91] animate-pulse" />
          <span>CYBER-PHYSICAL AUTONOMOUS FLEET TELEMATICS</span>
        </div>

        {/* Headline about Cubic Drag Tax */}
        <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight text-[#0F172A] leading-[1.1] max-w-4xl">
          Conquer the <span className="text-[#0B3D91]">Cubic Drag Tax</span> with Autonomous Physics Telematics
        </h1>

        <p className="mt-5 max-w-2xl text-base text-slate-700 leading-relaxed font-sans font-medium">
          Because aerodynamic drag scales with the cube of velocity (<span className="font-mono font-bold text-[#0F172A]">P &prop; v&sup3;</span>), cruising at 120 km/h dissipates <strong className="text-[#D7263D]">2.37&times;</strong> the power of 90 km/h. VelocIQ synchronizes multi-physics engines, 3D WebGL twins, and green-wave GLOSA guidance to protect enterprise margins.
        </p>

        {/* Visual Automotive Hero Graphic: Side-View Car Silhouette with Streamlines */}
        <div className="relative my-8 w-full max-w-xl h-44 flex items-center justify-center bg-white rounded-2xl border border-[#DDE2EA] shadow-sm p-4 overflow-hidden">
          {/* Subtle Speed Streamlines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 500 160" preserveAspectRatio="none">
            <path d="M 0 40 Q 200 20 300 45 T 500 40" fill="none" stroke="#0B3D91" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M 0 70 Q 180 50 280 75 T 500 70" fill="none" stroke="#1E88E5" strokeWidth="2.5" />
            <path d="M 0 100 Q 220 85 320 105 T 500 100" fill="none" stroke="#B45309" strokeWidth="2" strokeDasharray="8 4" />
            <path d="M 0 130 Q 240 120 340 135 T 500 130" fill="none" stroke="#D7263D" strokeWidth="1.5" />
          </svg>

          {/* Car Silhouette Centerpiece */}
          <div className="relative z-10 flex flex-col items-center">
            <CarSilhouette profile="sedan" view="side" className="w-56 h-24 text-[#0B3D91]" />
            <div className="flex items-center gap-3 mt-1 font-mono text-[11px]">
              <span className="text-[#047857] font-bold">● Eco 70 km/h</span>
              <span className="text-[#0B3D91] font-bold">● Cruise 95 km/h</span>
              <span className="text-[#D7263D] font-bold">● Drag Tax Zone &gt;110 km/h</span>
            </div>
          </div>
        </div>

        {/* Single Primary CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLaunch('/dashboard')}
            className="px-8 py-3.5 rounded-xl text-sm font-bold font-mono uppercase tracking-wider text-white bg-[#0B3D91] hover:bg-[#082b68] transition shadow-md flex items-center gap-2 group"
          >
            <span>Launch Mission Control</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>

        {/* Chequered Flag Section Divider */}
        <div className="chequered-flag w-full max-w-4xl h-3 my-12 opacity-80" />

        {/* Three Animated Stat Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          {statCounters.map((s, idx) => (
            <Card key={idx} className="p-5 bg-white border border-[#DDE2EA] rounded-xl shadow-sm">
              <span className="text-3xl font-extrabold font-mono tabular-nums block" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-xs font-bold font-heading text-[#0F172A] uppercase tracking-wider mt-1 block">
                {s.label}
              </span>
              <p className="text-[11px] text-slate-700 font-medium mt-1 leading-normal font-sans">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>

      </main>

      {/* Feature Grid for the 8 Modules */}
      <section className="py-16 px-6 mx-auto max-w-7xl relative z-10 border-t border-[#DDE2EA] bg-[#F8FAFC]">
        <div className="text-center mb-10">
          <SectionLabel label="SYSTEM CAPABILITIES & ARCHITECTURE" />
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#0F172A] mt-2">
            Eight Integrated Automotive Modules
          </h2>
          <p className="text-xs text-slate-700 font-medium mt-2 max-w-lg mx-auto">
            Engineered as a high-precision digital showroom & engineering workbench for enterprise fleet directors, vehicle engineers, and dispatch operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                onClick={() => handleLaunch(m.path)}
                className="group p-5 rounded-xl border border-[#DDE2EA] bg-white hover:border-[#0B3D91] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-[#0B3D91] transition text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 tracking-wider">
                      {m.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-heading font-bold text-[#0F172A] group-hover:text-[#0B3D91] transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed font-sans">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono font-bold text-[#0B3D91]">
                  <span>Enter Module</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DDE2EA] bg-white px-6 py-8 relative z-10 text-xs text-slate-700 font-mono">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SpeedArcLogo className="w-5 h-5 text-[#0B3D91]" />
            <span className="font-bold text-[#0F172A]">VELOCIQ TELEMATICS PLATFORM</span>
          </div>
          <div>
            Built with React 18, Three.js WebGL, Leaflet Esri Light Canvas, and Precision Automotive Design System.
          </div>
        </div>
      </footer>

    </div>
  );
}

