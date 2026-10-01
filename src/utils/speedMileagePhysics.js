/**
 * speedMileagePhysics.js
 * 
 * Physics-driven mathematical engine connecting Vehicle Velocity (Speed)
 * and Fuel Mileage / Range across aerodynamic drag, BSFC engine load,
 * kinetic energy dissipation, and traffic light wave optimization (GLOSA).
 */

// Aerodynamic and mechanical constants per profile
export const VEHICLE_PHYSICS_PROFILES = {
  hatchback: {
    name: 'Eco Hatchback',
    massKg: 1050,
    cd: 0.31,         // Drag coefficient
    frontalAreaM2: 2.1,
    baseRollingResistance: 0.012,
    idleFuelRateLPerHr: 0.65,
    optimalSpeedKmh: 62,
    peakMileageKmL: 21.4,
    tankCapacityLiters: 42
  },
  sedan: {
    name: 'Sports Sedan',
    massKg: 1420,
    cd: 0.28,
    frontalAreaM2: 2.25,
    baseRollingResistance: 0.013,
    idleFuelRateLPerHr: 0.85,
    optimalSpeedKmh: 68,
    peakMileageKmL: 19.1,
    tankCapacityLiters: 50
  },
  suv: {
    name: 'Heavy SUV',
    massKg: 2050,
    cd: 0.38,
    frontalAreaM2: 2.85,
    baseRollingResistance: 0.016,
    idleFuelRateLPerHr: 1.20,
    optimalSpeedKmh: 58,
    peakMileageKmL: 14.8,
    tankCapacityLiters: 65
  }
};

const AIR_DENSITY = 1.225; // kg/m^3 at sea level 15°C
const FUEL_ENERGY_DENSITY_J_PER_L = 32e6; // ~32 MJ per liter of gasoline
const ENGINE_THERMAL_EFFICIENCY = 0.26; // 26% brake thermal efficiency average

/**
 * Computes live physical fuel mileage (km/L) at a given cruising speed
 * with aerodynamic drag, wind vectors, payload, and roof rack penalties.
 */
export function calculateMileageAtSpeed(speedKmh, profileKey = 'sedan', options = {}) {
  const {
    windSpeedKmh = 0,
    windAngleDeg = 0, // 0 = headwind, 180 = tailwind, 90 = crosswind
    payloadKg = 0,
    hasRoofRack = false
  } = options;

  const profile = VEHICLE_PHYSICS_PROFILES[profileKey] || VEHICLE_PHYSICS_PROFILES.sedan;
  
  if (speedKmh <= 0.5) {
    return {
      kmPerL: 0,
      fuelRateLPerHr: profile.idleFuelRateLPerHr,
      dragForceN: 0,
      dragPowerKw: 0,
      rollingResistanceN: 0,
      aeroDragPct: 0
    };
  }

  const vMs = speedKmh / 3.6;
  
  // Aerodynamic drag modified by roof rack and ambient wind vector
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
  const auxPowerKw = 1.8;
  const totalEnginePowerKw = Math.max(2.5, roadLoadPowerKw + auxPowerKw);
  
  // Fuel rate (L/h) = Engine Power (kW) * 3600 (s) / (Thermal Efficiency * Fuel Energy Density (kJ/L))
  const fuelRateLPerHr = (totalEnginePowerKw * 3600) / (ENGINE_THERMAL_EFFICIENCY * (FUEL_ENERGY_DENSITY_J_PER_L / 1000));
  
  // km/L = Speed (km/h) / Fuel Rate (L/h)
  const kmPerL = speedKmh / fuelRateLPerHr;
  const aeroDragPct = roadLoadPowerKw > 0 ? Math.round((dragPowerKw / roadLoadPowerKw) * 100) : 0;

  return {
    kmPerL: Math.round(kmPerL * 10) / 10,
    fuelRateLPerHr: Math.round(fuelRateLPerHr * 100) / 100,
    dragForceN: Math.round(dragForceN),
    dragPowerKw: Math.round(dragPowerKw * 10) / 10,
    rollingResistanceN: Math.round(rollingResistanceN),
    aeroDragPct
  };
}

/**
 * Generates continuous parabolic curve data points for Recharts Speed vs Mileage chart
 */
export function generateSpeedMileageCurve(profileKey = 'sedan', options = {}) {
  const points = [];
  const profile = VEHICLE_PHYSICS_PROFILES[profileKey] || VEHICLE_PHYSICS_PROFILES.sedan;
  
  for (let spd = 15; spd <= 135; spd += 5) {
    const res = calculateMileageAtSpeed(spd, profileKey, options);
    let zone = 'eco';
    if (spd > 95) zone = 'burn';
    else if (spd > 75) zone = 'cruise';

    points.push({
      speed: spd,
      kmPerL: res.kmPerL,
      dragPowerKw: res.dragPowerKw,
      fuelRateLPerHr: res.fuelRateLPerHr,
      aeroDragPct: res.aeroDragPct,
      isSweetSpot: Math.abs(spd - profile.optimalSpeedKmh) <= 3,
      zone
    });
  }
  return points;
}

/**
 * Calculates aerodynamic penalty metrics comparing current speed to optimal sweet spot speed
 */
export function calculateAeroDragTax(currentSpeedKmh, profileKey = 'sedan', options = {}, fuelPrice = 95) {
  const profile = VEHICLE_PHYSICS_PROFILES[profileKey] || VEHICLE_PHYSICS_PROFILES.sedan;
  const optimalSpeed = profile.optimalSpeedKmh;

  const currentStats = calculateMileageAtSpeed(currentSpeedKmh, profileKey, options);
  const optimalStats = calculateMileageAtSpeed(optimalSpeed, profileKey, options);

  const speedDiff = currentSpeedKmh - optimalSpeed;
  const efficiencyLossPct = currentStats.kmPerL > 0 
    ? Math.max(0, Math.round(((optimalStats.kmPerL - currentStats.kmPerL) / optimalStats.kmPerL) * 100))
    : 0;

  // Fuel burned per 100 km at both speeds
  const fuelPer100KmCurrent = currentStats.kmPerL > 0 ? (100 / currentStats.kmPerL) : 0;
  const fuelPer100KmOptimal = optimalStats.kmPerL > 0 ? (100 / optimalStats.kmPerL) : 0;
  const excessFuelPer100Km = Math.max(0, fuelPer100KmCurrent - fuelPer100KmOptimal);
  const excessCostPer100Km = Math.round(excessFuelPer100Km * fuelPrice * 10) / 10;

  return {
    optimalSpeedKmh: optimalSpeed,
    currentSpeedKmh: Math.round(currentSpeedKmh),
    speedDiff: Math.round(speedDiff),
    efficiencyLossPct,
    excessFuelPer100Km: Math.round(excessFuelPer100Km * 100) / 100,
    excessCostPer100Km,
    currentAeroDragPct: currentStats.aeroDragPct,
    currentDragPowerKw: currentStats.dragPowerKw,
    currentDragForceN: currentStats.dragForceN
  };
}

/**
 * Calculates Range-to-Empty Matrix across a spectrum of vehicle cruising speeds
 */
export function calculateRangeMatrix(fuelLiters, profileKey = 'sedan', speeds = [40, 60, 80, 100, 120]) {
  const profile = VEHICLE_PHYSICS_PROFILES[profileKey] || VEHICLE_PHYSICS_PROFILES.sedan;
  const safeLiters = Math.max(0, fuelLiters);

  return speeds.map((spd) => {
    const { kmPerL, fuelRateLPerHr, dragPowerKw } = calculateMileageAtSpeed(spd, profileKey);
    const rangeKm = Math.round(safeLiters * kmPerL);
    const peakKmL = profile.peakMileageKmL;
    const efficiencyDropPct = Math.max(0, Math.round(((peakKmL - kmPerL) / peakKmL) * 100));

    return {
      speedKmh: spd,
      mileageKmL: kmPerL,
      fuelRateLPerHr,
      dragPowerKw,
      rangeKm,
      efficiencyDropPct
    };
  });
}

/**
 * Solves for the optimal Limp-Home safe speed to reach destination without fuel starvation
 */
export function calculateLimpHomeSpeed(remainingDistanceKm, fuelLiters, profileKey = 'sedan') {
  const profile = VEHICLE_PHYSICS_PROFILES[profileKey] || VEHICLE_PHYSICS_PROFILES.sedan;
  const safeLiters = Math.max(0, fuelLiters);

  if (safeLiters <= 0 || remainingDistanceKm <= 0) {
    return {
      canReach: false,
      recommendedSpeedKmh: profile.optimalSpeedKmh,
      projectedRangeKm: 0,
      safetyBufferPct: 0,
      riskLevel: 'CRITICAL'
    };
  }

  // Sweep speeds from 95 km/h down to 35 km/h to find highest comfortable speed that delivers >= 10% fuel buffer
  const sweepSpeeds = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35];
  let bestCandidate = null;
  let maxAchievableRange = 0;
  let maxRangeSpeed = profile.optimalSpeedKmh;

  for (const spd of sweepSpeeds) {
    const { kmPerL } = calculateMileageAtSpeed(spd, profileKey);
    const rangeKm = safeLiters * kmPerL;
    if (rangeKm > maxAchievableRange) {
      maxAchievableRange = rangeKm;
      maxRangeSpeed = spd;
    }

    // Require at least 8% safety buffer to account for traffic fluctuations
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
      riskLevel: bestCandidate.bufferPct > 20 ? 'SAFE' : 'CAUTION'
    };
  }

  // If even optimal speed cannot reach destination with buffer
  const canBarelyReach = maxAchievableRange >= remainingDistanceKm;
  return {
    canReach: canBarelyReach,
    recommendedSpeedKmh: maxRangeSpeed,
    projectedRangeKm: Math.round(maxAchievableRange),
    safetyBufferPct: Math.round(((maxAchievableRange - remainingDistanceKm) / remainingDistanceKm) * 100),
    riskLevel: canBarelyReach ? 'MARGINAL' : 'STRANDING_RISK'
  };
}

/**
 * Calculates comparative economic speed tiers for a given distance
 */
export function calculateSpeedTiers(routeDistanceKm = 25, fuelPrice = 95, profileKey = 'sedan') {
  const tiers = [
    { id: 'eco', name: 'Eco Saver', targetSpeed: 65, tag: 'Maximum Mileage', color: 'emerald' },
    { id: 'cruise', name: 'Nominal Cruise', targetSpeed: 85, tag: 'Standard Pace', color: 'cyan' },
    { id: 'rush', name: 'Express Rush', targetSpeed: 110, tag: 'High Drag Burn', color: 'rose' }
  ];

  const evaluated = tiers.map((tier) => {
    const { kmPerL, fuelRateLPerHr } = calculateMileageAtSpeed(tier.targetSpeed, profileKey);
    const durationMinutes = (routeDistanceKm / tier.targetSpeed) * 60;
    const fuelUsedLiters = routeDistanceKm / kmPerL;
    const totalCost = fuelUsedLiters * fuelPrice;

    return {
      ...tier,
      durationMinutes: Math.round(durationMinutes * 10) / 10,
      mileageKmL: kmPerL,
      fuelUsedLiters: Math.round(fuelUsedLiters * 100) / 100,
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
 * Calculates kinetic energy dissipated in braking and the resulting fuel burn to re-accelerate
 */
export function calculateKineticStopPenalty(initialSpeedKmh, finalSpeedKmh = 0, massKg = 1400) {
  if (initialSpeedKmh <= finalSpeedKmh || initialSpeedKmh < 10) {
    return { energyKj: 0, fuelWastedLiters: 0, costPenalty: 0 };
  }

  const vInitialMs = initialSpeedKmh / 3.6;
  const vFinalMs = finalSpeedKmh / 3.6;

  // Kinetic energy dissipated: delta_Ek = 0.5 * m * (v1^2 - v2^2)
  const deltaEkJoules = 0.5 * massKg * (Math.pow(vInitialMs, 2) - Math.pow(vFinalMs, 2));
  const energyKj = deltaEkJoules / 1000;

  // Fuel consumed by engine to restore that kinetic energy
  const fuelWastedLiters = deltaEkJoules / (ENGINE_THERMAL_EFFICIENCY * FUEL_ENERGY_DENSITY_J_PER_L);

  return {
    energyKj: Math.round(energyKj),
    fuelWastedLiters: Math.round(fuelWastedLiters * 1000) / 1000,
    costPenalty: Math.round(fuelWastedLiters * 95 * 100) / 100
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
    // If we can easily pass before light turns yellow
    if (currentEtaSec <= timeRemainingSec - 2) {
      const steadySpeed = Math.min(65, Math.max(35, currentSpeedKmh));
      return {
        status: 'CRUISE_GREEN',
        targetSpeedKmh: Math.round(steadySpeed),
        coastingAdvisory: `Green light open for ${timeRemainingSec}s. Cruise steadily to pass through.`,
        lightGlow: 'emerald'
      };
    } else {
      // Light will turn red before we arrive at current speed
      // Calculate speed needed or advise gentle coasting
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
    // RED PHASE: Calculate target speed so car arrives exactly when light flips back to GREEN
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
