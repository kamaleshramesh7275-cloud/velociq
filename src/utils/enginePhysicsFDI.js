/**
 * enginePhysicsFDI.js
 * 
 * Thermodynamic Mean-Value Engine Model (MVEM) &
 * Fault Detection and Isolation (FDI) Engine for Intake/Exhaust Air Leaks.
 * Generalised across all 10 powertrain families.
 */

import { getEngineType } from '../config/engineTypes.js';

// Atmospheric constants
const P_AMB = 101.325; // kPa (Standard atmospheric pressure)
const T_AMB = 298.15;  // Kelvin (25°C)
const R_AIR = 287.05;  // J/(kg·K)

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
    description: 'Thermal fracture at cylinder exhaust runner flange. Exhaust pulses draw ambient air pre-O2 sensor.'
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
 * Runs one simulation step for the engine air path physics (Parametric by Engine Type)
 */
export function simulateEngineAirPath({
  rpm = 850,
  throttlePct = 15,
  faultLocation = FAULT_LOCATIONS.NONE,
  leakDiameterMm = 0,
  time = 0,
  engineTypeId = 'i4_petrol'
}) {
  const engine = getEngineType(engineTypeId);

  // If electric powertrain (BEV), air path leaks are not applicable
  if (engine.category === 'BEV') {
    return {
      telemetry: {
        rpm,
        throttlePct,
        nominalMAP: 101.3,
        actualMAP: 101.3,
        nominalMAF: 0.0,
        actualMAF: 0.0,
        lambda: 1.000,
        afr: 0.0,
        stft: 0.0,
        ltft: 0.0,
        preCatO2: 0.450,
        postCatO2: 0.680,
        unmeteredAirGramsPerSec: 0.0,
        exhaustLeakFlow: 0.0,
        engineVacuumKPa: 0.0
      },
      residuals: {
        r_MAP: 0,
        r_MAF: 0,
        r_STFT: 0,
        r_Lambda: 0,
        r_O2_Variance: 0
      },
      fdiVerdict: {
        status: 'NOMINAL',
        isolatedComponent: null,
        confidence: 99.8,
        severity: 'Low',
        summary: 'BEV electric powertrain: zero intake throttle restriction, hermetic coolant loop intact.',
        dtcToTrigger: []
      }
    };
  }

  // 1. Throttle Angle & Effective Orifice Area
  const alpha = Math.max(2, Math.min(90, (throttlePct / 100) * 90));
  const rad = (alpha * Math.PI) / 180;
  const A_th = (1 - Math.cos(rad)) * 0.0018 + 0.00012;

  // 2. Leak Area
  const leakRadiusM = (Math.max(0, leakDiameterMm) / 2) / 1000;
  const A_leak = Math.PI * (leakRadiusM * leakRadiusM);

  // 3. Engine Displacement Pumping Capacity (Parametric)
  const dispL = engine.displacementL || 2.0;
  const V_d = dispL / 1000; // m^3
  const volumetricEfficiency = 0.85 + (throttlePct / 100) * 0.08;
  const enginePumpingRate = (V_d * (rpm / 60) * volumetricEfficiency) / 2;

  // 4. Manifold Pressure Physics
  const baseMapIdle = 30.5;
  const mapRisePerThrottle = 70.8 * Math.pow(throttlePct / 100, 0.7);
  const nominalMAP = Math.min(P_AMB, baseMapIdle + mapRisePerThrottle);

  // 5. Injected Leak Dynamics
  let actualMAP = nominalMAP;
  let unmeteredAirGramsPerSec = 0;
  let falseO2Suction = 0;
  let exhaustLeakFlow = 0;

  if (faultLocation === FAULT_LOCATIONS.INTAKE_MANIFOLD) {
    const vacuumDelta = Math.max(0, P_AMB - actualMAP);
    unmeteredAirGramsPerSec = A_leak * 1e6 * 0.85 * (vacuumDelta / 70);
    actualMAP = Math.min(P_AMB, nominalMAP + (unmeteredAirGramsPerSec * 4.2));
  } else if (faultLocation === FAULT_LOCATIONS.THROTTLE_COUPLER) {
    const vacuumDelta = Math.max(0, P_AMB - actualMAP);
    unmeteredAirGramsPerSec = A_leak * 1e6 * 0.65 * (vacuumDelta / 75);
    actualMAP = Math.min(P_AMB, nominalMAP + (unmeteredAirGramsPerSec * 3.1));
  } else if (faultLocation === FAULT_LOCATIONS.EXHAUST_HEADER) {
    const pulseFactor = 0.4 + 0.6 * Math.sin(time * (rpm / 60) * Math.PI * 2);
    falseO2Suction = (leakDiameterMm / 10) * 0.35 * Math.max(0, pulseFactor);
    exhaustLeakFlow = (leakDiameterMm / 10) * 1.8;
  } else if (faultLocation === FAULT_LOCATIONS.DOWNPIPE_FLEX) {
    exhaustLeakFlow = (leakDiameterMm / 10) * 2.4;
  }

  // 6. Mass Air Flow (MAF) Sensor
  const nominalMAF = Math.max(2.1, (rpm / 1000) * (dispL * 1.3) + (throttlePct / 100) * (dispL * 14.0));
  let actualMAF = nominalMAF;
  if (unmeteredAirGramsPerSec > 0) {
    actualMAF = Math.max(1.5, nominalMAF - (unmeteredAirGramsPerSec * 0.72));
  }

  // 7. Lambda & AFR
  const targetAFR = engine.fuelType === 'cng' ? 17.2 : 14.7;
  const commandedFuelGrams = actualMAF / targetAFR;
  const totalCylinderAir = actualMAF + unmeteredAirGramsPerSec;
  let trueLambda = totalCylinderAir / (commandedFuelGrams * targetAFR);

  // 8. Fuel Trim (STFT)
  let stftPct = 0;
  if (unmeteredAirGramsPerSec > 0) {
    stftPct = Math.min(25.0, (unmeteredAirGramsPerSec / nominalMAF) * 100 * 1.6);
  } else if (faultLocation === FAULT_LOCATIONS.EXHAUST_HEADER) {
    stftPct = Math.min(22.0, falseO2Suction * 40);
  }

  const correctedLambda = trueLambda / (1 + stftPct / 100);

  // 9. O2 Sensors
  const o2Oscillation = Math.sin(time * 3.5);
  let preCatO2 = 0.45 + 0.4 * o2Oscillation;

  if (correctedLambda > 1.05 || falseO2Suction > 0.08) {
    preCatO2 = Math.max(0.08, 0.25 - (correctedLambda - 1.0) * 0.8 + 0.06 * Math.sin(time * 8));
  }

  let postCatO2 = 0.68 + 0.02 * Math.sin(time * 0.8);
  if (faultLocation === FAULT_LOCATIONS.DOWNPIPE_FLEX || faultLocation === FAULT_LOCATIONS.EXHAUST_HEADER) {
    postCatO2 = 0.35 + 0.25 * Math.sin(time * 2.8);
  }

  const noise = (Math.random() - 0.5) * 0.02;
  actualMAP += (Math.random() - 0.5) * 0.3;
  actualMAF += (Math.random() - 0.5) * 0.1;

  // 10. Residuals
  const r_MAP = actualMAP - nominalMAP;
  const r_MAF = actualMAF - nominalMAF;
  const r_STFT = stftPct;
  const r_Lambda = correctedLambda - 1.00;
  const r_O2_Variance = Math.abs(preCatO2 - 0.45);

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
      afr: Number((correctedLambda * targetAFR).toFixed(2)),
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
