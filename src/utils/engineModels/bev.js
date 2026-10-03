/**
 * src/utils/engineModels/bev.js
 * 
 * Physics model for Battery-Electric Vehicle (BEV) with Permanent Magnet Synchronous Motor (PMSM).
 * Implements:
 * - Direct electro-mechanical power conversion with SiC inverter
 * - Motor speed range 0 to 14,000 RPM (single-speed reduction gear ~9.5:1)
 * - Peak torque flat from 0 to 4500 RPM (310 Nm), then constant power region (150 kW)
 * - Battery pack state-of-charge (SOC), pack terminal voltage, and high-voltage DC Amps
 * - Drivetrain battery-to-wheel efficiency (88%) and regen capture factor (60%)
 * - Zero tailpipe CO2, with configurable grid well-to-wheel tracking
 */

import { evaluateTorqueAtRpm } from '../../config/engineTypes.js';

export function stepBev(engineType, state = {}, inputs = {}, dt = 0.05) {
  const {
    rpm = 0,
    throttlePct = 20,
    time = 0,
    driverScore = 95,
    activeScenario = 'NOMINAL',
    isBraking = false
  } = inputs;

  const normPedal = Math.max(0, Math.min(100, throttlePct)) / 100;
  const motorRpm = Math.max(0, Math.min(engineType.redlineRpm || 14000, rpm));
  let batterySocPct = state.extra?.batterySocPct ?? 82.5;

  // 1. Motor Torque & Electrical Power
  let motorTorqueNm = 0;
  let electricalPowerKw = 0;
  let isRegenerating = false;

  if (isBraking) {
    // Regenerative braking recovers energy into the 60 kWh pack (up to 60 kW regen peak)
    isRegenerating = true;
    const maxRegenTorque = 140.0;
    motorTorqueNm = -Math.min(maxRegenTorque, normPedal * maxRegenTorque);
    // Mechanical power recovered from wheels (kW)
    const mechPowerKw = (motorTorqueNm * motorRpm * 2 * Math.PI) / 60000;
    // 60% of braking kinetic energy recovered into battery
    electricalPowerKw = mechPowerKw * 0.60; // Negative power (charging)
  } else {
    // Drive Mode: Torque evaluated across flat-torque / constant-power curve
    const maxAvailableTorque = evaluateTorqueAtRpm(engineType, motorRpm);
    motorTorqueNm = maxAvailableTorque * normPedal;

    if (activeScenario === 'MOTOR_INSULATION_BREAKDOWN') {
      motorTorqueNm *= 0.55;
    } else if (activeScenario === 'BATTERY_CELL_IMBALANCE') {
      motorTorqueNm *= 0.70; // Power derate
    }

    const mechPowerKw = (motorTorqueNm * motorRpm * 2 * Math.PI) / 60000;
    // Battery-to-wheel efficiency ~88%
    const etaDrivetrain = engineType.thermalEfficiencyPeak || 0.88;
    electricalPowerKw = mechPowerKw > 0 ? (mechPowerKw / etaDrivetrain) : 0.4; // 400W aux baseline
  }

  // 2. Battery State of Charge (SOC) Integration
  // Energy consumed: delta_kWh = (Power (kW) * dt (s)) / 3600
  const packCapacityKwh = engineType.batteryCapacityKwh || 60;
  const energyKwhDelta = (electricalPowerKw * dt) / 3600;
  batterySocPct = Math.max(0, Math.min(100, batterySocPct - (energyKwhDelta / packCapacityKwh) * 100));

  // High-Voltage Electrical Parameters
  const nominalVoltage = engineType.batteryVoltageNominal || 360;
  const openCircuitVoltage = nominalVoltage * (0.85 + (batterySocPct / 100) * 0.25); // 306V empty to 396V full
  const packCurrentAmps = openCircuitVoltage > 0 ? (electricalPowerKw * 1000) / openCircuitVoltage : 0;

  const mechanicalHp = Math.max(0, (Math.abs(motorTorqueNm) * motorRpm) / 7127 * 1.341);
  const mechanicalKw = (Math.abs(motorTorqueNm) * motorRpm * 2 * Math.PI) / 60000;

  // 3. Thermal Network for EV Powertrain (Stator, Rotor, SiC Inverter, Battery Pack, Reduction Gear)
  const prevThermal = state.thermal || {
    headTemp: 35,
    blockTemp: 35,
    coolantTemp: engineType.thermal.nominalCoolantC || 38,
    oilTemp: engineType.thermal.nominalOilC || 50,
    exhaustTemp: 30, // Virtual tailpipe
    motorStatorTemp: engineType.thermal.nominalMotorStatorC || 65,
    inverterTemp: engineType.thermal.nominalInverterC || 50,
    batteryTemp: engineType.thermal.nominalBatteryC || 28
  };

  const loadRatio = Math.abs(electricalPowerKw) / (engineType.peakPowerKw || 150);
  let targetStator = 45 + loadRatio * 75;
  let targetInverter = 40 + loadRatio * 55;
  let targetBattery = 25 + loadRatio * 22;
  const targetCoolant = 32 + loadRatio * 20;

  if (activeScenario === 'MOTOR_INSULATION_BREAKDOWN') {
    targetStator += 50;
  } else if (activeScenario === 'INVERTER_GATE_DRIVER_FAULT') {
    targetInverter += 45;
  }

  const statorTemp = (prevThermal.motorStatorTemp || 65) + (targetStator - (prevThermal.motorStatorTemp || 65)) * (dt * 0.3);
  const inverterTemp = (prevThermal.inverterTemp || 50) + (targetInverter - (prevThermal.inverterTemp || 50)) * (dt * 0.4);
  const batteryTemp = (prevThermal.batteryTemp || 28) + (targetBattery - (prevThermal.batteryTemp || 28)) * (dt * 0.1);
  const coolantTemp = (prevThermal.coolantTemp || 38) + (targetCoolant - (prevThermal.coolantTemp || 38)) * (dt * 0.2);
  const oilTemp = (prevThermal.oilTemp || 50) + (45 + (motorRpm / 14000) * 35 - (prevThermal.oilTemp || 50)) * (dt * 0.2);

  // 4. Efficiency & Energy Metrics
  // Wh/km and km/kWh
  const vehicleSpeedKmh = Math.max(1, motorRpm / 125); // ~112 km/h at 14,000 RPM with reduction
  const whPerKm = vehicleSpeedKmh > 5 ? Math.max(60, (electricalPowerKw * 1000) / vehicleSpeedKmh) : 0;
  const kmPerKwh = whPerKm > 0 ? (1000 / whPerKm) : 6.8;

  // Virtual cylinder balance: for BEVs, represents 4 modular battery cell-strings & stator sectors
  const cylinderBalance = [
    { id: 1, name: 'Module A (Stator U)', efficiency: 99.4, peakPressureBar: Number((statorTemp / 2).toFixed(1)), tempC: Number(statorTemp.toFixed(1)), status: 'Optimal' },
    { id: 2, name: 'Module B (Stator V)', efficiency: 99.1, peakPressureBar: Number((statorTemp / 2).toFixed(1)), tempC: Number(statorTemp.toFixed(1)), status: 'Optimal' },
    { id: 3, name: 'Module C (Stator W)', efficiency: activeScenario === 'MOTOR_INSULATION_BREAKDOWN' ? 52.0 : 99.3, peakPressureBar: Number((statorTemp / 2).toFixed(1)), tempC: Number((statorTemp + 15).toFixed(1)), status: activeScenario === 'MOTOR_INSULATION_BREAKDOWN' ? 'Thermal Anomaly' : 'Optimal' },
    { id: 4, name: 'HV Pack String D', efficiency: activeScenario === 'BATTERY_CELL_IMBALANCE' ? 74.0 : 99.5, peakPressureBar: Number((openCircuitVoltage / 10).toFixed(1)), tempC: Number(batteryTemp.toFixed(1)), status: activeScenario === 'BATTERY_CELL_IMBALANCE' ? 'Cell Delta 120mV' : 'Optimal' }
  ];

  return {
    telemetry: {
      rpm: Math.round(motorRpm),
      motorRpm: Math.round(motorRpm),
      throttlePct: Math.round(normPedal * 100),
      horsepower: Number(mechanicalHp.toFixed(1)),
      powerKw: Number(mechanicalKw.toFixed(1)),
      electricalPowerKw: Number(electricalPowerKw.toFixed(1)),
      torqueNm: Number(motorTorqueNm.toFixed(1)),
      motorTorqueNm: Number(motorTorqueNm.toFixed(1)),
      batterySocPct: Number(batterySocPct.toFixed(1)),
      batteryVoltage: Number(openCircuitVoltage.toFixed(1)),
      packCurrentAmps: Number(packCurrentAmps.toFixed(1)),
      whPerKm: Number(whPerKm.toFixed(1)),
      kmPerKwh: Number(kmPerKwh.toFixed(2)),
      fuelRateKwhPerHr: Number(electricalPowerKw.toFixed(2)),
      fuelRateLPerHr: 0.0,
      isRegenerating,
      oilPressurePsi: Number((18.0 + (motorRpm / 14000) * 22.0).toFixed(1)),
      activeFiringCylinder: Math.floor((time * (motorRpm / 60) * 4) % 4) + 1,
      misfireDetected: false,
      knockDetected: false
    },
    thermal: {
      headTemp: Number(statorTemp.toFixed(1)),
      blockTemp: Number(inverterTemp.toFixed(1)),
      coolantTemp: Number(coolantTemp.toFixed(1)),
      oilTemp: Number(oilTemp.toFixed(1)),
      exhaustTemp: 28, // Virtual tailpipe ambient
      motorStatorTemp: Number(statorTemp.toFixed(1)),
      inverterTemp: Number(inverterTemp.toFixed(1)),
      batteryTemp: Number(batteryTemp.toFixed(1))
    },
    emissions: {
      tailpipeCo2GramsPerSec: 0.0,
      co2GramsPerSec: 0.0,
      wellToWheelCo2GramsPerSec: Number(((Math.max(0, electricalPowerKw) / 3600) * engineType.co2FactorKgPerUnit * 1000).toFixed(2)),
      noxPpm: 0,
      sootLoadPct: 0
    },
    cylinderBalance,
    extra: {
      batterySocPct,
      openCircuitVoltage,
      packCurrentAmps,
      whPerKm,
      kmPerKwh,
      isRegenerating,
      statorTemp,
      inverterTemp,
      batteryTemp
    }
  };
}
