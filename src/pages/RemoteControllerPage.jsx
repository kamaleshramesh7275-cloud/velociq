import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendControl, onFeedbackPacket, initBridge } from '../services/telemetryBridge';

// ─── Procedural Engine Audio Synthesizer ─────────────────────────────────────
let _audioCtx = null;
let _engineNode = null;
let _gainNode = null;
let _turboNode = null;
let _turboGain = null;

function unlockAudio() {
  if (_audioCtx) return;
  _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function updateEngineSound(rpm, throttle, engineOn) {
  if (!_audioCtx) return;
  if (!engineOn) {
    if (_gainNode) _gainNode.gain.setTargetAtTime(0, _audioCtx.currentTime, 0.1);
    return;
  }
  if (!_engineNode) {
    _engineNode = _audioCtx.createOscillator();
    _gainNode = _audioCtx.createGain();
    const distortion = _audioCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
    }
    distortion.curve = curve;
    _engineNode.type = 'sawtooth';
    _engineNode.connect(distortion);
    distortion.connect(_gainNode);
    _gainNode.connect(_audioCtx.destination);
    _engineNode.start();

    // Turbo whistle
    _turboNode = _audioCtx.createOscillator();
    _turboGain = _audioCtx.createGain();
    _turboNode.type = 'sine';
    _turboNode.frequency.value = 3200;
    _turboGain.gain.value = 0;
    _turboNode.connect(_turboGain);
    _turboGain.connect(_audioCtx.destination);
    _turboNode.start();
  }

  const baseFreq = 30 + (rpm / 8000) * 120;
  _engineNode.frequency.setTargetAtTime(baseFreq, _audioCtx.currentTime, 0.05);
  const vol = 0.04 + throttle * 0.06;
  _gainNode.gain.setTargetAtTime(vol, _audioCtx.currentTime, 0.05);

  // Turbo spool
  const turboFreq = 2800 + throttle * 1200;
  _turboNode.frequency.setTargetAtTime(turboFreq, _audioCtx.currentTime, 0.1);
  const turboVol = throttle > 0.6 ? (throttle - 0.6) * 0.04 : 0;
  _turboGain.gain.setTargetAtTime(turboVol, _audioCtx.currentTime, 0.1);
}

function playShiftClick() {
  if (!_audioCtx) return;
  const osc = _audioCtx.createOscillator();
  const gain = _audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = 180;
  gain.gain.value = 0.15;
  gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(_audioCtx.destination);
  osc.start();
  osc.stop(_audioCtx.currentTime + 0.08);
}

function playHorn() {
  if (!_audioCtx) return;
  [350, 440].forEach((freq, i) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + i * 0.02);
    osc.stop(_audioCtx.currentTime + 0.5);
  });
}

// ─── Haptics ─────────────────────────────────────────────────────────────────
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ─── Component ────────────────────────────────────────────────────────────────
const DRIVE_MODES = ['ECO', 'COMFORT', 'SPORT', 'TRACK', 'DRIFT'];
const GEAR_MODES = ['P', 'R', 'N', 'D', 'S'];
const REGEN_LEVELS = ['0', '1', '2', '3'];

const FAULT_CODES = [
  { code: 'P0300', label: 'Cylinder Misfire', color: '#F97316' },
  { code: 'P0171', label: 'Sys Too Lean', color: '#EAB308' },
  { code: 'P0128', label: 'Thermostat Fail', color: '#EAB308' },
  { code: 'C0035', label: 'ABS Sensor FL', color: '#EF4444' },
  { code: 'B1245', label: 'ADAS Obstruction', color: '#8B5CF6' },
];

export default function RemoteControllerPage() {
  // ─── Core vehicle state ──────────────────────────────────────────────────
  const [engineOn, setEngineOn] = useState(false);
  const [gear, setGear] = useState('P');
  const [driveMode, setDriveMode] = useState('COMFORT');
  const [driveModeIdx, setDriveModeIdx] = useState(1);
  const [regenLevel, setRegenLevel] = useState(1);

  // ─── Pedal state (0–1) ─────────────────────────────────────────────────
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [handbrakeOn, setHandbrakeOn] = useState(false);

  // ─── Steering (-1 to +1) ────────────────────────────────────────────────
  const [steer, setSteer] = useState(0);
  const [wheelAngle, setWheelAngle] = useState(0); // display degrees
  const [gyroMode, setGyroMode] = useState(false);
  const steerRef = useRef(0);
  const wheelTouchRef = useRef(null);

  // ─── Assists ─────────────────────────────────────────────────────────────
  const [escOn, setEscOn] = useState(true);  // ESC ON / SPORT ESC / OFF
  const [escStage, setEscStage] = useState(0);
  const [absOn, setAbsOn] = useState(true);
  const [launchActive, setLaunchActive] = useState(false);

  // ─── Auxiliaries ─────────────────────────────────────────────────────────
  const [lightMode, setLightMode] = useState('OFF'); // OFF/AUTO/PARK/LOW/HIGH
  const lightModes = ['OFF', 'AUTO', 'PARK', 'LOW', 'HIGH'];
  const [leftBlinker, setLeftBlinker] = useState(false);
  const [rightBlinker, setRightBlinker] = useState(false);
  const [hazardOn, setHazardOn] = useState(false);
  const [wiperMode, setWiperMode] = useState('OFF'); // OFF/SLOW/AUTO/FAST
  const wiperModes = ['OFF', 'SLOW', 'AUTO', 'FAST'];
  const [acOn, setAcOn] = useState(false);
  const [acTemp, setAcTemp] = useState(22);
  const [fanLevel, setFanLevel] = useState(2);

  // ─── Active faults ─────────────────────────────────────────────────────
  const [activeFaults, setActiveFaults] = useState([]);

  // ─── Feedback from desktop ───────────────────────────────────────────────
  const [feedback, setFeedback] = useState({ speed: 0, rpm: 800, coolant: 80, gear: 'P', latency: 0 });
  const [connected, setConnected] = useState(false);

  // ─── Blinker auto-cancel ─────────────────────────────────────────────────
  const blinkerTimer = useRef(null);

  // ─── Init bridge ─────────────────────────────────────────────────────────
  useEffect(() => {
    initBridge('controller');
    const unsub = onFeedbackPacket((pkt) => {
      setFeedback(pkt);
      setConnected(true);
    });

    // Lock touch gestures to prevent accidental swipe/refresh
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.touchAction = 'none';

    return () => {
      unsub();
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
    };
  }, []);

  // ─── Gyroscope steering ──────────────────────────────────────────────────
  useEffect(() => {
    if (!gyroMode) return;
    const handleOrientation = (e) => {
      const gamma = e.gamma || 0; // -90 to 90 (left/right tilt)
      const normalized = Math.max(-1, Math.min(1, gamma / 35));
      steerRef.current = normalized;
      setSteer(normalized);
      setWheelAngle(Math.round(normalized * 180));
    };
    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [gyroMode]);

  // ─── Send control loop at 60Hz ───────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      sendControl({
        engineOn,
        throttle,
        brake,
        steer: steerRef.current,
        gear,
        driveMode,
        regenLevel,
        handbrake: handbrakeOn,
        escOn,
        absOn,
        lightMode,
        leftBlinker,
        rightBlinker,
        hazardOn,
        wiperMode,
        acOn,
        acTemp,
        fanLevel,
        activeFaults,
        launchActive,
        ts: Date.now(),
      });
      updateEngineSound(feedback.rpm || 800, throttle, engineOn);
    }, 16); // ~60Hz

    return () => clearInterval(interval);
  }, [engineOn, throttle, brake, gear, driveMode, regenLevel, handbrakeOn,
    escOn, absOn, lightMode, leftBlinker, rightBlinker, hazardOn, wiperMode,
    acOn, acTemp, fanLevel, activeFaults, launchActive, feedback.rpm]);

  // ─── Hazard overrides blinkers ───────────────────────────────────────────
  useEffect(() => {
    if (hazardOn) { setLeftBlinker(true); setRightBlinker(true); }
  }, [hazardOn]);

  // ─── Engine START button ─────────────────────────────────────────────────
  const handleEngineToggle = () => {
    unlockAudio();
    const next = !engineOn;
    setEngineOn(next);
    if (next) {
      if (gear !== 'P' && gear !== 'N') setGear('P');
      vibrate([50, 30, 100, 30, 200]);
    } else {
      vibrate([200]);
    }
  };

  // ─── Gear change ─────────────────────────────────────────────────────────
  const handleGear = (g) => {
    if (!engineOn && !['P', 'N'].includes(g)) return;
    playShiftClick();
    vibrate([30]);
    setGear(g);
  };

  // ─── Drive Mode ──────────────────────────────────────────────────────────
  const cycleDriveMode = (dir) => {
    const idx = Math.max(0, Math.min(DRIVE_MODES.length - 1, driveModeIdx + dir));
    setDriveModeIdx(idx);
    setDriveMode(DRIVE_MODES[idx]);
    vibrate([20]);
  };

  // ─── ESC Stage ───────────────────────────────────────────────────────────
  const cycleEsc = () => {
    const next = (escStage + 1) % 3;
    setEscStage(next);
    setEscOn(next < 2);
    vibrate([20]);
  };

  // ─── Wheel touch steering ────────────────────────────────────────────────
  const handleWheelTouch = useCallback((e) => {
    if (gyroMode) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = touch.clientX - cx;
    const angle = Math.max(-180, Math.min(180, (dx / (rect.width / 2)) * 180));
    const normalized = angle / 180;
    steerRef.current = normalized;
    setSteer(normalized);
    setWheelAngle(Math.round(angle));
  }, [gyroMode]);

  const handleWheelRelease = () => {
    // Spring return
    const spring = setInterval(() => {
      steerRef.current *= 0.75;
      setSteer(steerRef.current);
      setWheelAngle(Math.round(steerRef.current * 180));
      if (Math.abs(steerRef.current) < 0.01) {
        steerRef.current = 0;
        setSteer(0);
        setWheelAngle(0);
        clearInterval(spring);
      }
    }, 16);
    wheelTouchRef.current = spring;
  };

  // ─── Pedal touch handlers ────────────────────────────────────────────────
  const handlePedal = (pedal, e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const pct = Math.max(0, Math.min(1, 1 - (touch.clientY - rect.top) / rect.height));
    if (pedal === 'throttle') setThrottle(pct);
    else setBrake(pct);
  };

  const releasePedal = (pedal) => {
    if (pedal === 'throttle') setThrottle(0);
    else setBrake(0);
  };

  // ─── Fault inject / clear ────────────────────────────────────────────────
  const toggleFault = (code) => {
    vibrate([30, 20, 30]);
    setActiveFaults(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // ─── UI Helpers ──────────────────────────────────────────────────────────
  const modeColors = { ECO: '#22C55E', COMFORT: '#38BDF8', SPORT: '#F59E0B', TRACK: '#EF4444', DRIFT: '#A855F7' };
  const lightIcons = { OFF: '⚫', AUTO: '🟢', PARK: '🟡', LOW: '💡', HIGH: '🔦' };
  const escLabels = ['ESC ON', 'SPORT ESC', 'ESC OFF'];
  const escColors = ['#22C55E', '#F59E0B', '#EF4444'];

  // ─── Speed arc for mini gauge ─────────────────────────────────────────────
  const spd = Math.min(200, feedback.speed || 0);
  const spdPct = spd / 200;
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference * (1 - spdPct);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #0A0A0F 0%, #0F1318 50%, #0A0A0F 100%)',
        color: '#E8EAED',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflowY: 'auto',
        overscrollBehavior: 'none',
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Top status bar ─────────────────────────────────────────────── */}
      <div style={{
        background: '#111318',
        borderBottom: '1px solid #1E232E',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? '#22C55E' : '#EF4444',
            boxShadow: connected ? '0 0 8px #22C55E' : '0 0 8px #EF4444',
          }} />
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF' }}>
            {connected ? `ONLINE · ${feedback.latency || 0}ms` : 'CONNECTING...'}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: '#00D4FF' }}>
          VELOCIQ REMOTE
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: modeColors[driveMode] }}>
            {driveMode}
          </span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#9CA3AF' }}>{gear}</span>
        </div>
      </div>

      <div style={{ padding: '10px 10px 80px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── Engine Start / Stop + Mini Telemetry ─────────────────────── */}
        <div style={{
          background: '#111318',
          borderRadius: 16,
          border: engineOn ? '1px solid #00D4FF44' : '1px solid #1E232E',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          {/* Big ignition button */}
          <button
            onPointerDown={handleEngineToggle}
            style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: engineOn
                ? 'radial-gradient(circle at center, #00D4FF22 0%, #00D4FF08 100%)'
                : 'radial-gradient(circle at center, #1a1a22 0%, #111318 100%)',
              border: engineOn ? '2px solid #00D4FF' : '2px solid #2D3340',
              boxShadow: engineOn ? '0 0 24px #00D4FF66, inset 0 0 12px #00D4FF22' : 'none',
              color: engineOn ? '#00D4FF' : '#4B5563',
              fontSize: 12, fontWeight: 800, letterSpacing: '0.05em',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3,
            }}
          >
            <span style={{ fontSize: 20 }}>⏻</span>
            <span>{engineOn ? 'STOP' : 'START'}</span>
          </button>

          {/* Mini speed / RPM gauges */}
          <div style={{ flex: 1, display: 'flex', gap: 12 }}>
            {/* Speed circular */}
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="#1E232E" strokeWidth="5" />
                <circle
                  cx="40" cy="40" r="36" fill="none"
                  stroke={engineOn ? '#00D4FF' : '#2D3340'}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.1s' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{Math.round(spd)}</span>
                <span style={{ fontSize: 9, color: '#6B7280', letterSpacing: '0.05em' }}>km/h</span>
              </div>
            </div>

            {/* RPM & Coolant */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
              <div>
                <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>RPM</div>
                <div style={{
                  width: 100, height: 6, background: '#1E232E', borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3, transition: 'width 0.1s',
                    width: `${Math.min(100, ((feedback.rpm || 800) / 8000) * 100)}%`,
                    background: (feedback.rpm || 0) > 6000 ? '#EF4444' : '#00D4FF',
                  }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{Math.round(feedback.rpm || 800)}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>COOLANT</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: (feedback.coolant || 0) > 100 ? '#EF4444' : '#22C55E' }}>
                  {Math.round(feedback.coolant || 80)}°C
                </div>
              </div>
            </div>
          </div>

          {/* Horn */}
          <button
            onPointerDown={() => { playHorn(); vibrate([50]); }}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#1A1E28', border: '1px solid #2D3340',
              fontSize: 20, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >📯</button>
        </div>

        {/* ── Steering Wheel ────────────────────────────────────────────── */}
        <div style={{
          background: '#111318', borderRadius: 16,
          border: '1px solid #1E232E', padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, letterSpacing: '0.1em' }}>
              STEERING WHEEL
            </span>
            <button
              onPointerDown={() => setGyroMode(g => !g)}
              style={{
                padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: gyroMode ? '#00D4FF22' : '#1A1E28',
                border: gyroMode ? '1px solid #00D4FF' : '1px solid #2D3340',
                color: gyroMode ? '#00D4FF' : '#9CA3AF', cursor: 'pointer',
              }}
            >
              {gyroMode ? '📐 GYRO ON' : '📐 GYRO'}
            </button>
          </div>
          <div
            onTouchStart={handleWheelTouch}
            onTouchMove={handleWheelTouch}
            onTouchEnd={handleWheelRelease}
            style={{
              width: 160, height: 160, margin: '0 auto',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #1E2430 0%, #0F1318 100%)',
              border: `3px solid ${Math.abs(steer) > 0.05 ? '#00D4FF' : '#2D3340'}`,
              boxShadow: Math.abs(steer) > 0.05 ? '0 0 20px #00D4FF44' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              touchAction: 'none', cursor: 'grab',
              transform: `rotate(${wheelAngle}deg)`,
              transition: 'transform 0.05s, border-color 0.1s',
              position: 'relative',
            }}
          >
            {/* Spoke */}
            <div style={{ width: 70, height: 3, background: '#2D3340', borderRadius: 2, position: 'absolute' }} />
            <div style={{ width: 3, height: 70, background: '#2D3340', borderRadius: 2, position: 'absolute' }} />
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#1A1E28', border: '2px solid #2D3340',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800,
            }}>⊕</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, fontFamily: 'monospace', color: '#9CA3AF' }}>
            {wheelAngle > 0 ? `▶ ${wheelAngle}° R` : wheelAngle < 0 ? `${Math.abs(wheelAngle)}° L ◀` : '— CENTER —'}
          </div>
        </div>

        {/* ── Pedals ────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Throttle */}
          <div style={{ background: '#111318', borderRadius: 16, border: '1px solid #1E232E', padding: 12 }}>
            <div style={{ fontSize: 10, color: '#22C55E', fontWeight: 700, marginBottom: 8, letterSpacing: '0.1em' }}>⚡ THROTTLE</div>
            <div
              onTouchStart={(e) => { e.preventDefault(); handlePedal('throttle', e); }}
              onTouchMove={(e) => { e.preventDefault(); handlePedal('throttle', e); }}
              onTouchEnd={() => releasePedal('throttle')}
              style={{
                height: 120, background: '#0A0E15', borderRadius: 12,
                border: `2px solid ${throttle > 0.1 ? '#22C55E' : '#1E232E'}`,
                position: 'relative', overflow: 'hidden', touchAction: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${throttle * 100}%`,
                background: `linear-gradient(to top, #22C55E, #86EFAC)`,
                transition: 'height 0.05s', borderRadius: '0 0 10px 10px',
              }} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: throttle > 0.3 ? '#fff' : '#374151',
              }}>
                {Math.round(throttle * 100)}%
              </div>
            </div>
          </div>

          {/* Brake */}
          <div style={{ background: '#111318', borderRadius: 16, border: '1px solid #1E232E', padding: 12 }}>
            <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, marginBottom: 8, letterSpacing: '0.1em' }}>🛑 BRAKE</div>
            <div
              onTouchStart={(e) => { e.preventDefault(); handlePedal('brake', e); }}
              onTouchMove={(e) => { e.preventDefault(); handlePedal('brake', e); }}
              onTouchEnd={() => releasePedal('brake')}
              style={{
                height: 120, background: '#0A0E15', borderRadius: 12,
                border: `2px solid ${brake > 0.1 ? '#EF4444' : '#1E232E'}`,
                position: 'relative', overflow: 'hidden', touchAction: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${brake * 100}%`,
                background: `linear-gradient(to top, #EF4444, #FCA5A5)`,
                transition: 'height 0.05s', borderRadius: '0 0 10px 10px',
              }} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: brake > 0.3 ? '#fff' : '#374151',
              }}>
                {Math.round(brake * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* ── PRNDS Gear Selector ────────────────────────────────────────── */}
        <div style={{
          background: '#111318', borderRadius: 16,
          border: '1px solid #1E232E', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em' }}>
            GEAR SELECTOR
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {GEAR_MODES.map(g => (
              <button
                key={g}
                onPointerDown={() => handleGear(g)}
                style={{
                  flex: 1, height: 52, borderRadius: 12,
                  background: gear === g ? '#00D4FF22' : '#0A0E15',
                  border: gear === g ? '2px solid #00D4FF' : '1px solid #1E232E',
                  color: gear === g ? '#00D4FF' : '#6B7280',
                  fontSize: 18, fontWeight: 800, cursor: 'pointer',
                  boxShadow: gear === g ? '0 0 12px #00D4FF44' : 'none',
                  transition: 'all 0.15s',
                }}
              >{g}</button>
            ))}
          </div>
        </div>

        {/* ── Drive Mode + Regen ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Drive mode */}
          <div style={{
            background: '#111318', borderRadius: 16,
            border: `1px solid ${modeColors[driveMode]}44`, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, marginBottom: 8, letterSpacing: '0.1em' }}>
              DRIVE MODE
            </div>
            <div style={{
              fontSize: 18, fontWeight: 800, color: modeColors[driveMode],
              textAlign: 'center', marginBottom: 8,
            }}>{driveMode}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onPointerDown={() => cycleDriveMode(-1)}
                style={{
                  flex: 1, height: 36, borderRadius: 10, background: '#0A0E15',
                  border: '1px solid #1E232E', color: '#9CA3AF', fontSize: 16, cursor: 'pointer',
                }}
              >◀</button>
              <button
                onPointerDown={() => cycleDriveMode(1)}
                style={{
                  flex: 1, height: 36, borderRadius: 10, background: '#0A0E15',
                  border: '1px solid #1E232E', color: '#9CA3AF', fontSize: 16, cursor: 'pointer',
                }}
              >▶</button>
            </div>
          </div>

          {/* Regen braking */}
          <div style={{
            background: '#111318', borderRadius: 16,
            border: '1px solid #1E232E', padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, marginBottom: 8, letterSpacing: '0.1em' }}>
              REGEN BRAKING
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{
                fontSize: 22, fontWeight: 800, textAlign: 'center',
                color: regenLevel > 0 ? '#22C55E' : '#4B5563',
              }}>L{regenLevel}</div>
              <input
                type="range" min={0} max={3} value={regenLevel}
                onChange={(e) => setRegenLevel(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#22C55E' }}
              />
              <div style={{ fontSize: 9, textAlign: 'center', color: '#6B7280' }}>
                {['FREE', 'LOW', 'MED', 'MAX'][regenLevel]}
              </div>
            </div>
          </div>
        </div>

        {/* ── Driver Assists ────────────────────────────────────────────── */}
        <div style={{
          background: '#111318', borderRadius: 16,
          border: '1px solid #1E232E', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em' }}>
            DRIVER ASSISTS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {/* ESC */}
            <button
              onPointerDown={cycleEsc}
              style={{
                padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                background: '#0A0E15', border: `1px solid ${escColors[escStage]}44`,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 16 }}>⚡</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: escColors[escStage], marginTop: 3 }}>
                {escLabels[escStage]}
              </div>
            </button>

            {/* ABS */}
            <button
              onPointerDown={() => { setAbsOn(a => !a); vibrate([20]); }}
              style={{
                padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                background: '#0A0E15', border: `1px solid ${absOn ? '#22C55E44' : '#EF444444'}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 16 }}>🛞</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: absOn ? '#22C55E' : '#EF4444', marginTop: 3 }}>
                ABS {absOn ? 'ON' : 'OFF'}
              </div>
            </button>

            {/* Handbrake */}
            <button
              onPointerDown={() => { setHandbrakeOn(h => { vibrate([30]); return !h; }); }}
              style={{
                padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                background: handbrakeOn ? '#EF444422' : '#0A0E15',
                border: `1px solid ${handbrakeOn ? '#EF4444' : '#1E232E'}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 16 }}>🅿</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: handbrakeOn ? '#EF4444' : '#6B7280', marginTop: 3 }}>
                H-BRAKE
              </div>
            </button>

            {/* Launch Control */}
            <button
              onPointerDown={() => { setLaunchActive(l => !l); vibrate([50, 30, 50]); }}
              style={{
                padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                background: launchActive ? '#F59E0B22' : '#0A0E15',
                border: `1px solid ${launchActive ? '#F59E0B' : '#1E232E'}`,
                cursor: 'pointer',
                gridColumn: 'span 3',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: launchActive ? '#F59E0B' : '#6B7280', letterSpacing: '0.1em' }}>
                🚀 LAUNCH CONTROL {launchActive ? 'ARMED' : 'READY'}
              </div>
            </button>
          </div>
        </div>

        {/* ── Lights & Blinkers ─────────────────────────────────────────── */}
        <div style={{
          background: '#111318', borderRadius: 16,
          border: '1px solid #1E232E', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em' }}>
            LIGHTING
          </div>
          {/* Light mode selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {lightModes.map(m => (
              <button
                key={m}
                onPointerDown={() => setLightMode(m)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 9, fontWeight: 700,
                  background: lightMode === m ? '#F59E0B22' : '#0A0E15',
                  border: lightMode === m ? '1px solid #F59E0B' : '1px solid #1E232E',
                  color: lightMode === m ? '#F59E0B' : '#6B7280', cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 14 }}>{lightIcons[m]}</div>
                <div style={{ marginTop: 2 }}>{m}</div>
              </button>
            ))}
          </div>
          {/* Blinkers + Hazard */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onPointerDown={() => { setLeftBlinker(l => !l); setRightBlinker(false); setHazardOn(false); vibrate([20]); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 18, textAlign: 'center',
                background: leftBlinker ? '#22C55E22' : '#0A0E15',
                border: `1px solid ${leftBlinker ? '#22C55E' : '#1E232E'}`,
                cursor: 'pointer',
              }}
            >◀ L</button>
            <button
              onPointerDown={() => { setHazardOn(h => !h); vibrate([20, 20, 20]); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 18, textAlign: 'center',
                background: hazardOn ? '#EF444422' : '#0A0E15',
                border: `1px solid ${hazardOn ? '#EF4444' : '#1E232E'}`,
                cursor: 'pointer',
              }}
            >⚠</button>
            <button
              onPointerDown={() => { setRightBlinker(r => !r); setLeftBlinker(false); setHazardOn(false); vibrate([20]); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 18, textAlign: 'center',
                background: rightBlinker ? '#22C55E22' : '#0A0E15',
                border: `1px solid ${rightBlinker ? '#22C55E' : '#1E232E'}`,
                cursor: 'pointer',
              }}
            >R ▶</button>
          </div>
        </div>

        {/* ── Climate & Wipers ─────────────────────────────────────────── */}
        <div style={{
          background: '#111318', borderRadius: 16,
          border: '1px solid #1E232E', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em' }}>
            CLIMATE & AUXILIARIES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* A/C */}
            <div>
              <button
                onPointerDown={() => setAcOn(a => !a)}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 10, marginBottom: 6,
                  background: acOn ? '#38BDF822' : '#0A0E15',
                  border: `1px solid ${acOn ? '#38BDF8' : '#1E232E'}`,
                  color: acOn ? '#38BDF8' : '#6B7280', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >❄ A/C {acOn ? 'ON' : 'OFF'}</button>
              {acOn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, color: '#38BDF8' }}>16°</span>
                  <input
                    type="range" min={16} max={28} value={acTemp}
                    onChange={e => setAcTemp(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#38BDF8' }}
                  />
                  <span style={{ fontSize: 10, color: '#EF4444' }}>28°</span>
                </div>
              )}
              {acOn && (
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#38BDF8', marginTop: 4 }}>
                  {acTemp}°C
                </div>
              )}
            </div>

            {/* Wipers */}
            <div>
              <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 6 }}>WIPERS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {wiperModes.map(m => (
                  <button
                    key={m}
                    onPointerDown={() => setWiperMode(m)}
                    style={{
                      flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: 9, fontWeight: 700,
                      background: wiperMode === m ? '#6366F122' : '#0A0E15',
                      border: wiperMode === m ? '1px solid #6366F1' : '1px solid #1E232E',
                      color: wiperMode === m ? '#6366F1' : '#6B7280', cursor: 'pointer', minWidth: 36,
                    }}
                  >{m}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Fault Injection Chaos Pad ─────────────────────────────────── */}
        <div style={{
          background: '#111318', borderRadius: 16,
          border: '1px solid #EF444422', padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, marginBottom: 10, letterSpacing: '0.1em' }}>
            ⚠ FAULT INJECTION / CHAOS PAD
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FAULT_CODES.map(({ code, label, color }) => (
              <button
                key={code}
                onPointerDown={() => toggleFault(code)}
                style={{
                  padding: '10px 8px', borderRadius: 10, textAlign: 'left',
                  background: activeFaults.includes(code) ? `${color}22` : '#0A0E15',
                  border: `1px solid ${activeFaults.includes(code) ? color : '#1E232E'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color, fontFamily: 'monospace' }}>{code}</div>
                <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 2 }}>{label}</div>
                <div style={{
                  fontSize: 9, fontWeight: 700, marginTop: 4,
                  color: activeFaults.includes(code) ? color : '#4B5563',
                }}>
                  {activeFaults.includes(code) ? '● INJECTED' : '○ IDLE'}
                </div>
              </button>
            ))}
          </div>
          {/* Clear all faults */}
          <button
            onPointerDown={() => { setActiveFaults([]); vibrate([30]); }}
            style={{
              width: '100%', marginTop: 8, padding: '8px 0', borderRadius: 10,
              background: '#0A0E15', border: '1px solid #1E232E',
              color: '#6B7280', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >✕ CLEAR ALL FAULTS</button>
        </div>

        {/* Bottom safe zone spacer */}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
