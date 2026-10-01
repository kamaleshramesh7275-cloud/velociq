/**
 * engineTwinPhysics.js
 * 
 * Multi-Physics Cyber-Physical Simulation Engine for the Automotive Engine Digital Twin.
 * Computes:
 * 1. 4-Cylinder Combustion & Power Balance (Cyl 1, 2, 3, 4 firing sequence)
 * 2. Lumped-Parameter Thermal Network (Head, Block, Oil, Coolant, Exhaust/Turbo)
 * 3. Lubrication & Tribology (Oil Pressure, Viscosity, Bearing Friction)
 * 4. Air Induction & Turbo Boost Dynamics (MAP, MAF, Lambda)
 * 5. Mechanical Wear & Remaining Lifespan
 * 6. Virtual Dyno Performance Curves (Torque & Horsepower)
 */

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
 * Multi-physics simulation step
 */
export function stepEngineDigitalTwin({
  rpm = 1200,
  throttlePct = 20,
  activeScenario = 'NOMINAL',
  time = 0,
  driverScore = 95,
  prevThermalState = null,
  isDynoRunning = false
}) {
  const normThrottle = Math.max(0, Math.min(100, throttlePct)) / 100;
  const normRpm = Math.max(700, Math.min(7200, rpm));
  const dt = 0.05; // 50ms timestep

  // 1. Combustion & 4-Cylinder Power Balance
  // Firing order: 1 - 3 - 4 - 2
  const firingCycle = (time * (normRpm / 60) * 2) % 4; // Current cylinder firing
  const activeFiringCylinder = Math.floor(firingCycle) + 1;

  let cyl1Efficiency = 0.98 + (Math.random() - 0.5) * 0.03;
  let cyl2Efficiency = 0.99 + (Math.random() - 0.5) * 0.03;
  let cyl3Efficiency = 0.97 + (Math.random() - 0.5) * 0.03;
  let cyl4Efficiency = 0.98 + (Math.random() - 0.5) * 0.03;

  let misfireDetected = false;
  let knockDetected = false;

  if (activeScenario === 'CYL_3_MISFIRE') {
    cyl3Efficiency = 0.12 + (Math.random() * 0.08); // Severe loss of power
    misfireDetected = true;
  } else if (activeScenario === 'TURBO_OVERBOOST') {
    knockDetected = normThrottle > 0.6; // Detonation under excessive boost
  }

  const cylinderBalance = [
    { id: 1, name: 'Cyl #1', efficiency: Number((cyl1Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl1Efficiency).toFixed(1)), tempC: 0, status: 'Normal' },
    { id: 2, name: 'Cyl #2', efficiency: Number((cyl2Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl2Efficiency).toFixed(1)), tempC: 0, status: 'Normal' },
    { id: 3, name: 'Cyl #3', efficiency: Number((cyl3Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl3Efficiency).toFixed(1)), tempC: 0, status: activeScenario === 'CYL_3_MISFIRE' ? 'Misfire' : 'Normal' },
    { id: 4, name: 'Cyl #4', efficiency: Number((cyl4Efficiency * 100).toFixed(1)), peakPressureBar: Number((45 + normThrottle * 55 * cyl4Efficiency).toFixed(1)), tempC: 0, status: 'Normal' }
  ];

  // 2. Air Path & Turbo Boost Induction
  let manifoldPressureKPa = 32.0 + (normThrottle * 70.0); // 32 kPa idle vacuum to 102 kPa N/A WOT
  let turboBoostPsi = 0.0;
  let mafFlowRate = 3.2 + (normRpm / 1000) * 4.5 + normThrottle * 50.0; // g/s

  if (normRpm > 1800 && normThrottle > 0.25) {
    // Turbo spool dynamics
    turboBoostPsi = Math.min(16.5, (normRpm / 6000) * 16.0 * normThrottle * 1.3);
    if (activeScenario === 'TURBO_OVERBOOST') {
      turboBoostPsi = Math.min(27.5, turboBoostPsi * 1.75); // Overboost runaway
    }
    manifoldPressureKPa += (turboBoostPsi * 6.894);
  }

  let lambda = 1.00;
  let stftPct = 0.0;
  if (activeScenario === 'INTAKE_VACUUM_LEAK') {
    manifoldPressureKPa = Math.min(101.3, manifoldPressureKPa + 22.0); // Vacuum collapse
    mafFlowRate = Math.max(2.0, mafFlowRate - 3.5); // Air enters unmetered
    lambda = 1.18; // Lean
    stftPct = 24.5; // Max positive fuel trim
  }

  // 3. Thermal Network (Differential State Equations)
  const prev = prevThermalState || {
    headTemp: 92.0,
    blockTemp: 88.0,
    coolantTemp: 86.0,
    oilTemp: 91.0,
    exhaustTemp: 420.0,
    turboTemp: 380.0
  };

  // Heat generation targets based on engine load
  const loadFactor = (normRpm / 6000) * 0.6 + normThrottle * 0.4;
  let targetExhaust = 340 + loadFactor * 460;
  let targetHead = 88 + loadFactor * 26;
  let targetBlock = 84 + loadFactor * 20;
  let targetCoolant = 84 + loadFactor * 16;
  let targetOil = 86 + loadFactor * 28;
  let targetTurbo = 300 + loadFactor * 380;

  if (activeScenario === 'THERMOSTAT_STUCK') {
    targetCoolant += 35.0; // Thermostat fails to open radiator flow
    targetHead += 32.0;
    targetBlock += 24.0;
    targetOil += 22.0;
  } else if (activeScenario === 'CYL_3_MISFIRE') {
    targetExhaust += 110.0; // Unburnt fuel burns inside catalytic converter/exhaust!
    targetTurbo += 90.0;
  } else if (activeScenario === 'OIL_STARVATION') {
    targetBlock += 18.0; // Severe friction heat
    targetOil += 35.0;
  }

  // Smooth thermal lag integration (engines have high thermal inertia)
  const headTemp = prev.headTemp + (targetHead - prev.headTemp) * (dt * 0.4);
  const blockTemp = prev.blockTemp + (targetBlock - prev.blockTemp) * (dt * 0.3);
  const coolantTemp = prev.coolantTemp + (targetCoolant - prev.coolantTemp) * (dt * 0.35);
  const oilTemp = prev.oilTemp + (targetOil - prev.oilTemp) * (dt * 0.25);
  const exhaustTemp = prev.exhaustTemp + (targetExhaust - prev.exhaustTemp) * (dt * 0.8);
  const turboTemp = prev.turboTemp + (targetTurbo - prev.turboTemp) * (dt * 0.6);

  // Update cylinder temps based on head temp
  cylinderBalance[0].tempC = Number((headTemp + 1.2).toFixed(1));
  cylinderBalance[1].tempC = Number((headTemp - 0.4).toFixed(1));
  cylinderBalance[2].tempC = Number((headTemp + (activeScenario === 'CYL_3_MISFIRE' ? -8.0 : 0.8)).toFixed(1));
  cylinderBalance[3].tempC = Number((headTemp + 1.5).toFixed(1));

  // 4. Lubrication & Tribology
  let baseOilPressurePsi = 22.0 + (normRpm / 6000) * 44.0; // 22 psi idle to 66 psi high rpm
  if (activeScenario === 'OIL_STARVATION') {
    baseOilPressurePsi = Math.max(9.5, 12.0 + (normRpm / 6000) * 4.0); // Severe pressure collapse
  }

  // Oil Viscosity & Bearing Friction Film
  const thermalDegradation = Math.max(0, (oilTemp - 100) * 0.015);
  const oilViscosityCentistokes = Math.max(6.2, 14.5 - thermalDegradation);
  const bearingFrictionCoeff = activeScenario === 'OIL_STARVATION' ? 0.085 : (0.008 + (1 / oilViscosityCentistokes) * 0.04);
  const hydrodynamicFilmThicknessMicrons = activeScenario === 'OIL_STARVATION' ? 0.8 : Number((3.2 * (baseOilPressurePsi / 40)).toFixed(2));

  // 5. Mechanical Wear & Life Expectancy
  const aggressiveDrivingWearMultiplier = Math.max(1.0, (100 - driverScore) / 25);
  const baseLifespanHours = 4500;
  const currentWearPct = {
    pistonRings: Number((6.8 + (normRpm > 5000 ? 0.05 : 0.01) * aggressiveDrivingWearMultiplier).toFixed(2)),
    crankBearings: Number((4.2 + (activeScenario === 'OIL_STARVATION' ? 18.5 : 0.01)).toFixed(2)),
    valvetrain: Number((5.1 + (headTemp > 105 ? 0.08 : 0.01)).toFixed(2)),
    turboBearings: Number((7.4 + (turboTemp > 650 ? 0.12 : 0.02)).toFixed(2))
  };

  // 6. Virtual Dyno Output (Torque & Horsepower)
  // 2.0L Turbocharged Inline-4 profile
  const rpmPeakTorque = 3200;
  const maxTorqueNm = 360;
  const rpmDelta = Math.abs(normRpm - rpmPeakTorque);
  let availableTorque = (maxTorqueNm - Math.pow(rpmDelta / 220, 1.85)) * normThrottle;
  availableTorque = Math.max(15, availableTorque * (cyl1Efficiency + cyl2Efficiency + cyl3Efficiency + cyl4Efficiency) / 4);

  if (activeScenario === 'INTAKE_VACUUM_LEAK') availableTorque *= 0.82;
  if (activeScenario === 'TURBO_OVERBOOST' && knockDetected) availableTorque *= 0.75; // Knock retard

  const horsepowerHp = Math.max(5, (availableTorque * normRpm) / 7127 * 1.341);

  // 7. Active Trouble Codes & Diagnostics
  const scenarioObj = TWIN_FAULT_SCENARIOS[activeScenario] || TWIN_FAULT_SCENARIOS.NOMINAL;
  const activeDTCs = [...scenarioObj.dtc];
  if (coolantTemp > 108 && !activeDTCs.includes('P0217')) activeDTCs.push('P0217');
  if (baseOilPressurePsi < 15 && !activeDTCs.includes('P0524')) activeDTCs.push('P0524');

  return {
    telemetry: {
      rpm: Math.round(normRpm),
      throttlePct: Math.round(normThrottle * 100),
      horsepower: Number(horsepowerHp.toFixed(1)),
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
 * Pre-computes full Virtual Dyno Sweep curve (1000 RPM to 6800 RPM)
 */
export function generateDynoPowerCurve(scenario = 'NOMINAL') {
  const points = [];
  for (let r = 1000; r <= 6800; r += 200) {
    const step = stepEngineDigitalTwin({
      rpm: r,
      throttlePct: 100, // WOT
      activeScenario: scenario,
      time: r / 1000,
      driverScore: 100
    });
    points.push({
      rpm: r,
      torque: step.telemetry.torqueNm,
      horsepower: step.telemetry.horsepower,
      boost: step.telemetry.turboBoostPsi
    });
  }
  return points;
}
