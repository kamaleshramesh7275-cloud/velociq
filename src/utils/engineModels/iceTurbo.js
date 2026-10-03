/**
 * src/utils/engineModels/iceTurbo.js
 * 
 * Physics model for Turbocharged Downsized Petrol Engines (e.g., I3 Turbo 1.0L).
 * Implements:
 * - Turbocharger compressor & turbine spool lag (first-order low-pass response)
 * - Wastegate actuator duty cycle & overboost limiter
 * - Manifold positive pressure boost (up to 18-22 PSI)
 * - Knock threshold under elevated intake charge temperatures
 * - 6-node thermal network including Turbo Turbine housing
 */

import { evaluateTorqueAtRpm, computePowerKw } from '../../config/engineTypes.js';

export function stepIceTurbo(engineType, state = {}, inputs = {}, dt = 0.05) {
  const {
    rpm = engineType.idleRpm,
    throttlePct = 20,
    time = 0,
    driverScore = 95,
    activeScenario = 'NOMINAL'
  } = inputs;

  const normThrottle = Math.max(0, Math.min(100, throttlePct)) / 100;
  const normRpm = Math.max(engineType.idleRpm * 0.8, Math.min(engineType.redlineRpm * 1.1, rpm));
  const numCylinders = engineType.cylinders || 3;

  // 1. Turbo Boost Spool Dynamics (First-Order Lag)
  const prevBoostPsi = state.extra?.turboBoostPsi || 0.0;
  let targetBoostPsi = 0.0;

  if (normRpm > 1600 && normThrottle > 0.20) {
    // Target boost based on exhaust gas energy flow
    const exhaustMassFlow = (normRpm / 6000) * normThrottle;
    targetBoostPsi = Math.min(18.5, exhaustMassFlow * 21.0);

    if (activeScenario === 'TURBO_OVERBOOST') {
      targetBoostPsi = Math.min(28.0, targetBoostPsi * 1.65); // Wastegate jam
    }
  }

  // Spool lag tau: ~0.4s to spool up, ~0.15s to dump boost via blow-off valve
  const tau = targetBoostPsi > prevBoostPsi ? 0.38 : 0.15;
  const turboBoostPsi = prevBoostPsi + (targetBoostPsi - prevBoostPsi) * (dt / (tau + dt));
  const turboBoostBar = turboBoostPsi * 0.0689476;

  // Wastegate duty cycle %
  const wastegateDutyPct = targetBoostPsi > 2.0 
    ? Math.min(100, Math.max(0, 100 - (turboBoostPsi / 18.5) * 80))
    : 0;

  // Manifold absolute pressure (kPa)
  let manifoldPressureKPa = (32.0 + normThrottle * 69.3) + (turboBoostPsi * 6.894);
  let mafFlowRate = (engineType.displacementL * 2.2) + (normRpm / 1000) * 3.8 + normThrottle * 42.0 + (turboBoostPsi * 2.8);

  let knockDetected = false;
  if (activeScenario === 'TURBO_OVERBOOST' && turboBoostPsi > 22.0 && normThrottle > 0.6) {
    knockDetected = true;
  }

  // 2. Cylinder Balance
  const firingCycle = (time * (normRpm / 60) * (numCylinders / 2)) % numCylinders;
  const activeFiringCylinder = Math.floor(firingCycle) + 1;

  const cylinderBalance = [];
  let avgEfficiency = 0;

  for (let c = 1; c <= numCylinders; c++) {
    let eff = 0.98 + (Math.random() - 0.5) * 0.025;
    let status = 'Normal';

    if (activeScenario === 'CYL_3_MISFIRE' && c === 3) {
      eff = 0.10 + Math.random() * 0.08;
      status = 'Misfire';
    }

    avgEfficiency += eff;
    cylinderBalance.push({
      id: c,
      name: `Cyl #${c}`,
      efficiency: Number((eff * 100).toFixed(1)),
      peakPressureBar: Number((45 + normThrottle * 65 * eff + turboBoostBar * 20).toFixed(1)),
      tempC: 0,
      status
    });
  }
  avgEfficiency /= numCylinders;

  // 3. Torque & Power
  let availableTorque = evaluateTorqueAtRpm(engineType, normRpm) * (0.15 + 0.85 * normThrottle) * avgEfficiency;
  // Boost enhancement vs knock retard
  if (turboBoostPsi > 1.0) availableTorque *= (1 + (turboBoostPsi / 28) * 0.35);
  if (knockDetected) availableTorque *= 0.74; // Retard timing

  const horsepowerHp = Math.max(2, (availableTorque * normRpm) / 7127 * 1.341);
  const powerKw = computePowerKw(availableTorque, normRpm);

  // 4. Thermal Network
  const prevThermal = state.thermal || {
    headTemp: engineType.thermal.nominalHeadC,
    blockTemp: engineType.thermal.nominalBlockC,
    coolantTemp: engineType.thermal.nominalCoolantC,
    oilTemp: engineType.thermal.nominalOilC,
    exhaustTemp: engineType.thermal.nominalExhaustC,
    turboTemp: engineType.thermal.nominalTurboC || 520
  };

  const loadFactor = (normRpm / engineType.redlineRpm) * 0.6 + normThrottle * 0.4;
  let targetExhaust = 420 + loadFactor * 450;
  let targetTurbo = 380 + loadFactor * 520;
  let targetHead = engineType.thermal.nominalHeadC + loadFactor * 22;
  let targetBlock = engineType.thermal.nominalBlockC + loadFactor * 16;
  let targetCoolant = engineType.thermal.nominalCoolantC + loadFactor * 16;
  let targetOil = engineType.thermal.nominalOilC + loadFactor * 28;

  if (activeScenario === 'TURBO_OVERBOOST') {
    targetTurbo += 140.0;
    targetExhaust += 110.0;
  } else if (activeScenario === 'THERMOSTAT_STUCK') {
    targetCoolant += 36.0;
    targetHead += 30.0;
  }

  const headTemp = prevThermal.headTemp + (targetHead - prevThermal.headTemp) * (dt * 0.4);
  const blockTemp = prevThermal.blockTemp + (targetBlock - prevThermal.blockTemp) * (dt * 0.3);
  const coolantTemp = prevThermal.coolantTemp + (targetCoolant - prevThermal.coolantTemp) * (dt * 0.35);
  const oilTemp = prevThermal.oilTemp + (targetOil - prevThermal.oilTemp) * (dt * 0.25);
  const exhaustTemp = prevThermal.exhaustTemp + (targetExhaust - prevThermal.exhaustTemp) * (dt * 0.8);
  const turboTemp = (prevThermal.turboTemp || 500) + (targetTurbo - (prevThermal.turboTemp || 500)) * (dt * 0.6);

  cylinderBalance.forEach((cyl) => {
    cyl.tempC = Number((headTemp + (Math.random() - 0.5) * 2).toFixed(1));
  });

  // 5. Lubrication & Tribology
  let baseOilPressurePsi = 24.0 + (normRpm / engineType.redlineRpm) * 46.0;
  if (activeScenario === 'OIL_STARVATION') baseOilPressurePsi = 11.0;

  // 6. Fuel Flow Rate
  const etaTh = engineType.thermalEfficiencyPeak * (0.86 + 0.14 * normThrottle);
  const fuelRateLPerHr = Math.max(0.55, (Math.max(1.5, powerKw) * 3600) / (etaTh * engineType.energyDensity));

  return {
    telemetry: {
      rpm: Math.round(normRpm),
      throttlePct: Math.round(normThrottle * 100),
      horsepower: Number(horsepowerHp.toFixed(1)),
      powerKw: Number(powerKw.toFixed(1)),
      torqueNm: Number(availableTorque.toFixed(1)),
      manifoldPressureKPa: Number(manifoldPressureKPa.toFixed(1)),
      turboBoostPsi: Number(turboBoostPsi.toFixed(1)),
      turboBoostBar: Number(turboBoostBar.toFixed(2)),
      wastegateDutyPct: Math.round(wastegateDutyPct),
      mafFlowRate: Number(mafFlowRate.toFixed(1)),
      lambda: Number((1.00 - (turboBoostPsi > 10 ? 0.06 : 0)).toFixed(3)),
      stftPct: Number((knockDetected ? -8.0 : 0.0).toFixed(1)),
      oilPressurePsi: Number(baseOilPressurePsi.toFixed(1)),
      fuelRateLPerHr: Number(fuelRateLPerHr.toFixed(2)),
      activeFiringCylinder,
      misfireDetected: activeScenario === 'CYL_3_MISFIRE',
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
    emissions: {
      co2GramsPerSec: Number(((fuelRateLPerHr / 3600) * engineType.co2FactorKgPerUnit * 1000).toFixed(2)),
      noxPpm: Math.round(60 + normThrottle * 380 + (turboBoostPsi * 8)),
      sootLoadPct: 0
    },
    cylinderBalance,
    extra: {
      turboBoostPsi,
      wastegateDutyPct
    }
  };
}
