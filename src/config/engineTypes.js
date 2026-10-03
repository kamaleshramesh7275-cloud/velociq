/**
 * src/config/engineTypes.js
 * 
 * Central Data-Driven Powertrain Registry for VelocIQ.
 * Covers all 10 distinct engine / powertrain families:
 * 1. i4_petrol: Inline-4 Petrol NA (Default / Baseline)
 * 2. i3_turbo: Inline-3 Turbo Petrol (downsized, spool lag, wastegate)
 * 3. v6_petrol: 60° V6 Petrol (smooth high-output)
 * 4. v8_petrol: 90° V8 Petrol (cross-plane burble, high torque)
 * 5. boxer4: Flat-4 Boxer (180° horizontally opposed, low center of gravity)
 * 6. i4_diesel: Inline-4 Turbo Diesel (common-rail, VGT, DPF soot, EGR, DEF/AdBlue)
 * 7. single_4s: Single-Cylinder 4-Stroke (two-wheeler / thumper)
 * 8. i4_cng: Inline-4 Bi-Fuel CNG (kg fuel, tank pressure, derate, petrol fallback)
 * 9. hybrid_atkinson: Full Hybrid (Atkinson I4 + PMSM motor, battery pack, regen)
 * 10. bev_pmsm: Battery-Electric (Permanent Magnet Synchronous Motor, inverter, high-voltage pack)
 */

export const ENGINE_CATEGORIES = {
  ICE: 'ICE',
  HYBRID: 'HYBRID',
  BEV: 'BEV'
};

export const FUEL_TYPES = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  CNG: 'cng',
  ELECTRIC: 'electric'
};

export const MILEAGE_UNITS = {
  KM_PER_L: 'km/L',
  KM_PER_KG: 'km/kg',
  KM_PER_KWH: 'km/kWh'
};

export const ENGINE_TYPES = {
  i4_petrol: {
    id: 'i4_petrol',
    label: 'Inline-4 1.5L Petrol (NA)',
    shortLabel: 'I4 Petrol',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_i4',
    badgeText: '1.5L I4 DOHC NA',
    description: 'Naturally aspirated 4-cylinder petrol engine with variable valve timing. Smooth, balanced, and responsive.',
    
    // Geometry & Kinematics
    cylinders: 4,
    layout: 'INLINE', // INLINE | VEE | BOXER | SINGLE | BEV
    bankAngleDeg: 0,
    boreMm: 75.0,
    strokeMm: 84.8,
    rodLengthMm: 138.0,
    crankThrowAnglesDeg: [0, 180, 180, 0], // Cyl 1, 2, 3, 4
    cylinderBankMap: [0, 0, 0, 0], // All on Bank 0
    firingOrder: [1, 3, 4, 2],
    firingIntervalDeg: 180,

    // Operating Envelopes
    idleRpm: 800,
    redlineRpm: 6500,
    maxRpm: 6800,
    compressionRatio: 10.5,
    displacementL: 1.5,
    peakPowerKw: 85,    // @ 6000 RPM (~115 HP)
    peakPowerRpm: 6000,
    peakTorqueNm: 145,  // @ 4000 RPM
    peakTorqueRpm: 4000,
    // Dyno Spline Control Points: [rpm, torqueNm]
    torqueCurvePoints: [
      [800, 95],
      [1500, 118],
      [2500, 134],
      [4000, 145],
      [5000, 140],
      [6000, 135],
      [6500, 115]
    ],

    // Fuel & Energy
    fuelType: FUEL_TYPES.PETROL,
    energyDensity: 34200, // kJ/L
    thermalEfficiencyPeak: 0.28,
    co2FactorKgPerUnit: 2.31, // kg CO2 / L
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 45, // Liters
    defaultFuelPrice: 95.0, // INR/L or local currency

    // Mileage Curve Parameters M(v)
    mileageParams: {
      peakMileage: 18.5,
      sweetSpeedKmh: 68,
      alpha: 0.0018,
      beta: 0.000028,
      gamma: 1.1
    },

    // Thermal Setpoints (°C)
    thermal: {
      nominalCoolantC: 86,
      warningCoolantC: 102,
      criticalCoolantC: 112,
      nominalOilC: 90,
      warningOilC: 110,
      criticalOilC: 125,
      nominalHeadC: 92,
      nominalBlockC: 88,
      nominalExhaustC: 450,
      warningExhaustC: 750
    },

    // Subsystem Features
    features: {
      hasTurbo: false,
      hasEGR: false,
      hasDPF: false,
      hasSCR: false,
      hasGPF: false,
      hasThrottle: true,
      hasBattery: false, // Traction battery
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: false
    },

    faultCatalogKey: 'i4_petrol',
    maintenanceProfileKey: 'i4_petrol',
    digitalTwinProfileKey: 'i4_petrol',

    // 3D Model Exploded Parts & Thermal Zones
    explodedParts: ['cylinder_head', 'valve_cover', 'intake_plenum', 'exhaust_manifold', 'block', 'oil_pan'],
    thermalZones: ['head', 'block', 'coolant_loop', 'oil_circuit', 'exhaust']
  },

  i3_turbo: {
    id: 'i3_turbo',
    label: 'Inline-3 1.0L Turbo Petrol',
    shortLabel: 'I3 Turbo',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_turbo',
    badgeText: '1.0L I3 Turbo EcoBoost',
    description: 'Downsized 3-cylinder turbocharged engine. High low-end torque plateau with wastegate boost control and compact footprint.',
    
    cylinders: 3,
    layout: 'INLINE',
    bankAngleDeg: 0,
    boreMm: 71.9,
    strokeMm: 82.0,
    rodLengthMm: 132.0,
    crankThrowAnglesDeg: [0, 120, 240],
    cylinderBankMap: [0, 0, 0],
    firingOrder: [1, 2, 3],
    firingIntervalDeg: 240,

    idleRpm: 850,
    redlineRpm: 6000,
    maxRpm: 6500,
    compressionRatio: 10.0,
    displacementL: 1.0,
    peakPowerKw: 88,    // @ 5500 RPM (~118 HP)
    peakPowerRpm: 5500,
    peakTorqueNm: 172,  // @ 1800-4500 RPM (flat plateau)
    peakTorqueRpm: 2500,
    torqueCurvePoints: [
      [850, 110],
      [1500, 155],
      [1800, 172],
      [3000, 172],
      [4500, 170],
      [5500, 152],
      [6000, 130]
    ],

    fuelType: FUEL_TYPES.PETROL,
    energyDensity: 34200,
    thermalEfficiencyPeak: 0.30,
    co2FactorKgPerUnit: 2.31,
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 40,
    defaultFuelPrice: 95.0,

    mileageParams: {
      peakMileage: 20.8,
      sweetSpeedKmh: 64,
      alpha: 0.0016,
      beta: 0.000032,
      gamma: 1.15
    },

    thermal: {
      nominalCoolantC: 88,
      warningCoolantC: 104,
      criticalCoolantC: 114,
      nominalOilC: 94,
      warningOilC: 115,
      criticalOilC: 130,
      nominalHeadC: 95,
      nominalBlockC: 89,
      nominalExhaustC: 580,
      warningExhaustC: 880,
      nominalTurboC: 520
    },

    features: {
      hasTurbo: true,
      hasEGR: true,
      hasDPF: false,
      hasSCR: false,
      hasGPF: true,
      hasThrottle: true,
      hasBattery: false,
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: false
    },

    faultCatalogKey: 'i3_turbo',
    maintenanceProfileKey: 'i3_turbo',
    digitalTwinProfileKey: 'i3_turbo',

    explodedParts: ['cylinder_head', 'valve_cover', 'turbocharger', 'intercooler_pipe', 'block', 'oil_pan'],
    thermalZones: ['head', 'block', 'turbo', 'exhaust', 'coolant_loop']
  },

  v6_petrol: {
    id: 'v6_petrol',
    label: '3.5L 60° V6 Petrol',
    shortLabel: 'V6 3.5L',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_v6',
    badgeText: '3.5L 60° V6 Quad-Cam',
    description: 'Naturally aspirated 60-degree V6 with dual cylinder heads. Exceptional high-rev power delivery and refined balance.',
    
    cylinders: 6,
    layout: 'VEE',
    bankAngleDeg: 60,
    boreMm: 94.0,
    strokeMm: 83.0,
    rodLengthMm: 147.0,
    // 3 crankpins with 60° offset split pins:
    crankThrowAnglesDeg: [0, 60, 120, 180, 240, 300],
    cylinderBankMap: [0, 1, 0, 1, 0, 1], // Alternating Left/Right
    firingOrder: [1, 4, 2, 5, 3, 6],
    firingIntervalDeg: 120,

    idleRpm: 700,
    redlineRpm: 6500,
    maxRpm: 7000,
    compressionRatio: 11.0,
    displacementL: 3.5,
    peakPowerKw: 210,   // @ 6200 RPM (~282 HP)
    peakPowerRpm: 6200,
    peakTorqueNm: 350,  // @ 4700 RPM
    peakTorqueRpm: 4700,
    torqueCurvePoints: [
      [700, 220],
      [1500, 260],
      [2500, 305],
      [3800, 335],
      [4700, 350],
      [5800, 340],
      [6500, 305]
    ],

    fuelType: FUEL_TYPES.PETROL,
    energyDensity: 34200,
    thermalEfficiencyPeak: 0.29,
    co2FactorKgPerUnit: 2.31,
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 65,
    defaultFuelPrice: 95.0,

    mileageParams: {
      peakMileage: 13.5,
      sweetSpeedKmh: 72,
      alpha: 0.0022,
      beta: 0.000030,
      gamma: 1.05
    },

    thermal: {
      nominalCoolantC: 87,
      warningCoolantC: 103,
      criticalCoolantC: 115,
      nominalOilC: 92,
      warningOilC: 112,
      criticalOilC: 128,
      nominalHeadC: 94,
      nominalBlockC: 90,
      nominalExhaustC: 500,
      warningExhaustC: 780
    },

    features: {
      hasTurbo: false,
      hasEGR: true,
      hasDPF: false,
      hasSCR: false,
      hasGPF: false,
      hasThrottle: true,
      hasBattery: false,
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: false
    },

    faultCatalogKey: 'v6_petrol',
    maintenanceProfileKey: 'v6_petrol',
    digitalTwinProfileKey: 'v6_petrol',

    explodedParts: ['bank_left_head', 'bank_right_head', 'intake_surge_tank', 'v_block', 'crankshaft', 'oil_pan'],
    thermalZones: ['bank_left', 'bank_right', 'block', 'exhaust_l', 'exhaust_r']
  },

  v8_petrol: {
    id: 'v8_petrol',
    label: '5.0L 90° V8 Cross-Plane',
    shortLabel: 'V8 5.0L',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_v8',
    badgeText: '5.0L 90° V8 Cross-Plane',
    description: 'High-displacement 90° cross-plane V8 engine. Massive low-end torque with characteristic cross-plane firing pulses.',
    
    cylinders: 8,
    layout: 'VEE',
    bankAngleDeg: 90,
    boreMm: 93.0,
    strokeMm: 92.7,
    rodLengthMm: 150.7,
    crankThrowAnglesDeg: [0, 90, 270, 180, 0, 90, 270, 180],
    cylinderBankMap: [0, 1, 0, 1, 0, 1, 0, 1],
    firingOrder: [1, 8, 4, 3, 6, 5, 7, 2],
    firingIntervalDeg: 90,

    idleRpm: 650,
    redlineRpm: 6800,
    maxRpm: 7200,
    compressionRatio: 10.5,
    displacementL: 5.0,
    peakPowerKw: 330,   // @ 6500 RPM (~445 HP)
    peakPowerRpm: 6500,
    peakTorqueNm: 530,  // @ 4500 RPM
    peakTorqueRpm: 4500,
    torqueCurvePoints: [
      [650, 340],
      [1500, 420],
      [2800, 480],
      [4500, 530],
      [5500, 510],
      [6500, 480],
      [6800, 440]
    ],

    fuelType: FUEL_TYPES.PETROL,
    energyDensity: 34200,
    thermalEfficiencyPeak: 0.28,
    co2FactorKgPerUnit: 2.31,
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 80,
    defaultFuelPrice: 95.0,

    mileageParams: {
      peakMileage: 10.2,
      sweetSpeedKmh: 75,
      alpha: 0.0028,
      beta: 0.000035,
      gamma: 1.05
    },

    thermal: {
      nominalCoolantC: 88,
      warningCoolantC: 105,
      criticalCoolantC: 116,
      nominalOilC: 96,
      warningOilC: 118,
      criticalOilC: 132,
      nominalHeadC: 96,
      nominalBlockC: 92,
      nominalExhaustC: 540,
      warningExhaustC: 820
    },

    features: {
      hasTurbo: false,
      hasEGR: true,
      hasDPF: false,
      hasSCR: false,
      hasGPF: false,
      hasThrottle: true,
      hasBattery: false,
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: false
    },

    faultCatalogKey: 'v8_petrol',
    maintenanceProfileKey: 'v8_petrol',
    digitalTwinProfileKey: 'v8_petrol',

    explodedParts: ['bank1_head', 'bank2_head', 'tunnel_ram_plenum', 'v8_block', 'crankshaft', 'dual_exhaust'],
    thermalZones: ['bank1', 'bank2', 'block', 'oil_pan', 'headers']
  },

  boxer4: {
    id: 'boxer4',
    label: '2.0L Flat-4 Boxer',
    shortLabel: 'Boxer-4',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_boxer',
    badgeText: '2.0L 180° Flat-4 Boxer',
    description: 'Horizontally opposed 4-cylinder engine with pistons moving toward and away from each other. Ultra-low center of gravity.',
    
    cylinders: 4,
    layout: 'BOXER',
    bankAngleDeg: 180,
    boreMm: 84.0,
    strokeMm: 90.0,
    rodLengthMm: 130.5,
    crankThrowAnglesDeg: [0, 180, 180, 0],
    cylinderBankMap: [0, 1, 0, 1], // Bank 0 (Left), Bank 1 (Right)
    firingOrder: [1, 3, 2, 4],
    firingIntervalDeg: 180,

    idleRpm: 750,
    redlineRpm: 7000,
    maxRpm: 7400,
    compressionRatio: 12.0,
    displacementL: 2.0,
    peakPowerKw: 115,   // @ 6000 RPM (~154 HP)
    peakPowerRpm: 6000,
    peakTorqueNm: 205,  // @ 4000 RPM
    peakTorqueRpm: 4000,
    torqueCurvePoints: [
      [750, 140],
      [1500, 168],
      [2800, 192],
      [4000, 205],
      [5200, 198],
      [6000, 182],
      [7000, 155]
    ],

    fuelType: FUEL_TYPES.PETROL,
    energyDensity: 34200,
    thermalEfficiencyPeak: 0.29,
    co2FactorKgPerUnit: 2.31,
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 50,
    defaultFuelPrice: 95.0,

    mileageParams: {
      peakMileage: 16.8,
      sweetSpeedKmh: 68,
      alpha: 0.0019,
      beta: 0.000029,
      gamma: 1.10
    },

    thermal: {
      nominalCoolantC: 86,
      warningCoolantC: 102,
      criticalCoolantC: 112,
      nominalOilC: 92,
      warningOilC: 114,
      criticalOilC: 128,
      nominalHeadC: 93,
      nominalBlockC: 88,
      nominalExhaustC: 480,
      warningExhaustC: 760
    },

    features: {
      hasTurbo: false,
      hasEGR: true,
      hasDPF: false,
      hasSCR: false,
      hasGPF: false,
      hasThrottle: true,
      hasBattery: false,
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: false
    },

    faultCatalogKey: 'boxer4',
    maintenanceProfileKey: 'boxer4',
    digitalTwinProfileKey: 'boxer4',

    explodedParts: ['left_opposed_head', 'right_opposed_head', 'split_crankcase', 'crankshaft', 'oil_sump'],
    thermalZones: ['head_left', 'head_right', 'crankcase', 'exhaust_runners']
  },

  i4_diesel: {
    id: 'i4_diesel',
    label: '2.0L Turbo Diesel (Common-Rail, VGT)',
    shortLabel: 'I4 Diesel',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_diesel',
    badgeText: '2.0L CRDi VGT Clean Diesel',
    description: 'High-pressure common-rail diesel with variable geometry turbo. High torque at low RPM, EGR, DPF soot loading, and AdBlue SCR.',
    
    cylinders: 4,
    layout: 'INLINE',
    bankAngleDeg: 0,
    boreMm: 83.0,
    strokeMm: 92.0,
    rodLengthMm: 145.0,
    crankThrowAnglesDeg: [0, 180, 180, 0],
    cylinderBankMap: [0, 0, 0, 0],
    firingOrder: [1, 3, 4, 2],
    firingIntervalDeg: 180,

    idleRpm: 800,
    redlineRpm: 4800,
    maxRpm: 5200,
    compressionRatio: 16.5, // High compression ignition
    displacementL: 2.0,
    peakPowerKw: 110,   // @ 4000 RPM (~148 HP)
    peakPowerRpm: 4000,
    peakTorqueNm: 350,  // @ 1750-2500 RPM (strong low-end)
    peakTorqueRpm: 2100,
    torqueCurvePoints: [
      [800, 190],
      [1400, 290],
      [1750, 350],
      [2500, 350],
      [3500, 300],
      [4000, 260],
      [4800, 180]
    ],

    fuelType: FUEL_TYPES.DIESEL,
    energyDensity: 38600, // kJ/L (higher than petrol)
    thermalEfficiencyPeak: 0.35, // High thermal efficiency
    co2FactorKgPerUnit: 2.68, // kg CO2 / L diesel
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 55,
    defaultFuelPrice: 88.0,

    mileageParams: {
      peakMileage: 22.4, // Flatter and peaks higher
      sweetSpeedKmh: 70,
      alpha: 0.0013,
      beta: 0.000022,
      gamma: 1.2
    },

    thermal: {
      nominalCoolantC: 85,
      warningCoolantC: 100,
      criticalCoolantC: 110,
      nominalOilC: 92,
      warningOilC: 112,
      criticalOilC: 125,
      nominalHeadC: 92,
      nominalBlockC: 86,
      nominalExhaustC: 410,
      warningExhaustC: 720,
      nominalDpfC: 550 // For active regen
    },

    features: {
      hasTurbo: true,
      hasEGR: true,
      hasDPF: true,
      hasSCR: true, // AdBlue / DEF
      hasGPF: false,
      hasThrottle: false, // Quantity controlled via fuel injection
      hasBattery: false,
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: false
    },

    faultCatalogKey: 'i4_diesel',
    maintenanceProfileKey: 'i4_diesel',
    digitalTwinProfileKey: 'i4_diesel',

    explodedParts: ['cylinder_head', 'common_rail', 'vgt_turbo', 'egr_valve', 'dpf_canister', 'block', 'oil_pan'],
    thermalZones: ['head', 'block', 'turbo', 'dpf', 'scr']
  },

  single_4s: {
    id: 'single_4s',
    label: '350cc Single-Cylinder 4-Stroke',
    shortLabel: 'Single 350',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_single',
    badgeText: '350cc Single 4-Stroke Thumper',
    description: 'Air-cooled single-cylinder motorcycle engine. High idle, sharp rev drop, simple architecture, lightweight.',
    
    cylinders: 1,
    layout: 'SINGLE',
    bankAngleDeg: 0,
    boreMm: 72.0,
    strokeMm: 85.8,
    rodLengthMm: 125.0,
    crankThrowAnglesDeg: [0],
    cylinderBankMap: [0],
    firingOrder: [1],
    firingIntervalDeg: 720, // 1 power stroke every 2 revolutions

    idleRpm: 1200,
    redlineRpm: 7000,
    maxRpm: 7500,
    compressionRatio: 9.5,
    displacementL: 0.35,
    peakPowerKw: 15,    // @ 6100 RPM (~20.2 HP)
    peakPowerRpm: 6100,
    peakTorqueNm: 27,   // @ 4000 RPM
    peakTorqueRpm: 4000,
    torqueCurvePoints: [
      [1200, 16],
      [2200, 22],
      [3200, 25.5],
      [4000, 27],
      [5200, 24],
      [6100, 23.5],
      [7000, 18]
    ],

    fuelType: FUEL_TYPES.PETROL,
    energyDensity: 34200,
    thermalEfficiencyPeak: 0.26,
    co2FactorKgPerUnit: 2.31,
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 14, // Motorcycle tank
    defaultFuelPrice: 95.0,

    mileageParams: {
      peakMileage: 38.5, // High mileage, but steeper drop at high speeds
      sweetSpeedKmh: 52,
      alpha: 0.0035,
      beta: 0.000045,
      gamma: 1.25
    },

    thermal: {
      nominalCoolantC: 92, // Air/oil head temp
      warningCoolantC: 115,
      criticalCoolantC: 130,
      nominalOilC: 98,
      warningOilC: 120,
      criticalOilC: 135,
      nominalHeadC: 105,
      nominalBlockC: 95,
      nominalExhaustC: 490,
      warningExhaustC: 750
    },

    features: {
      hasTurbo: false,
      hasEGR: false,
      hasDPF: false,
      hasSCR: false,
      hasGPF: false,
      hasThrottle: true,
      hasBattery: false,
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: false
    },

    faultCatalogKey: 'single_4s',
    maintenanceProfileKey: 'single_4s',
    digitalTwinProfileKey: 'single_4s',

    explodedParts: ['cylinder_head_fins', 'cylinder_barrel', 'piston', 'crankshaft', 'unit_crankcase'],
    thermalZones: ['finned_head', 'cylinder_barrel', 'crankcase', 'exhaust_header']
  },

  i4_cng: {
    id: 'i4_cng',
    label: '1.5L Inline-4 Bi-Fuel CNG',
    shortLabel: 'I4 Bi-Fuel CNG',
    category: ENGINE_CATEGORIES.ICE,
    iconKey: 'engine_cng',
    badgeText: '1.5L Bi-Fuel CNG / Petrol',
    description: 'Dedicated high-compression CNG bi-fuel engine with electronic pressure regulator, multi-point gas injectors, and seamless petrol fallback.',
    
    cylinders: 4,
    layout: 'INLINE',
    bankAngleDeg: 0,
    boreMm: 74.0,
    strokeMm: 85.0,
    rodLengthMm: 135.0,
    crankThrowAnglesDeg: [0, 180, 180, 0],
    cylinderBankMap: [0, 0, 0, 0],
    firingOrder: [1, 3, 4, 2],
    firingIntervalDeg: 180,

    idleRpm: 800,
    redlineRpm: 6200,
    maxRpm: 6500,
    compressionRatio: 12.0, // Higher CR for CNG
    displacementL: 1.5,
    peakPowerKw: 70,    // @ 5800 RPM (~94 HP on CNG, ~14% derate vs petrol)
    peakPowerRpm: 5800,
    peakTorqueNm: 120,  // @ 3500 RPM
    peakTorqueRpm: 3500,
    torqueCurvePoints: [
      [800, 78],
      [1500, 95],
      [2500, 112],
      [3500, 120],
      [4500, 116],
      [5500, 108],
      [6200, 92]
    ],

    fuelType: FUEL_TYPES.CNG,
    energyDensity: 48000, // kJ/kg CNG
    thermalEfficiencyPeak: 0.27,
    co2FactorKgPerUnit: 2.75, // kg CO2 / kg CNG (lower net per km due to high energy density)
    mileageUnit: MILEAGE_UNITS.KM_PER_KG,
    fuelCapacityDefault: 10, // 10 kg CNG tank (60L water capacity cylinder)
    tankPressureBarMax: 200, // Full tank
    defaultFuelPrice: 76.0, // INR/kg

    mileageParams: {
      peakMileage: 26.5, // km/kg
      sweetSpeedKmh: 65,
      alpha: 0.0017,
      beta: 0.000030,
      gamma: 1.12
    },

    thermal: {
      nominalCoolantC: 88,
      warningCoolantC: 104,
      criticalCoolantC: 114,
      nominalOilC: 92,
      warningOilC: 114,
      criticalOilC: 128,
      nominalHeadC: 96, // Runs slightly hotter valves on dry CNG
      nominalBlockC: 88,
      nominalExhaustC: 480,
      warningExhaustC: 770
    },

    features: {
      hasTurbo: false,
      hasEGR: true,
      hasDPF: false,
      hasSCR: false,
      hasGPF: false,
      hasThrottle: true,
      hasBattery: false,
      hasMotor: false,
      hasRegen: false,
      hasDualFuel: true // Automatic petrol fallback below 12 bar
    },

    faultCatalogKey: 'i4_cng',
    maintenanceProfileKey: 'i4_cng',
    digitalTwinProfileKey: 'i4_cng',

    explodedParts: ['cylinder_head', 'gas_injectors', 'cng_regulator', 'high_pressure_lines', 'block', 'oil_pan'],
    thermalZones: ['head', 'block', 'regulator', 'exhaust']
  },

  hybrid_atkinson: {
    id: 'hybrid_atkinson',
    label: '1.8L Full Hybrid (Atkinson I4 + PMSM)',
    shortLabel: 'Full Hybrid',
    category: ENGINE_CATEGORIES.HYBRID,
    iconKey: 'engine_hybrid',
    badgeText: '1.8L Atkinson I4 + e-Motor HEV',
    description: 'High-expansion ratio Atkinson-cycle I4 paired with 53 kW permanent-magnet motor, power-split planetary gearbox, and 1.3 kWh lithium pack.',
    
    cylinders: 4,
    layout: 'INLINE',
    bankAngleDeg: 0,
    boreMm: 80.5,
    strokeMm: 88.3,
    rodLengthMm: 140.0,
    crankThrowAnglesDeg: [0, 180, 180, 0],
    cylinderBankMap: [0, 0, 0, 0],
    firingOrder: [1, 3, 4, 2],
    firingIntervalDeg: 180,

    idleRpm: 0, // Engine can shut off completely in EV mode
    redlineRpm: 5200,
    maxRpm: 5500,
    compressionRatio: 13.0, // High expansion ratio
    displacementL: 1.8,
    peakPowerKw: 103,   // Combined system: 72 kW ICE + 53 kW motor
    peakPowerRpm: 5200,
    peakTorqueNm: 250,  // Combined system torque (electric torque from 0 RPM)
    peakTorqueRpm: 1500,
    torqueCurvePoints: [
      [0, 210],    // Electric assist instantly at 0 RPM
      [1000, 240],
      [2000, 250],
      [3500, 235],
      [4500, 210],
      [5200, 180]
    ],

    fuelType: FUEL_TYPES.PETROL,
    energyDensity: 34200,
    thermalEfficiencyPeak: 0.36, // Exceptionally high Atkinson efficiency
    co2FactorKgPerUnit: 2.31,
    mileageUnit: MILEAGE_UNITS.KM_PER_L,
    fuelCapacityDefault: 43,
    defaultFuelPrice: 95.0,
    batteryCapacityKwh: 1.3,
    batteryVoltageNominal: 207.2,

    mileageParams: {
      peakMileage: 27.2, // Very high in city stop-and-go
      sweetSpeedKmh: 60,
      alpha: 0.0012,
      beta: 0.000020,
      gamma: 1.25
    },

    thermal: {
      nominalCoolantC: 84,
      warningCoolantC: 98,
      criticalCoolantC: 108,
      nominalOilC: 88,
      warningOilC: 108,
      criticalOilC: 122,
      nominalHeadC: 88,
      nominalBlockC: 84,
      nominalExhaustC: 400,
      warningExhaustC: 680,
      nominalInverterC: 55,
      nominalBatteryC: 32
    },

    features: {
      hasTurbo: false,
      hasEGR: true,
      hasDPF: false,
      hasSCR: false,
      hasGPF: true,
      hasThrottle: true,
      hasBattery: true,
      hasMotor: true,
      hasRegen: true,
      hasDualFuel: false
    },

    faultCatalogKey: 'hybrid_atkinson',
    maintenanceProfileKey: 'hybrid_atkinson',
    digitalTwinProfileKey: 'hybrid_atkinson',

    explodedParts: ['atkinson_head', 'transaxle_motor', 'power_split_gear', 'inverter_module', 'engine_block', 'traction_pack'],
    thermalZones: ['ice_head', 'ice_block', 'inverter', 'motor_generator', 'hybrid_battery']
  },

  bev_pmsm: {
    id: 'bev_pmsm',
    label: '150 kW Permanent-Magnet EV (PMSM)',
    shortLabel: 'Pure Electric',
    category: ENGINE_CATEGORIES.BEV,
    iconKey: 'engine_bev',
    badgeText: '150 kW PMSM + 60 kWh Pack',
    description: 'High-efficiency liquid-cooled Permanent Magnet Synchronous Motor with integrated SiC inverter, single-speed reduction, and 360V 60 kWh pack.',
    
    cylinders: 0,
    layout: 'BEV',
    bankAngleDeg: 0,
    boreMm: 0,
    strokeMm: 0,
    rodLengthMm: 0,
    crankThrowAnglesDeg: [],
    cylinderBankMap: [],
    firingOrder: [],
    firingIntervalDeg: 0,

    idleRpm: 0,
    redlineRpm: 14000,
    maxRpm: 15000,
    compressionRatio: 0,
    displacementL: 0,
    peakPowerKw: 150,   // ~201 HP
    peakPowerRpm: 4500,
    peakTorqueNm: 310,  // Flat from 0 to 4500 RPM, then constant power
    peakTorqueRpm: 1000,
    torqueCurvePoints: [
      [0, 310],
      [2000, 310],
      [4500, 310],
      [7000, 204],
      [10000, 143],
      [14000, 102]
    ],

    fuelType: FUEL_TYPES.ELECTRIC,
    energyDensity: 3600, // 1 kWh = 3600 kJ
    thermalEfficiencyPeak: 0.88, // Battery-to-wheel overall drivetrain efficiency
    co2FactorKgPerUnit: 0.71, // Grid factor (default 0.71 kg/kWh India grid average)
    tailpipeCo2Factor: 0.0,  // Zero tailpipe emissions
    mileageUnit: MILEAGE_UNITS.KM_PER_KWH,
    fuelCapacityDefault: 60, // 60 kWh battery
    defaultFuelPrice: 12.0,  // INR/kWh
    batteryCapacityKwh: 60,
    batteryVoltageNominal: 360,

    mileageParams: {
      peakMileage: 6.8, // km/kWh (equivalent to ~147 Wh/km)
      sweetSpeedKmh: 45, // EV is most efficient at city speeds
      alpha: 0.0010,
      beta: 0.000045, // Drops faster with v^2 and v^3 due to aerodynamic drag
      gamma: 1.35
    },

    thermal: {
      nominalCoolantC: 38, // Battery / inverter cooling loop
      warningCoolantC: 55,
      criticalCoolantC: 68,
      nominalOilC: 50, // Reduction gearbox oil
      warningOilC: 75,
      criticalOilC: 90,
      nominalMotorStatorC: 65,
      warningMotorStatorC: 110,
      criticalMotorStatorC: 135,
      nominalInverterC: 50,
      warningInverterC: 85,
      criticalInverterC: 105,
      nominalBatteryC: 28,
      warningBatteryC: 45,
      criticalBatteryC: 58
    },

    features: {
      hasTurbo: false,
      hasEGR: false,
      hasDPF: false,
      hasSCR: false,
      hasGPF: false,
      hasThrottle: false, // Inverter torque request
      hasBattery: true,
      hasMotor: true,
      hasRegen: true,
      hasDualFuel: false
    },

    faultCatalogKey: 'bev_pmsm',
    maintenanceProfileKey: 'bev_pmsm',
    digitalTwinProfileKey: 'bev_pmsm',

    explodedParts: ['stator_housing', 'pmsm_rotor', 'reduction_gearbox', 'sic_inverter', 'hv_junction_box', 'battery_pack'],
    thermalZones: ['stator', 'rotor', 'inverter_sic', 'battery_cells', 'gearbox']
  }
};

/**
 * Returns the engine type configuration by ID. Falls back to i4_petrol if not found.
 */
export function getEngineType(id) {
  return ENGINE_TYPES[id] || ENGINE_TYPES.i4_petrol;
}

/**
 * Lists all registered engine types as an array.
 */
export function listEngineTypes() {
  return Object.values(ENGINE_TYPES);
}

/**
 * Evaluates torque at a given RPM from the control points using monotone cubic Hermite interpolation.
 */
export function evaluateTorqueAtRpm(engineTypeOrId, rpm) {
  const engine = typeof engineTypeOrId === 'string' ? getEngineType(engineTypeOrId) : engineTypeOrId;
  const points = engine.torqueCurvePoints;
  if (!points || points.length === 0) return engine.peakTorqueNm;

  const clampedRpm = Math.max(points[0][0], Math.min(points[points.length - 1][0], rpm));

  // Find bounding segment
  for (let i = 0; i < points.length - 1; i++) {
    const [r0, t0] = points[i];
    const [r1, t1] = points[i + 1];
    if (clampedRpm >= r0 && clampedRpm <= r1) {
      const frac = (clampedRpm - r0) / (r1 - r0);
      // Smooth Hermite blend
      const smoothFrac = frac * frac * (3 - 2 * frac);
      return t0 + (t1 - t0) * smoothFrac;
    }
  }

  return points[points.length - 1][1];
}

/**
 * Computes brake power in kW from torque (Nm) and RPM:
 * Power (kW) = (Torque (Nm) * RPM * 2 * pi) / (60 * 1000)
 */
export function computePowerKw(torqueNm, rpm) {
  return (torqueNm * rpm * Math.PI * 2) / 60000;
}
