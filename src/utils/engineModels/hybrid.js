/**
 * src/utils/engineModels/hybrid.js
 * 
 * Physics model for Atkinson Full Hybrid Powertrain (e.g., 1.8L Atkinson + 53 kW PMSM).
 * Implements:
 * - Atkinson cycle late intake valve closing (high expansion ratio, 36% peak efficiency)
 * - Energy Management Strategy (EMS) state machine:
 *     EV_DRIVE | ENGINE_CHARGE | PARALLEL_BOOST | REGEN_BRAKING | ENGINE_COAST
 * - 1.3 kWh Traction Battery pack with SOC bounds [30%, 80%] (target 55%)
 * - Dual power sources: ICE torque + Instant Electric Motor torque
 * - Regenerative braking recovery capturing kinetic energy
 */

import { evaluateTorqueAtRpm, computePowerKw } from '../../config/engineTypes.js';

export function stepHybrid(engineType, state = {}, inputs = {}, dt = 0.05) {
  const {
    rpm = 0,
    throttlePct = 20,
    time = 0,
    driverScore = 95,
    activeScenario = 'NOMINAL',
    isBraking = false
  } = inputs;

  const normPedal = Math.max(0, Math.min(100, throttlePct)) / 100;
  let batterySocPct = state.extra?.batterySocPct ?? 58.0;

  // 1. Energy Management Strategy (EMS) Mode Selection
  let hybridMode = 'EV_DRIVE';
  let iceRpm = 0;
  let iceTorqueNm = 0;
  let motorTorqueNm = 0;
  let motorPowerKw = 0;
  let icePowerKw = 0;

  if (isBraking) {
    hybridMode = 'REGEN_BRAKING';
    // Regenerative braking recovers energy into battery
    motorTorqueNm = -60.0 * normPedal;
    motorPowerKw = -18.0 * normPedal;
    batterySocPct = Math.min(80.0, batterySocPct + 0.12 * dt);
    iceRpm = 0;
  } else if (normPedal < 0.22 && batterySocPct > 35.0 && activeScenario !== 'HYBRID_BATTERY_FAULT') {
    // Pure EV Launch / Creep: Engine OFF
    hybridMode = 'EV_DRIVE';
    iceRpm = 0;
    motorTorqueNm = normPedal * 180;
    motorPowerKw = (motorTorqueNm * Math.max(500, rpm) * 2 * Math.PI) / 60000;
    batterySocPct = Math.max(30.0, batterySocPct - 0.08 * dt);
  } else if (batterySocPct < 40.0 || (normPedal > 0.22 && normPedal < 0.65)) {
    // Engine in BSFC sweet-spot (~1800-2400 RPM), driving wheels + charging pack
    hybridMode = 'ENGINE_CHARGE';
    iceRpm = Math.max(1400, Math.min(3200, 1400 + normPedal * 2200));
    iceTorqueNm = evaluateTorqueAtRpm(engineType, iceRpm) * (0.3 + normPedal * 0.7);
    icePowerKw = computePowerKw(iceTorqueNm, iceRpm);
    // Motor acts as generator
    motorTorqueNm = -25.0;
    motorPowerKw = -6.5;
    batterySocPct = Math.min(80.0, batterySocPct + 0.06 * dt);
  } else {
    // Full Boost Assist: ICE + Motor combined
    hybridMode = 'PARALLEL_BOOST';
    iceRpm = Math.max(1800, Math.min(engineType.redlineRpm, 1800 + normPedal * 3200));
    iceTorqueNm = evaluateTorqueAtRpm(engineType, iceRpm) * normPedal;
    motorTorqueNm = 120.0 * normPedal;
    icePowerKw = computePowerKw(iceTorqueNm, iceRpm);
    motorPowerKw = 35.0 * normPedal;
    batterySocPct = Math.max(30.0, batterySocPct - 0.15 * dt);
  }

  if (activeScenario === 'HYBRID_INVERTER_OVERHEAT') {
    motorTorqueNm *= 0.4;
    motorPowerKw *= 0.4;
  }

  const combinedTorqueNm = Math.max(0, iceTorqueNm + motorTorqueNm);
  const combinedPowerKw = Math.max(0, icePowerKw + motorPowerKw);
  const combinedHorsepower = combinedPowerKw * 1.341;

  // 2. Cylinder Balance (Only when ICE is running)
  const isIceRunning = iceRpm > 400;
  const numCylinders = engineType.cylinders || 4;
  const cylinderBalance = [];

  for (let c = 1; c <= numCylinders; c++) {
    cylinderBalance.push({
      id: c,
      name: `Cyl #${c}`,
      efficiency: isIceRunning ? 99.2 : 0,
      peakPressureBar: isIceRunning ? Number((42 + normPedal * 35).toFixed(1)) : 0,
      tempC: isIceRunning ? 84 : 45,
      status: isIceRunning ? 'Normal' : 'Engine Inactive (EV Mode)'
    });
  }

  // 3. Thermal Network (Includes SiC Inverter & Hybrid Battery)
  const prevThermal = state.thermal || {
    headTemp: 75,
    blockTemp: 72,
    coolantTemp: 75,
    oilTemp: 76,
    exhaustTemp: 320,
    inverterTemp: engineType.thermal.nominalInverterC || 55,
    batteryTemp: engineType.thermal.nominalBatteryC || 32
  };

  const iceLoad = isIceRunning ? (iceRpm / engineType.redlineRpm) * 0.7 + normPedal * 0.3 : 0;
  const targetCoolant = isIceRunning ? 84 + iceLoad * 14 : Math.max(45, prevThermal.coolantTemp - 0.2 * dt);
  const targetHead = isIceRunning ? 88 + iceLoad * 18 : Math.max(45, prevThermal.headTemp - 0.3 * dt);
  let targetInverter = 45 + (Math.abs(motorPowerKw) / 45) * 35;
  let targetBattery = 28 + (Math.abs(motorPowerKw) / 45) * 14;

  if (activeScenario === 'HYBRID_INVERTER_OVERHEAT') {
    targetInverter = 94.0;
  }

  const coolantTemp = prevThermal.coolantTemp + (targetCoolant - prevThermal.coolantTemp) * (dt * 0.2);
  const headTemp = prevThermal.headTemp + (targetHead - prevThermal.headTemp) * (dt * 0.25);
  const blockTemp = prevThermal.blockTemp + (targetCoolant - prevThermal.blockTemp) * (dt * 0.2);
  const oilTemp = prevThermal.oilTemp + (targetCoolant + 4 - prevThermal.oilTemp) * (dt * 0.15);
  const exhaustTemp = isIceRunning ? prevThermal.exhaustTemp + (380 + iceLoad * 280 - prevThermal.exhaustTemp) * (dt * 0.6) : Math.max(90, prevThermal.exhaustTemp - 1.2 * dt);
  const inverterTemp = prevThermal.inverterTemp + (targetInverter - prevThermal.inverterTemp) * (dt * 0.4);
  const batteryTemp = prevThermal.batteryTemp + (targetBattery - prevThermal.batteryTemp) * (dt * 0.1);

  // 4. Fuel Flow Rate (Atkinson engine 36% thermal efficiency)
  const etaTh = engineType.thermalEfficiencyPeak;
  const fuelRateLPerHr = isIceRunning ? Math.max(0.4, (icePowerKw * 3600) / (etaTh * engineType.energyDensity)) : 0.0;

  return {
    telemetry: {
      rpm: Math.round(isIceRunning ? iceRpm : 0),
      iceRpm: Math.round(iceRpm),
      throttlePct: Math.round(normPedal * 100),
      horsepower: Number(combinedHorsepower.toFixed(1)),
      powerKw: Number(combinedPowerKw.toFixed(1)),
      icePowerKw: Number(icePowerKw.toFixed(1)),
      motorPowerKw: Number(motorPowerKw.toFixed(1)),
      torqueNm: Number(combinedTorqueNm.toFixed(1)),
      iceTorqueNm: Number(iceTorqueNm.toFixed(1)),
      motorTorqueNm: Number(motorTorqueNm.toFixed(1)),
      hybridMode,
      batterySocPct: Number(batterySocPct.toFixed(1)),
      fuelRateLPerHr: Number(fuelRateLPerHr.toFixed(2)),
      oilPressurePsi: isIceRunning ? Number((24.0 + (iceRpm / 5200) * 38.0).toFixed(1)) : 0.0,
      activeFiringCylinder: isIceRunning ? Math.floor((time * (iceRpm / 60) * 2) % 4) + 1 : 0,
      misfireDetected: false,
      knockDetected: false
    },
    thermal: {
      headTemp: Number(headTemp.toFixed(1)),
      blockTemp: Number(blockTemp.toFixed(1)),
      coolantTemp: Number(coolantTemp.toFixed(1)),
      oilTemp: Number(oilTemp.toFixed(1)),
      exhaustTemp: Number(exhaustTemp.toFixed(1)),
      inverterTemp: Number(inverterTemp.toFixed(1)),
      batteryTemp: Number(batteryTemp.toFixed(1))
    },
    emissions: {
      co2GramsPerSec: Number(((fuelRateLPerHr / 3600) * engineType.co2FactorKgPerUnit * 1000).toFixed(2)),
      noxPpm: isIceRunning ? Math.round(25 + normPedal * 140) : 0,
      sootLoadPct: 0
    },
    cylinderBalance,
    extra: {
      batterySocPct,
      hybridMode,
      motorPowerKw,
      inverterTemp,
      batteryTemp
    }
  };
}
