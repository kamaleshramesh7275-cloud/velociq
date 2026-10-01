import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SpeedArcLogo, LockIcon } from './components/icons';
import { Card, SectionLabel } from './components/ui';

export default function LoginPage({ onLogin }) {
  // Pre-filled demo credentials
  const [email, setEmail] = useState('director@velociq.io');
  const [password, setPassword] = useState('ObsidianCommand2026');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onLogin) onLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-4 py-8 relative overflow-hidden text-[#0F172A] select-none">
      
      {/* 3px Racing Stripe on very top of screen */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D] z-50" />

      {/* Centered White Showroom Card */}
      <Card className="w-full max-w-md bg-white border border-[#DDE2EA] rounded-2xl p-8 shadow-lg relative z-10 overflow-hidden">
        
        {/* Card Top Accent Racing Stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />

        {/* Logo & Header */}
        <div className="text-center flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs mb-3">
            <SpeedArcLogo className="w-8 h-8 text-[#0B3D91]" />
          </div>
          <SectionLabel label="ENTERPRISE AUTHENTICATION" />
          <h2 className="mt-2 text-2xl font-bold font-heading tracking-tight text-[#0F172A]">
            VelocIQ Mission Control
          </h2>
          <p className="mt-1 text-xs text-slate-700 font-medium font-sans">
            Access autonomous fleet telematics and digital twin telemetry.
          </p>
        </div>

        {/* Form with Pre-filled Demo Credentials and Clean Light Focus Rings */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-mono uppercase font-bold text-slate-800" htmlFor="email">
              Operator Identity (Email)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] px-4 py-2.5 text-xs font-mono text-[#0F172A] outline-none transition focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] focus:bg-white"
              placeholder="director@velociq.io"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-mono uppercase font-bold text-slate-800" htmlFor="password">
              Security Token (Password)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] px-4 py-2.5 text-xs font-mono text-[#0F172A] outline-none transition focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] focus:bg-white"
              placeholder="••••••••••••"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#0B3D91] hover:bg-[#082b68] py-3 px-4 text-xs font-bold font-mono uppercase tracking-wider text-white shadow-sm transition flex items-center justify-center gap-2"
            >
              <LockIcon className="w-3.5 h-3.5 text-white" />
              <span>Authorize & Enter Cockpit</span>
            </button>
          </div>
        </form>

        <div className="mt-5 p-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-center">
          <p className="text-[11px] font-mono text-slate-700 font-semibold">
            Demo credentials pre-filled • Direct offline simulation access
          </p>
        </div>

        <div className="mt-5 text-center">
          <Link to="/" className="text-xs font-mono text-[#0B3D91] hover:underline font-bold transition">
            &larr; Return to public showroom
          </Link>
        </div>

      </Card>
    </div>
  );
}

