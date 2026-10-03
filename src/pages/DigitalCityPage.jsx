import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { SimulationContext } from '../context/SimulationContext';
import DigitalCityWorld from '../components/DigitalCityWorld';
import PhoneConnectModal from '../components/PhoneConnectModal';
import { onControlPacket, initBridge, onStatusChange } from '../services/telemetryBridge';

export default function DigitalCityPage() {
  const sim = useContext(SimulationContext);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState({ status: 'disconnected', latency: 0 });
  const [engineOn, setEngineOn] = useState(false);
  const [activeDTCsFromController, setActiveDTCsFromController] = useState([]);

  // Init bridge on desktop side
  useEffect(() => {
    initBridge('vehicle');
    const unsubStatus = onStatusChange(setBridgeStatus);
    const unsubControl = onControlPacket((cmd) => {
      if (cmd.engineOn !== undefined) setEngineOn(cmd.engineOn);
      if (cmd.activeFaults !== undefined) setActiveDTCsFromController(cmd.activeFaults);
    });
    return () => { unsubStatus(); unsubControl(); };
  }, []);

  // Receive telemetry from 3D world and push into SimulationContext
  const handleTelemetry = useCallback((tel) => {
    if (!sim?.setTelemetry) return;
    sim.setTelemetry(prev => ({
      ...prev,
      speed: tel.speed,
      rpm: tel.rpm,
      gear: tel.gear || 'D',
      driveMode: tel.driveMode || 'SPORT',
      coolant: tel.coolant,
      oilTemp: tel.oilTemp || 90,
      oilPressurePsi: 24 + (tel.rpm / 8000) * 42,
      fuel: tel.fuelPct ?? prev.fuel,
      maf: 2 + (tel.rpm / 8000) * 18,
      voltage: 13.8 + (tel.rpm > 1200 ? 0.4 : 0.1),
      throttle: tel.throttle ?? 0,
      brake: tel.brake ?? 0,
      steer: tel.steer ?? 0,
      route: {
        ...prev.route,
        lat: 28.6139 + (tel.posZ || 0) / 100000,
        lon: 77.2090 + (tel.posX || 0) / 100000,
        heading: ((tel.rotY || 0) * 180 / Math.PI + 360) % 360,
      },
      // Real Tire & Brake thermals from 3D city physics
      tireTempFL: tel.tireTempFL ?? 35,
      tireTempFR: tel.tireTempFR ?? 35,
      brakeTempFL: tel.brakeTempFL ?? 45,
      brakeTempFR: tel.brakeTempFR ?? 45,
      brakeTempRL: tel.brakeTempRL ?? 45,
      brakeTempRR: tel.brakeTempRR ?? 45,
      latG: tel.latG ?? 0,
      longG: tel.longG ?? 0,
      engineOn: engineOn || tel.rpm > 0,
      isRealWorldLive: true,
      lastRealWorldUpdate: Date.now(),
      // Fault codes injected from phone
      activeFaults: activeDTCsFromController,
    }));

    // Push injected DTC faults into the fleet-level fault list
    if (activeDTCsFromController.length > 0 && sim?.setActiveDTCs) {
      sim.setActiveDTCs(activeDTCsFromController);
    }
  }, [sim, engineOn, activeDTCsFromController]);

  const statusColor = bridgeStatus.status === 'websocket' ? '#22C55E'
    : bridgeStatus.status === 'broadcast' ? '#38BDF8'
    : '#4B5563';

  const statusLabel = bridgeStatus.status === 'websocket' ? `PHONE · ${bridgeStatus.latency}ms`
    : bridgeStatus.status === 'broadcast' ? `SAME-DEVICE · ${bridgeStatus.latency}ms`
    : 'NO CONTROLLER';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#0A0E15', color: '#E8EAED',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{
        background: '#111318', borderBottom: '1px solid #1E232E',
        padding: '10px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0, gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.04em', color: '#00D4FF' }}>
            🏙 DIGITAL TWIN CITY
          </div>
          <div style={{ fontSize: 10, color: '#6B7280', marginTop: 1 }}>
            3D World · Phone-Controlled · Live Telematics Feed
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Engine status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            borderRadius: 8, background: engineOn ? '#22C55E18' : '#0A0E15',
            border: `1px solid ${engineOn ? '#22C55E44' : '#1E232E'}`,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: engineOn ? '#22C55E' : '#4B5563',
              boxShadow: engineOn ? '0 0 6px #22C55E' : 'none',
            }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: engineOn ? '#22C55E' : '#6B7280' }}>
              ENGINE {engineOn ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Controller status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
            borderRadius: 8, background: '#0A0E15', border: '1px solid #1E232E',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, fontFamily: 'monospace' }}>
              {statusLabel}
            </span>
          </div>

          {/* Connect button */}
          <button
            onClick={() => setShowConnectModal(true)}
            style={{
              padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 700,
              background: '#00D4FF22', border: '1px solid #00D4FF66',
              color: '#00D4FF', cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            📱 CONNECT PHONE
          </button>
        </div>
      </div>

      {/* ── 3D World canvas ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DigitalCityWorld onTelemetry={handleTelemetry} />
      </div>

      {/* ── Live telemetry strip ─────────────────────────────────────────── */}
      {sim?.telemetry && (
        <div style={{
          background: '#111318', borderTop: '1px solid #1E232E',
          padding: '8px 16px', display: 'flex', gap: 24, alignItems: 'center',
          flexShrink: 0, overflowX: 'auto',
        }}>
          {[
            { label: 'SPEED', value: `${Math.round(sim.telemetry.speed || 0)} km/h`, color: '#00D4FF' },
            { label: 'RPM', value: Math.round(sim.telemetry.rpm || 0), color: (sim.telemetry.rpm || 0) > 6000 ? '#EF4444' : '#E8EAED' },
            { label: 'COOLANT', value: `${Math.round(sim.telemetry.coolant || 0)}°C`, color: (sim.telemetry.coolant || 0) > 100 ? '#EF4444' : '#22C55E' },
            { label: 'FUEL', value: `${Math.round(sim.telemetry.fuel || 0)}%`, color: '#F59E0B' },
            { label: 'LAT G', value: `${(sim.telemetry.latG || 0).toFixed(2)}g`, color: '#A855F7' },
            { label: 'BRAKE FL', value: `${Math.round(sim.telemetry.brakeTempFL || 0)}°C`, color: '#F97316' },
            { label: 'BRAKE FR', value: `${Math.round(sim.telemetry.brakeTempFR || 0)}°C`, color: '#F97316' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: '#6B7280', fontWeight: 700, letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
            </div>
          ))}

          {/* Active DTC badges */}
          {activeDTCsFromController.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              {activeDTCsFromController.map(code => (
                <div key={code} style={{
                  padding: '2px 8px', borderRadius: 6, background: '#EF444422',
                  border: '1px solid #EF4444', color: '#EF4444',
                  fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                }}>
                  ⚠ {code}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showConnectModal && <PhoneConnectModal onClose={() => setShowConnectModal(false)} />}
    </div>
  );
}
