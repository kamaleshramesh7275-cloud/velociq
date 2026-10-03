/**
 * src/config/vehicleProfiles.js
 * 
 * Aerodynamic, mass, and powertrain compatibility profiles for vehicles in VelocIQ.
 * Extends the baseline Sedan, SUV, Hatchback, Truck profiles with:
 * - Pickup / LCV (Cd 0.45, Frontal Area 3.2 m^2)
 * - Motorcycle (Cd 0.70, Frontal Area 0.65 m^2)
 * - Hybrid/EV Aero Sedan (Cd 0.24, Frontal Area 2.15 m^2)
 * 
 * Each vehicle profile binds an allowed list of engineTypeIds and specifies a defaultEngineTypeId.
 */

export const VEHICLE_PROFILES = {
  hatchback: {
    id: 'hatchback',
    name: 'Eco Hatchback',
    shortName: 'Hatchback',
    category: 'Urban Compact',
    massKg: 1050,
    cd: 0.31,
    frontalAreaM2: 2.1,
    baseRollingResistance: 0.012,
    idleFuelRateLPerHr: 0.65,
    optimalSpeedKmh: 62,
    peakMileageKmL: 21.4,
    tankCapacityLiters: 42,
    fuelTankLiters: 42,
    allowedEngineTypeIds: ['i3_turbo', 'i4_petrol', 'i4_cng', 'bev_pmsm'],
    defaultEngineTypeId: 'i3_turbo'
  },

  sedan: {
    id: 'sedan',
    name: 'Executive Sedan',
    shortName: 'Sedan',
    category: 'Midsize Passenger',
    massKg: 1420,
    cd: 0.28,
    frontalAreaM2: 2.25,
    baseRollingResistance: 0.013,
    idleFuelRateLPerHr: 0.85,
    optimalSpeedKmh: 68,
    peakMileageKmL: 19.1,
    tankCapacityLiters: 50,
    fuelTankLiters: 50,
    allowedEngineTypeIds: ['i4_petrol', 'v6_petrol', 'boxer4', 'i4_diesel', 'i4_cng', 'hybrid_atkinson', 'bev_pmsm'],
    defaultEngineTypeId: 'i4_petrol'
  },

  hybrid_sedan: {
    id: 'hybrid_sedan',
    name: 'AeroStream HEV/EV Sedan',
    shortName: 'Aero Sedan',
    category: 'Ultra-Efficiency Sedan',
    massKg: 1560,
    cd: 0.24,
    frontalAreaM2: 2.15,
    baseRollingResistance: 0.010, // Low rolling resistance EV tires
    idleFuelRateLPerHr: 0.0,
    optimalSpeedKmh: 65,
    peakMileageKmL: 27.5,
    tankCapacityLiters: 45,
    fuelTankLiters: 45,
    allowedEngineTypeIds: ['hybrid_atkinson', 'bev_pmsm', 'i4_petrol'],
    defaultEngineTypeId: 'hybrid_atkinson'
  },

  suv: {
    id: 'suv',
    name: 'Performance SUV',
    shortName: 'SUV',
    category: 'Midsize SUV',
    massKg: 2050,
    cd: 0.38,
    frontalAreaM2: 2.85,
    baseRollingResistance: 0.016,
    idleFuelRateLPerHr: 1.20,
    optimalSpeedKmh: 58,
    peakMileageKmL: 14.8,
    tankCapacityLiters: 65,
    fuelTankLiters: 65,
    allowedEngineTypeIds: ['v6_petrol', 'v8_petrol', 'i4_diesel', 'hybrid_atkinson', 'bev_pmsm'],
    defaultEngineTypeId: 'v6_petrol'
  },

  pickup_lcv: {
    id: 'pickup_lcv',
    name: 'Commercial Pickup / LCV',
    shortName: 'Pickup / LCV',
    category: 'Light Commercial Vehicle',
    massKg: 2200,
    cd: 0.45,
    frontalAreaM2: 3.2,
    baseRollingResistance: 0.018,
    idleFuelRateLPerHr: 1.35,
    optimalSpeedKmh: 56,
    peakMileageKmL: 13.2,
    tankCapacityLiters: 75,
    fuelTankLiters: 75,
    allowedEngineTypeIds: ['i4_diesel', 'v8_petrol', 'i4_cng'],
    defaultEngineTypeId: 'i4_diesel'
  },

  truck: {
    id: 'truck',
    name: 'Heavy Duty Commercial Truck',
    shortName: 'Heavy Truck',
    category: 'Heavy Commercial Vehicle',
    massKg: 3200,
    cd: 0.52,
    frontalAreaM2: 3.8,
    baseRollingResistance: 0.020,
    idleFuelRateLPerHr: 1.80,
    optimalSpeedKmh: 52,
    peakMileageKmL: 10.5,
    tankCapacityLiters: 90,
    fuelTankLiters: 90,
    allowedEngineTypeIds: ['v8_petrol', 'i4_diesel'],
    defaultEngineTypeId: 'v8_petrol'
  },

  motorcycle: {
    id: 'motorcycle',
    name: 'Urban Commuter Motorcycle',
    shortName: 'Motorcycle',
    category: 'Two-Wheeler',
    massKg: 185,
    cd: 0.70,
    frontalAreaM2: 0.65,
    baseRollingResistance: 0.015,
    idleFuelRateLPerHr: 0.28,
    optimalSpeedKmh: 52,
    peakMileageKmL: 38.5,
    tankCapacityLiters: 14,
    fuelTankLiters: 14,
    allowedEngineTypeIds: ['single_4s', 'bev_pmsm'],
    defaultEngineTypeId: 'single_4s'
  }
};

export function getVehicleProfile(profileKey) {
  return VEHICLE_PROFILES[profileKey] || VEHICLE_PROFILES.sedan;
}

export function listVehicleProfiles() {
  return Object.values(VEHICLE_PROFILES);
}
