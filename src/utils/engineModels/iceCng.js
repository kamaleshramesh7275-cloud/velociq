/**
 * src/utils/engineModels/iceCng.js
 * 
 * Physics model for Bi-Fuel CNG Engine (e.g., 1.5L Inline-4 CNG).
 * Implements:
 * - High-pressure CNG tank storage (200 bar down to 10 bar)
 * - Two-stage electronic pressure regulator (200 bar -> 2.5 bar rail)
 * - Power derate of 12-15% on CNG mode due to air displacement
 * - Automatic seamless petrol fallback when CNG pressure < 12 bar
 * - Mass-based consumption in kg/h and mileage in km/kg
 */

import { evaluateTorqueAtRpm, computePowerKw } from '../../config/engineTypes.js';

export function stepIceCng(engineType, state = {}, inputs = {}, dt = 0.05) {
  const {
    rpm = engineType.idleRpm,
    throttlePct = 20,
    time = 0,
    driverScore = 95,
    activeScenario = 'NOMINAL'
  } = inputs;

  const normThrottle = Math.max(0, Math.min(100, throttlePct)) / 100;
  const normRpm = Math.max(engineType.idleRpm * 0.8, Math.min(engineType.redlineRpm * 1.08, rpm));
  const numCylinders = engineType.cylinders || 4;

  // 1. CNG Tank Pressure & Fuel Mode
  let tankPressureBar = state.extra?.cngTankPressureBar ?? 185.0;
  let activeFuelMode = state.extra?.activeFuelMode ?? 'CNG'; // 'CNG' | 'PETROL_FALLBACK'

  if (activeScenario === 'CNG_REGULATOR_FREEZE') {
    // Regulator valve freezing reduces rail pressure
    tankPressureBar = Math.max(8.0, tankPressureBar - 2.5);
  }

  // Automatic fallback check
  if (tankPressureBar < 12.0 || activeScenario === 'CNG_LOW_PRESSURE') {
    activeFuelMode = 'PETROL_FALLBACK';
  } else {
    activeFuelMode = 'CNG';
  }

  // 2. Air & Gas Metering
  const manifoldPressureKPa = 30.0 + normThrottle * 71.3;
  const mafFlowRate = (engineType.displacementL * 1.5) + (normRpm / 1000) * 3.6 + normThrottle * 32.0;

  // 3. Cylinder Balance
  const firingCycle = (time * (normRpm / 60) * (numCylinders / 2)) % numCylinders;
  const activeFiringCylinder = Math.floor(firingCycle) + 1;

  const cylinderBalance = [];
  let avgEfficiency = 0;
  for (let c = 1; c <= numCylinders; c++) {
    let eff = 0.98 + (Math.random() - 0.5) * 0.02;
    let status = 'Normal';
    if (activeScenario === 'CNG_INJECTOR_LEAK' && c === 4) {
      eff = 0.40;
      status = 'Gas Injector Leak';
    }
    avgEfficiency += eff;
    cylinderBalance.push({
      id: c,
      name: `Cyl #${c}`,
      efficiency: Number((eff * 100).toFixed(1)),
      peakPressureBar: Number((40 + normThrottle * 52 * eff).toFixed(1)),
      tempC: 0,
      status
    });
  }
  avgEfficiency /= numCylinders;

  // 4. Torque & Power (CNG Derate 14% vs Petrol)
  let baseTorque = evaluateTorqueAtRpm(engineType, normRpm) * (0.12 + 0.88 * normThrottle) * avgEfficiency;
  if (activeFuelMode === 'PETROL_FALLBACK') {
    baseTorque *= 1.14; // Petrol restores standard output
  }
  const horsepowerHp = Math.max(2, (baseTorque * normRpm) / 7127 * 1.341);
  const powerKw = computePowerKw(baseTorque, normRpm);

  // 5. Fuel Consumption (kg/hr for CNG, L/hr for Petrol)
  // CNG energy density = 48,000 kJ/kg
  const etaTh = activeFuelMode === 'CNG' ? engineType.thermalEfficiencyPeak : 0.28;
  const energyDensity = activeFuelMode === 'CNG' ? 48000 : 34200;
  const massRateKgPerHr = Math.max(0.35, (Math.max(1.2, powerKw) * 3600) / (etaTh * energyDensity));

  // Burn from tank
  if (activeFuelMode === 'CNG') {
    tankPressureBar = Math.max(0, tankPressureBar - (massRateKgPerHr / 10.0) * (dt / 3600) * 200);
  }

  // 6. Thermal Network (CNG burns slightly hotter on exhaust valves due to dry gas)
  const prevThermal = state.thermal || {
    headTemp: engineType.thermal.nominalHeadC,
    blockTemp: engineType.thermal.nominalBlockC,
    coolantTemp: engineType.thermal.nominalCoolantC,
    oilTemp: engineType.thermal.nominalOilC,
    exhaustTemp: engineType.thermal.nominalExhaustC,
    regulatorTemp: 45
  };

  const loadFactor = (normRpm / engineType.redlineRpm) * 0.65 + normThrottle * 0.35;
  const headTemp = prevThermal.headTemp + (engineType.thermal.nominalHeadC + (activeFuelMode === 'CNG' ? 5 : 0) + loadFactor * 22 - prevThermal.headTemp) * (dt * 0.4);
  const blockTemp = prevThermal.blockTemp + (engineType.thermal.nominalBlockC + loadFactor * 16 - prevThermal.blockTemp) * (dt * 0.3);
  const coolantTemp = prevThermal.coolantTemp + (engineType.thermal.nominalCoolantC + loadFactor * 16 - prevThermal.coolantTemp) * (dt * 0.35);
  const oilTemp = prevThermal.oilTemp + (engineType.thermal.nominalOilC + loadFactor * 24 - prevThermal.oilTemp) * (dt * 0.25);
  const exhaustTemp = prevThermal.exhaustTemp + (460 + loadFactor * 320 - prevThermal.exhaustTemp) * (dt * 0.8);
  const regulatorTemp = Math.max(5, (prevThermal.regulatorTemp || 45) - (massRateKgPerHr * 2.2 * dt)); // Joule-Thomson expansion cooling

  cylinderBalance.forEach(cyl => {
    cyl.tempC = Number((headTemp + (Math.random() - 0.5) * 1.5).toFixed(1));
  });

  return {
    telemetry: {
      rpm: Math.round(normRpm),
      throttlePct: Math.round(normThrottle * 100),
      horsepower: Number(horsepowerHp.toFixed(1)),
      powerKw: Number(powerKw.toFixed(1)),
      torqueNm: Number(baseTorque.toFixed(1)),
      manifoldPressureKPa: Number(manifoldPressureKPa.toFixed(1)),
      cngTankPressureBar: Number(tankPressureBar.toFixed(1)),
      cngRegulatorPressureBar: 2.5,
      activeFuelMode,
      fuelRateKgPerHr: Number(massRateKgPerHr.toFixed(2)),
      fuelRateLPerHr: activeFuelMode === 'CNG' ? 0 : Number((massRateKgPerHr * 1.35).toFixed(2)),
      oilPressurePsi: Number((22.0 + (normRpm / engineType.redlineRpm) * 44.0).toFixed(1)),
      activeFiringCylinder,
      misfireDetected: false,
      knockDetected: false
    },
    thermal: {
      headTemp: Number(headTemp.toFixed(1)),
      blockTemp: Number(blockTemp.toFixed(1)),
      coolantTemp: Number(coolantTemp.toFixed(1)),
      oilTemp: Number(oilTemp.toFixed(1)),
      exhaustTemp: Number(exhaustTemp.toFixed(1)),
      regulatorTemp: Number(regulatorTemp.toFixed(1))
    },
    emissions: {
      co2GramsPerSec: Number(((massRateKgPerHr / 3600) * engineType.co2FactorKgPerUnit * 1000).toFixed(2)),
      noxPpm: Math.round(30 + normThrottle * 190),
      sootLoadPct: 0
    },
    cylinderBalance,
    extra: {
      cngTankPressureBar: tankPressureBar,
      activeFuelMode,
      regulatorTemp
    }
  };
}
