/**
 * worldPhysicsEngine.js
 * 
 * Global Authoritative Physics & Telematics Engine for VelocIQ.
 * Runs 24/7 as the SINGLE SOURCE OF TRUTH across the entire application:
 * - 3D Digital World (/world)
 * - Overview Dashboard (/dashboard)
 * - Driver Cockpit HUD (/driver-portal)
 * - GPS Navigation Map (/navigation)
 * - Real-Time Analytics (/analytics)
 * - 3D Engine Twin (/engine-twin)
 * - Predictive Maintenance (/maintenance)
 * - Driver Safety & Gamification (/safety)
 * - Cybersecurity & Immobilizer (/security)
 * 
 * Synchronized with the Mobile Controller via telemetryBridge.
 */

import { onControlPacket, sendFeedback } from './telemetryBridge';
import { VEHICLE_PHYSICS_PROFILES } from '../utils/speedMileagePhysics';

const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;
const TICK = 1 / 60; // 60 Hz physics step

// Initial vehicle state
const state = {
  // Powertrain & Gear
  engineOn: true,
  gear: 'D', // 'P' | 'R' | 'N' | 'D' | 'S'
  driveMode: 'SPORT',
  regenLevel: 1,

  // Driver Inputs (0–1)
  throttle: 0,
  brake: 0,
  steer: 0, // -1 to +1
  handbrake: false,

  // Safety & Assists
  escOn: true,
  absOn: true,
  isImmobilized: false,

  // Auxiliaries
  lightMode: 'AUTO',
  activeFaults: [],
};

// Real-world physical metrics
const vehicle = {
  // Dynamics
  speed: 0,        // km/h
  velX: 0,         // m/s
  velZ: 0,         // m/s
  posX: 0,         // meters in world
  posY: 0,
  posZ: 0,
  rotY: 0,         // heading in radians
  latG: 0,
  longG: 0,

  // Engine & Fluids
  rpm: 850,
  coolant: 85.0,   // °C
  oilTemp: 90.0,   // °C
  oilPressurePsi: 28.0,
  voltage: 13.9,   // Volts
  maf: 2.4,        // g/s
  fuelL: 50.0,     // Liters
  fuelPct: 100.0,  // %

  // Thermals & Tires
  brakeTempFL: 45.0,
  brakeTempFR: 45.0,
  brakeTempRL: 40.0,
  brakeTempRR: 40.0,
  tireTempFL: 35.0,
  tireTempFR: 35.0,
  tireTempRL: 32.0,
  tireTempRR: 32.0,

  // Trip Accumulators
  tripMileage: 0.0,     // km
  activeDuration: 0,     // seconds
  activeFuelUsed: 0.0,   // Liters
  co2Grams: 0.0,
  score: 100,
  events: [{ label: 'Telemetry Online', delta: 0 }],
  tripCoordinates: [[28.6139, 77.2090]],

  // Parts wear (percentage remaining)
  partsWear: { oil: 98.5, brakes: 96.0, battery: 99.2, coolant: 97.8 },
  predictedFailureDays: { oil: 180, brakes: 120, battery: 450, coolant: 220 },
};

// Listeners
const telemetryListeners = new Set();
let safetyLogCallback = null;
let lastRemotePacketTime = 0;
let physicsInterval = null;
let broadcastInterval = null;
let lastCoordDist = 0;
const keys = {};

// Active vehicle profile
let activeProfileKey = 'sedan';
let activeProfile = VEHICLE_PHYSICS_PROFILES.sedan;

function getProfile() {
  return VEHICLE_PHYSICS_PROFILES[activeProfileKey] || VEHICLE_PHYSICS_PROFILES.sedan;
}

// ─── Core Physics Tick ───────────────────────────────────────────────────────
function physicsStep(dt) {
  const phys = getProfile();
  const mass = phys.massKg || 1450;
  const Cd = phys.Cd || 0.28;
  const A = phys.frontalAreaM2 || 2.2;
  const maxPowerW = (phys.maxPowerKw || 140) * 1000;

  // External controller priority: don't decay inputs if phone is actively controlling
  const isRemoteActive = (performance.now() - lastRemotePacketTime) < 1800;

  // Apply desktop keyboard hotkeys if pressed
  const hasKeyThrottle = keys['KeyW'] || keys['ArrowUp'];
  const hasKeyBrake = keys['KeyS'] || keys['ArrowDown'];
  const hasKeySteerL = keys['KeyA'] || keys['ArrowLeft'];
  const hasKeySteerR = keys['KeyD'] || keys['ArrowRight'];

  if (hasKeyThrottle) {
    state.throttle = Math.min(1, state.throttle + 0.08);
  } else if (!isRemoteActive && state.throttle > 0) {
    state.throttle = Math.max(0, state.throttle - 0.12);
  }

  if (hasKeyBrake) {
    state.brake = Math.min(1, state.brake + 0.14);
  } else if (!isRemoteActive && state.brake > 0) {
    state.brake = Math.max(0, state.brake - 0.15);
  }

  if (hasKeySteerL) {
    state.steer = Math.max(-1, state.steer - 0.08);
  } else if (hasKeySteerR) {
    state.steer = Math.min(1, state.steer + 0.08);
  } else if (!isRemoteActive) {
    state.steer *= 0.82;
  }

  if (keys['Space']) {
    state.handbrake = true;
  } else if (!isRemoteActive) {
    state.handbrake = false;
  }

  // Keyboard Gear & Ignition Hotkeys
  if (keys['KeyE']) state.engineOn = true;
  if (keys['KeyP']) state.gear = 'P';
  if (keys['KeyR']) state.gear = 'R';
  if (keys['KeyN']) state.gear = 'N';
  if (keys['Digit1'] || keys['KeyD']) state.gear = 'D';
  if (keys['Digit2'] || keys['KeyQ']) state.gear = 'S';

  // Engine immobilizer enforcement (Cybersecurity kill switch)
  if (state.isImmobilized) {
    state.engineOn = false;
    state.throttle = 0;
  }

  // Engine OFF physics
  if (!state.engineOn) {
    vehicle.rpm = Math.max(0, vehicle.rpm - 120 * dt * 60);
    vehicle.voltage = 12.4 + (vehicle.rpm > 0 ? 0.8 : 0);
    vehicle.oilPressurePsi = Math.max(0, vehicle.oilPressurePsi - 8 * dt * 60);
    vehicle.maf = 0;
    vehicle.speed = Math.max(0, vehicle.speed * 0.985 - 0.2 * dt);
    vehicle.coolant = Math.max(30, vehicle.coolant - 0.02 * dt * 60);
    vehicle.oilTemp = Math.max(30, vehicle.oilTemp - 0.025 * dt * 60);
    return;
  }

  // Engine is ON: alternator charges battery
  vehicle.voltage = 13.8 + (vehicle.rpm > 1200 ? 0.35 : 0.1);

  // Drive Mode Multipliers
  const driveModeMult = { ECO: 0.72, COMFORT: 0.90, SPORT: 1.15, TRACK: 1.35, DRIFT: 1.25 }[state.driveMode] || 1;
  const gearActive = ['D', 'S'].includes(state.gear) || state.gear?.startsWith('M');
  const reverse = state.gear === 'R';

  // Park or Neutral: disengaged transmission
  if (state.gear === 'P' || state.gear === 'N') {
    const targetIdleRpm = 800 + state.throttle * 4500;
    vehicle.rpm += (targetIdleRpm - vehicle.rpm) * 0.15;
    vehicle.speed = Math.max(0, vehicle.speed * 0.97 - 0.1 * dt);
    vehicle.longG = 0;
    vehicle.latG = 0;
    return;
  }

  const vMs = vehicle.speed / 3.6;
  const currentDir = vMs >= 0 ? 1 : -1;
  const isStopped = Math.abs(vMs) < 0.05;

  // Effective throttle with automatic transmission idle crawl
  let effectiveThrottle = state.throttle;
  if (effectiveThrottle < 0.02 && state.brake < 0.08 && !state.handbrake) {
    if (gearActive && vMs < 2.0) {
      effectiveThrottle = 0.08; // Idle crawl forward ~7.2 km/h
    } else if (reverse && vMs > -1.5) {
      effectiveThrottle = 0.08; // Idle crawl reverse ~5.4 km/h
    }
  }

  // Tractive propulsion force (in target drive direction)
  const targetDir = reverse ? -1 : 1;
  let driveForce = 0;
  if (gearActive || reverse) {
    const rawPower = reverse ? maxPowerW * 0.45 : maxPowerW;
    const rawForce = (effectiveThrottle * rawPower * driveModeMult) / Math.max(2.0, Math.abs(vMs));
    const maxTraction = mass * GRAVITY * 1.15; // Tire traction limit
    driveForce = targetDir * Math.min(maxTraction, rawForce);
  }

  // Rolling resistance & aero drag (always opposes current motion)
  const aeroDrag = 0.5 * AIR_DENSITY * Cd * A * vMs * vMs;
  const rollingRes = isStopped ? 0 : mass * GRAVITY * 0.012;
  const passiveResistance = (aeroDrag + rollingRes) * (isStopped ? 0 : currentDir);

  // Braking force (always opposes motion or counters driveForce when stopped)
  let brakePressure = state.brake;
  if (state.handbrake) brakePressure = Math.max(brakePressure, 1.0);

  let brakeResistance = 0;
  if (brakePressure > 0.02) {
    const maxBrakeF = brakePressure * mass * GRAVITY * 1.25;
    if (isStopped) {
      driveForce = Math.sign(driveForce) * Math.max(0, Math.abs(driveForce) - maxBrakeF);
    } else {
      brakeResistance = maxBrakeF * currentDir;
    }
  }

  // Net Force & Acceleration
  const netForce = driveForce - passiveResistance - brakeResistance;
  const accel = netForce / mass;

  let newVMs = vMs + accel * dt;

  // Prevent oscillating back-and-forth across zero when braking to a stop
  if (!isStopped && (vMs > 0 ? newVMs <= 0 : newVMs >= 0) && effectiveThrottle < 0.05) {
    newVMs = 0;
  }

  // Clamp speed limits (-12 m/s reverse, +75 m/s forward)
  newVMs = Math.max(-12, Math.min(75, newVMs));
  vehicle.speed = newVMs * 3.6;

  // Realistic Steering & Yaw Rate
  const steerAngle = state.steer * 0.42 * (1 - Math.min(0.65, Math.abs(vMs) / 70));
  const wheelbase = 2.75;
  const yawRate = Math.abs(vMs) > 0.15 ? (vMs * Math.tan(steerAngle)) / wheelbase : 0;
  const effectiveYawRate = state.escOn ? yawRate * 0.88 : yawRate;

  vehicle.rotY += effectiveYawRate * dt;
  vehicle.posX += Math.sin(vehicle.rotY) * newVMs * dt;
  vehicle.posZ += Math.cos(vehicle.rotY) * newVMs * dt;

  // Bound within 3D city limits
  vehicle.posX = Math.max(-420, Math.min(420, vehicle.posX));
  vehicle.posZ = Math.max(-420, Math.min(420, vehicle.posZ));

  // G-Forces
  vehicle.latG = Number(((effectiveYawRate * vMs) / GRAVITY).toFixed(2));
  vehicle.longG = Number((accel / GRAVITY).toFixed(2));

  // Realistic Engine RPM
  const targetRpm = state.engineOn
    ? (850 + effectiveThrottle * 6500 * driveModeMult * Math.min(1, Math.abs(vMs) / 28))
    : 0;
  vehicle.rpm += (targetRpm - vehicle.rpm) * 0.18;

  // MAF & Oil Pressure
  vehicle.maf = Number((2.2 + (vehicle.rpm / 7000) * 14.0 + effectiveThrottle * 8.0).toFixed(1));
  vehicle.oilPressurePsi = Number((24 + (vehicle.rpm / 7000) * 44).toFixed(1));

  // Engine Thermals
  vehicle.coolant += (vehicle.rpm > 3500 ? 0.04 : -0.01) * dt * 60;
  vehicle.coolant = Math.max(75, Math.min(112, vehicle.coolant));
  vehicle.oilTemp = vehicle.coolant + (vehicle.rpm / 8000) * 15;

  // Fuel Depletion (throttle based)
  const burnRateLps = (effectiveThrottle * (phys.maxFuelConsumptionLPH || 18)) / 3600;
  const fuelBurned = burnRateLps * dt;
  vehicle.fuelL = Math.max(0, vehicle.fuelL - fuelBurned);
  vehicle.fuelPct = Number(((vehicle.fuelL / 50) * 100).toFixed(1));
  vehicle.activeFuelUsed += fuelBurned;

  // Trip Mileage & CO2
  const distanceTraveledKm = (Math.abs(newVMs) * dt) / 1000;
  vehicle.tripMileage += distanceTraveledKm;
  vehicle.activeDuration += dt;
  vehicle.co2Grams += distanceTraveledKm * 124; // ~124 g CO2 / km

  // Rotor & Tire Thermal Model
  const brakeFrictionHeat = (state.brake * 14 + Math.abs(state.steer) * 4) * Math.max(0.5, Math.abs(vMs) / 10);
  const coolingRate = 0.15 + (Math.abs(vMs) / 40) * 0.4;

  vehicle.brakeTempFL = Math.min(520, Math.max(28, vehicle.brakeTempFL + (brakeFrictionHeat * 6 - (vehicle.brakeTempFL - 25) * coolingRate) * dt));
  vehicle.brakeTempFR = Math.min(520, Math.max(28, vehicle.brakeTempFR + (brakeFrictionHeat * 6 - (vehicle.brakeTempFR - 25) * coolingRate) * dt));
  vehicle.brakeTempRL = Math.min(480, Math.max(28, vehicle.brakeTempRL + (brakeFrictionHeat * 4 - (vehicle.brakeTempRL - 25) * coolingRate) * dt));
  vehicle.brakeTempRR = Math.min(480, Math.max(28, vehicle.brakeTempRR + (brakeFrictionHeat * 4 - (vehicle.brakeTempRR - 25) * coolingRate) * dt));

  vehicle.tireTempFL = 30 + (vehicle.brakeTempFL / 500) * 60;
  vehicle.tireTempFR = 30 + (vehicle.brakeTempFR / 500) * 60;
  vehicle.tireTempRL = 28 + (vehicle.brakeTempRL / 500) * 50;
  vehicle.tireTempRR = 28 + (vehicle.brakeTempRR / 500) * 50;

  // Parts wear slow degradation based on real driving
  vehicle.partsWear.brakes = Math.max(10, vehicle.partsWear.brakes - (state.brake * 0.0001 + distanceTraveledKm * 0.002));
  vehicle.partsWear.oil = Math.max(10, vehicle.partsWear.oil - distanceTraveledKm * 0.001);
  vehicle.partsWear.coolant = Math.max(10, vehicle.partsWear.coolant - distanceTraveledKm * 0.0005);

  // GPS Coordinates (Connaught Place origin: 28.6139, 77.2090)
  const lat = 28.6139 + (vehicle.posZ / 111000);
  const lon = 77.2090 + (vehicle.posX / 97400);

  // Log GPS breadcrumb every 30 meters
  lastCoordDist += Math.abs(newVMs) * dt;
  if (lastCoordDist >= 30) {
    lastCoordDist = 0;
    vehicle.tripCoordinates.push([lat, lon]);
    if (vehicle.tripCoordinates.length > 200) vehicle.tripCoordinates.shift();
  }

  // Safety Events Detection from REAL Physics
  let penalty = 0;
  let eventType = null;
  if (vehicle.longG < -0.45) {
    penalty = 3.5;
    eventType = 'Harsh Braking';
  } else if (vehicle.longG > 0.45) {
    penalty = 2.5;
    eventType = 'Rapid Acceleration';
  } else if (Math.abs(vehicle.latG) > 0.40) {
    penalty = 2.0;
    eventType = 'Hard Cornering';
  } else if (vehicle.rpm > 6200) {
    penalty = 1.0;
    eventType = 'Engine Overrev';
  }

  if (eventType && Math.random() < 0.05) { // Throttle log frequency
    vehicle.score = Math.max(20, vehicle.score - penalty);
    vehicle.events = [{ label: eventType, delta: -penalty }, ...vehicle.events.slice(0, 3)];
    safetyLogCallback?.({
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: eventType,
      penalty,
      speed: vehicle.speed.toFixed(1),
    });
  }
}

// ─── Broadcast Telemetry Snapshot (20Hz) ────────────────────────────────────
function broadcastTelemetry() {
  const heading = ((vehicle.rotY * 180 / Math.PI) + 360) % 360;
  const lat = 28.6139 + (vehicle.posZ / 111000);
  const lon = 77.2090 + (vehicle.posX / 97400);

  // Temperature compensated tire pressures (psi)
  const tpFL = Number((32.0 + (vehicle.tireTempFL - 25) * 0.12).toFixed(1));
  const tpFR = Number((32.0 + (vehicle.tireTempFR - 25) * 0.12).toFixed(1));
  const tpRL = Number((31.5 + (vehicle.tireTempRL - 25) * 0.11).toFixed(1));
  const tpRR = Number((31.5 + (vehicle.tireTempRR - 25) * 0.11).toFixed(1));

  const packet = {
    // Primary gauges
    speed: Number(Math.max(0, vehicle.speed).toFixed(1)),
    rpm: Math.round(vehicle.rpm),
    gear: state.gear,
    driveMode: state.driveMode,
    engineOn: state.engineOn,
    throttle: Number((state.throttle || 0).toFixed(2)),
    brake: Number((state.brake || 0).toFixed(2)),
    steer: Number((state.steer || 0).toFixed(2)),
    handbrake: state.handbrake,

    // Diagnostics & Fluids
    coolant: Number(vehicle.coolant.toFixed(1)),
    oilTemp: Number(vehicle.oilTemp.toFixed(1)),
    oilPressurePsi: Number(vehicle.oilPressurePsi.toFixed(1)),
    voltage: Number(vehicle.voltage.toFixed(2)),
    maf: Number(vehicle.maf.toFixed(1)),
    fuel: vehicle.fuelPct,
    fuelL: Number(vehicle.fuelL.toFixed(1)),

    // Accelerations & Dynamics
    latG: vehicle.latG,
    longG: vehicle.longG,

    // Thermals
    brakeTempFL: Math.round(vehicle.brakeTempFL),
    brakeTempFR: Math.round(vehicle.brakeTempFR),
    brakeTempRL: Math.round(vehicle.brakeTempRL),
    brakeTempRR: Math.round(vehicle.brakeTempRR),
    tireTempFL: Math.round(vehicle.tireTempFL),
    tireTempFR: Math.round(vehicle.tireTempFR),
    tireTempRL: Math.round(vehicle.tireTempRL),
    tireTempRR: Math.round(vehicle.tireTempRR),

    // Pressures
    tirePressureFL: tpFL,
    tirePressureFR: tpFR,
    tirePressureRL: tpRL,
    tirePressureRR: tpRR,

    // Trip & Economy
    tripMileage: Number(vehicle.tripMileage.toFixed(2)),
    activeDuration: Math.round(vehicle.activeDuration),
    activeFuelUsed: Number(vehicle.activeFuelUsed.toFixed(3)),
    co2: Number(vehicle.co2Grams.toFixed(1)),
    score: Math.round(vehicle.score),
    events: vehicle.events,
    tripCoordinates: vehicle.tripCoordinates,

    // Parts wear & lifecycle
    partsWear: vehicle.partsWear,
    predictedFailureDays: vehicle.predictedFailureDays,

    // GPS Navigation
    route: {
      lat,
      lon,
      heading,
      progress: Math.min(100, (vehicle.tripMileage / 25) * 100),
      startName: 'Fleet Hub (Connaught Place)',
      endName: 'Airport Cargo Terminal (IGI)',
      etaMinutes: vehicle.speed > 5 ? Math.round(((25 - (vehicle.tripMileage % 25)) / vehicle.speed) * 60) : 0,
    },

    // Faults & Status
    activeFaults: state.activeFaults,
    isRealWorldLive: true,
    lastRealWorldUpdate: Date.now(),
  };

  // Dispatch to all app components
  telemetryListeners.forEach(fn => {
    try { fn(packet); } catch (_) {}
  });

  // Dispatch feedback to mobile controller
  sendFeedback({
    speed: packet.speed,
    rpm: packet.rpm,
    coolant: packet.coolant,
    gear: packet.gear,
  });
}

// ─── Public Engine API ───────────────────────────────────────────────────────

export function initWorldPhysics(profileKey = 'sedan') {
  activeProfileKey = profileKey;
  activeProfile = getProfile();

  if (!physicsInterval) {
    let prev = performance.now();
    physicsInterval = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      physicsStep(dt);
    }, 1000 / 60); // 60 FPS
  }

  if (!broadcastInterval) {
    broadcastInterval = setInterval(broadcastTelemetry, 50); // 20 FPS broadcast
  }

  // Subscribe to phone remote controller packets
  onControlPacket((cmd) => {
    lastRemotePacketTime = performance.now();
    if (cmd.engineOn !== undefined) state.engineOn = cmd.engineOn;
    if (cmd.gear !== undefined) state.gear = cmd.gear;
    if (cmd.driveMode !== undefined) state.driveMode = cmd.driveMode;
    if (cmd.throttle !== undefined) state.throttle = cmd.throttle;
    if (cmd.brake !== undefined) state.brake = cmd.brake;
    if (cmd.steer !== undefined) state.steer = cmd.steer;
    if (cmd.handbrake !== undefined) state.handbrake = cmd.handbrake;
    if (cmd.escOn !== undefined) state.escOn = cmd.escOn;
    if (cmd.absOn !== undefined) state.absOn = cmd.absOn;
    if (cmd.activeFaults !== undefined) state.activeFaults = cmd.activeFaults;
  });
}

export function subscribeTelemetry(fn) {
  telemetryListeners.add(fn);
  // Send current state immediately
  broadcastTelemetry();
  return () => { telemetryListeners.delete(fn); };
}

export function setSafetyLogHandler(fn) {
  safetyLogCallback = fn;
}

export function getVehicleState() {
  return {
    state,
    vehicle,
  };
}

export function setWorldControl(partial) {
  lastRemotePacketTime = performance.now();
  Object.assign(state, partial);
}

export function setWorldKey(code, isDown) {
  keys[code] = isDown;
}

export function setImmobilized(val) {
  state.isImmobilized = val;
  if (val) {
    state.engineOn = false;
    state.throttle = 0;
  }
}

export function injectFaultCode(code) {
  if (!state.activeFaults.includes(code)) {
    state.activeFaults = [...state.activeFaults, code];
  }
}

export function clearFaultCodes() {
  state.activeFaults = [];
}
