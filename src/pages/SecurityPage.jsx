import React, { useState } from 'react';
import { SimulationContext } from '../context/SimulationContext';
import { useFleet } from '../context/FleetContext';
import { useAuth } from '../context/AuthContext';
import { Card, SectionLabel, Modal } from '../components/ui';
import { PlateBadge } from '../components/ui/PlateBadge';
import { WarningLight } from '../components/ui/WarningLight';
import { 
  ShieldIcon, 
  AlertTriangleIcon, 
  LockIcon, 
  FuelIcon, 
  PulseDot 
} from '../components/icons';

export default function SecurityPage() {
  const { hasPermission, activeRoleData } = useAuth();
  const canImmobilize = hasPermission('canImmobilize');
  const { securityState, setSecurityState, isConnected } = React.useContext(SimulationContext);
  const { threatLevel, isGeofenceBreached, isImmobilized } = securityState;
  const { activeVehicle } = useFleet();
  const vehiclePlate = activeVehicle?.licensePlate || 'DL-01-AB-1234';

  // Guarded Remote Immobilizer Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [typedPlate, setTypedPlate] = useState('');
  const [modalAction, setModalAction] = useState('LOCK'); // 'LOCK' or 'UNLOCK'

  const handleToggleGuarded = () => {
    if (!canImmobilize) return;
    setModalAction(isImmobilized ? 'UNLOCK' : 'LOCK');
    setTypedPlate('');
    setShowConfirmModal(true);
  };

  const handleExecuteGuardedAction = () => {
    if (typedPlate.trim().toUpperCase() !== vehiclePlate.toUpperCase()) {
      return;
    }
    const nextImmobilized = !isImmobilized;
    setSecurityState((s) => ({
      ...s,
      isImmobilized: nextImmobilized,
      threatLevel: nextImmobilized ? 'Critical' : 'Secure'
    }));
    setShowConfirmModal(false);
    setTypedPlate('');
  };

  // Car alarm status strip configuration
  const threatLevels = ['Secure', 'Elevated', 'Critical', 'Alert'];
  const threatConfig = {
    Secure: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'emerald' },
    Elevated: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'amber' },
    Critical: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'rose' },
    Alert: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', dot: 'rose' }
  }[threatLevel] || { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'emerald' };

  // Security Event Timeline data
  const securityEvents = [
    {
      id: 'e1',
      type: 'Fuel Siphoning Anomaly',
      desc: 'Rapid fuel tank drop of 8.2L detected while ignition was OFF.',
      time: '14:24:02',
      lightType: 'fuel',
      lightColor: 'red',
      severity: 'critical'
    },
    {
      id: 'e2',
      type: 'ECU Bus Dropout Warning',
      desc: 'OBD-II CAN telemetry frame drop rate reached 4.2% on trunk link.',
      time: '13:58:45',
      lightType: 'engine',
      lightColor: 'amber',
      severity: 'warning'
    },
    {
      id: 'e3',
      type: 'Geofence Perimeter Boundary',
      desc: isGeofenceBreached 
        ? 'Vehicle exited Central Logistics authorized operating boundary.' 
        : 'Vehicle operating inside authorized geofence boundary.',
      time: '12:15:30',
      lightType: 'battery',
      lightColor: isGeofenceBreached ? 'red' : 'green',
      severity: isGeofenceBreached ? 'critical' : 'nominal'
    }
  ];

  return (
    <div className="p-6 md:p-8 flex-1 overflow-auto bg-[#F4F6F9] text-[#0F172A]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        
        {/* Header with 3px Racing Stripe */}
        <header className="relative bg-white border border-[#DDE2EA] rounded-xl p-5 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B3D91] via-[#0B3D91] to-[#D7263D]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <SectionLabel label="SECURITY & ASSET DEFENSE" />
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0F172A] tracking-tight mt-1">
                Threat Defense & Remote Immobilizer
              </h1>
              <p className="mt-1 text-xs text-[#475569]">
                CAN bus anomaly radar, geofence boundary integrity, and guarded fuel pump interlock.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-700 font-bold">TARGET VEHICLE:</span>
              <PlateBadge plate={vehiclePlate} region="IND" size="md" />
            </div>
          </div>
        </header>

        {/* Car-Alarm Style Status Strip */}
        <div className="bg-white border border-[#DDE2EA] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Shield and Key SVG */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              isImmobilized ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-blue-50 text-[#0B3D91] border-blue-200'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                  VEHICLE IMMOBILIZATION RADAR
                </span>
                <span className="text-[10px] font-mono text-slate-700 font-semibold">• 256-bit Encrypted CAN</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                Status: <strong className={isImmobilized ? 'text-rose-700' : 'text-[#047857]'}>
                  {isImmobilized ? 'POWERTRAIN LOCKED (0 KM/H)' : 'ARMED & MONITORING'}
                </strong>
              </p>
            </div>
          </div>

          {/* 4-State Car Alarm Level Indicator */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1.5 rounded-lg border border-[#CBD5E1]">
            {threatLevels.map((lvl) => {
              const active = threatLevel.toLowerCase() === lvl.toLowerCase();
              return (
                <div
                  key={lvl}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                    active
                      ? `${threatConfig.bg} ${threatConfig.color} border ${threatConfig.border} shadow-sm`
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    active 
                      ? lvl === 'Secure' ? 'bg-[#047857]' : lvl === 'Elevated' ? 'bg-[#B45309]' : 'bg-[#D7263D]' 
                      : 'bg-slate-400'
                  }`} />
                  {lvl}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Split: Perimeter Radar (Left) + Guarded Remote Immobilizer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cols 1-7: Sweeping Threat Radar */}
          <div className="lg:col-span-7">
            <Card className="p-6 bg-white border border-[#DDE2EA] rounded-xl shadow-sm h-full flex flex-col justify-between">
              <div>
                <SectionLabel label="PERIMETER THREAT RADAR" />
                <h3 className="text-lg font-heading font-bold text-[#0F172A] mt-1">Active RF & Telemetry Sensor Sweep</h3>
              </div>

              {/* Concentric rings radar with sweeping line */}
              <div className="relative my-6 h-64 w-full flex items-center justify-center overflow-hidden bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="relative w-60 h-60 rounded-full border border-slate-300 flex items-center justify-center bg-white shadow-inner">
                  {/* Concentric ring 1 */}
                  <div className="absolute w-44 h-44 rounded-full border border-slate-200" />
                  {/* Concentric ring 2 */}
                  <div className="absolute w-28 h-28 rounded-full border border-slate-200" />
                  {/* Concentric ring 3 */}
                  <div className="absolute w-12 h-12 rounded-full border border-blue-200 bg-blue-50/60" />
                  
                  {/* Crosshairs */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-slate-200" />

                  {/* Sweeping radar arm */}
                  <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
                    <div className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-[#0B3D91] origin-right absolute left-0 shadow-[0_0_8px_rgba(11,61,145,0.4)]" />
                  </div>

                  {/* Target Blips */}
                  <div className="absolute top-16 right-20 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-ping" />
                  <div className="absolute bottom-20 left-16 h-2 w-2 rounded-full bg-[#0B3D91] shadow-[0_0_6px_#0B3D91]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-medium border-t border-[#E2E8F0] pt-3">
                <span>SWEEP RADIUS: 5.0 KM</span>
                <span className="text-emerald-700 font-bold">TELEMETRY LINK: ENCRYPTED AES-256</span>
              </div>
            </Card>
          </div>

          {/* Cols 8-12: Guarded Remote Immobilizer */}
          <div className="lg:col-span-5">
            <Card 
              className={`p-6 rounded-xl border transition-all duration-300 shadow-sm h-full flex flex-col justify-between ${
                isImmobilized 
                  ? 'bg-rose-50/30 border-rose-300 shadow-[0_0_20px_rgba(215,38,61,0.15)]' 
                  : 'bg-white border-[#DDE2EA]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <SectionLabel label="GUARDED CONTROL / IMMOBILIZER" />
                  <LockIcon className={`w-4 h-4 ${isImmobilized ? 'text-[#D7263D] animate-pulse' : 'text-slate-600'}`} />
                </div>
                <h3 className="text-lg font-heading font-bold text-[#0F172A] mt-1">Remote Powertrain Cutoff</h3>
                <p className="mt-1 text-xs text-[#475569] leading-relaxed">
                  Safely interlocks the electronic fuel pump and restricts vehicle speed to 0 km/h. Requires explicit plate confirmation.
                </p>
              </div>

              {/* State Banner: "Engine locked. Speed limited to 0 km/h." */}
              <div className="my-6 text-center">
                {isImmobilized ? (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 p-5 shadow-sm">
                    <span className="text-xs font-mono font-bold uppercase text-rose-700 block tracking-wider">
                      CRITICAL SECURITY INTERLOCK
                    </span>
                    <h2 className="text-2xl font-black font-heading text-rose-900 mt-1">
                      Engine locked. Speed limited to 0 km/h.
                    </h2>
                    <p className="text-xs font-mono text-rose-700 mt-1">
                      Electronic Fuel Injectors Cut • Anti-Theft Active
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] p-5">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-700 block tracking-wider">
                      POWERTRAIN NOMINAL
                    </span>
                    <h2 className="text-2xl font-bold font-heading text-[#0F172A] mt-1">
                      Ignition Armed & Ready
                    </h2>
                    <p className="text-xs font-mono text-slate-700 font-semibold mt-1">
                      Full Powertrain & ECU Authorization Granted
                    </p>
                  </div>
                )}
              </div>

              {/* Slide-to-arm / Guarded Switch */}
              <div>
                {canImmobilize ? (
                  <button
                    onClick={handleToggleGuarded}
                    disabled={!isConnected && !isImmobilized}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                      isImmobilized
                        ? 'bg-[#0F9D6B] hover:bg-[#0c8258] text-white shadow-emerald-500/20'
                        : 'bg-[#D7263D] hover:bg-[#ba1e32] text-white shadow-rose-500/20'
                    }`}
                  >
                    <LockIcon className="w-4 h-4 text-white" />
                    {isImmobilized ? 'Reactivate Powertrain' : 'Lock Engine & Immobilize'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border border-slate-300 bg-slate-100 text-slate-400 flex items-center justify-center gap-2 cursor-not-allowed shadow-2xs opacity-80"
                    title={`Remote Immobilizer Locked: Fleet Administrator authority required. Active role: ${activeRoleData?.label}`}
                  >
                    <LockIcon className="w-4 h-4 text-slate-400" />
                    <span>IMMOBILIZER LOCKED (ADMIN ONLY)</span>
                  </button>
                )}
                <p className="text-[10px] font-mono text-center text-slate-700 font-semibold mt-2">
                  Protected by 2-Factor License Plate Confirmation
                </p>
              </div>
            </Card>
          </div>

        </div>

        {/* Lower Row: Security Event Timeline in Light Showroom Cards with WarningLights */}
        <Card className="p-6 bg-white border border-[#DDE2EA] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionLabel label="SECURITY & ANOMALY TIMELINE" />
              <h3 className="text-lg font-heading font-bold text-[#0F172A] mt-1">Live Audit Log of Vehicle Threat Events</h3>
            </div>
            <span className="text-xs font-mono font-medium text-[#475569] bg-[#F1F5F9] px-3 py-1 rounded-full border border-[#DDE2EA]">
              {securityEvents.length} active events
            </span>
          </div>

          <div className="space-y-3">
            {securityEvents.map((evt) => {
              return (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 transition shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Automotive Warning Light Icon */}
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <WarningLight 
                        type={evt.lightType} 
                        color={evt.lightColor} 
                        active={true} 
                        size={22} 
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-heading font-bold text-[#0F172A]">{evt.type}</h4>
                      <p className="text-xs text-[#475569] mt-0.5">{evt.desc}</p>
                    </div>
                  </div>

                  <div className="text-right pl-4">
                    <span className="text-xs font-mono text-[#0B3D91] font-bold tabular-nums block">{evt.time}</span>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border inline-block mt-1 ${
                      evt.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                      evt.severity === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {evt.severity === 'critical' ? 'HIGH RISK' : evt.severity === 'warning' ? 'WARNING' : 'RESOLVED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* CONFIRMATION MODAL: REQUIRES TYPING VEHICLE LICENSE PLATE */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalAction === 'LOCK' ? 'Confirm Remote Engine Immobilization' : 'Confirm Engine Reactivation'}
      >
        <div className="flex flex-col gap-4 text-[#0F172A]">
          <p className="text-xs text-[#475569] leading-relaxed">
            {modalAction === 'LOCK'
              ? `You are about to cut fuel delivery and govern speed to 0 km/h for asset ${activeVehicle?.name || 'Selected Vehicle'}. To proceed, verify the vehicle license plate below.`
              : `You are restoring fuel delivery and powertrain authorization for asset ${activeVehicle?.name || 'Selected Vehicle'}. Enter plate to confirm.`}
          </p>

          <div className="rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] p-3 flex justify-between items-center font-mono text-xs">
            <span className="text-slate-700 uppercase font-bold">Required Plate:</span>
            <PlateBadge plate={vehiclePlate} region="IND" size="md" />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-slate-800 font-bold block mb-1">
              Type License Plate to Confirm
            </label>
            <input
              type="text"
              value={typedPlate}
              onChange={(e) => setTypedPlate(e.target.value)}
              placeholder={vehiclePlate}
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-mono text-[#0F172A] uppercase tracking-widest outline-none focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 border border-[#DDE2EA]"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteGuardedAction}
              disabled={typedPlate.trim().toUpperCase() !== vehiclePlate.toUpperCase()}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition ${
                typedPlate.trim().toUpperCase() === vehiclePlate.toUpperCase()
                  ? modalAction === 'LOCK' 
                    ? 'bg-[#D7263D] hover:bg-[#ba1e32] text-white shadow-sm' 
                    : 'bg-[#0F9D6B] hover:bg-[#0c8258] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 cursor-not-allowed border border-[#DDE2EA]'
              }`}
            >
              {modalAction === 'LOCK' ? 'Confirm Lockout' : 'Confirm Reactivation'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

