/**
 * src/utils/engineModels/iceDiesel.js
 * 
 * Physics model for Common-Rail Turbo Diesel Engine (e.g., 2.0L CRDi VGT).
 * Implements:
 * - Unthrottled intake air path (torque governed strictly by fuel injection mg/stroke)
 * - Common-rail fuel injection pressure (300 to 2000 bar)
 * - Variable Geometry Turbo (VGT) vane position control
 * - Cooled Exhaust Gas Recirculation (EGR) mass fraction
 * - Diesel Particulate Filter (DPF) soot loading & active/passive thermal regeneration
 * - Selective Catalytic Reduction (SCR) AdBlue / DEF consumption
 */

import { evaluateTorqueAtRpm, computePowerKw } from '../../config/engineTypes.js';

export function stepIceDiesel(engineType, state = {}, inputs = {}, dt = 0.05) {
  const {
    rpm = engineType.idleRpm,
    throttlePct = 20, // Driver pedal torque request
    time = 0,
    driverScore = 95,
    activeScenario = 'NOMINAL'
  } = inputs;

  const normPedal = Math.max(0, Math.min(100, throttlePct)) / 100;
  const normRpm = Math.max(engineType.idleRpm * 0.8, Math.min(engineType.redlineRpm * 1.08, rpm));
  const numCylinders = engineType.cylinders || 4;

  // 1. Common-Rail Injection & Fuel Quantity
  // In diesel, fuel mg/stroke directly commands torque (no throttle restriction)
  const maxFuelMgPerStroke = 78.0; // mg/stroke at full torque
  const idleFuelMgPerStroke = 8.5;
  const commandedFuelMg = idleFuelMgPerStroke + normPedal * (maxFuelMgPerStroke - idleFuelMgPerStroke);

  // Common rail pressure rises from 350 bar (idle) to 1950 bar (high load)
  const railPressureBar = 350 + (normRpm / engineType.redlineRpm) * 600 + normPedal * 1000;

  // 2. VGT Vane Position & Boost Pressure
  // VGT vanes close down at low RPM to spin turbine rapidly, open at high RPM
  const vgtVaneClosePct = Math.max(15, Math.min(95, 85 - (normRpm / engineType.redlineRpm) * 50 + normPedal * 25));
  const turboBoostBar = Math.min(1.85, (normRpm / engineType.redlineRpm) * 0.8 + (vgtVaneClosePct / 100) * normPedal * 1.4);
  const turboBoostPsi = turboBoostBar * 14.5038;

  // 3. EGR Fraction & Lambda (Diesels run ultra lean overall, lambda 1.3 to 2.8)
  let egrValvePct = normPedal < 0.6 && normRpm < 3200 ? Math.max(0, 35 - normPedal * 40) : 0;
  if (activeScenario === 'EGR_VALVE_CLOGGED') egrValvePct = 0;

  const dieselLambda = Math.max(1.15, 2.8 - normPedal * 1.4);

  // 4. Cylinder Balance & Firing
  const firingCycle = (time * (normRpm / 60) * (numCylinders / 2)) % numCylinders;
  const activeFiringCylinder = Math.floor(firingCycle) + 1;

  const cylinderBalance = [];
  let avgEfficiency = 0;
  for (let c = 1; c <= numCylinders; c++) {
    let eff = 0.99 + (Math.random() - 0.5) * 0.02;
    let status = 'Normal';
    if (activeScenario === 'INJECTOR_CLOGGED' && c === 2) {
      eff = 0.35;
      status = 'Restricted Injector';
    }
    avgEfficiency += eff;
    cylinderBalance.push({
      id: c,
      name: `Cyl #${c}`,
      efficiency: Number((eff * 100).toFixed(1)),
      peakPressureBar: Number((80 + commandedFuelMg * 1.6 * eff).toFixed(1)), // High diesel cylinder pressure
      tempC: 0,
      status
    });
  }
  avgEfficiency /= numCylinders;

  // 5. Torque & Power
  let availableTorque = evaluateTorqueAtRpm(engineType, normRpm) * (commandedFuelMg / maxFuelMgPerStroke) * avgEfficiency;
  const horsepowerHp = Math.max(2, (availableTorque * normRpm) / 7127 * 1.341);
  const powerKw = computePowerKw(availableTorque, normRpm);

  // 6. DPF Soot Loading & Regeneration Cycle
  let currentSootPct = state.extra?.sootLoadPct ?? 42.0;
  let isRegenActive = state.extra?.isRegenActive ?? false;

  // Soot accumulates under rich/high load, burns off if EGT > 550°C
  const sootProductionRate = (normPedal > 0.7 ? 0.025 : 0.008) * (1 + (egrValvePct / 40) * 0.5);
  currentSootPct = Math.min(100, currentSootPct + sootProductionRate * dt);

  if (activeScenario === 'DPF_SOOT_SATURATION') {
    currentSootPct = Math.min(98.5, currentSootPct + 0.15);
  }

  // Auto trigger active regen if soot > 80% and vehicle is at operating temp
  if (currentSootPct > 80.0 && !isRegenActive) {
    isRegenActive = true;
  }
  if (isRegenActive) {
    currentSootPct = Math.max(8.0, currentSootPct - 0.18 * dt);
    if (currentSootPct <= 10.0) isRegenActive = false;
  }

  // 7. Thermal Network
  const prevThermal = state.thermal || {
    headTemp: engineType.thermal.nominalHeadC,
    blockTemp: engineType.thermal.nominalBlockC,
    coolantTemp: engineType.thermal.nominalCoolantC,
    oilTemp: engineType.thermal.nominalOilC,
    exhaustTemp: engineType.thermal.nominalExhaustC,
    dpfTemp: 320
  };

  const loadFactor = (normRpm / engineType.redlineRpm) * 0.6 + normPedal * 0.4;
  let targetExhaust = 280 + loadFactor * 320;
  let targetDpf = targetExhaust - 30;

  if (isRegenActive) {
    // Post-injection warms DPF to 620°C for soot burnoff
    targetDpf = 620;
    targetExhaust += 120;
  }

  const headTemp = prevThermal.headTemp + (engineType.thermal.nominalHeadC + loadFactor * 18 - prevThermal.headTemp) * (dt * 0.35);
  const blockTemp = prevThermal.blockTemp + (engineType.thermal.nominalBlockC + loadFactor * 14 - prevThermal.blockTemp) * (dt * 0.25);
  const coolantTemp = prevThermal.coolantTemp + (engineType.thermal.nominalCoolantC + loadFactor * 14 - prevThermal.coolantTemp) * (dt * 0.3);
  const oilTemp = prevThermal.oilTemp + (engineType.thermal.nominalOilC + loadFactor * 22 - prevThermal.oilTemp) * (dt * 0.2);
  const exhaustTemp = prevThermal.exhaustTemp + (targetExhaust - prevThermal.exhaustTemp) * (dt * 0.7);
  const dpfTemp = (prevThermal.dpfTemp || 320) + (targetDpf - (prevThermal.dpfTemp || 320)) * (dt * 0.5);

  cylinderBalance.forEach(cyl => {
    cyl.tempC = Number((headTemp + (Math.random() - 0.5) * 1.5).toFixed(1));
  });

  // 8. Fuel Flow Rate (Diesel has higher energy density 38,600 kJ/L and higher thermal efficiency ~35%)
  const etaTh = engineType.thermalEfficiencyPeak * (0.88 + 0.12 * normPedal);
  const fuelRateLPerHr = Math.max(0.48, (Math.max(1.2, powerKw) * 3600) / (etaTh * engineType.energyDensity));

  // DEF / AdBlue consumption (~4% of fuel rate)
  const defLevelPct = Math.max(5.0, (state.extra?.defLevelPct ?? 88.0) - (fuelRateLPerHr * 0.04 / 15.0) * (dt / 3600) * 100);

  return {
    telemetry: {
      rpm: Math.round(normRpm),
      throttlePct: Math.round(normPedal * 100),
      horsepower: Number(horsepowerHp.toFixed(1)),
      powerKw: Number(powerKw.toFixed(1)),
      torqueNm: Number(availableTorque.toFixed(1)),
      railPressureBar: Math.round(railPressureBar),
      commandedFuelMg: Number(commandedFuelMg.toFixed(1)),
      turboBoostBar: Number(turboBoostBar.toFixed(2)),
      turboBoostPsi: Number(turboBoostPsi.toFixed(1)),
      vgtVaneClosePct: Math.round(vgtVaneClosePct),
      egrValvePct: Math.round(egrValvePct),
      lambda: Number(dieselLambda.toFixed(2)),
      oilPressurePsi: Number((26.0 + (normRpm / engineType.redlineRpm) * 45.0).toFixed(1)),
      fuelRateLPerHr: Number(fuelRateLPerHr.toFixed(2)),
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
      dpfTemp: Number(dpfTemp.toFixed(1))
    },
    emissions: {
      co2GramsPerSec: Number(((fuelRateLPerHr / 3600) * engineType.co2FactorKgPerUnit * 1000).toFixed(2)),
      noxPpm: Math.round(35 + (1 - egrValvePct / 100) * 280),
      sootLoadPct: Number(currentSootPct.toFixed(1)),
      defLevelPct: Number(defLevelPct.toFixed(1)),
      isRegenActive
    },
    cylinderBalance,
    extra: {
      sootLoadPct: currentSootPct,
      isRegenActive,
      defLevelPct,
      railPressureBar
    }
  };
}
