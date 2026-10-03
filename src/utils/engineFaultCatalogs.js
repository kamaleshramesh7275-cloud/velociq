/**
 * src/utils/engineFaultCatalogs.js
 * 
 * Per-Engine Fault Catalogs, Diagnostics & Isolation (FDI) Definitions.
 * Covers all 10 powertrain families with realistic automotive OBD-II DTCs,
 * descriptions, and 3D component risk mappings.
 */

export const ENGINE_FAULT_CATALOGS = {
  i4_petrol: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'All 4 cylinders operating within optimal thermal, mechanical, and combustion tolerances.',
      dtc: []
    },
    CYL_3_MISFIRE: {
      id: 'CYL_3_MISFIRE',
      title: 'Cylinder #3 Ignition Coil Breakdown (Misfire)',
      description: 'Ignition breakdown on Cylinder 3 causes incomplete combustion and raw fuel in exhaust.',
      dtc: ['P0303', 'P0300'],
      affectedParts: { coil_3: 'critical', exhaust_runner_3: 'damaged', catalytic_converter: 'critical', cylinder_head: 'damaged' }
    },
    THERMOSTAT_STUCK: {
      id: 'THERMOSTAT_STUCK',
      title: 'Coolant Thermostat Stuck Closed',
      description: 'Coolant circulation restricted. Cylinder head temperature rapidly exceeds 112°C limit.',
      dtc: ['P0217', 'P0128'],
      affectedParts: { thermostat_housing: 'critical', coolant_hard_line: 'damaged', cylinder_head: 'damaged' }
    },
    OIL_STARVATION: {
      id: 'OIL_STARVATION',
      title: 'Oil Pressure Collapse & Starvation',
      description: 'Oil relief valve failure or leak drops lubrication pressure to 12 PSI.',
      dtc: ['P0524'],
      affectedParts: { oil_filter: 'critical', oil_pressure_sensor: 'critical', oil_pan: 'critical', crankshaft: 'damaged' }
    },
    INTAKE_VACUUM_LEAK: {
      id: 'INTAKE_VACUUM_LEAK',
      title: 'Intake Plenum Gasket Vacuum Leak',
      description: 'Unmetered ambient air enters manifold, driving STFT to +25% limit.',
      dtc: ['P0171', 'P0106'],
      affectedParts: { intake_plenum: 'critical', cylinder_head: 'damaged' }
    }
  },

  i3_turbo: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'I3 turbocharger, wastegate actuator, and intercooler sealed and calibrated.',
      dtc: []
    },
    TURBO_OVERBOOST: {
      id: 'TURBO_OVERBOOST',
      title: 'Wastegate Actuator Stuck Shut (Overboost)',
      description: 'Wastegate failed shut. Boost surges past 24 PSI, risking detonation and engine knock.',
      dtc: ['P0234'],
      affectedParts: { turbocharger: 'critical', intercooler_pipe: 'damaged', exhaust_manifold: 'damaged' }
    },
    WASTEGATE_JAMMED_OPEN: {
      id: 'WASTEGATE_JAMMED_OPEN',
      title: 'Wastegate Flapper Leaking / Open',
      description: 'Exhaust energy bypasses turbine wheel. Engine cannot reach target boost pressure.',
      dtc: ['P0299'],
      affectedParts: { turbocharger: 'damaged', catalytic_converter: 'watch' }
    },
    INTERCOOLER_LEAK: {
      id: 'INTERCOOLER_LEAK',
      title: 'Intercooler Charge Pipe Coupler Rupture',
      description: 'High boost pressure blows charge air coupler off. Severe air metering divergence.',
      dtc: ['P0101', 'P0299'],
      affectedParts: { intercooler_pipe: 'critical', intake_plenum: 'damaged' }
    },
    CYL_3_MISFIRE: {
      id: 'CYL_3_MISFIRE',
      title: 'Cylinder #3 Direct Injector Clogged',
      description: 'High-pressure petrol direct injector restricted, creating harsh 3-cylinder imbalance.',
      dtc: ['P0303', 'P0171'],
      affectedParts: { cylinder_head: 'damaged', exhaust_manifold: 'watch' }
    }
  },

  v6_petrol: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'Dual-bank 60° V6 synchronized across cam phasers and catalytic converters.',
      dtc: []
    },
    VVT_SOLENOID_DRIFT: {
      id: 'VVT_SOLENOID_DRIFT',
      title: 'Bank 1 Intake Cam Phaser Oil Solenoid Sluggish',
      description: 'Hydraulic camshaft timing solenoid clogged, causing timing correlation error on Bank 1.',
      dtc: ['P0011', 'P0016'],
      affectedParts: { bank_left_head: 'critical', v_block: 'watch' }
    },
    BANK2_O2_SLOW_RESPONSE: {
      id: 'BANK2_O2_SLOW_RESPONSE',
      title: 'Bank 2 Upstream O2 Sensor Thermal Drift',
      description: 'Air-fuel sensor heater circuit degraded on right cylinder bank.',
      dtc: ['P0153', 'P0174'],
      affectedParts: { exhaust_r: 'critical', bank_right_head: 'damaged' }
    },
    CYL_5_MISFIRE: {
      id: 'CYL_5_MISFIRE',
      title: 'Cylinder #5 Spark Plug Fouling',
      description: 'Carbon deposits bridging spark electrode on rear right cylinder bank.',
      dtc: ['P0305'],
      affectedParts: { bank_right_head: 'critical', exhaust_r: 'damaged' }
    }
  },

  v8_petrol: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: '90° cross-plane V8 operating with uniform cylinder bank balance.',
      dtc: []
    },
    KNOCK_SENSOR_FAULT: {
      id: 'KNOCK_SENSOR_FAULT',
      title: 'Valley Knock Sensor Resonance Drift',
      description: 'Piezoelectric knock sensor in the engine valley reporting false detonation signal.',
      dtc: ['P0325'],
      affectedParts: { v8_block: 'damaged', tunnel_ram_plenum: 'watch' }
    },
    OIL_STARVATION: {
      id: 'OIL_STARVATION',
      title: 'High-Volume Oil Pump Cavitation',
      description: 'Main journal bearing clearance wear drops V8 idle oil pressure to 11 PSI.',
      dtc: ['P0524'],
      affectedParts: { crankshaft: 'critical', v8_block: 'damaged', oil_pan: 'critical' }
    },
    VALVE_FLOAT: {
      id: 'VALVE_FLOAT',
      title: 'Bank 2 Exhaust Valve Spring Fatigue',
      description: 'Weak valve spring causes valve float and cylinder misfire above 5800 RPM.',
      dtc: ['P0308', 'P0300'],
      affectedParts: { bank2_head: 'critical', dual_exhaust: 'damaged' }
    }
  },

  boxer4: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'Flat-4 boxer horizontally opposed pistons balanced across split crankcase.',
      dtc: []
    },
    OIL_SCAVENGE_RESTRICTION: {
      id: 'OIL_SCAVENGE_RESTRICTION',
      title: 'Left Cylinder Head Oil Return Scavenge Restriction',
      description: 'Horizontal head design allows oil pooling in left cylinder head under lateral Gs.',
      dtc: ['P0521'],
      affectedParts: { left_opposed_head: 'critical', oil_sump: 'damaged' }
    },
    HEAD_GASKET_LEAK: {
      id: 'HEAD_GASKET_LEAK',
      title: 'Multi-Layer Steel (MLS) Head Gasket Breach',
      description: 'Combustion gases leaking into coolant gallery on horizontal Bank 2.',
      dtc: ['P0217', 'P0128'],
      affectedParts: { right_opposed_head: 'critical', split_crankcase: 'damaged' }
    },
    BOXER_CYL_2_MISFIRE: {
      id: 'BOXER_CYL_2_MISFIRE',
      title: 'Cylinder #2 Ignition Coil Breakdown',
      description: 'Tight frame rail clearance caused heat degradation on Cylinder 2 coil-on-plug.',
      dtc: ['P0302'],
      affectedParts: { left_opposed_head: 'critical', exhaust_runners: 'damaged' }
    }
  },

  i4_diesel: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'Clean diesel common-rail, VGT turbo, DPF, and SCR AdBlue operating in optimal envelope.',
      dtc: []
    },
    DPF_SOOT_SATURATION: {
      id: 'DPF_SOOT_SATURATION',
      title: 'Diesel Particulate Filter (DPF) Soot Saturation',
      description: 'DPF differential pressure exceeds 45 kPa. Regeneration required immediately.',
      dtc: ['P2463', 'P2452'],
      affectedParts: { dpf_canister: 'critical', egr_valve: 'watch', vgt_turbo: 'damaged' }
    },
    INJECTOR_CLOGGED: {
      id: 'INJECTOR_CLOGGED',
      title: 'Cylinder #2 Common-Rail Piezo Injector Clogged',
      description: 'Fuel delivery deficit in cylinder 2. Rough idle and unburned hydrocarbon smoke.',
      dtc: ['P0202', 'P0266'],
      affectedParts: { common_rail: 'critical', cylinder_head: 'damaged' }
    },
    EGR_VALVE_CLOGGED: {
      id: 'EGR_VALVE_CLOGGED',
      title: 'EGR Valve Carbon Coking & Sticking',
      description: 'Exhaust gas recirculation valve jammed with soot. Elevated NOx and turbo lag.',
      dtc: ['P0401', 'P0404'],
      affectedParts: { egr_valve: 'critical', vgt_turbo: 'watch' }
    },
    DEF_DOSING_FAILURE: {
      id: 'DEF_DOSING_FAILURE',
      title: 'AdBlue / DEF Dosing Valve Clogged',
      description: 'SCR urea crystallization prevents NOx abatement. Engine restart lockout countdown.',
      dtc: ['P20EE', 'P204F'],
      affectedParts: { dpf_canister: 'damaged', common_rail: 'watch' }
    }
  },

  single_4s: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'Air-cooled thumper engine with clean valve clearances and optimal lubrication.',
      dtc: []
    },
    AIR_COOLING_FIN_CLOGGED: {
      id: 'AIR_COOLING_FIN_CLOGGED',
      title: 'Cylinder Head Cooling Fins Mud Clad',
      description: 'Air-cooling fins obstructed. Cylinder barrel temperature climbs past 125°C.',
      dtc: ['P0217'],
      affectedParts: { cylinder_head_fins: 'critical', cylinder_barrel: 'damaged' }
    },
    CARB_JET_LEAN: {
      id: 'CARB_JET_LEAN',
      title: 'Carburetor / Injector Pilot Jet Obstruction',
      description: 'Lean air-fuel ratio causes backfiring and high exhaust header thermal stress.',
      dtc: ['P0171'],
      affectedParts: { cylinder_barrel: 'damaged', exhaust_header: 'critical' }
    },
    VALVE_TAPPET_CLEARANCE: {
      id: 'VALVE_TAPPET_CLEARANCE',
      title: 'Loose Valve Tappet Clearance',
      description: 'Excessive valve lash creates mechanical tapping noise and reduces intake airflow.',
      dtc: ['P0010'],
      affectedParts: { cylinder_head_fins: 'damaged', piston: 'watch' }
    }
  },

  i4_cng: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'High-pressure 200 bar CNG gas delivery and electronic regulator operating nominal.',
      dtc: []
    },
    CNG_REGULATOR_FREEZE: {
      id: 'CNG_REGULATOR_FREEZE',
      title: 'CNG High-Pressure Regulator Heater Fault',
      description: 'Coolant line to gas regulator clogged. Joule-Thomson expansion causes valve freeze-up.',
      dtc: ['P0190', 'P0171'],
      affectedParts: { cng_regulator: 'critical', high_pressure_lines: 'damaged' }
    },
    CNG_INJECTOR_LEAK: {
      id: 'CNG_INJECTOR_LEAK',
      title: 'Cylinder #4 CNG Low-Pressure Gas Injector Leak',
      description: 'Plunger seal deterioration causes unmetered gas bleed into intake runner.',
      dtc: ['P0172', 'P0304'],
      affectedParts: { gas_injectors: 'critical', cylinder_head: 'damaged' }
    },
    CNG_LOW_PRESSURE: {
      id: 'CNG_LOW_PRESSURE',
      title: 'Tank Storage Pressure Depleted (< 10 Bar)',
      description: 'CNG tank below threshold. Automatic fallback to petrol fuel injection engaged.',
      dtc: ['P018B'],
      affectedParts: { high_pressure_lines: 'watch', cng_regulator: 'watch' }
    }
  },

  hybrid_atkinson: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'Atkinson ICE, 53 kW PMSM, planetary power split, and traction battery synchronized.',
      dtc: []
    },
    HYBRID_INVERTER_OVERHEAT: {
      id: 'HYBRID_INVERTER_OVERHEAT',
      title: 'Hybrid Inverter Water Pump Failure (Thermal Runaway)',
      description: 'Dedicated electric water pump for SiC inverter failed. Temperature reached 94°C.',
      dtc: ['P0A93', 'P0A78'],
      affectedParts: { inverter_module: 'critical', transaxle_motor: 'damaged' }
    },
    HYBRID_BATTERY_FAULT: {
      id: 'HYBRID_BATTERY_FAULT',
      title: 'High-Voltage Battery Cell Delta Voltage Drift',
      description: 'Cell block 7 internal resistance increased; capacity imbalance triggers safe EV disable.',
      dtc: ['P0A80', 'P0A7F'],
      affectedParts: { traction_pack: 'critical', inverter_module: 'watch' }
    },
    EV_TRANSAXLE_SLIP: {
      id: 'EV_TRANSAXLE_SLIP',
      title: 'Planetary Power Split Damper Slip',
      description: 'Dorsal torsional damper spring play causing vibration during ICE start-stop transitions.',
      dtc: ['P0A1B'],
      affectedParts: { power_split_gear: 'critical', engine_block: 'damaged' }
    }
  },

  bev_pmsm: {
    NOMINAL: {
      id: 'NOMINAL',
      title: 'Factory Nominal (Healthy)',
      description: 'PMSM traction motor, 360V pack, and SiC high-power inverter running balanced.',
      dtc: []
    },
    MOTOR_INSULATION_BREAKDOWN: {
      id: 'MOTOR_INSULATION_BREAKDOWN',
      title: 'Stator Phase W Phase-to-Ground Insulation Breakdown',
      description: 'High-voltage insulation resistance dropped below 500 kOhm on stator Phase W.',
      dtc: ['P0AA6', 'P0C17'],
      affectedParts: { stator_housing: 'critical', pmsm_rotor: 'damaged', hv_junction_box: 'critical' }
    },
    BATTERY_CELL_IMBALANCE: {
      id: 'BATTERY_CELL_IMBALANCE',
      title: 'HV Battery Pack Module 4 Voltage Spread Anomaly',
      description: 'Cell spread exceeded 120 mV during acceleration burst. Power derate enforced.',
      dtc: ['P0B24', 'P0A80'],
      affectedParts: { battery_pack: 'critical', hv_junction_box: 'watch' }
    },
    INVERTER_GATE_DRIVER_FAULT: {
      id: 'INVERTER_GATE_DRIVER_FAULT',
      title: 'SiC MOSFET Inverter Gate Driver Desaturation',
      description: 'Overcurrent spike detected on Phase U high-side switch during heavy acceleration.',
      dtc: ['P0A44', 'P0C4A'],
      affectedParts: { sic_inverter: 'critical', stator_housing: 'damaged' }
    },
    HV_INTERLOCK_BREACH: {
      id: 'HV_INTERLOCK_BREACH',
      title: 'High Voltage Interlock Loop (HVIL) Disconnect',
      description: 'Service disconnect plug or HV connector unseated. Contactors opened for safety.',
      dtc: ['P0A0D'],
      affectedParts: { hv_junction_box: 'critical', battery_pack: 'damaged' }
    }
  }
};

/**
 * Returns the fault catalog for an engine type.
 */
export function getEngineFaultCatalog(engineId = 'i4_petrol') {
  return ENGINE_FAULT_CATALOGS[engineId] || ENGINE_FAULT_CATALOGS.i4_petrol;
}

/**
 * Returns a list of scenario objects for an engine type formatted for UI selectors.
 */
export function getScenariosForEngine(engineId = 'i4_petrol') {
  const catalog = getEngineFaultCatalog(engineId);
  return Object.entries(catalog).map(([key, item]) => ({
    key,
    label: item.title,
    desc: item.description,
    dtc: item.dtc || [],
    affectedParts: item.affectedParts || {}
  }));
}

/**
 * Returns the specific fault definition for an engine and scenario key.
 */
export function getFaultDefinition(engineId = 'i4_petrol', scenarioKey = 'NOMINAL') {
  const catalog = getEngineFaultCatalog(engineId);
  return catalog[scenarioKey] || catalog.NOMINAL;
}

/**
 * Builds a component risk map tailored to the active engine and scenario.
 */
export function buildEngineRiskMap({
  engineId = 'i4_petrol',
  activeScenario = 'NOMINAL',
  diagnostics = {},
  thermal = {},
  telemetry = {}
} = {}) {
  const catalog = getEngineFaultCatalog(engineId);
  const scenarioObj = catalog[activeScenario] || catalog.NOMINAL;
  const map = { ...(scenarioObj.affectedParts || {}) };

  // Dynamic thermal thresholds based on engine type
  if (engineId === 'bev_pmsm') {
    if (thermal.inverterTemp > 80) map.sic_inverter = 'critical';
    if (thermal.motorStatorTemp > 100) map.stator_housing = 'critical';
    if (thermal.batteryTemp > 45) map.battery_pack = 'damaged';
  } else if (engineId === 'i4_diesel') {
    if (thermal.dpfTemp > 600) map.dpf_canister = 'damaged';
  } else if (engineId === 'hybrid_atkinson') {
    if (thermal.inverterTemp > 75) map.inverter_module = 'critical';
    if (thermal.batteryTemp > 40) map.traction_pack = 'damaged';
  } else {
    // ICE engines
    if (thermal.headTemp >= 108) map.cylinder_head = 'critical';
    if (thermal.coolantTemp >= 105) map.thermostat_housing = 'critical';
    if (telemetry.oilPressurePsi < 16) map.oil_pan = 'critical';
  }

  return map;
}
