/**
 * engineTwinPhysics.js
 * 
 * Multi-Physics Cyber-Physical Simulation Engine for the Automotive Engine Digital Twin.
 * Extended with full Multi-Engine-Type architecture supporting:
 * - i4_petrol (Default baseline, zero regression)
 * - i3_turbo, v6_petrol, v8_petrol, boxer4, i4_diesel, single_4s, i4_cng, hybrid_atkinson, bev_pmsm
 * 
 * Computes:
 * 1. Engine-Specific Combustion & Power Balance (1 to 8 cylinders, opposed, or electric drive)
 * 2. Lumped-Parameter Thermal Network (Head, Block, Oil, Coolant, Exhaust/Turbo/Inverter/Battery)
 * 3. Lubrication & Tribology (Oil Pressure, Viscosity, Bearing Friction)
 * 4. Air Induction & Turbo Boost Dynamics (MAP, MAF, Lambda)
 * 5. Mechanical Wear & Remaining Lifespan
 * 6. Virtual Dyno Performance Curves (Torque & Horsepower)
 */

import { getEngineType } from '../config/engineTypes.js';
import { stepEngineModel } from './engineModels/index.js';
import { getEngineFaultCatalog, buildEngineRiskMap } from './engineFaultCatalogs.js';

export const VISUAL_MODES = {
  CAD: 'CAD',
  THERMAL: 'THERMAL',
  FLUIDS: 'FLUIDS',
  MECHANICAL: 'MECHANICAL',
  EXPLODED: 'EXPLODED'
};

export const TWIN_FAULT_SCENARIOS = {
  NOMINAL: {
    id: 'NOMINAL',
    title: 'Factory Nominal (Healthy)',
    description: 'All engine subsystems operating within optimal thermal, mechanical, and combustion tolerances.',
    dtc: []
  },
  CYL_3_MISFIRE: {
    id: 'CYL_3_MISFIRE',
    title: 'Cylinder #3 Ignition Breakdown (Misfire)',
    description: 'Ignition coil failure on Cylinder 3 causes incomplete combustion, raw fuel dumping into exhaust, and rough torque ripple.',
    dtc: ['P0303', 'P0300']
  },
  THERMOSTAT_STUCK: {
    id: 'THERMOSTAT_STUCK',
    title: 'Coolant Thermostat Stuck Closed (Thermal Overheat)',
    description: 'Coolant circulation restricted. Coolant and cylinder head temperatures rapidly rise toward critical 118°C gasket failure threshold.',
    dtc: ['P0217', 'P0128']
  },
  OIL_STARVATION: {
    id: 'OIL_STARVATION',
    title: 'Oil Pressure Collapse & Starvation',
    description: 'Oil relief valve failure or severe leak drops lubrication pressure to 12 PSI, leading to hydrodynamic bearing friction and metal wear.',
    dtc: ['P0524']
  },
  INTAKE_VACUUM_LEAK: {
    id: 'INTAKE_VACUUM_LEAK',
    title: 'Intake Plenum Gasket Vacuum Leak',
    description: 'Unmetered ambient air bypasses throttle plate. Lambda swings lean, causing the ECU to peg Short-Term Fuel Trim at +25%.',
    dtc: ['P0171', 'P0106']
  },
  TURBO_OVERBOOST: {
    id: 'TURBO_OVERBOOST',
    title: 'Turbocharger Wastegate Actuator Jam',
    description: 'Wastegate stuck shut under load. Boost pressure surges past safe threshold (24 PSI / 265 kPa), triggering ECU safety limit.',
    dtc: ['P0234']
  }
};

/**
 * Returns the fault scenarios available for a specific engine type.
 */
export function getScenariosForEngine(engineTypeId = 'i4_petrol') {
  return getEngineFaultCatalog(engineTypeId);
}

export function buildComponentRiskMap({
  diagnostics = {},
  thermal = {},
  wear = {},
  telemetry = {},
  activeScenario = 'NOMINAL',
  engineTypeId = 'i4_petrol'
} = {}) {
  // If non-default engine, use engine-specific risk mapper
  if (engineTypeId && engineTypeId !== 'i4_petrol') {
    return buildEngineRiskMap({
      engineId: engineTypeId,
      activeScenario,
      diagnostics,
      thermal,
      telemetry
    });
  }

  // Exact baseline behavior for i4_petrol (Zero Regression)
  const map = {};
  const priority = { healthy: 0, watch: 1, damaged: 2, critical: 3 };

  const setRisk = (componentId, level) => {
    if (!componentId) return;
    const current = map[componentId];
    if (!current || priority[level] > priority[current]) {
      map[componentId] = level;
    }
  };

  const activeDTCs = diagnostics.activeDTCs || [];

  if (activeScenario === 'CYL_3_MISFIRE') {
    setRisk('coil_3', 'critical');
    setRisk('coil_4', 'watch');
    setRisk('exhaust_runner_3', 'damaged');
    setRisk('exhaust_runner_4', 'watch');
    setRisk('catalytic_converter', 'critical');
    setRisk('cylinder_head', 'damaged');
  }

  if (activeScenario === 'THERMOSTAT_STUCK') {
    setRisk('thermostat_housing', 'critical');
    setRisk('coolant_hard_line', 'damaged');
    setRisk('cylinder_head', 'damaged');
  }

  if (activeScenario === 'OIL_STARVATION') {
    setRisk('oil_filter', 'critical');
    setRisk('oil_pressure_sensor', 'critical');
    setRisk('oil_pan', 'critical');
    setRisk('crankshaft', 'damaged');
  }

  if (activeScenario === 'INTAKE_VACUUM_LEAK') {
    setRisk('intake_plenum', 'critical');
    setRisk('cylinder_head', 'damaged');
  }

  if (activeScenario === 'TURBO_OVERBOOST') {
    setRisk('exhaust_runner_1', 'damaged');
    setRisk('exhaust_runner_2', 'damaged');
    setRisk('catalytic_converter', 'critical');
  }

  if (activeDTCs.includes('P0217') || activeDTCs.includes('P0128')) {
    setRisk('thermostat_housing', 'critical');
  }

  if (activeDTCs.includes('P0524')) {
    setRisk('oil_filter', 'critical');
    setRisk('oil_pressure_sensor', 'critical');
  }

  if (activeDTCs.includes('P0171') || activeDTCs.includes('P0106')) {
    setRisk('intake_plenum', 'critical');
  }

  if (thermal.coolantTemp >= 111) {
    setRisk('thermostat_housing', 'critical');
    setRisk('coolant_hard_line', 'damaged');
  } else if (thermal.coolantTemp >= 100) {
    setRisk('thermostat_housing', 'damaged');
  }

  if (thermal.headTemp >= 108) {
    setRisk('cylinder_head', 'critical');
  } else if (thermal.headTemp >= 100) {
    setRisk('cylinder_head', 'damaged');
  }

  if (telemetry.oilPressurePsi < 16) {
    setRisk('oil_filter', 'critical');
    setRisk('oil_pressure_sensor', 'critical');
    setRisk('oil_pan', 'damaged');
  } else if (telemetry.oilPressurePsi < 20) {
    setRisk('oil_filter', 'damaged');
  }

  if (wear && wear.crankBearings >= 15) {
    setRisk('oil_pan', 'critical');
  } else if (wear && wear.crankBearings >= 8) {
    setRisk('oil_pan', 'damaged');
  }

  if (wear && wear.turboBearings >= 12) {
    setRisk('catalytic_converter', 'damaged');
  }

  return map;
}

/**
 * Multi-physics simulation step (Parametric by Engine Type)
 */
export function stepEngineDigitalTwin({
  rpm = 1200,
  throttlePct = 20,
  activeScenario = 'NOMINAL',
  time = 0,
  driverScore = 95,
  prevThermalState = null,
  isDynoRunning = false,
  engineTypeId = 'i4_petrol'
}) {
  const engineType = getEngineType(engineTypeId);

  // If another engine type is requested, dispatch to modular family model
  if (engineTypeId && engineTypeId !== 'i4_petrol') {
    const res = stepEngineModel(engineType, { thermal: prevThermalState }, {
      rpm,
      throttlePct,
      time,
      driverScore,
      activeScenario
    });

    const catalog = getEngineFaultCatalog(engineTypeId);
    const scenarioObj = catalog[activeScenario] || catalog.NOMINAL;
    const activeDTCs = [...(scenarioObj.dtc || [])];

    // Compute mechanical wear rates tailored to engine type
    const aggressiveDrivingWearMultiplier = Math.max(1.0, (100 - driverScore) / 25);
    const wear = {
      pistonRings: Number((6.8 + (rpm > 5000 ? 0.05 : 0.01) * aggressiveDrivingWearMultiplier).toFixed(2)),
      crankBearings: Number((4.2 + (activeScenario.includes('STARVATION') ? 18.5 : 0.01)).toFixed(2)),
      valvetrain: Number((5.1 + (res.thermal.headTemp > 105 ? 0.08 : 0.01)).toFixed(2)),
      turboBearings: Number((7.4 + ((res.thermal.turboTemp || 400) > 650 ? 0.12 : 0.02)).toFixed(2))
    };

    const healthIndex = Math.max(20, Math.min(100, 100 - (activeDTCs.length * 18) - (res.thermal.coolantTemp > 100 ? 15 : 0)));

    return {
      telemetry: res.telemetry,
      thermal: res.thermal,
      cylinderBalance: res.cylinderBalance,
      wear,
      diagnostics: {
        activeScenario,
        scenarioTitle: scenarioObj.title,
        scenarioDesc: scenarioObj.description,
        activeDTCs,
        healthIndex
      }
    };
  }

  // --- EXACT NUMERICAL BASELINE PRESERVED FOR i4_petrol (Zero Regression) ---
  const normThrottle = Math.max(0, Math.min(100, throttlePct)) / 100;
  const normRpm = Math.max(700, Math.min(7200, rpm));
  const dt = 0.05; // 50ms timestep

  // 1. Combustion & 4-Cylinder Power Balance
  const firingCycle = (time * (normRpm / 60) * 2) % 4;
  const activeFiringCylinder = Math.floor(firingCycle) + 1;

  let cyl1Efficiency = 0.98 + (Math.random() - 0.5) * 0.03;
  let cyl2Efficiency = 0.99 + (Math.random() - 0.5) * 0.03;
  let cyl3Efficiency = 0.97 + (Math.random() - 0.5) * 0.03;
  let cyl4Efficiency = 0.98 + (Math.random() - 0.5) * 0.03;

  let misfireDetected = false;
  let knockDetected = false;

  if (activeScenario === 'CYL_3_MISFIRE') {
    cyl3Efficiency = 0.12 + (Math.random() * 0.08);
    misfireDetected = true;
  } else if (activeScenario === 'TURBO_OVERBOOST') {
    knockDetected = normThrottle > 0.6;
  }

  const cylinderBalance = [
    { id: 1, name: 'Cyl #1', efficiency: Number((cyl1Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl1Efficiency).toFixed(1)), tempC: 0, status: 'Normal' },
    { id: 2, name: 'Cyl #2', efficiency: Number((cyl2Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl2Efficiency).toFixed(1)), tempC: 0, status: 'Normal' },
    { id: 3, name: 'Cyl #3', efficiency: Number((cyl3Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl3Efficiency).toFixed(1)), tempC: 0, status: activeScenario === 'CYL_3_MISFIRE' ? 'Misfire' : 'Normal' },
    { id: 4, name: 'Cyl #4', efficiency: Number((cyl4Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl4Efficiency).toFixed(1)), tempC: 0, status: 'Normal' }
  ];

  // 2. Air Path & Turbo Boost Induction
  let manifoldPressureKPa = 32.0 + (normThrottle * 70.0);
  let turboBoostPsi = 0.0;
  let mafFlowRate = 3.2 + (normRpm / 1000) * 4.5 + normThrottle * 50.0;

  if (normRpm > 1800 && normThrottle > 0.25) {
    turboBoostPsi = Math.min(16.5, (normRpm / 6000) * 16.0 * normThrottle * 1.3);
    if (activeScenario === 'TURBO_OVERBOOST') {
      turboBoostPsi = Math.min(27.5, turboBoostPsi * 1.75);
    }
    manifoldPressureKPa += (turboBoostPsi * 6.894);
  }

  let lambda = 1.00;
  let stftPct = 0.0;
  if (activeScenario === 'INTAKE_VACUUM_LEAK') {
    manifoldPressureKPa = Math.min(101.3, manifoldPressureKPa + 22.0);
    mafFlowRate = Math.max(2.0, mafFlowRate - 3.5);
    lambda = 1.18;
    stftPct = 24.5;
  }

  // 3. Thermal Network
  const prev = prevThermalState || {
    headTemp: 92.0,
    blockTemp: 88.0,
    coolantTemp: 86.0,
    oilTemp: 91.0,
    exhaustTemp: 420.0,
    turboTemp: 380.0
  };

  const loadFactor = (normRpm / 6000) * 0.6 + normThrottle * 0.4;
  let targetExhaust = 340 + loadFactor * 460;
  let targetHead = 88 + loadFactor * 26;
  let targetBlock = 84 + loadFactor * 20;
  let targetCoolant = 84 + loadFactor * 16;
  let targetOil = 86 + loadFactor * 28;
  let targetTurbo = 300 + loadFactor * 380;

  if (activeScenario === 'THERMOSTAT_STUCK') {
    targetCoolant += 35.0;
    targetHead += 32.0;
    targetBlock += 24.0;
    targetOil += 22.0;
  } else if (activeScenario === 'CYL_3_MISFIRE') {
    targetExhaust += 110.0;
    targetTurbo += 90.0;
  } else if (activeScenario === 'OIL_STARVATION') {
    targetBlock += 18.0;
    targetOil += 35.0;
  }

  const headTemp = prev.headTemp + (targetHead - prev.headTemp) * (dt * 0.4);
  const blockTemp = prev.blockTemp + (targetBlock - prev.blockTemp) * (dt * 0.3);
  const coolantTemp = prev.coolantTemp + (targetCoolant - prev.coolantTemp) * (dt * 0.35);
  const oilTemp = prev.oilTemp + (targetOil - prev.oilTemp) * (dt * 0.25);
  const exhaustTemp = prev.exhaustTemp + (targetExhaust - prev.exhaustTemp) * (dt * 0.8);
  const turboTemp = prev.turboTemp + (targetTurbo - prev.turboTemp) * (dt * 0.6);

  cylinderBalance[0].tempC = Number((headTemp + 1.2).toFixed(1));
  cylinderBalance[1].tempC = Number((headTemp - 0.4).toFixed(1));
  cylinderBalance[2].tempC = Number((headTemp + (activeScenario === 'CYL_3_MISFIRE' ? -8.0 : 0.8)).toFixed(1));
  cylinderBalance[3].tempC = Number((headTemp + 1.5).toFixed(1));

  // 4. Lubrication & Tribology
  let baseOilPressurePsi = 22.0 + (normRpm / 6000) * 44.0;
  if (activeScenario === 'OIL_STARVATION') {
    baseOilPressurePsi = Math.max(9.5, 12.0 + (normRpm / 6000) * 4.0);
  }

  const thermalDegradation = Math.max(0, (oilTemp - 100) * 0.015);
  const oilViscosityCentistokes = Math.max(6.2, 14.5 - thermalDegradation);
  const bearingFrictionCoeff = activeScenario === 'OIL_STARVATION' ? 0.085 : (0.008 + (1 / oilViscosityCentistokes) * 0.04);
  const hydrodynamicFilmThicknessMicrons = activeScenario === 'OIL_STARVATION' ? 0.8 : Number((3.2 * (baseOilPressurePsi / 40)).toFixed(2));

  // 5. Mechanical Wear
  const aggressiveDrivingWearMultiplier = Math.max(1.0, (100 - driverScore) / 25);
  const currentWearPct = {
    pistonRings: Number((6.8 + (normRpm > 5000 ? 0.05 : 0.01) * aggressiveDrivingWearMultiplier).toFixed(2)),
    crankBearings: Number((4.2 + (activeScenario === 'OIL_STARVATION' ? 18.5 : 0.01)).toFixed(2)),
    valvetrain: Number((5.1 + (headTemp > 105 ? 0.08 : 0.01)).toFixed(2)),
    turboBearings: Number((7.4 + (turboTemp > 650 ? 0.12 : 0.02)).toFixed(2))
  };

  // 6. Virtual Dyno Output (Torque & Horsepower)
  const rpmPeakTorque = 3200;
  const maxTorqueNm = 360;
  const rpmDelta = Math.abs(normRpm - rpmPeakTorque);
  let availableTorque = (maxTorqueNm - Math.pow(rpmDelta / 220, 1.85)) * normThrottle;
  availableTorque = Math.max(15, availableTorque * (cyl1Efficiency + cyl2Efficiency + cyl3Efficiency + cyl4Efficiency) / 4);

  if (activeScenario === 'INTAKE_VACUUM_LEAK') availableTorque *= 0.82;
  if (activeScenario === 'TURBO_OVERBOOST' && knockDetected) availableTorque *= 0.75;

  const horsepowerHp = Math.max(5, (availableTorque * normRpm) / 7127 * 1.341);

  // 7. Diagnostics
  const scenarioObj = TWIN_FAULT_SCENARIOS[activeScenario] || TWIN_FAULT_SCENARIOS.NOMINAL;
  const activeDTCs = [...scenarioObj.dtc];
  if (coolantTemp > 108 && !activeDTCs.includes('P0217')) activeDTCs.push('P0217');
  if (baseOilPressurePsi < 15 && !activeDTCs.includes('P0524')) activeDTCs.push('P0524');

  return {
    telemetry: {
      rpm: Math.round(normRpm),
      throttlePct: Math.round(normThrottle * 100),
      horsepower: Number(horsepowerHp.toFixed(1)),
      powerKw: Number(((availableTorque * normRpm * Math.PI * 2) / 60000).toFixed(1)),
      torqueNm: Number(availableTorque.toFixed(1)),
      manifoldPressureKPa: Number(manifoldPressureKPa.toFixed(1)),
      turboBoostPsi: Number(turboBoostPsi.toFixed(1)),
      mafFlowRate: Number(mafFlowRate.toFixed(1)),
      lambda: Number(lambda.toFixed(3)),
      stftPct: Number(stftPct.toFixed(1)),
      oilPressurePsi: Number(baseOilPressurePsi.toFixed(1)),
      oilViscosityCentistokes: Number(oilViscosityCentistokes.toFixed(1)),
      bearingFilmThicknessMicrons: hydrodynamicFilmThicknessMicrons,
      bearingFrictionCoeff: Number(bearingFrictionCoeff.toFixed(4)),
      activeFiringCylinder,
      misfireDetected,
      knockDetected
    },
    thermal: {
      headTemp: Number(headTemp.toFixed(1)),
      blockTemp: Number(blockTemp.toFixed(1)),
      coolantTemp: Number(coolantTemp.toFixed(1)),
      oilTemp: Number(oilTemp.toFixed(1)),
      exhaustTemp: Number(exhaustTemp.toFixed(1)),
      turboTemp: Number(turboTemp.toFixed(1))
    },
    cylinderBalance,
    wear: currentWearPct,
    diagnostics: {
      activeScenario,
      scenarioTitle: scenarioObj.title,
      scenarioDesc: scenarioObj.description,
      activeDTCs,
      healthIndex: Math.max(20, Math.min(100, 100 - (activeDTCs.length * 18) - (coolantTemp > 100 ? 15 : 0) - (baseOilPressurePsi < 20 ? 25 : 0)))
    }
  };
}

/**
 * Pre-computes full Virtual Dyno Sweep curve parameterized by engine type
 */
export function generateDynoPowerCurve(scenario = 'NOMINAL', engineTypeId = 'i4_petrol') {
  const engineType = getEngineType(engineTypeId);
  const minRpm = engineTypeId === 'bev_pmsm' ? 500 : Math.max(800, engineType.idleRpm);
  const maxRpm = engineType.redlineRpm || 6800;
  const stepRpm = engineTypeId === 'bev_pmsm' ? 500 : 200;

  const points = [];
  for (let r = minRpm; r <= maxRpm; r += stepRpm) {
    const step = stepEngineDigitalTwin({
      rpm: r,
      throttlePct: 100,
      activeScenario: scenario,
      time: r / 1000,
      driverScore: 100,
      engineTypeId
    });
    points.push({
      rpm: r,
      torque: step.telemetry.torqueNm,
      horsepower: step.telemetry.horsepower,
      boost: step.telemetry.turboBoostPsi || 0,
      powerKw: step.telemetry.powerKw || Math.round(step.telemetry.horsepower * 0.7457)
    });
  }
  return points;
}
