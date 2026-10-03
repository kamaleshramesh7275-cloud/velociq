/**
 * src/utils/engineDigitalTwins.js
 * 
 * Per-Engine Digital Twin Baselines, Drift Metrics, and Remaining Useful Life (RUL) Profiles.
 * Maps every powertrain family to tailored 90-day baselines and wear runways.
 */

export const ENGINE_DIGITAL_TWINS = {
  i4_petrol: {
    engineId: 'i4_petrol',
    name: '1.5L Inline-4 DOHC Petrol',
    normalBaseline90d: {
      efficiency: 17.8, // km/L
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 86.0,
      idleAirFlow: 2.4, // g/s MAF
      cruiseAirFlow: 8.8,
      vibrationIndex: 1.15,
      nominalBrakeWearPer1kKm: 0.32,
      batteryVoltageResting: 12.6,
      batteryVoltageCharging: 14.1,
      coldStartTimeSec: 210,
      oilShearIndex: 1.02
    },
    wearRunways: {
      engineOil: { label: 'Engine Oil', healthPct: 78, daysRemaining: 95, kmRemaining: 7500, status: 'Healthy' },
      brakes: { label: 'Brake Pads', healthPct: 84, daysRemaining: 180, kmRemaining: 14000, status: 'Healthy' },
      battery: { label: '12V Starter Battery', healthPct: 92, daysRemaining: 410, kmRemaining: 32000, status: 'Optimal' },
      coolingSystem: { label: 'Cooling System', healthPct: 88, daysRemaining: 240, kmRemaining: 19500, status: 'Healthy' }
    },
    xaiFactors: [
      { factor: 'O2 Sensor Thermal Drift', contributionPct: 34, impact: '+4.2% Fuel Penalty', risk: 'Medium' },
      { factor: 'Tire Rolling Resistance / Pressure', contributionPct: 31, impact: '-3.8% Energy Loss', risk: 'Moderate' },
      { factor: 'Thermostat Thermal Lag', contributionPct: 35, impact: '+4.4% Inefficient Choke Cycle', risk: 'Medium-High' }
    ]
  },

  i3_turbo: {
    engineId: 'i3_turbo',
    name: '1.0L Inline-3 Turbocharged Petrol',
    normalBaseline90d: {
      efficiency: 20.2,
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 88.0,
      idleAirFlow: 1.9,
      cruiseAirFlow: 7.2,
      vibrationIndex: 1.35,
      nominalBrakeWearPer1kKm: 0.30,
      batteryVoltageResting: 12.6,
      batteryVoltageCharging: 14.2,
      coldStartTimeSec: 180,
      turboBearingFilmIndex: 1.10
    },
    wearRunways: {
      turboBearings: { label: 'Turbo Bearings', healthPct: 86, daysRemaining: 260, kmRemaining: 21000, status: 'Healthy' },
      engineOil: { label: 'Synthetic 0W-20 Oil', healthPct: 72, daysRemaining: 80, kmRemaining: 6200, status: 'Healthy' },
      brakes: { label: 'Brake Pads', healthPct: 88, daysRemaining: 220, kmRemaining: 17500, status: 'Optimal' },
      sparkPlugs: { label: 'Iridium Spark Plugs', healthPct: 82, daysRemaining: 190, kmRemaining: 15000, status: 'Healthy' }
    },
    xaiFactors: [
      { factor: 'Wastegate Actuator Calibration', contributionPct: 40, impact: '-5.2% Boost Response', risk: 'Medium' },
      { factor: 'Intercooler Thermal Heat Soak', contributionPct: 32, impact: '-3.5% Air Density Charge', risk: 'Moderate' },
      { factor: 'Cold Enrichment Throttle Tip-in', contributionPct: 28, impact: '+4.1% Cold Trip Penalty', risk: 'Low' }
    ]
  },

  v6_petrol: {
    engineId: 'v6_petrol',
    name: '3.5L 60° V6 Quad-Cam Petrol',
    normalBaseline90d: {
      efficiency: 13.2,
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 87.0,
      idleAirFlow: 3.8,
      cruiseAirFlow: 12.5,
      vibrationIndex: 0.85,
      nominalBrakeWearPer1kKm: 0.42,
      batteryVoltageResting: 12.5,
      batteryVoltageCharging: 14.1,
      coldStartTimeSec: 240,
      vvtCamPhaserJitterMs: 1.2
    },
    wearRunways: {
      engineOil: { label: 'Engine Oil', healthPct: 68, daysRemaining: 70, kmRemaining: 5400, status: 'Healthy' },
      brakes: { label: 'Brake Pads', healthPct: 76, daysRemaining: 140, kmRemaining: 11000, status: 'Healthy' },
      timingBelt: { label: 'Quad-Cam Timing Belt', healthPct: 91, daysRemaining: 380, kmRemaining: 30000, status: 'Optimal' },
      catalyticConverters: { label: 'Dual Catalytic Converters', healthPct: 89, daysRemaining: 320, kmRemaining: 25000, status: 'Optimal' }
    },
    xaiFactors: [
      { factor: 'Dual-Bank Fuel Trim Divergence', contributionPct: 42, impact: '+4.8% Bank-2 Fuel Burn', risk: 'Medium' },
      { factor: 'High-RPM Inertial Pumping Loss', contributionPct: 36, impact: '-4.0% Cruise Efficiency', risk: 'Moderate' },
      { factor: 'VVT Hydraulic Phase Lag', contributionPct: 22, impact: '-2.5% Low-End Torque', risk: 'Low' }
    ]
  },

  v8_petrol: {
    engineId: 'v8_petrol',
    name: '5.0L 90° Cross-Plane V8',
    normalBaseline90d: {
      efficiency: 10.1,
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 88.0,
      idleAirFlow: 5.2,
      cruiseAirFlow: 16.8,
      vibrationIndex: 1.10,
      nominalBrakeWearPer1kKm: 0.58,
      batteryVoltageResting: 12.4,
      batteryVoltageCharging: 14.2,
      coldStartTimeSec: 300,
      oilFilmThicknessMicrons: 3.8
    },
    wearRunways: {
      engineOil: { label: 'High-Shear V8 Oil', healthPct: 62, daysRemaining: 55, kmRemaining: 4200, status: 'Attention Soon' },
      brakes: { label: 'Heavy-Duty Brake Rotors', healthPct: 68, daysRemaining: 95, kmRemaining: 7400, status: 'Healthy' },
      crankBearings: { label: 'Main Journal Bearings', healthPct: 85, daysRemaining: 280, kmRemaining: 22000, status: 'Optimal' },
      valvetrain: { label: 'Hydraulic Lifters & Springs', healthPct: 81, daysRemaining: 220, kmRemaining: 17000, status: 'Healthy' }
    },
    xaiFactors: [
      { factor: 'Cold Idle Fuel Enrichment', contributionPct: 48, impact: '+8.2% Short Trip Fuel Burn', risk: 'High' },
      { factor: 'Aero Drag on Heavy Chassis', contributionPct: 32, impact: '-5.5% Highway Range', risk: 'Medium' },
      { factor: 'Mechanical Pumping Drag', contributionPct: 20, impact: '-3.0% Throttle Response', risk: 'Low' }
    ]
  },

  boxer4: {
    engineId: 'boxer4',
    name: '2.0L Horizontally Opposed Flat-4 Boxer',
    normalBaseline90d: {
      efficiency: 16.4,
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 86.0,
      idleAirFlow: 2.5,
      cruiseAirFlow: 9.1,
      vibrationIndex: 0.90, // Low boxer vibration
      nominalBrakeWearPer1kKm: 0.34,
      batteryVoltageResting: 12.6,
      batteryVoltageCharging: 14.1,
      coldStartTimeSec: 220,
      horizontalHeadGasketIntegrity: 0.98
    },
    wearRunways: {
      headGaskets: { label: 'Opposed MLS Head Gaskets', healthPct: 88, daysRemaining: 290, kmRemaining: 23000, status: 'Optimal' },
      engineOil: { label: 'Synthetic 0W-20 Oil', healthPct: 75, daysRemaining: 90, kmRemaining: 7100, status: 'Healthy' },
      brakes: { label: 'Brake Pads', healthPct: 82, daysRemaining: 170, kmRemaining: 13500, status: 'Healthy' },
      sparkPlugs: { label: 'Horizontal Plugs', healthPct: 79, daysRemaining: 150, kmRemaining: 12000, status: 'Healthy' }
    },
    xaiFactors: [
      { factor: 'Symmetrical AWD Drivetrain Drag', contributionPct: 45, impact: '-4.6% Powertrain Loss', risk: 'Medium' },
      { factor: 'Horizontal Oil Return Drain Delay', contributionPct: 30, impact: '-2.8% Oil Lubricity at Startup', risk: 'Moderate' },
      { factor: 'Intake Runner Resonance', contributionPct: 25, impact: '+3.1% Mid-Range Volumetric Fill', risk: 'Low' }
    ]
  },

  i4_diesel: {
    engineId: 'i4_diesel',
    name: '2.0L Common-Rail Turbo Diesel (CRDi)',
    normalBaseline90d: {
      efficiency: 21.8,
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 85.0,
      idleAirFlow: 3.2,
      cruiseAirFlow: 11.2,
      vibrationIndex: 1.45,
      nominalBrakeWearPer1kKm: 0.38,
      batteryVoltageResting: 12.5,
      batteryVoltageCharging: 14.3,
      coldStartTimeSec: 270,
      dpfSootAccumulationRate: 0.04
    },
    wearRunways: {
      dpfFilter: { label: 'DPF Particulate Filter', healthPct: 74, daysRemaining: 120, kmRemaining: 9600, status: 'Healthy' },
      engineOil: { label: 'Low-SAPS Diesel C3 Oil', healthPct: 69, daysRemaining: 75, kmRemaining: 5900, status: 'Healthy' },
      defAdBlue: { label: 'SCR AdBlue / DEF Fluid', healthPct: 82, daysRemaining: 160, kmRemaining: 12800, status: 'Healthy' },
      fuelFilter: { label: 'High-Pressure Fuel Filter', healthPct: 87, daysRemaining: 210, kmRemaining: 16500, status: 'Optimal' }
    },
    xaiFactors: [
      { factor: 'DPF Soot Backpressure Rise', contributionPct: 46, impact: '+5.5% Fuel Consumption', risk: 'High' },
      { factor: 'EGR Valve Carbon Layering', contributionPct: 34, impact: '-3.8% Turbo Spool Rate', risk: 'Medium' },
      { factor: 'Cold Weather Glow Plug Delay', contributionPct: 20, impact: '+2.5% Warmup Fuel Burn', risk: 'Low' }
    ]
  },

  single_4s: {
    engineId: 'single_4s',
    name: '350cc Single-Cylinder 4-Stroke (Two-Wheeler)',
    normalBaseline90d: {
      efficiency: 38.0,
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 92.0, // Air head temp
      idleAirFlow: 0.8,
      cruiseAirFlow: 2.4,
      vibrationIndex: 2.20,
      nominalBrakeWearPer1kKm: 0.45,
      batteryVoltageResting: 12.5,
      batteryVoltageCharging: 13.9,
      coldStartTimeSec: 90,
      tappetClearanceMm: 0.12
    },
    wearRunways: {
      engineOil: { label: 'Motorcycle 4T 15W-50 Oil', healthPct: 64, daysRemaining: 45, kmRemaining: 2800, status: 'Attention Soon' },
      clutchPlates: { label: 'Wet Multi-Plate Clutch', healthPct: 82, daysRemaining: 160, kmRemaining: 10200, status: 'Healthy' },
      brakes: { label: 'Front/Rear Disc Pads', healthPct: 78, daysRemaining: 130, kmRemaining: 8400, status: 'Healthy' },
      driveChain: { label: 'O-Ring Final Drive Chain', healthPct: 71, daysRemaining: 90, kmRemaining: 5800, status: 'Healthy' }
    },
    xaiFactors: [
      { factor: 'Aerodynamic Drag on Rider Silhouette', contributionPct: 52, impact: '-9.5% Efficiency above 65 km/h', risk: 'High' },
      { factor: 'Air-Cooling Thermal Drift in Traffic', contributionPct: 30, impact: '+4.8% Choke Richness', risk: 'Medium' },
      { factor: 'Chain Tension Slack Friction', contributionPct: 18, impact: '-2.0% Wheel Power', risk: 'Low' }
    ]
  },

  i4_cng: {
    engineId: 'i4_cng',
    name: '1.5L Inline-4 Bi-Fuel CNG',
    normalBaseline90d: {
      efficiency: 26.0,
      efficiencyUnit: 'km/kg',
      avgCoolantTempC: 88.0,
      idleAirFlow: 2.1,
      cruiseAirFlow: 7.8,
      vibrationIndex: 1.18,
      nominalBrakeWearPer1kKm: 0.35,
      batteryVoltageResting: 12.6,
      batteryVoltageCharging: 14.1,
      coldStartTimeSec: 160,
      cngTankPressureNominal: 195
    },
    wearRunways: {
      cngRegulator: { label: 'CNG Pressure Regulator Diaphragm', healthPct: 89, daysRemaining: 310, kmRemaining: 24000, status: 'Optimal' },
      sparkPlugs: { label: 'CNG High-Heat Spark Plugs', healthPct: 74, daysRemaining: 110, kmRemaining: 8600, status: 'Healthy' },
      engineOil: { label: 'Low-Ash CNG Synthetic Oil', healthPct: 80, daysRemaining: 140, kmRemaining: 11000, status: 'Healthy' },
      gasValves: { label: 'High-Pressure Solenoid Seals', healthPct: 93, daysRemaining: 420, kmRemaining: 33000, status: 'Optimal' }
    },
    xaiFactors: [
      { factor: 'High Pressure Regulator Thermal Drop', contributionPct: 40, impact: '-3.5% Rail Delivery Density', risk: 'Medium' },
      { factor: 'Dry Gas Valve Recession Wear', contributionPct: 35, impact: '-2.8% Sealing Index', risk: 'Moderate' },
      { factor: 'Petrol Priming Injector Stale Fuel', contributionPct: 25, impact: '+2.0% Fallback Start Lag', risk: 'Low' }
    ]
  },

  hybrid_atkinson: {
    engineId: 'hybrid_atkinson',
    name: '1.8L Full Hybrid (Atkinson I4 + PMSM)',
    normalBaseline90d: {
      efficiency: 26.8,
      efficiencyUnit: 'km/L',
      avgCoolantTempC: 84.0,
      idleAirFlow: 0.0, // ICE engine off at idle
      cruiseAirFlow: 6.8,
      vibrationIndex: 0.72,
      nominalBrakeWearPer1kKm: 0.14, // 50% less brake wear due to regen!
      batteryVoltageResting: 207.2,
      batteryVoltageCharging: 235.0,
      coldStartTimeSec: 120,
      hybridBatterySohPct: 97.4
    },
    wearRunways: {
      hybridBattery: { label: 'Li-Ion Traction Pack (SOH)', healthPct: 96, daysRemaining: 750, kmRemaining: 58000, status: 'Optimal' },
      powerSplitGear: { label: 'Planetary e-CVT Damper', healthPct: 92, daysRemaining: 520, kmRemaining: 41000, status: 'Optimal' },
      inverterCooling: { label: 'SiC Inverter Coolant Loop', healthPct: 90, daysRemaining: 400, kmRemaining: 32000, status: 'Optimal' },
      brakes: { label: 'Regen-Preserved Brake Pads', healthPct: 95, daysRemaining: 680, kmRemaining: 54000, status: 'Optimal' }
    },
    xaiFactors: [
      { factor: 'Traction Battery Internal Resistance', contributionPct: 44, impact: '-4.2% EV Boost Window', risk: 'Medium' },
      { factor: 'Aggressive Acceleration Forcing ICE On', contributionPct: 36, impact: '-6.5% City Eco-Score', risk: 'Moderate' },
      { factor: 'Inverter Operating Temperature', contributionPct: 20, impact: '-1.8% Power Inversion Efficiency', risk: 'Low' }
    ]
  },

  bev_pmsm: {
    engineId: 'bev_pmsm',
    name: '150 kW Pure Electric (PMSM + 60 kWh)',
    normalBaseline90d: {
      efficiency: 6.5, // km/kWh (equivalent to 153 Wh/km)
      efficiencyUnit: 'km/kWh',
      avgCoolantTempC: 38.0, // Liquid thermal management loop
      idleAirFlow: 0.0,
      cruiseAirFlow: 0.0,
      vibrationIndex: 0.35, // Virtually zero vibration
      nominalBrakeWearPer1kKm: 0.08, // 75% less brake wear due to 1-pedal regen
      batteryVoltageResting: 360.0,
      batteryVoltageCharging: 400.0,
      coldStartTimeSec: 15,
      batteryStateOfHealthPct: 96.8
    },
    wearRunways: {
      tractionBatteryPack: { label: '60 kWh High-Voltage Pack (SOH)', healthPct: 96, daysRemaining: 1200, kmRemaining: 95000, status: 'Optimal' },
      sicInverter: { label: 'SiC Inverter Gate Drivers', healthPct: 94, daysRemaining: 850, kmRemaining: 68000, status: 'Optimal' },
      motorBearings: { label: 'PMSM Rotor High-Speed Bearings', healthPct: 91, daysRemaining: 620, kmRemaining: 49000, status: 'Optimal' },
      reductionGearbox: { label: 'Single-Speed Gearbox Fluid', healthPct: 88, daysRemaining: 450, kmRemaining: 36000, status: 'Optimal' }
    },
    xaiFactors: [
      { factor: 'Battery Pack Temperature (< 15°C or > 40°C)', contributionPct: 45, impact: '-8.5% DC Charge Acceptance', risk: 'High' },
      { factor: 'Highway Aerodynamic Drag (v^2 & v^3)', contributionPct: 38, impact: '+18% Wh/km above 90 km/h', risk: 'High' },
      { factor: 'HVAC Cabin Climate Heat-Pump Draw', contributionPct: 17, impact: '-4.2% Seasonal Range', risk: 'Medium' }
    ]
  }
};

/**
 * Returns the digital twin profile for a given engine type.
 */
export function getEngineDigitalTwin(engineId = 'i4_petrol') {
  return ENGINE_DIGITAL_TWINS[engineId] || ENGINE_DIGITAL_TWINS.i4_petrol;
}
