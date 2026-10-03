/**
 * VelocIQ Living Digital Twin & AI Driving Optimizer Engine
 * 
 * Provides:
 * 1. Living Vehicle Digital Twin: multi-variate 90-day baselines, operational envelopes, drift metrics.
 * 2. Predictive Vehicle Health Engine: Time-series ML anomaly detection, XAI factor attribution, RUL runway.
 * 3. AI Driver Digital Twin: Behavioral modeling (jerk, smoothness, cornering, temporal habit clustering).
 * 4. AI Driving Optimizer: Driver-Vehicle synthesis across Safety, Efficiency, and Health pillars.
 * 5. Closed-Loop Feedback Engine: Self-learning cycle state machine with iterative adaptation.
 */

import { getEngineDigitalTwin } from './engineDigitalTwins.js';
import { getEngineType } from '../config/engineTypes.js';

// ==========================================
// 1. VEHICLE DIGITAL TWIN BASELINES
// ==========================================

export const VEHICLE_BASELINES = {
  v1: {
    id: 'v1',
    name: 'Alpha Cruiser (Sedan)',
    model: 'Executive Sports Sedan 2.0L Turbo',
    odometerBaselineKm: 12450,
    normalBaseline90d: {
      fuelEfficiencyKmL: 17.8,
      avgCoolantTempC: 86.0,
      idleMafGs: 2.4,
      cruiseMafGs: 8.8,
      vibrationIndex: 1.15,
      nominalBrakeWearPer1kKm: 0.32, // % wear per 1000 km
      batteryVoltageResting: 12.6,
      batteryVoltageCharging: 14.1,
      coldStartTimeSec: 210, // time to reach 85C
      throttleAggressionBaseline: 24.5,
    },
    operatingConditions: {
      urbanRatio: 0.38,
      highwayRatio: 0.52,
      mountainRatio: 0.10,
      avgAmbientTempC: 26.5,
      avgPayloadKg: 180,
      coldStartsPerMonth: 54,
    },
    serviceHistory: [
      { date: '2026-08-12', mileage: 10200, type: 'Scheduled 10k Service', notes: 'Synthetic 0W-20 oil change, cabin filter replaced' },
      { date: '2026-05-18', mileage: 5100, type: 'Inspection', notes: 'ECU software patch 2.4, tire rotation completed' },
    ],
    wearRunways: {
      brakes: { healthPct: 84, daysRemaining: 182, kmRemaining: 14200, status: 'Healthy' },
      engineOil: { healthPct: 76, daysRemaining: 94, kmRemaining: 7400, status: 'Healthy' },
      battery: { healthPct: 92, daysRemaining: 410, kmRemaining: 32000, status: 'Optimal' },
      coolingSystem: { healthPct: 88, daysRemaining: 240, kmRemaining: 19500, status: 'Healthy' },
      catalyticEmissions: { healthPct: 91, daysRemaining: 365, kmRemaining: 28000, status: 'Optimal' }
    }
  },
  v2: {
    id: 'v2',
    name: 'Cargo Hauler (Truck/SUV)',
    model: 'Heavy Duty 4.5L V8 Turbodiesel',
    odometerBaselineKm: 82000,
    normalBaseline90d: {
      fuelEfficiencyKmL: 11.2,
      avgCoolantTempC: 89.5,
      idleMafGs: 4.8,
      cruiseMafGs: 16.4,
      vibrationIndex: 2.1,
      nominalBrakeWearPer1kKm: 0.55,
      batteryVoltageResting: 12.5,
      batteryVoltageCharging: 14.2,
      coldStartTimeSec: 320,
      throttleAggressionBaseline: 34.0,
    },
    operatingConditions: {
      urbanRatio: 0.25,
      highwayRatio: 0.65,
      mountainRatio: 0.10,
      avgAmbientTempC: 28.0,
      avgPayloadKg: 950,
      coldStartsPerMonth: 48,
    },
    serviceHistory: [
      { date: '2026-07-04', mileage: 75000, type: 'Brake Overhaul', notes: 'Heavy-duty ceramic pads & rotors installed' },
      { date: '2026-03-11', mileage: 68000, type: 'Major 70k Service', notes: 'Transmission fluid flush, diesel particulate filter clean' },
    ],
    wearRunways: {
      brakes: { healthPct: 72, daysRemaining: 120, kmRemaining: 9200, status: 'Good' },
      engineOil: { healthPct: 61, daysRemaining: 55, kmRemaining: 4100, status: 'Attention Soon' },
      battery: { healthPct: 86, daysRemaining: 310, kmRemaining: 24000, status: 'Optimal' },
      coolingSystem: { healthPct: 79, daysRemaining: 160, kmRemaining: 13000, status: 'Healthy' },
      catalyticEmissions: { healthPct: 83, daysRemaining: 280, kmRemaining: 21000, status: 'Healthy' }
    }
  },
  v3: {
    id: 'v3',
    name: 'Eco Commuter (Hatchback)',
    model: 'Hyper-Eco 1.2L DualJet Mild-Hybrid',
    odometerBaselineKm: 45000,
    normalBaseline90d: {
      fuelEfficiencyKmL: 22.4,
      avgCoolantTempC: 84.0,
      idleMafGs: 1.8,
      cruiseMafGs: 6.2,
      vibrationIndex: 0.95,
      nominalBrakeWearPer1kKm: 0.22,
      batteryVoltageResting: 12.7,
      batteryVoltageCharging: 14.4,
      coldStartTimeSec: 160,
      throttleAggressionBaseline: 19.0,
    },
    operatingConditions: {
      urbanRatio: 0.60,
      highwayRatio: 0.35,
      mountainRatio: 0.05,
      avgAmbientTempC: 25.0,
      avgPayloadKg: 120,
      coldStartsPerMonth: 72,
    },
    serviceHistory: [
      { date: '2026-06-20', mileage: 42000, type: 'Hybrid Battery Diagnostic', notes: 'State of Health 96.2%, cell balancing verified' },
      { date: '2026-01-15', mileage: 36000, type: 'Fluid Inspection', notes: 'Coolant refill, regenerative brake line inspection' },
    ],
    wearRunways: {
      brakes: { healthPct: 89, daysRemaining: 290, kmRemaining: 22000, status: 'Optimal' },
      engineOil: { healthPct: 82, daysRemaining: 130, kmRemaining: 10500, status: 'Optimal' },
      battery: { healthPct: 94, daysRemaining: 520, kmRemaining: 40000, status: 'Optimal' },
      coolingSystem: { healthPct: 91, daysRemaining: 340, kmRemaining: 27000, status: 'Optimal' },
      catalyticEmissions: { healthPct: 95, daysRemaining: 480, kmRemaining: 38000, status: 'Optimal' }
    }
  },
  v4: {
    id: 'v4',
    name: 'City Sprinter (Hatchback)',
    model: 'Agile 1.0L Turbo Urban Compact',
    odometerBaselineKm: 3100,
    normalBaseline90d: {
      fuelEfficiencyKmL: 19.5,
      avgCoolantTempC: 85.0,
      idleMafGs: 1.9,
      cruiseMafGs: 7.1,
      vibrationIndex: 1.05,
      nominalBrakeWearPer1kKm: 0.28,
      batteryVoltageResting: 12.6,
      batteryVoltageCharging: 14.1,
      coldStartTimeSec: 180,
      throttleAggressionBaseline: 22.0,
    },
    operatingConditions: {
      urbanRatio: 0.70,
      highwayRatio: 0.25,
      mountainRatio: 0.05,
      avgAmbientTempC: 27.0,
      avgPayloadKg: 140,
      coldStartsPerMonth: 65,
    },
    serviceHistory: [
      { date: '2026-09-01', mileage: 1500, type: 'First Inspection', notes: 'Factory fluid levels check, bolt torque checks' },
    ],
    wearRunways: {
      brakes: { healthPct: 97, daysRemaining: 420, kmRemaining: 32000, status: 'Optimal' },
      engineOil: { healthPct: 92, daysRemaining: 210, kmRemaining: 16000, status: 'Optimal' },
      battery: { healthPct: 98, daysRemaining: 650, kmRemaining: 48000, status: 'Optimal' },
      coolingSystem: { healthPct: 96, daysRemaining: 450, kmRemaining: 35000, status: 'Optimal' },
      catalyticEmissions: { healthPct: 98, daysRemaining: 580, kmRemaining: 44000, status: 'Optimal' }
    }
  },
  v5: {
    id: 'v5',
    name: 'Heavy Duty (Truck)',
    model: 'Commercial 6.0L Commercial Hauler',
    odometerBaselineKm: 110200,
    normalBaseline90d: {
      fuelEfficiencyKmL: 9.8,
      avgCoolantTempC: 91.0,
      idleMafGs: 5.4,
      cruiseMafGs: 18.2,
      vibrationIndex: 2.4,
      nominalBrakeWearPer1kKm: 0.68,
      batteryVoltageResting: 12.4,
      batteryVoltageCharging: 14.0,
      coldStartTimeSec: 360,
      throttleAggressionBaseline: 36.0,
    },
    operatingConditions: {
      urbanRatio: 0.20,
      highwayRatio: 0.70,
      mountainRatio: 0.10,
      avgAmbientTempC: 29.5,
      avgPayloadKg: 1400,
      coldStartsPerMonth: 40,
    },
    serviceHistory: [
      { date: '2026-08-30', mileage: 105000, type: 'Transmission Service', notes: 'Heavy gear oil replaced, filter renewed' },
      { date: '2026-04-12', mileage: 98000, type: 'Cooling Overhaul', notes: 'New high-flow water pump & silicone hoses' },
    ],
    wearRunways: {
      brakes: { healthPct: 64, daysRemaining: 75, kmRemaining: 5800, status: 'Attention Soon' },
      engineOil: { healthPct: 54, daysRemaining: 38, kmRemaining: 2900, status: 'Service Recommended' },
      battery: { healthPct: 81, daysRemaining: 220, kmRemaining: 18000, status: 'Healthy' },
      coolingSystem: { healthPct: 75, daysRemaining: 140, kmRemaining: 11000, status: 'Healthy' },
      catalyticEmissions: { healthPct: 78, daysRemaining: 190, kmRemaining: 15000, status: 'Healthy' }
    }
  }
};

// ==========================================
// 2. PREDICTIVE VEHICLE HEALTH & ANOMALY ENGINE
// ==========================================

export function computePredictiveHealthMetrics(liveTelemetry, vehicleId = 'v1', engineTypeId = null) {
  const vehicle = VEHICLE_BASELINES[vehicleId] || VEHICLE_BASELINES.v1;
  const activeEngineId = engineTypeId || vehicle.engineTypeId || 'i4_petrol';
  const engineTwin = getEngineDigitalTwin(activeEngineId);
  const engineType = getEngineType(activeEngineId);
  const isBev = engineType.category === 'BEV';

  // Use engine-specific 90-day baseline when available
  const baseline = {
    ...vehicle.normalBaseline90d,
    ...(engineTwin.normalBaseline90d || {}),
    fuelEfficiencyKmL: engineTwin.normalBaseline90d?.efficiency || vehicle.normalBaseline90d.fuelEfficiencyKmL,
    efficiencyUnit: engineType.mileageUnit || 'km/L'
  };

  // Real-time comparison against 90-day baseline
  const currentEff = isBev
    ? (liveTelemetry?.kmPerKwh ? parseFloat(liveTelemetry.kmPerKwh) : (liveTelemetry?.fuel ? parseFloat(liveTelemetry.fuel) : 6.5))
    : (liveTelemetry?.fuel ? parseFloat(liveTelemetry.fuel) : 15.6);
  const currentCoolant = liveTelemetry?.coolant ? parseFloat(liveTelemetry.coolant) : (isBev ? 38.0 : 85.8);
  const currentMaf = liveTelemetry?.maf ? parseFloat(liveTelemetry.maf) : (isBev ? 0.0 : 9.4);

  // Percentage deviations
  const fuelEfficiencyDeltaPct = ((currentEff - baseline.fuelEfficiencyKmL) / baseline.fuelEfficiencyKmL) * 100;
  const coolantDeltaC = currentCoolant - (baseline.avgCoolantTempC || 86.0);
  const mafDeltaPct = isBev ? 0 : ((currentMaf - (baseline.cruiseAirFlow || baseline.cruiseMafGs || 8.8)) / (baseline.cruiseAirFlow || baseline.cruiseMafGs || 8.8)) * 100;

  // Multivariate Anomaly Score (0 to 100%)
  const fuelAnomalyComponent = Math.max(0, -fuelEfficiencyDeltaPct) * 2.2;
  const coolantAnomalyComponent = Math.max(0, Math.abs(coolantDeltaC) - (isBev ? 5 : 3)) * 4.5;
  const mafAnomalyComponent = isBev ? 0 : Math.max(0, Math.abs(mafDeltaPct) - 10) * 1.8;

  const rawAnomalyScore = Math.min(98, Math.max(4, fuelAnomalyComponent + coolantAnomalyComponent + mafAnomalyComponent));
  const anomalyScore = Math.round(rawAnomalyScore * 10) / 10;

  // Time-Series ML Anomaly Status
  let healthStatus = 'NOMINAL';
  let severity = 'info';
  if (anomalyScore > 65) {
    healthStatus = 'CRITICAL ANOMALY';
    severity = 'critical';
  } else if (anomalyScore > 35) {
    healthStatus = 'PREDICTIVE WARNING';
    severity = 'warning';
  } else if (anomalyScore > 18) {
    healthStatus = 'MINOR DEVIATION';
    severity = 'caution';
  }

  // Primary Health Alert Message
  const fuelDropFormatted = Math.abs(fuelEfficiencyDeltaPct).toFixed(1);
  const efficiencyLabel = isBev ? 'Electrical efficiency (km/kWh)' : 'Fuel efficiency';
  const primaryAlert = {
    title: `${engineType.shortLabel} Health Alert`,
    message: fuelEfficiencyDeltaPct < -5
      ? `${efficiencyLabel} has decreased ${fuelDropFormatted}% compared with your 90-day baseline.`
      : `Powertrain operating within nominal ±${Math.abs(fuelEfficiencyDeltaPct).toFixed(1)}% of 90-day baseline.`,
    isAnomaly: fuelEfficiencyDeltaPct < -5,
    severity,
    anomalyScore,
  };

  // Explainable AI (Factor Attribution tailored to engine type)
  const factorAttributions = engineTwin.xaiFactors || [
    { factor: 'O2 Sensor Thermal Drift', contributionPct: 34, impact: '+4.2% Fuel Penalty', risk: 'Medium' },
    { factor: 'Tire Rolling Resistance / Pressure', contributionPct: 31, impact: '-3.8% Energy Loss', risk: 'Moderate' },
    { factor: 'Coolant Thermostat Thermal Lag', contributionPct: 35, impact: '+4.4% Inefficient Choke Cycle', risk: 'Medium-High' }
  ];

  const wearRunways = engineTwin.wearRunways || vehicle.wearRunways;

  return {
    vehicle,
    baseline,
    currentMetrics: {
      kmL: currentEff,
      coolantC: currentCoolant,
      mafGs: currentMaf,
      fuelEfficiencyDeltaPct: Math.round(fuelEfficiencyDeltaPct * 10) / 10,
      coolantDeltaC: Math.round(coolantDeltaC * 10) / 10,
      mafDeltaPct: Math.round(mafDeltaPct * 10) / 10,
      efficiencyUnit: baseline.efficiencyUnit
    },
    primaryAlert,
    anomalyScore,
    healthStatus,
    factorAttributions,
    wearRunways,
    timeSeriesBaselineHistory: [
      { day: 'Day 1', baseline: baseline.fuelEfficiencyKmL, observed: Number((baseline.fuelEfficiencyKmL + 0.4).toFixed(1)), anomalyBand: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)) },
      { day: 'Day 15', baseline: baseline.fuelEfficiencyKmL, observed: Number((baseline.fuelEfficiencyKmL + 0.1).toFixed(1)), anomalyBand: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)) },
      { day: 'Day 30', baseline: baseline.fuelEfficiencyKmL, observed: Number((baseline.fuelEfficiencyKmL - 0.3).toFixed(1)), anomalyBand: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)) },
      { day: 'Day 45', baseline: baseline.fuelEfficiencyKmL, observed: Number((baseline.fuelEfficiencyKmL - 0.7).toFixed(1)), anomalyBand: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)) },
      { day: 'Day 60', baseline: baseline.fuelEfficiencyKmL, observed: Number((baseline.fuelEfficiencyKmL - 1.2).toFixed(1)), anomalyBand: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)) },
      { day: 'Day 75', baseline: baseline.fuelEfficiencyKmL, observed: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)), anomalyBand: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)) },
      { day: 'Today', baseline: baseline.fuelEfficiencyKmL, observed: currentEff, anomalyBand: Number((baseline.fuelEfficiencyKmL - 1.8).toFixed(1)) },
    ]
  };
}

// ==========================================
// 3. AI DRIVER DIGITAL TWIN (BEHAVIORAL MODEL)
// ==========================================

export const DRIVER_BEHAVIORAL_PROFILES = {
  d1: {
    id: 'd1',
    name: 'Sarah Jenkins',
    persona: 'Dynamic Commuter',
    experienceYears: 8,
    skillRadar: [
      { axis: 'Acceleration Smoothness', score: 78, baseline: 82 },
      { axis: 'Braking Smoothness', score: 74, baseline: 80 },
      { axis: 'Cornering Control', score: 92, baseline: 88 },
      { axis: 'Driving Consistency', score: 85, baseline: 84 },
      { axis: 'Eco-Coasting Ratio', score: 71, baseline: 76 },
      { axis: 'Speed Adherence', score: 94, baseline: 90 },
    ],
    behaviorMetrics: {
      avgAccelerationJerk: 1.84, // m/s^3
      baselineJerk: 1.56, // +18% higher today
      brakingDecelPeakG: 0.42, // Gs
      baselineBrakingG: 0.35,
      corneringLateralG: 0.28,
      speedVarianceKmh: 4.2,
      shortCityTripsCount: 42,
      longHighwayTripsCount: 28,
    },
    contextualPatterns: [
      {
        id: 'pat-1',
        title: 'Short City Trip Fuel Disparity',
        highlight: 'Your fuel consumption is consistently higher during short city trips (+21.4%).',
        condition: 'Urban stop-and-go < 8 km duration',
        evidence: '38 recorded short trips averaged 13.9 km/L vs 18.2 km/L on suburban runs.',
        severity: 'warning'
      },
      {
        id: 'pat-2',
        title: 'High-Traffic Braking Aggression',
        highlight: 'Your braking becomes more aggressive during high-traffic journeys.',
        condition: 'Congestion index > 65% (17:00 - 18:30)',
        evidence: 'Deceleration impulses exceed 0.38G 3.4x more frequently than open road cruising.',
        severity: 'caution'
      },
      {
        id: 'pat-3',
        title: 'Morning Throttle Ramp Pattern',
        highlight: 'Cold-engine acceleration is +18% sharper in first 10 minutes of morning trips.',
        condition: 'First departure between 07:30 - 08:45 AM',
        evidence: 'Throttle opening speed exceeds 45%/sec before coolant reaches 70°C.',
        severity: 'warning'
      }
    ],
    timeOfDayDistributions: [
      { period: 'Morning Rush (07-09)', aggressionIndex: 78, ecoScore: 68, avgSpeed: 38 },
      { period: 'Midday Transit (11-14)', aggressionIndex: 42, ecoScore: 84, avgSpeed: 62 },
      { period: 'Evening Commute (17-19)', aggressionIndex: 72, ecoScore: 71, avgSpeed: 44 },
      { period: 'Night Cruise (20-23)', aggressionIndex: 35, ecoScore: 92, avgSpeed: 75 },
    ]
  },
  d2: {
    id: 'd2',
    name: 'Marcus Cole',
    persona: 'Spirited Pilot',
    experienceYears: 3,
    skillRadar: [
      { axis: 'Acceleration Smoothness', score: 62, baseline: 70 },
      { axis: 'Braking Smoothness', score: 65, baseline: 72 },
      { axis: 'Cornering Control', score: 88, baseline: 82 },
      { axis: 'Driving Consistency', score: 68, baseline: 75 },
      { axis: 'Eco-Coasting Ratio', score: 58, baseline: 65 },
      { axis: 'Speed Adherence', score: 82, baseline: 85 },
    ],
    behaviorMetrics: {
      avgAccelerationJerk: 2.35,
      baselineJerk: 1.95,
      brakingDecelPeakG: 0.52,
      baselineBrakingG: 0.44,
      corneringLateralG: 0.38,
      speedVarianceKmh: 8.6,
      shortCityTripsCount: 55,
      longHighwayTripsCount: 16,
    },
    contextualPatterns: [
      {
        id: 'pat-mc-1',
        title: 'High Dynamic Launch Frequency',
        highlight: 'Rapid throttle tip-ins from standing stops increase fuel burn by 28%.',
        condition: 'Signal starts and ramp entries',
        evidence: 'Exceeds 3,500 RPM in 1st/2nd gear before torque converter lockup.',
        severity: 'critical'
      },
      {
        id: 'pat-mc-2',
        title: 'Late Braking Trajectory',
        highlight: 'Deceleration initiated 25m later than vehicle predictive coasting window.',
        condition: 'Approaching highway tollbooths and roundabouts',
        evidence: 'Brake disc thermal spikes recorded at 380°C.',
        severity: 'warning'
      }
    ],
    timeOfDayDistributions: [
      { period: 'Morning Rush (07-09)', aggressionIndex: 85, ecoScore: 59, avgSpeed: 45 },
      { period: 'Midday Transit (11-14)', aggressionIndex: 68, ecoScore: 65, avgSpeed: 68 },
      { period: 'Evening Commute (17-19)', aggressionIndex: 82, ecoScore: 61, avgSpeed: 48 },
      { period: 'Night Cruise (20-23)', aggressionIndex: 74, ecoScore: 70, avgSpeed: 82 },
    ]
  },
  d3: {
    id: 'd3',
    name: 'Elena Rodriguez',
    persona: 'Methodical Hyper-Miler',
    experienceYears: 12,
    skillRadar: [
      { axis: 'Acceleration Smoothness', score: 94, baseline: 92 },
      { axis: 'Braking Smoothness', score: 95, baseline: 94 },
      { axis: 'Cornering Control', score: 91, baseline: 90 },
      { axis: 'Driving Consistency', score: 96, baseline: 95 },
      { axis: 'Eco-Coasting Ratio', score: 92, baseline: 90 },
      { axis: 'Speed Adherence', score: 98, baseline: 96 },
    ],
    behaviorMetrics: {
      avgAccelerationJerk: 1.12,
      baselineJerk: 1.18,
      brakingDecelPeakG: 0.24,
      baselineBrakingG: 0.26,
      corneringLateralG: 0.18,
      speedVarianceKmh: 2.1,
      shortCityTripsCount: 22,
      longHighwayTripsCount: 48,
    },
    contextualPatterns: [
      {
        id: 'pat-er-1',
        title: 'Master-Class Momentum Preservation',
        highlight: 'Maintains optimal aero velocity envelope with 42% coasting utilization.',
        condition: 'Rolling topography & highway corridors',
        evidence: 'Brake pedal application 60% lower than fleet average.',
        severity: 'optimal'
      },
      {
        id: 'pat-er-2',
        title: 'Negligible Cold-Engine Wear',
        highlight: 'Maintains gentle sub-2,000 RPM pacing during first 12 minutes of warmup.',
        condition: 'Engine oil temperature < 80°C',
        evidence: 'Zero high-torque load requests recorded during warmup.',
        severity: 'optimal'
      }
    ],
    timeOfDayDistributions: [
      { period: 'Morning Rush (07-09)', aggressionIndex: 28, ecoScore: 92, avgSpeed: 42 },
      { period: 'Midday Transit (11-14)', aggressionIndex: 22, ecoScore: 96, avgSpeed: 70 },
      { period: 'Evening Commute (17-19)', aggressionIndex: 31, ecoScore: 90, avgSpeed: 46 },
      { period: 'Night Cruise (20-23)', aggressionIndex: 20, ecoScore: 97, avgSpeed: 74 },
    ]
  },
  d4: {
    id: 'd4',
    name: 'James Wilson',
    persona: 'Evolving Novice',
    experienceYears: 1,
    skillRadar: [
      { axis: 'Acceleration Smoothness', score: 68, baseline: 65 },
      { axis: 'Braking Smoothness', score: 71, baseline: 68 },
      { axis: 'Cornering Control', score: 74, baseline: 70 },
      { axis: 'Driving Consistency', score: 66, baseline: 64 },
      { axis: 'Eco-Coasting Ratio', score: 64, baseline: 60 },
      { axis: 'Speed Adherence', score: 86, baseline: 82 },
    ],
    behaviorMetrics: {
      avgAccelerationJerk: 1.98,
      baselineJerk: 2.10,
      brakingDecelPeakG: 0.46,
      baselineBrakingG: 0.49,
      corneringLateralG: 0.32,
      speedVarianceKmh: 6.8,
      shortCityTripsCount: 60,
      longHighwayTripsCount: 14,
    },
    contextualPatterns: [
      {
        id: 'pat-jw-1',
        title: 'Oscillating Throttle Tendency',
        highlight: 'Frequent micro-throttle adjustments during highway cruise increases fuel burn by 6.5%.',
        condition: 'Open highway 70-90 km/h',
        evidence: 'Speed fluctuates ±5 km/h rather than maintaining steady pedal position.',
        severity: 'caution'
      }
    ],
    timeOfDayDistributions: [
      { period: 'Morning Rush (07-09)', aggressionIndex: 70, ecoScore: 70, avgSpeed: 36 },
      { period: 'Midday Transit (11-14)', aggressionIndex: 54, ecoScore: 78, avgSpeed: 58 },
      { period: 'Evening Commute (17-19)', aggressionIndex: 68, ecoScore: 72, avgSpeed: 40 },
      { period: 'Night Cruise (20-23)', aggressionIndex: 48, ecoScore: 82, avgSpeed: 66 },
    ]
  }
};

// ==========================================
// 4. AI DRIVING OPTIMIZER (VEHICLE + DRIVER FUSION)
// ==========================================

export function computeAiDrivingOptimizer({
  vehicleId = 'v1',
  driverId = 'd1',
  liveTelemetry = null,
  whatIfSliders = { throttleSmoothing: 0, coastingBonus: 0, corneringSmoothing: 0 },
  engineTypeId = null
}) {
  const vehicle = VEHICLE_BASELINES[vehicleId] || VEHICLE_BASELINES.v1;
  const driver = DRIVER_BEHAVIORAL_PROFILES[driverId] || DRIVER_BEHAVIORAL_PROFILES.d1;
  const activeEngineId = engineTypeId || vehicle.engineTypeId || 'i4_petrol';
  const engineType = getEngineType(activeEngineId);
  const engineTwin = getEngineDigitalTwin(activeEngineId);
  const isBev = engineType.category === 'BEV';
  const isHybrid = engineType.category === 'HYBRID';

  // Driver metrics vs vehicle physics correlation
  const jerkDeltaPct = Math.round(((driver.behaviorMetrics.avgAccelerationJerk - driver.behaviorMetrics.baselineJerk) / driver.behaviorMetrics.baselineJerk) * 100);

  // Personalized Today's Driving Insight tailored to powertrain
  let todaysInsight = {
    headline: "Today's Driving Insight",
    observation: jerkDeltaPct > 0 
      ? `Your average acceleration was ${jerkDeltaPct}% higher than your normal pattern.`
      : `Your acceleration smoothness improved by ${Math.abs(jerkDeltaPct)}% over your historical baseline.`,
    metrics: {
      fuelEfficiencyImpact: jerkDeltaPct > 0 ? -7 : +4.5,
      drivingSmoothnessImpact: jerkDeltaPct > 0 ? -12 : +8,
      vehicleStress: jerkDeltaPct > 0 ? 'increased' : 'reduced',
      vehicleStressPct: jerkDeltaPct > 0 ? +14 : -9,
    },
    recommendation: isBev
      ? 'Modulate regenerative one-pedal braking to recover up to 60% of kinetic momentum.'
      : 'Use smoother acceleration during the first 10 minutes of your trip.',
    reasoning: isBev
      ? `On the ${engineType.label}, high jerk tip-ins trigger inverter current spikes that lower battery pack efficiency by 8%. Smooth pedal modulation maximizes regenerative capture.`
      : `On the ${vehicle.name} with ${engineType.shortLabel}, rapid cold throttle ramp rates consume 24% more fuel. Smoothing acceleration protects cylinder liners and saves fuel.`
  };

  // 3 Primary Outcome Pillars
  const smoothBonus = whatIfSliders.throttleSmoothing * 0.15;
  const coastBonus = whatIfSliders.coastingBonus * 0.12;
  const cornerBonus = whatIfSliders.corneringSmoothing * 0.08;

  // Pillar 1: SAFETY
  const baseSafetyScore = Math.round(
    (driver.skillRadar.reduce((acc, curr) => acc + curr.score, 0) / driver.skillRadar.length)
  );
  const safetyScore = Math.min(100, Math.round(baseSafetyScore + smoothBonus * 20 + cornerBonus * 15));
  const collisionRiskReductionPct = Math.round(18 + smoothBonus * 30 + cornerBonus * 20);

  // Pillar 2: EFFICIENCY
  const baselineEff = engineTwin.normalBaseline90d?.efficiency || vehicle.normalBaseline90d.fuelEfficiencyKmL;
  const effSavingPct = Math.round((7.4 + smoothBonus * 12 + coastBonus * 14) * 10) / 10;
  const projectedMonthlyUnitsSaved = Math.round((34 + (effSavingPct - 7.4) * 4.2) * 10) / 10;
  const unitPrice = engineType.defaultFuelPrice || 95;
  const projectedMonthlySavingsUsd = Math.round(projectedMonthlyUnitsSaved * (unitPrice / 80)); // USD equivalent
  const co2ReductionKg = Math.round(projectedMonthlyUnitsSaved * (isBev ? 0.71 : engineType.co2FactorKgPerUnit));

  // Pillar 3: HEALTH
  const componentStressReductionPct = Math.round((14 + smoothBonus * 18 + coastBonus * 15) * 10) / 10;
  const brakePadLifeExtensionDays = Math.round((isBev || isHybrid ? 65 : 32) + coastBonus * 45);
  const oilThermalDegradationDelayDays = isBev ? 0 : Math.round(21 + smoothBonus * 30);

  return {
    vehicle,
    driver,
    engineType,
    todaysInsight,
    pillars: {
      safety: {
        drivingScore: safetyScore,
        scoreDelta: safetyScore - baseSafetyScore,
        collisionRiskReductionPct,
        status: safetyScore >= 90 ? 'Elite Safe' : safetyScore >= 75 ? 'Optimal' : 'Needs Polish'
      },
      efficiency: {
        fuelSavingPct: effSavingPct,
        monthlyLitersSaved: projectedMonthlyUnitsSaved,
        monthlyUnitsSaved: projectedMonthlyUnitsSaved,
        monthlySavingsUsd: projectedMonthlySavingsUsd,
        co2ReductionKg,
        efficiencyKmPerL: Math.round((baselineEff * (1 + effSavingPct / 100)) * 10) / 10,
        mileageUnit: engineType.mileageUnit
      },
      health: {
        stressReductionPct: componentStressReductionPct,
        brakePadExtensionDays: brakePadLifeExtensionDays,
        oilLifeExtensionDays: oilThermalDegradationDelayDays,
        maintenanceRunwayStatus: isBev ? 'Battery Buffer Active' : 'Stress Buffer Active'
      }
    },
    actionCards: [
      {
        id: 'act-1',
        title: isBev ? 'Inverter Ramp Smoothing' : 'Thermal Ramp Moderation',
        category: 'Efficiency & Powertrain Life',
        targetPillar: 'EFFICIENCY',
        impactScore: isBev ? '+5.4% kWh Range' : '+4.8% Fuel Saved',
        advice: isBev 
          ? `Keep ${driver.name.split(' ')[0]}'s acceleration requests below 65 kW on urban stretches.`
          : `Keep ${driver.name.split(' ')[0]}'s cold-start throttle below 28% for initial 3.5 km.`,
        vehicleSpecific: isBev ? `Protects SiC gate drivers and mitigates cell heating in ${vehicle.name}.` : `Reduces thermal shock on ${engineType.shortLabel} bearing seals.`
      },
      {
        id: 'act-2',
        title: isBev ? 'Regen Kinetic Braking Wave' : 'Predictive Signal Coasting',
        category: 'Safety & Component Health',
        targetPillar: 'HEALTH',
        impactScore: isBev ? '+65 Days Pad Life' : '+35 Days Brake Life',
        advice: 'Release throttle early when approaching red signals to capture kinetic energy.',
        vehicleSpecific: isBev ? `Converts braking into ~0.8 kWh battery regeneration.` : `Saves kinetic energy dissipation and prevents brake rotor glazing.`
      },
      {
        id: 'act-3',
        title: 'Aero Sweet-Spot Cruise Lock',
        category: 'Long-Distance Optimization',
        targetPillar: 'EFFICIENCY',
        impactScore: '$28/mo Energy Cut',
        advice: `Engage cruise control at ${engineType.mileageParams?.sweetSpeedKmh || 68} km/h on expressways.`,
        vehicleSpecific: `Matches the aerodynamic sweet-spot envelope of ${vehicle.name}.`
      }
    ]
  };
}

// ==========================================
// 5. CLOSED-LOOP FEEDBACK ENGINE (THE INNOVATION)
// ==========================================

export const CLOSED_LOOP_STAGES = [
  {
    id: 1,
    key: 'VEHICLE_LEARNS',
    label: '1. Vehicle Learns',
    shortTitle: 'Vehicle Learns',
    description: 'Vehicle sensors & software continuously establish normal physical & thermal baselines.',
    dataFlow: 'Sensors (MAF, O2, RPM, Coolant, Load) ──> Rolling 90-Day Normal Baseline'
  },
  {
    id: 2,
    key: 'DRIVER_LEARNS',
    label: '2. Driver Learns',
    shortTitle: 'Driver Learns',
    description: 'Driver behavioral model dynamically records acceleration jerk, braking smoothness & habits.',
    dataFlow: 'Telematics (G-Force, Throttle, Time-of-Day) ──> Dynamic Driver Profile'
  },
  {
    id: 3,
    key: 'AI_ANALYZES',
    label: '3. AI Analyzes Both',
    shortTitle: 'AI Analyzes Both',
    description: 'AI core correlates vehicle physical physics against driver habits to find root causal links.',
    dataFlow: 'Vehicle Digital Twin ⨁ Driver Digital Twin ──> Multi-Variate Cross-Correlation'
  },
  {
    id: 4,
    key: 'AI_PREDICTS',
    label: '4. AI Predicts',
    shortTitle: 'AI Predicts',
    description: 'Predictive health engine identifies anomalies and generates personalized actionable optimizer insights.',
    dataFlow: 'Anomaly Detection + Optimizer ──> Targeted Personalized Driving Recommendations'
  },
  {
    id: 5,
    key: 'DRIVER_ADAPTS',
    label: '5. Driver Changes Behavior',
    shortTitle: 'Driver Changes Behavior',
    description: 'Driver adopts recommendations (or AI Agent smoothens throttle).',
    dataFlow: 'Action: Smoother launches, predictive deceleration, eco-band cruising'
  },
  {
    id: 6,
    key: 'VEHICLE_CHANGES',
    label: '6. Vehicle Data Changes',
    shortTitle: 'Vehicle Data Changes',
    description: 'Physical vehicle telemetry shifts: thermal spikes drop, fuel flow lowers, brake wear slows.',
    dataFlow: 'Telemetry shifts ──> Loop returns to Step 1: AI Learns Again (Self-Learning)'
  }
];

export const INITIAL_LEARNING_EPOCHS = [
  {
    epoch: 1,
    timestamp: '2026-09-24 08:30',
    trigger: 'Initial Baseline Ingestion',
    driverJerk: 2.12,
    vehicleEfficiency: 15.2,
    healthAnomalyScore: 48.5,
    synergyScore: 68,
    action: 'Identified aggressive cold-engine launches'
  },
  {
    epoch: 2,
    timestamp: '2026-09-27 14:15',
    trigger: 'AI Optimizer Recommendation Adopted',
    driverJerk: 1.84,
    vehicleEfficiency: 16.4,
    healthAnomalyScore: 28.0,
    synergyScore: 79,
    action: 'Driver smoothed initial 10-min acceleration'
  },
  {
    epoch: 3,
    timestamp: '2026-10-01 19:00',
    trigger: 'Closed-Loop Self-Learning Convergence',
    driverJerk: 1.56,
    vehicleEfficiency: 17.8,
    healthAnomalyScore: 12.4,
    synergyScore: 92,
    action: 'Thermal lag mitigated; fuel efficiency recovered +14%'
  }
];
