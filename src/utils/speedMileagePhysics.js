/**
 * speedMileagePhysics.js
 * 
 * Physics-driven mathematical engine connecting Vehicle Velocity (Speed)
 * and Fuel Mileage / Energy Consumption / Range across aerodynamic drag,
 * engine load, kinetic energy dissipation, and traffic light wave optimization (GLOSA).
 * 
 * Generalised for all 10 powertrain families (Petrol, Diesel, CNG, Hybrid, BEV).
 */

import { getEngineType } from '../config/engineTypes.js';
import { VEHICLE_PROFILES, getVehicleProfile } from '../config/vehicleProfiles.js';

// Backward compatibility export matching all vehicle profiles
export const VEHICLE_PHYSICS_PROFILES = VEHICLE_PROFILES;

const AIR_DENSITY = 1.225; // kg/m^3 at sea level 15°C
const BASE_PETROL_ENERGY_DENSITY_J = 34.2e6; // 34.2 MJ/L
const BASE_PETROL_THERMAL_EFF = 0.28;

/**
 * Computes live physical mileage (km/L, km/kg, or km/kWh) at a given cruising speed
 * with aerodynamic drag, wind vectors, payload, roof rack, and engine efficiency.
 */
export function calculateMileageAtSpeed(speedKmh, profileKey = 'sedan', options = {}) {
  const {
    windSpeedKmh = 0,
    windAngleDeg = 0,
    payloadKg = 0,
    hasRoofRack = false,
    engineTypeId
  } = options;

  const profile = getVehicleProfile(profileKey);
  const activeEngineId = engineTypeId || profile.defaultEngineTypeId || 'i4_petrol';
  const engine = getEngineType(activeEngineId);

  const isBev = engine.category === 'BEV';
  const isHybrid = engine.category === 'HYBRID';
  const isCng = engine.fuelType === 'cng';

  if (speedKmh <= 0.5) {
    const idleRate = isBev ? 0.4 : profile.idleFuelRateLPerHr;
    return {
      kmPerL: 0,
      mileage: 0,
      mileageUnit: engine.mileageUnit,
      fuelRateLPerHr: isBev ? 0 : idleRate,
      energyRateKw: isBev ? idleRate : 0,
      fuelRateFormatted: isBev ? `${idleRate.toFixed(2)} kW` : `${idleRate.toFixed(2)} ${engine.mileageUnit.replace('km/', '')}/h`,
      dragForceN: 0,
      dragPowerKw: 0,
      rollingResistanceN: 0,
      aeroDragPct: 0,
      whPerKm: 0,
      tailpipeCo2GramsPerKm: 0,
      wellToWheelCo2GramsPerKm: 0
    };
  }

  const vMs = speedKmh / 3.6;
  const effectiveCd = hasRoofRack ? profile.cd * 1.15 : profile.cd;

  // Wind vector: headwind increases relative airspeed, tailwind reduces it
  const windAngleRad = (windAngleDeg * Math.PI) / 180;
  const windHeadwindMs = (windSpeedKmh / 3.6) * Math.cos(windAngleRad);
  const relativeAirspeedMs = Math.max(0, vMs + windHeadwindMs);

  // Aerodynamic Drag Force: F_drag = 0.5 * rho * Cd * A * v_air^2
  const dragForceN = 0.5 * AIR_DENSITY * effectiveCd * profile.frontalAreaM2 * Math.pow(relativeAirspeedMs, 2);

  // Rolling Resistance: F_rr = Crr * (m_base + payload) * g
  const totalMassKg = profile.massKg + Math.max(0, payloadKg);
  const rollingResistanceN = profile.baseRollingResistance * totalMassKg * 9.81;

  // Power required to overcome drag and rolling resistance (kW)
  const dragPowerKw = (dragForceN * vMs) / 1000;
  const rollingPowerKw = (rollingResistanceN * vMs) / 1000;
  const roadLoadPowerKw = dragPowerKw + rollingPowerKw;

  // Auxiliary baseline electrical / parasitic engine load (kW)
  const auxPowerKw = isBev ? 0.6 : (isHybrid ? 1.0 : 1.6);
  const totalDrivetrainPowerKw = Math.max(1.8, roadLoadPowerKw + auxPowerKw);

  let mileageVal = 0;
  let fuelRateVal = 0;
  let whPerKmVal = 0;

  if (isBev) {
    // BEV: Drivetrain efficiency (battery-to-wheel ~88%)
    const eta = engine.thermalEfficiencyPeak || 0.88;
    const electricalPowerKw = totalDrivetrainPowerKw / eta;
    fuelRateVal = electricalPowerKw; // kW electrical draw
    mileageVal = speedKmh / electricalPowerKw; // km/kWh
    whPerKmVal = (electricalPowerKw * 1000) / speedKmh;
  } else {
    // ICE / Hybrid:
    const etaTh = engine.thermalEfficiencyPeak || BASE_PETROL_THERMAL_EFF;
    const energyDensityJ = (engine.energyDensity || 34200) * 1000; // J/unit
    // Consumption rate per hour in unit/h (L/h or kg/h)
    fuelRateVal = (totalDrivetrainPowerKw * 3600 * 1000) / (etaTh * energyDensityJ);
    mileageVal = speedKmh / fuelRateVal;
  }

  // Mileage curve calibration check against M(v) params
  const mParams = engine.mileageParams;
  if (mParams) {
    const vDiff = speedKmh - mParams.sweetSpeedKmh;
    const penalty = mParams.alpha * Math.pow(Math.abs(vDiff), mParams.gamma) + mParams.beta * Math.pow(Math.max(0, speedKmh - 75), 2.5);
    const calibratedMileage = Math.max(isBev ? 2.5 : 4.0, mParams.peakMileage * Math.exp(-penalty));
    mileageVal = Number(((mileageVal * 0.4) + (calibratedMileage * 0.6)).toFixed(1));
  }

  const aeroDragPct = roadLoadPowerKw > 0 ? Math.round((dragPowerKw / roadLoadPowerKw) * 100) : 0;

  // Emissions per km
  const co2PerUnit = engine.co2FactorKgPerUnit || 2.31;
  const tailpipeCo2 = isBev ? 0.0 : ((1 / Math.max(0.1, mileageVal)) * co2PerUnit * 1000); // g/km
  const wellToWheelCo2 = isBev ? ((whPerKmVal / 1000) * (engine.co2FactorKgPerUnit || 0.71) * 1000) : tailpipeCo2 * 1.18;

  return {
    kmPerL: isBev ? Number(mileageVal.toFixed(1)) : Number(mileageVal.toFixed(1)),
    mileage: Number(mileageVal.toFixed(1)),
    mileageUnit: engine.mileageUnit,
    fuelRateLPerHr: Number(fuelRateVal.toFixed(2)),
    energyRateKw: isBev ? Number(fuelRateVal.toFixed(1)) : 0,
    fuelRateFormatted: isBev ? `${fuelRateVal.toFixed(1)} kW` : `${fuelRateVal.toFixed(2)} ${engine.mileageUnit.replace('km/', '')}/h`,
    dragForceN: Math.round(dragForceN),
    dragPowerKw: Math.round(dragPowerKw * 10) / 10,
    rollingResistanceN: Math.round(rollingResistanceN),
    aeroDragPct,
    whPerKm: Math.round(whPerKmVal),
    tailpipeCo2GramsPerKm: Math.round(tailpipeCo2),
    wellToWheelCo2GramsPerKm: Math.round(wellToWheelCo2)
  };
}

/**
 * Generates continuous parabolic curve data points for Recharts Speed vs Mileage chart
 */
export function generateSpeedMileageCurve(profileKey = 'sedan', options = {}) {
  const points = [];
  const profile = getVehicleProfile(profileKey);
  const activeEngineId = options.engineTypeId || profile.defaultEngineTypeId || 'i4_petrol';
  const engine = getEngineType(activeEngineId);

  const sweetSpeed = engine.mileageParams?.sweetSpeedKmh || profile.optimalSpeedKmh || 68;

  for (let spd = 15; spd <= 135; spd += 5) {
    const res = calculateMileageAtSpeed(spd, profileKey, { ...options, engineTypeId: activeEngineId });
    let zone = 'eco';
    if (spd > 95) zone = 'burn';
    else if (spd > 75) zone = 'cruise';

    points.push({
      speed: spd,
      kmPerL: res.mileage,
      mileage: res.mileage,
      mileageUnit: res.mileageUnit,
      dragPowerKw: res.dragPowerKw,
      fuelRateLPerHr: res.fuelRateLPerHr,
      aeroDragPct: res.aeroDragPct,
      whPerKm: res.whPerKm,
      isSweetSpot: Math.abs(spd - sweetSpeed) <= 3,
      zone
    });
  }
  return points;
}

/**
 * Calculates aerodynamic penalty metrics comparing current speed to optimal sweet spot speed
 */
export function calculateAeroDragTax(currentSpeedKmh, profileKey = 'sedan', options = {}, fuelPrice = 95) {
  const profile = getVehicleProfile(profileKey);
  const activeEngineId = options.engineTypeId || profile.defaultEngineTypeId || 'i4_petrol';
  const engine = getEngineType(activeEngineId);
  const optimalSpeed = engine.mileageParams?.sweetSpeedKmh || profile.optimalSpeedKmh || 68;

  const currentStats = calculateMileageAtSpeed(currentSpeedKmh, profileKey, { ...options, engineTypeId: activeEngineId });
  const optimalStats = calculateMileageAtSpeed(optimalSpeed, profileKey, { ...options, engineTypeId: activeEngineId });

  const speedDiff = currentSpeedKmh - optimalSpeed;
  const efficiencyLossPct = currentStats.mileage > 0 
    ? Math.max(0, Math.round(((optimalStats.mileage - currentStats.mileage) / optimalStats.mileage) * 100))
    : 0;

  const unitPrice = fuelPrice || engine.defaultFuelPrice || 95;
  const fuelPer100KmCurrent = currentStats.mileage > 0 ? (100 / currentStats.mileage) : 0;
  const fuelPer100KmOptimal = optimalStats.mileage > 0 ? (100 / optimalStats.mileage) : 0;
  const excessFuelPer100Km = Math.max(0, fuelPer100KmCurrent - fuelPer100KmOptimal);
  const excessCostPer100Km = Math.round(excessFuelPer100Km * unitPrice * 10) / 10;

  return {
    optimalSpeedKmh: optimalSpeed,
    currentSpeedKmh: Math.round(currentSpeedKmh),
    speedDiff: Math.round(speedDiff),
    efficiencyLossPct,
    excessFuelPer100Km: Math.round(excessFuelPer100Km * 100) / 100,
    excessCostPer100Km,
    currentAeroDragPct: currentStats.aeroDragPct,
    currentDragPowerKw: currentStats.dragPowerKw,
    dragPowerKw: currentStats.dragPowerKw,
    currentDragForceN: currentStats.dragForceN,
    dragForceN: currentStats.dragForceN,
    dragHp: (currentStats.dragPowerKw || 0) * 1.34102,
    fuelMultiplier: 1 + (efficiencyLossPct || 0) / 100,
    costPenaltyPer100Km: excessCostPer100Km,
    mileageUnit: currentStats.mileageUnit,
    unitPrice
  };
}

/**
 * Calculates Range-to-Empty Matrix across a spectrum of vehicle cruising speeds
 */
export function calculateRangeMatrix(fuelUnits, profileKey = 'sedan', speeds = [40, 60, 80, 100, 120], options = {}) {
  const profile = getVehicleProfile(profileKey);
  const activeEngineId = options.engineTypeId || profile.defaultEngineTypeId || 'i4_petrol';
  const engine = getEngineType(activeEngineId);
  const safeUnits = Math.max(0, fuelUnits);

  return speeds.map((spd) => {
    const res = calculateMileageAtSpeed(spd, profileKey, { ...options, engineTypeId: activeEngineId });
    const rangeKm = Math.round(safeUnits * res.mileage);
    const peakMileage = engine.mileageParams?.peakMileage || profile.peakMileageKmL || 19;
    const efficiencyDropPct = Math.max(0, Math.round(((peakMileage - res.mileage) / peakMileage) * 100));

    return {
      speedKmh: spd,
      mileageKmL: res.mileage,
      mileage: res.mileage,
      mileageUnit: res.mileageUnit,
      fuelRateLPerHr: res.fuelRateLPerHr,
      dragPowerKw: res.dragPowerKw,
      rangeKm,
      efficiencyDropPct
    };
  });
}

/**
 * Solves for the optimal Limp-Home safe speed to reach destination without energy/fuel starvation
 */
export function calculateLimpHomeSpeed(remainingDistanceKm, fuelUnits, profileKey = 'sedan', options = {}) {
  const profile = getVehicleProfile(profileKey);
  const activeEngineId = options.engineTypeId || profile.defaultEngineTypeId || 'i4_petrol';
  const engine = getEngineType(activeEngineId);
  const safeUnits = Math.max(0, fuelUnits);

  if (safeUnits <= 0 || remainingDistanceKm <= 0) {
    return {
      canReach: false,
      recommendedSpeedKmh: engine.mileageParams?.sweetSpeedKmh || profile.optimalSpeedKmh,
      projectedRangeKm: 0,
      safetyBufferPct: 0,
      riskLevel: 'CRITICAL',
      mileageUnit: engine.mileageUnit
    };
  }

  const sweepSpeeds = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35];
  let bestCandidate = null;
  let maxAchievableRange = 0;
  let maxRangeSpeed = engine.mileageParams?.sweetSpeedKmh || profile.optimalSpeedKmh;

  for (const spd of sweepSpeeds) {
    const { mileage } = calculateMileageAtSpeed(spd, profileKey, { ...options, engineTypeId: activeEngineId });
    const rangeKm = safeUnits * mileage;
    if (rangeKm > maxAchievableRange) {
      maxAchievableRange = rangeKm;
      maxRangeSpeed = spd;
    }

    if (rangeKm >= remainingDistanceKm * 1.08 && !bestCandidate) {
      bestCandidate = {
        speed: spd,
        range: rangeKm,
        bufferPct: Math.round(((rangeKm - remainingDistanceKm) / remainingDistanceKm) * 100)
      };
    }
  }

  if (bestCandidate) {
    return {
      canReach: true,
      recommendedSpeedKmh: bestCandidate.speed,
      projectedRangeKm: Math.round(bestCandidate.range),
      safetyBufferPct: bestCandidate.bufferPct,
      riskLevel: bestCandidate.bufferPct > 20 ? 'SAFE' : 'CAUTION',
      mileageUnit: engine.mileageUnit
    };
  }

  const canBarelyReach = maxAchievableRange >= remainingDistanceKm;
  return {
    canReach: canBarelyReach,
    recommendedSpeedKmh: maxRangeSpeed,
    projectedRangeKm: Math.round(maxAchievableRange),
    safetyBufferPct: Math.round(((maxAchievableRange - remainingDistanceKm) / remainingDistanceKm) * 100),
    riskLevel: canBarelyReach ? 'MARGINAL' : 'STRANDING_RISK',
    mileageUnit: engine.mileageUnit
  };
}

/**
 * Calculates comparative economic speed tiers for a given distance
 */
export function calculateSpeedTiers(routeDistanceKm = 25, fuelPrice = 95, profileKey = 'sedan', options = {}) {
  const profile = getVehicleProfile(profileKey);
  const activeEngineId = options.engineTypeId || profile.defaultEngineTypeId || 'i4_petrol';
  const engine = getEngineType(activeEngineId);
  const unitPrice = fuelPrice || engine.defaultFuelPrice || 95;

  const tiers = [
    { id: 'eco', name: 'Eco Saver', targetSpeed: 65, tag: 'Maximum Range / Efficiency', color: 'emerald' },
    { id: 'cruise', name: 'Nominal Cruise', targetSpeed: 85, tag: 'Standard Pace', color: 'cyan' },
    { id: 'rush', name: 'Express Rush', targetSpeed: 110, tag: 'High Drag Burn', color: 'rose' }
  ];

  const evaluated = tiers.map((tier) => {
    const res = calculateMileageAtSpeed(tier.targetSpeed, profileKey, { ...options, engineTypeId: activeEngineId });
    const durationMinutes = (routeDistanceKm / tier.targetSpeed) * 60;
    const unitsUsed = res.mileage > 0 ? routeDistanceKm / res.mileage : 0;
    const totalCost = unitsUsed * unitPrice;

    return {
      ...tier,
      durationMinutes: Math.round(durationMinutes * 10) / 10,
      mileageKmL: res.mileage,
      mileage: res.mileage,
      mileageUnit: res.mileageUnit,
      fuelUsedLiters: Math.round(unitsUsed * 100) / 100,
      unitsUsed: Math.round(unitsUsed * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100
    };
  });

  const ecoTier = evaluated[0];

  return evaluated.map((tier) => {
    const timeSavedMinutes = Math.max(0, Math.round((ecoTier.durationMinutes - tier.durationMinutes) * 10) / 10);
    const costPremium = Math.max(0, Math.round((tier.totalCost - ecoTier.totalCost) * 100) / 100);
    const timeSavedHours = timeSavedMinutes / 60;
    const valueOfTimePerHour = timeSavedHours > 0 ? Math.round(costPremium / timeSavedHours) : 0;

    return {
      ...tier,
      timeSavedMinutes,
      costPremium,
      valueOfTimePerHour
    };
  });
}

/**
 * Calculates kinetic energy dissipated in braking and the resulting fuel burn / regen recovery
 */
export function calculateKineticStopPenalty(initialSpeedKmh, finalSpeedKmh = 0, massKg = 1400, options = {}) {
  if (initialSpeedKmh <= finalSpeedKmh || initialSpeedKmh < 10) {
    return { energyKj: 0, fuelWastedLiters: 0, costPenalty: 0, energyRecoveredKj: 0, isRegenSupported: false };
  }

  const vInitialMs = initialSpeedKmh / 3.6;
  const vFinalMs = finalSpeedKmh / 3.6;

  // Kinetic energy dissipated: delta_Ek = 0.5 * m * (v1^2 - v2^2)
  const deltaEkJoules = 0.5 * massKg * (Math.pow(vInitialMs, 2) - Math.pow(vFinalMs, 2));
  const energyKj = deltaEkJoules / 1000;

  const engine = getEngineType(options.engineTypeId || 'i4_petrol');
  const isBev = engine.category === 'BEV';
  const isHybrid = engine.category === 'HYBRID';

  if (isBev || isHybrid) {
    // Regenerative recovery (60% captured)
    const regenFraction = isBev ? 0.60 : 0.45;
    const energyRecoveredKj = energyKj * regenFraction;
    const energyDissipatedKj = energyKj * (1 - regenFraction);
    const kwhRecovered = energyRecoveredKj / 3600;
    const unitPrice = options.fuelPrice || engine.defaultFuelPrice || 12;

    return {
      energyKj: Math.round(energyKj),
      totalEnergyDissipatedKj: Math.round(energyDissipatedKj),
      energyRecoveredKj: Math.round(energyRecoveredKj),
      energyDissipatedKj: Math.round(energyDissipatedKj),
      fuelWastedLiters: 0,
      kwhWasted: Number((energyDissipatedKj / 3600).toFixed(3)),
      kwhRecovered: Number(kwhRecovered.toFixed(3)),
      extraFuelLiters: 0,
      costPenalty: Math.round((energyDissipatedKj / 3600) * unitPrice * 100) / 100,
      isRegenSupported: true,
      regenEfficiencyPct: Math.round(regenFraction * 100)
    };
  }

  // ICE engines (heat lost in friction brakes)
  const etaTh = engine.thermalEfficiencyPeak || BASE_PETROL_THERMAL_EFF;
  const energyDensityJ = (engine.energyDensity || 34200) * 1000;
  const fuelWastedUnits = deltaEkJoules / (etaTh * energyDensityJ);
  const unitPrice = options.fuelPrice || engine.defaultFuelPrice || 95;

  return {
    energyKj: Math.round(energyKj),
    totalEnergyDissipatedKj: Math.round(energyKj),
    energyRecoveredKj: 0,
    energyDissipatedKj: Math.round(energyKj),
    fuelWastedLiters: Math.round(fuelWastedUnits * 1000) / 1000,
    extraFuelLiters: Math.round(fuelWastedUnits * 1000) / 1000,
    costPenalty: Math.round(fuelWastedUnits * unitPrice * 100) / 100,
    isRegenSupported: false,
    regenEfficiencyPct: 0
  };
}

/**
 * GLOSA: Green Light Optimal Speed Advisory calculator
 */
export function calculateGlosaTarget(distanceMeters, phase, timeRemainingSec, currentSpeedKmh) {
  if (distanceMeters <= 5) {
    return {
      status: 'INTERSECTION_REACHED',
      targetSpeedKmh: currentSpeedKmh,
      coastingAdvisory: 'Maintain flow across crossing.',
      lightGlow: 'green'
    };
  }

  const currentSpeedMs = currentSpeedKmh / 3.6;
  const currentEtaSec = currentSpeedMs > 0.5 ? distanceMeters / currentSpeedMs : 999;

  if (phase === 'GREEN') {
    if (currentEtaSec <= timeRemainingSec - 2) {
      const steadySpeed = Math.min(65, Math.max(35, currentSpeedKmh));
      return {
        status: 'CRUISE_GREEN',
        targetSpeedKmh: Math.round(steadySpeed),
        coastingAdvisory: `Green light open for ${timeRemainingSec}s. Cruise steadily to pass through.`,
        lightGlow: 'emerald'
      };
    } else {
      const speedToPassKmh = (distanceMeters / Math.max(1, timeRemainingSec - 1)) * 3.6;
      if (speedToPassKmh <= 75 && speedToPassKmh > currentSpeedKmh) {
        return {
          status: 'ACCEL_CATCH_GREEN',
          targetSpeedKmh: Math.round(speedToPassKmh),
          coastingAdvisory: `Accelerate smoothly to ${Math.round(speedToPassKmh)} km/h to pass before yellow.`,
          lightGlow: 'emerald'
        };
      } else {
        return {
          status: 'COAST_FOR_RED',
          targetSpeedKmh: Math.round(Math.max(25, currentSpeedKmh * 0.7)),
          coastingAdvisory: `Signal turning red soon. Coast throttle early to avoid slamming brakes.`,
          lightGlow: 'amber'
        };
      }
    }
  } else if (phase === 'YELLOW') {
    return {
      status: 'PREPARE_STOP',
      targetSpeedKmh: 0,
      coastingAdvisory: `Yellow phase (${timeRemainingSec}s). Begin smooth progressive braking.`,
      lightGlow: 'amber'
    };
  } else {
    const targetSpeedMs = distanceMeters / Math.max(2, timeRemainingSec);
    const targetSpeedKmh = targetSpeedMs * 3.6;

    if (targetSpeedKmh >= 20 && targetSpeedKmh <= 65) {
      return {
        status: 'GLOSA_WAVE_MATCH',
        targetSpeedKmh: Math.round(targetSpeedKmh),
        coastingAdvisory: `Glide at ${Math.round(targetSpeedKmh)} km/h to catch the green wave without stopping.`,
        lightGlow: 'rose'
      };
    } else {
      return {
        status: 'COAST_TO_STANDSTILL',
        targetSpeedKmh: Math.round(Math.max(15, currentSpeedKmh * 0.6)),
        coastingAdvisory: `Red light active for ${timeRemainingSec}s. Glide to minimize brake pad wear.`,
        lightGlow: 'rose'
      };
    }
  }
}
