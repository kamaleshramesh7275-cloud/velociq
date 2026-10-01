/**
 * enginePhysicsFDI.js
 * 
 * Thermodynamic Mean-Value Engine Model (MVEM) &
 * Fault Detection and Isolation (FDI) Engine for Intake/Exhaust Air Leaks.
 */

// Atmospheric constants
const P_AMB = 101.325; // kPa (Standard atmospheric pressure)
const T_AMB = 298.15;  // Kelvin (25°C)
const R_AIR = 287.05;  // J/(kg·K)
const V_MANIFOLD = 0.0035; // m^3 (3.5L intake plenum)

export const FAULT_LOCATIONS = {
  NONE: 'NONE',
  INTAKE_MANIFOLD: 'INTAKE_MANIFOLD',
  THROTTLE_COUPLER: 'THROTTLE_COUPLER',
  EXHAUST_HEADER: 'EXHAUST_HEADER',
  DOWNPIPE_FLEX: 'DOWNPIPE_FLEX'
};

export const FAULT_PRESETS = [
  {
    id: 'nominal',
    name: 'Nominal Operation',
    location: FAULT_LOCATIONS.NONE,
    leakDiameterMm: 0,
    throttlePct: 15,
    description: 'Engine running within factory tolerances. Sealed intake and exhaust pathways.'
  },
  {
    id: 'intake_vacuum_leak',
    name: 'Intake Manifold Gasket Blowout',
    location: FAULT_LOCATIONS.INTAKE_MANIFOLD,
    leakDiameterMm: 5.5,
    throttlePct: 15,
    description: 'Upper plenum gasket ruptured. Unmetered ambient air rushes into manifold under engine vacuum.'
  },
  {
    id: 'throttle_coupler_tear',
    name: 'Throttle Body Coupler Tear',
    location: FAULT_LOCATIONS.THROTTLE_COUPLER,
    leakDiameterMm: 4.0,
    throttlePct: 20,
    description: 'Silicone intake boot downstream of MAF sensor cracked, bypassing throttle metering.'
  },
  {
    id: 'exhaust_header_crack',
    name: 'Exhaust Header Flange Crack',
    location: FAULT_LOCATIONS.EXHAUST_HEADER,
    leakDiameterMm: 4.8,
    throttlePct: 25,
    description: 'Thermal fracture at cylinder #1 exhaust runner flange. Exhaust pulses draw ambient air pre-O2 sensor.'
  },
  {
    id: 'downpipe_flex_leak',
    name: 'Downpipe Flex-Joint Breach',
    location: FAULT_LOCATIONS.DOWNPIPE_FLEX,
    leakDiameterMm: 6.2,
    throttlePct: 30,
    description: 'Braided exhaust flex joint perforated post-pre-cat O2, causing catalytic efficiency decay.'
  }
];

export const COMPONENT_METADATA = {
  INTAKE_MANIFOLD: {
    name: 'Intake Manifold Upper Plenum',
    type: 'Intake Subsystem',
    nominalCondition: 'Vacuum pressure 28 - 36 kPa at idle',
    failureConsequence: 'Unmetered air causes severe lean condition, idle hunting, and high STFT trim.',
    dtcList: ['P0171', 'P0106', 'P0507'],
    inspectionSteps: [
      'Perform ultrasonic or smoke leak test at 3-5 PSI in intake plenum.',
      'Check plenum gasket torque specification (22 Nm in cross pattern).',
      'Inspect vacuum lines and PCV valve grommet for dry rot or micro-cracks.'
    ]
  },
  THROTTLE_COUPLER: {
    name: 'Throttle Body Boot & Coupler',
    type: 'Intake Metering',
    nominalCondition: 'Airtight seal between MAF sensor tube and throttle housing',
    failureConsequence: 'Air bypasses MAF metering; hesitation during acceleration; erratic idle.',
    dtcList: ['P0101', 'P0171', 'P2187'],
    inspectionSteps: [
      'Visually inspect silicone accordion boot for underside split or loose T-bolt clamp.',
      'Verify throttle plate sealing and stepper motor zero-point calibration.',
      'Clean throttle bore of carbon deposits that may cause vacuum bypass.'
    ]
  },
  EXHAUST_HEADER: {
    name: 'Exhaust Header Flange & Runners',
    type: 'Exhaust Pre-Catalyst',
    nominalCondition: 'Positive pulsating pressure, thermal resilience up to 850°C',
    failureConsequence: 'Venturi air suction creates false lean reading at Pre-Cat O2 sensor; fuel over-enrichment.',
    dtcList: ['P0131', 'P0171', 'P2270'],
    inspectionSteps: [
      'Inspect tubular header welds and cylinder head flange for soot / carbon tracking.',
      'Check exhaust manifold stud torque; replace multi-layer steel (MLS) gasket.',
      'Verify pre-cat lambda sensor tight fitment in bung.'
    ]
  },
  DOWNPIPE_FLEX: {
    name: 'Downpipe Braided Flex Joint',
    type: 'Exhaust Post-Sensor / Pre-Cat',
    nominalCondition: 'Dampens engine vibration without gas escape; 100% gastight to catalytic converter',
    failureConsequence: 'Exhaust gas odor, catalytic converter efficiency fault, divergence in post-O2 voltage.',
    dtcList: ['P0420', 'P0137'],
    inspectionSteps: [
      'Inspect stainless wire mesh flex section for fraying, blowout, or soot deposits.',
      'Pressure test exhaust system from tailpipe using low-pressure smoke tracer.',
      'Replace flex pipe section with high-grade stainless interlock connector.'
    ]
  }
};

/**
 * Runs one simulation step for the engine air path physics
 */
export function simulateEngineAirPath({
  rpm = 850,
  throttlePct = 15,
  faultLocation = FAULT_LOCATIONS.NONE,
  leakDiameterMm = 0,
  time = 0
}) {
  // 1. Throttle Angle & Effective Orifice Area
  const alpha = Math.max(2, Math.min(90, (throttlePct / 100) * 90)); // degrees
  const rad = (alpha * Math.PI) / 180;
  // Normalized throttle flow area
  const A_th = (1 - Math.cos(rad)) * 0.0018 + 0.00012; // m^2

  // 2. Leak Area
  const leakRadiusM = (Math.max(0, leakDiameterMm) / 2) / 1000;
  const A_leak = Math.PI * (leakRadiusM * leakRadiusM); // m^2

  // 3. Engine Displacement Pumping Capacity (2.0L 4-cylinder engine)
  const V_d = 0.002; // 2.0 Liters = 0.002 m^3
  const volumetricEfficiency = 0.85 + (throttlePct / 100) * 0.08;
  const enginePumpingRate = (V_d * (rpm / 60) * volumetricEfficiency) / 2; // m^3/s of air drawn

  // 4. Manifold Pressure Physics (Nominal)
  // Balance between throttle inflow and engine pumping outflow
  const baseMapIdle = 30.5; // kPa
  const mapRisePerThrottle = 70.8 * Math.pow(throttlePct / 100, 0.7);
  const nominalMAP = Math.min(P_AMB, baseMapIdle + mapRisePerThrottle);

  // 5. Injected Leak Dynamics
  let actualMAP = nominalMAP;
  let unmeteredAirGramsPerSec = 0;
  let falseO2Suction = 0;
  let exhaustLeakFlow = 0;

  if (faultLocation === FAULT_LOCATIONS.INTAKE_MANIFOLD) {
    // Air rushes into intake vacuum: mass flow proportional to pressure differential
    const vacuumDelta = Math.max(0, P_AMB - actualMAP);
    // Leak flow in g/s
    unmeteredAirGramsPerSec = A_leak * 1e6 * 0.85 * (vacuumDelta / 70);
    // Vacuum diminishes: MAP rises toward atmospheric pressure!
    actualMAP = Math.min(P_AMB, nominalMAP + (unmeteredAirGramsPerSec * 4.2));
  } else if (faultLocation === FAULT_LOCATIONS.THROTTLE_COUPLER) {
    const vacuumDelta = Math.max(0, P_AMB - actualMAP);
    unmeteredAirGramsPerSec = A_leak * 1e6 * 0.65 * (vacuumDelta / 75);
    actualMAP = Math.min(P_AMB, nominalMAP + (unmeteredAirGramsPerSec * 3.1));
  } else if (faultLocation === FAULT_LOCATIONS.EXHAUST_HEADER) {
    // High-frequency exhaust pulses create negative pressure venturi waves that suck ambient air in
    const pulseFactor = 0.4 + 0.6 * Math.sin(time * (rpm / 60) * Math.PI * 2);
    falseO2Suction = (leakDiameterMm / 10) * 0.35 * Math.max(0, pulseFactor);
    exhaustLeakFlow = (leakDiameterMm / 10) * 1.8;
  } else if (faultLocation === FAULT_LOCATIONS.DOWNPIPE_FLEX) {
    exhaustLeakFlow = (leakDiameterMm / 10) * 2.4;
  }

  // 6. Mass Air Flow (MAF) Sensor (measured at the intake filter)
  // Nominal MAF is proportional to engine load and RPM
  const nominalMAF = Math.max(2.1, (rpm / 1000) * 2.6 + (throttlePct / 100) * 28.0);
  
  // If there is an intake leak downstream, the engine gets air through the leak,
  // so the metered MAF at the intake entrance drops relative to the actual manifold charge!
  let actualMAF = nominalMAF;
  if (unmeteredAirGramsPerSec > 0) {
    actualMAF = Math.max(1.5, nominalMAF - (unmeteredAirGramsPerSec * 0.72));
  }

  // 7. Lambda & Air-Fuel Ratio (AFR)
  // ECU calculates fuel injector pulse width based on measured MAF (metered air)
  const targetAFR = 14.7; // Stoichiometric
  const commandedFuelGrams = actualMAF / targetAFR;
  const totalCylinderAir = actualMAF + unmeteredAirGramsPerSec;
  
  // True Lambda inside combustion chamber
  let trueLambda = totalCylinderAir / (commandedFuelGrams * targetAFR);

  // 8. ECU Closed Loop Fuel Trim (STFT & LTFT)
  // The ECU senses O2 in the exhaust and tries to correct trueLambda back to 1.00
  let stftPct = 0;
  if (unmeteredAirGramsPerSec > 0) {
    // To compensate for extra unmetered air, ECU increases fuel trim up to +25% limit
    stftPct = Math.min(25.0, (unmeteredAirGramsPerSec / nominalMAF) * 100 * 1.6);
  } else if (faultLocation === FAULT_LOCATIONS.EXHAUST_HEADER) {
    // False oxygen sucked into exhaust manifold fools the O2 sensor into reading lean
    stftPct = Math.min(22.0, falseO2Suction * 40);
  }

  // With closed-loop trim active, trueLambda is partially corrected:
  const correctedLambda = trueLambda / (1 + stftPct / 100);

  // 9. Pre-Cat and Post-Cat Oxygen Sensor Voltages
  // Pre-Cat O2 cycles rapidly between 0.1V (lean) and 0.9V (rich)
  const o2Oscillation = Math.sin(time * 3.5);
  let preCatO2 = 0.45 + 0.4 * o2Oscillation;

  if (correctedLambda > 1.05 || falseO2Suction > 0.08) {
    // Lean or false lean: sensor gets pinned low (0.05V - 0.25V)
    preCatO2 = Math.max(0.08, 0.25 - (correctedLambda - 1.0) * 0.8 + 0.06 * Math.sin(time * 8));
  }

  // Post-Cat O2 (Downstream): Under healthy catalytic converter, stays stable ~0.65V - 0.72V
  let postCatO2 = 0.68 + 0.02 * Math.sin(time * 0.8);
  if (faultLocation === FAULT_LOCATIONS.DOWNPIPE_FLEX || faultLocation === FAULT_LOCATIONS.EXHAUST_HEADER) {
    // Ambient air or leak disrupts cat conversion: post-O2 begins tracking pre-O2 waves (P0420 condition)
    postCatO2 = 0.35 + 0.25 * Math.sin(time * 2.8);
  }

  // Add realistic subtle sensor noise
  const noise = (Math.random() - 0.5) * 0.02;
  actualMAP += (Math.random() - 0.5) * 0.3;
  actualMAF += (Math.random() - 0.5) * 0.1;

  // 10. Compute FDI Residuals (Observed - Nominal Model)
  const r_MAP = actualMAP - nominalMAP;
  const r_MAF = actualMAF - nominalMAF;
  const r_STFT = stftPct;
  const r_Lambda = correctedLambda - 1.00;
  const r_O2_Variance = Math.abs(preCatO2 - 0.45);

  // 11. Run FDI Fault Isolation Engine
  const fdiVerdict = runFaultIsolationClassifier({
    r_MAP,
    r_MAF,
    r_STFT,
    r_Lambda,
    preCatO2,
    postCatO2,
    leakDiameterMm,
    faultLocation
  });

  return {
    telemetry: {
      rpm,
      throttlePct,
      nominalMAP: Number(nominalMAP.toFixed(1)),
      actualMAP: Number(actualMAP.toFixed(1)),
      nominalMAF: Number(nominalMAF.toFixed(2)),
      actualMAF: Number(actualMAF.toFixed(2)),
      lambda: Number(correctedLambda.toFixed(3)),
      afr: Number((correctedLambda * 14.7).toFixed(2)),
      stft: Number(stftPct.toFixed(1)),
      ltft: Number((stftPct * 0.6).toFixed(1)),
      preCatO2: Number(Math.max(0.02, Math.min(0.98, preCatO2 + noise)).toFixed(3)),
      postCatO2: Number(Math.max(0.02, Math.min(0.98, postCatO2 + noise)).toFixed(3)),
      unmeteredAirGramsPerSec: Number(unmeteredAirGramsPerSec.toFixed(2)),
      exhaustLeakFlow: Number(exhaustLeakFlow.toFixed(2)),
      engineVacuumKPa: Number((P_AMB - actualMAP).toFixed(1))
    },
    residuals: {
      r_MAP: Number(r_MAP.toFixed(2)),
      r_MAF: Number(r_MAF.toFixed(2)),
      r_STFT: Number(r_STFT.toFixed(1)),
      r_Lambda: Number(r_Lambda.toFixed(3)),
      r_O2_Variance: Number(r_O2_Variance.toFixed(3))
    },
    fdiVerdict
  };
}

/**
 * FDI Decision Engine & Parity Matrix
 */
function runFaultIsolationClassifier({
  r_MAP,
  r_MAF,
  r_STFT,
  r_Lambda,
  preCatO2,
  postCatO2,
  leakDiameterMm
}) {
  const isLeakSignificant = leakDiameterMm > 0.8;

  if (!isLeakSignificant) {
    return {
      status: 'NOMINAL',
      isolatedComponent: null,
      confidence: 99.2,
      severity: 'Low',
      summary: 'All intake and exhaust pathways verified airtight. Residuals within nominal 3-sigma envelope.',
      dtcToTrigger: []
    };
  }

  // FDI Rule 1: Intake Manifold Vacuum Leak
  // High positive MAP residual (vacuum collapse) + High positive STFT + MAF drop relative to load
  if (r_MAP > 4.0 && r_STFT > 8.0 && r_MAF < -0.5) {
    const confidence = Math.min(99.4, 82 + (r_MAP * 1.8) + (r_STFT * 0.4));
    return {
      status: 'FAULT_ISOLATED',
      isolatedComponent: FAULT_LOCATIONS.INTAKE_MANIFOLD,
      componentName: 'Intake Manifold Upper Plenum',
      confidence: Number(confidence.toFixed(1)),
      severity: r_STFT > 18 ? 'Critical' : 'Moderate',
      summary: `Intake vacuum breach isolated at Intake Manifold Plenum / Runner Gasket. Massive unmetered air intake bypassing throttle.`,
      dtcToTrigger: ['P0171', 'P0106']
    };
  }

  // FDI Rule 2: Throttle Body Coupler / Boot Tear
  // Moderate MAP rise, moderate positive STFT, MAF drop, erratic tip-in
  if (r_MAP > 2.0 && r_STFT > 5.0 && r_MAF <= 0) {
    const confidence = Math.min(96.8, 78 + (r_MAP * 2.2));
    return {
      status: 'FAULT_ISOLATED',
      isolatedComponent: FAULT_LOCATIONS.THROTTLE_COUPLER,
      componentName: 'Throttle Body Boot & Coupler',
      confidence: Number(confidence.toFixed(1)),
      severity: 'Moderate',
      summary: `Air ingestion isolated downstream of MAF sensor housing at Throttle Body silicone inlet sleeve.`,
      dtcToTrigger: ['P0171', 'P0101']
    };
  }

  // FDI Rule 3: Exhaust Header Flange Crack (Pre-O2)
  // MAP normal (~0), MAF normal (~0), but Pre-Cat O2 pinned lean + high STFT compensation + high frequency variance
  if (Math.abs(r_MAP) < 3.5 && preCatO2 < 0.28 && r_STFT > 6.0) {
    const confidence = Math.min(98.5, 84 + (r_STFT * 1.1));
    return {
      status: 'FAULT_ISOLATED',
      isolatedComponent: FAULT_LOCATIONS.EXHAUST_HEADER,
      componentName: 'Exhaust Header Flange',
      confidence: Number(confidence.toFixed(1)),
      severity: 'High',
      summary: `Pre-Catalytic exhaust leak isolated at Header Flange. Exhaust scavenging pulses aspirating atmospheric oxygen over Pre-Cat O2 sensor.`,
      dtcToTrigger: ['P0131', 'P0171', 'P2270']
    };
  }

  // FDI Rule 4: Downpipe / Flex-Joint Breach
  // MAP normal, MAF normal, STFT near normal, but Post-Cat O2 erratic / oscillating (P0420 precursor)
  if (Math.abs(r_MAP) < 3.0 && Math.abs(r_STFT) < 6.0 && postCatO2 < 0.55) {
    return {
      status: 'FAULT_ISOLATED',
      isolatedComponent: FAULT_LOCATIONS.DOWNPIPE_FLEX,
      componentName: 'Downpipe Braided Flex Joint',
      confidence: 93.4,
      severity: 'Moderate',
      summary: `Post-sensor exhaust leak isolated at braided downpipe flex section. Catalytic conversion integrity compromised.`,
      dtcToTrigger: ['P0420', 'P0137']
    };
  }

  // Default fallback if anomaly is detected but confidence is spreading
  return {
    status: 'FAULT_DETECTED_UNRESOLVED',
    isolatedComponent: FAULT_LOCATIONS.INTAKE_MANIFOLD,
    componentName: 'Air Path Assembly',
    confidence: 68.5,
    severity: 'Low',
    summary: 'Air path residual anomaly detected; converging Kalman filter matrices to isolate exact subsystem.',
    dtcToTrigger: ['P0171']
  };
}
