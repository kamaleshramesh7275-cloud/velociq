/**
 * src/utils/engineModels/icePetrol.js
 * 
 * Physics model for Naturally Aspirated Petrol Engines (I4, V6, V8, Boxer4, Single 4S).
 * Implements:
 * - Throttle body airflow metering & manifold vacuum (MAP/MAF)
 * - Firing order cylinder balance & power stroke kinematics
 * - 5-node lumped parameter thermal network (Head, Block, Coolant, Oil, Exhaust)
 * - Hydrodynamic oil film tribology and bearing friction
 * - Monotone cubic torque calculation & dyno integration
 */

import { evaluateTorqueAtRpm, computePowerKw } from '../../config/engineTypes.js';

export function stepIcePetrol(engineType, state = {}, inputs = {}, dt = 0.05) {
  const {
    rpm = engineType.idleRpm,
    throttlePct = 20,
    time = 0,
    driverScore = 95,
    activeScenario = 'NOMINAL'
  } = inputs;

  const normThrottle = Math.max(0, Math.min(100, throttlePct)) / 100;
  const normRpm = Math.max(engineType.idleRpm * 0.8, Math.min(engineType.redlineRpm * 1.1, rpm));
  const numCylinders = engineType.cylinders || 4;

  // 1. Air Induction (Naturally Aspirated)
  let manifoldPressureKPa = 30.0 + normThrottle * 71.3; // 30 kPa vacuum at idle to 101.3 kPa WOT
  let mafFlowRate = (engineType.displacementL * 1.6) + (normRpm / 1000) * (engineType.displacementL * 2.8) + normThrottle * (engineType.displacementL * 22.0); // g/s

  let lambda = 1.00;
  let stftPct = 0.0;

  if (activeScenario === 'INTAKE_VACUUM_LEAK') {
    manifoldPressureKPa = Math.min(101.3, manifoldPressureKPa + 22.0);
    mafFlowRate = Math.max(1.8, mafFlowRate - 3.5);
    lambda = 1.18;
    stftPct = 24.5;
  }

  // 2. Firing sequence & Cylinder Power Balance
  const firingCycle = (time * (normRpm / 60) * (numCylinders / 2)) % numCylinders;
  const activeFiringCylinder = Math.floor(firingCycle) + 1;

  const cylinderBalance = [];
  let avgEfficiency = 0;

  for (let c = 1; c <= numCylinders; c++) {
    let eff = 0.98 + (Math.random() - 0.5) * 0.025;
    let status = 'Normal';

    if (activeScenario === 'CYL_3_MISFIRE' && (c === 3 || numCylinders === 1)) {
      eff = 0.12 + Math.random() * 0.08;
      status = 'Misfire';
    }

    avgEfficiency += eff;
    cylinderBalance.push({
      id: c,
      name: `Cyl #${c}`,
      efficiency: Number((eff * 100).toFixed(1)),
      peakPressureBar: Number((38 + normThrottle * 58 * eff).toFixed(1)),
      tempC: 0,
      status
    });
  }
  avgEfficiency /= numCylinders;

  // 3. Torque & Power
  let availableTorque = evaluateTorqueAtRpm(engineType, normRpm) * (0.12 + 0.88 * normThrottle) * avgEfficiency;
  if (activeScenario === 'INTAKE_VACUUM_LEAK') availableTorque *= 0.84;
  const horsepowerHp = Math.max(2, (availableTorque * normRpm) / 7127 * 1.341);
  const powerKw = computePowerKw(availableTorque, normRpm);

  // 4. Thermal Network
  const prevThermal = state.thermal || {
    headTemp: engineType.thermal.nominalHeadC,
    blockTemp: engineType.thermal.nominalBlockC,
    coolantTemp: engineType.thermal.nominalCoolantC,
    oilTemp: engineType.thermal.nominalOilC,
    exhaustTemp: engineType.thermal.nominalExhaustC
  };

  const loadFactor = (normRpm / engineType.redlineRpm) * 0.65 + normThrottle * 0.35;
  let targetExhaust = 340 + loadFactor * (engineType.thermal.warningExhaustC - 340);
  let targetHead = engineType.thermal.nominalHeadC + loadFactor * 24;
  let targetBlock = engineType.thermal.nominalBlockC + loadFactor * 18;
  let targetCoolant = engineType.thermal.nominalCoolantC + loadFactor * 16;
  let targetOil = engineType.thermal.nominalOilC + loadFactor * 26;

  if (activeScenario === 'THERMOSTAT_STUCK') {
    targetCoolant += 36.0;
    targetHead += 32.0;
    targetBlock += 22.0;
    targetOil += 24.0;
  } else if (activeScenario === 'CYL_3_MISFIRE') {
    targetExhaust += 120.0;
  } else if (activeScenario === 'OIL_STARVATION') {
    targetBlock += 20.0;
    targetOil += 38.0;
  }

  const headTemp = prevThermal.headTemp + (targetHead - prevThermal.headTemp) * (dt * 0.4);
  const blockTemp = prevThermal.blockTemp + (targetBlock - prevThermal.blockTemp) * (dt * 0.3);
  const coolantTemp = prevThermal.coolantTemp + (targetCoolant - prevThermal.coolantTemp) * (dt * 0.35);
  const oilTemp = prevThermal.oilTemp + (targetOil - prevThermal.oilTemp) * (dt * 0.25);
  const exhaustTemp = prevThermal.exhaustTemp + (targetExhaust - prevThermal.exhaustTemp) * (dt * 0.8);

  cylinderBalance.forEach((cyl, idx) => {
    cyl.tempC = Number((headTemp + (idx % 2 === 0 ? 1.0 : -0.8)).toFixed(1));
  });

  // 5. Lubrication & Tribology
  let baseOilPressurePsi = 22.0 + (normRpm / engineType.redlineRpm) * 44.0;
  if (activeScenario === 'OIL_STARVATION') {
    baseOilPressurePsi = Math.max(9.5, 12.0 + (normRpm / engineType.redlineRpm) * 4.0);
  }

  const thermalDegradation = Math.max(0, (oilTemp - 100) * 0.015);
  const oilViscosityCentistokes = Math.max(6.2, 14.5 - thermalDegradation);
  const bearingFrictionCoeff = activeScenario === 'OIL_STARVATION' ? 0.085 : (0.008 + (1 / oilViscosityCentistokes) * 0.04);
  const hydrodynamicFilmThicknessMicrons = activeScenario === 'OIL_STARVATION' ? 0.8 : Number((3.2 * (baseOilPressurePsi / 40)).toFixed(2));

  // 6. Fuel Flow Rate
  // BSFC based fuel consumption: fuelRate (L/hr) = (Power (kW) * 3600) / (eta_th * energyDensity kJ/L)
  const etaTh = engineType.thermalEfficiencyPeak * (0.85 + 0.15 * normThrottle);
  const fuelRateLPerHr = Math.max(0.6, (Math.max(1.5, powerKw) * 3600) / (etaTh * engineType.energyDensity));

  return {
    telemetry: {
      rpm: Math.round(normRpm),
      throttlePct: Math.round(normThrottle * 100),
      horsepower: Number(horsepowerHp.toFixed(1)),
      powerKw: Number(powerKw.toFixed(1)),
      torqueNm: Number(availableTorque.toFixed(1)),
      manifoldPressureKPa: Number(manifoldPressureKPa.toFixed(1)),
      turboBoostPsi: 0.0,
      turboBoostBar: 0.0,
      mafFlowRate: Number(mafFlowRate.toFixed(1)),
      lambda: Number(lambda.toFixed(3)),
      stftPct: Number(stftPct.toFixed(1)),
      oilPressurePsi: Number(baseOilPressurePsi.toFixed(1)),
      oilViscosityCentistokes: Number(oilViscosityCentistokes.toFixed(1)),
      bearingFilmThicknessMicrons: hydrodynamicFilmThicknessMicrons,
      bearingFrictionCoeff: Number(bearingFrictionCoeff.toFixed(4)),
      fuelRateLPerHr: Number(fuelRateLPerHr.toFixed(2)),
      activeFiringCylinder,
      misfireDetected: activeScenario === 'CYL_3_MISFIRE',
      knockDetected: false
    },
    thermal: {
      headTemp: Number(headTemp.toFixed(1)),
      blockTemp: Number(blockTemp.toFixed(1)),
      coolantTemp: Number(coolantTemp.toFixed(1)),
      oilTemp: Number(oilTemp.toFixed(1)),
      exhaustTemp: Number(exhaustTemp.toFixed(1))
    },
    emissions: {
      co2GramsPerSec: Number(((fuelRateLPerHr / 3600) * engineType.co2FactorKgPerUnit * 1000).toFixed(2)),
      noxPpm: Math.round(45 + normThrottle * 320 * (headTemp / 90)),
      sootLoadPct: 0
    },
    cylinderBalance,
    extra: {
      oilLevelPct: activeScenario === 'OIL_STARVATION' ? 22 : 94
    }
  };
}
