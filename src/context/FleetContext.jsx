import { createContext, useContext, useState, useEffect } from 'react';

const FleetContext = createContext();

export function useFleet() {
  return useContext(FleetContext);
}

const DEFAULT_VEHICLES = [
  {
    id: 'v1',
    name: 'Alpha Cruiser',
    profile: 'sedan',
    type: 'Sedan',
    engineTypeId: 'i4_petrol', // 2.0L I-4 DOHC Turbo
    status: 'Active',
    licensePlate: 'NY-482-XA',
    vin: '1HGCR2F83HA019482',
    mileage: 12450,
    fuelCapacityL: 55,
    curbWeightKg: 1550,
    maxPowerHp: 248,
    lat: 28.6139,
    lon: 77.2090,
    lastDvirStatus: 'PASSED',
    documents: {
      registration: { name: "Vehicle Registration", docNumber: "REG-NY482XA", expiryDate: "2027-08-15" },
      insurance: { name: "Commercial Fleet Policy", docNumber: "POL-772910", expiryDate: "2027-05-30" },
      puc: { name: "State Emissions / PUC", docNumber: "PUC-99120", expiryDate: "2026-11-10" },
      dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-44910", expiryDate: "2027-01-25" },
    }
  },
  {
    id: 'v2',
    name: 'Falcon Hauler',
    profile: 'truck',
    type: 'Heavy Truck',
    engineTypeId: 'v8_petrol',
    status: 'Active',
    licensePlate: 'TX-901-BH',
    vin: '3C6UR5FL9JG182901',
    mileage: 82000,
    fuelCapacityL: 120,
    curbWeightKg: 3100,
    maxPowerHp: 385,
    lat: 28.6310,
    lon: 77.2180,
    lastDvirStatus: 'PASSED',
    documents: {
      registration: { name: "Vehicle Registration", docNumber: "REG-TX901BH", expiryDate: "2027-09-20" },
      insurance: { name: "Commercial Fleet Policy", docNumber: "POL-883912", expiryDate: "2027-07-14" },
      puc: { name: "State Emissions / PUC", docNumber: "PUC-88192", expiryDate: "2027-03-05" },
      dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-55102", expiryDate: "2027-04-18" },
    }
  },
  {
    id: 'v3',
    name: 'Cyber Transit',
    profile: 'suv',
    type: 'Cargo Van',
    engineTypeId: 'bev_pmsm',
    status: 'Idle',
    licensePlate: 'CA-512-EV',
    vin: '7G2BEV098KX440512',
    mileage: 24100,
    fuelCapacityL: 85,
    curbWeightKg: 2400,
    maxPowerHp: 320,
    lat: 28.5980,
    lon: 77.1950,
    lastDvirStatus: 'PASSED',
    documents: {
      registration: { name: "Vehicle Registration", docNumber: "REG-CA512EV", expiryDate: "2028-02-10" },
      insurance: { name: "Commercial Fleet Policy", docNumber: "POL-992014", expiryDate: "2027-11-22" },
      puc: { name: "State Emissions / PUC", docNumber: "EV-ZERO-EMIS", expiryDate: "2029-01-01" },
      dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-66291", expiryDate: "2027-06-12" },
    }
  },
  {
    id: 'v4',
    name: 'Apex Courier',
    profile: 'sedan',
    type: 'Urban Compact',
    engineTypeId: 'i3_turbo',
    status: 'Active',
    licensePlate: 'FL-389-KP',
    vin: '2T1BR32E5HC903389',
    mileage: 3100,
    fuelCapacityL: 42,
    curbWeightKg: 1180,
    maxPowerHp: 135,
    lat: 28.6250,
    lon: 77.2350,
    lastDvirStatus: 'PASSED',
    documents: {
      registration: { name: "Vehicle Registration", docNumber: "REG-FL389KP", expiryDate: "2028-05-18" },
      insurance: { name: "Commercial Fleet Policy", docNumber: "POL-554190", expiryDate: "2027-09-30" },
      puc: { name: "State Emissions / PUC", docNumber: "PUC-44109", expiryDate: "2027-08-14" },
      dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-77189", expiryDate: "2027-10-05" },
    }
  },
  {
    id: 'v5',
    name: 'Sentinel Heavy',
    profile: 'truck',
    type: 'Industrial Hauler',
    engineTypeId: 'i4_diesel',
    status: 'Maintenance',
    licensePlate: 'IL-847-TR',
    vin: '1FDWF36R4EE110847',
    mileage: 110200,
    fuelCapacityL: 140,
    curbWeightKg: 3800,
    maxPowerHp: 410,
    lat: 28.6050,
    lon: 77.2250,
    lastDvirStatus: 'ATTENTION_REQUIRED',
    documents: {
      registration: { name: "Vehicle Registration", docNumber: "REG-IL847TR", expiryDate: "2027-04-12" },
      insurance: { name: "Commercial Fleet Policy", docNumber: "POL-332918", expiryDate: "2027-03-25" },
      puc: { name: "State Emissions / PUC", docNumber: "PUC-33019", expiryDate: "2026-12-15" },
      dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-88471", expiryDate: "2026-11-30" },
    }
  }
];

const DEFAULT_DRIVERS = [
  {
    id: 'd1',
    name: 'Sarah Jenkins',
    license: 'CDL-A 92839',
    experience: '8 Years',
    phone: '+1 (555) 482-9910',
    email: 'sarah.jenkins@velociq.fleet',
    rating: 4.8,
    avatar: 'SJ',
    safetyScore: 94,
    fuelEfficiency: 92,
    onTimeCompliance: 96,
    stopsAvoided: 18,
    weeklyFuelSavedLiters: 14.2,
    rankMovement: 1,
    documents: {
      cdl: { name: "CDL License", docNumber: "CDL-A 92839", expiryDate: "2027-09-15" },
      medical: { name: "DOT Medical Card", docNumber: "MED-99482", expiryDate: "2027-04-10" },
      hazmat: { name: "HazMat Endorsement", docNumber: "HM-88392", expiryDate: "2027-06-20" },
      mvr: { name: "Annual MVR Review", docNumber: "MVR-10293", expiryDate: "2027-02-28" },
    }
  },
  {
    id: 'd2',
    name: 'Marcus Vance',
    license: 'CDL-A 77312',
    experience: '5 Years',
    phone: '+1 (555) 732-8419',
    email: 'marcus.vance@velociq.fleet',
    rating: 4.5,
    avatar: 'MV',
    safetyScore: 82,
    fuelEfficiency: 84,
    onTimeCompliance: 91,
    stopsAvoided: 11,
    weeklyFuelSavedLiters: 8.4,
    rankMovement: -1,
    documents: {
      cdl: { name: "CDL License", docNumber: "CDL-A 77312", expiryDate: "2028-03-20" },
      medical: { name: "DOT Medical Card", docNumber: "MED-77192", expiryDate: "2027-08-15" },
      hazmat: { name: "HazMat Endorsement", docNumber: "HM-77291", expiryDate: "2027-10-05" },
      mvr: { name: "Annual MVR Review", docNumber: "MVR-77401", expiryDate: "2027-06-30" },
    }
  },
  {
    id: 'd3',
    name: 'Elena Rostova',
    license: 'CDL-B 49102',
    experience: '12 Years',
    phone: '+1 (555) 918-3342',
    email: 'elena.rostova@velociq.fleet',
    rating: 4.95,
    avatar: 'ER',
    safetyScore: 98,
    fuelEfficiency: 97,
    onTimeCompliance: 99,
    stopsAvoided: 24,
    weeklyFuelSavedLiters: 19.8,
    rankMovement: 2,
    documents: {
      cdl: { name: "CDL License", docNumber: "CDL-B 49102", expiryDate: "2028-09-10" },
      medical: { name: "DOT Medical Card", docNumber: "MED-49102", expiryDate: "2027-11-20" },
      hazmat: { name: "HazMat Endorsement", docNumber: "HM-49102", expiryDate: "2028-01-15" },
      mvr: { name: "Annual MVR Review", docNumber: "MVR-49102", expiryDate: "2027-07-15" },
    }
  },
  {
    id: 'd4',
    name: 'Dev Patel',
    license: 'CDL-A 60491',
    experience: '9 Years',
    phone: '+1 (555) 604-9128',
    email: 'dev.patel@velociq.fleet',
    rating: 4.7,
    avatar: 'DP',
    safetyScore: 91,
    fuelEfficiency: 89,
    onTimeCompliance: 94,
    stopsAvoided: 15,
    weeklyFuelSavedLiters: 11.2,
    rankMovement: 0,
    documents: {
      cdl: { name: "CDL License", docNumber: "CDL-A 60491", expiryDate: "2027-12-05" },
      medical: { name: "DOT Medical Card", docNumber: "MED-60491", expiryDate: "2027-05-18" },
      hazmat: { name: "HazMat Endorsement", docNumber: "HM-60491", expiryDate: "2027-09-12" },
      mvr: { name: "Annual MVR Review", docNumber: "MVR-60491", expiryDate: "2027-04-10" },
    }
  }
];

export function FleetProvider({ children }) {
  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem('velociq_fleet_vehicles');
      return saved ? JSON.parse(saved) : DEFAULT_VEHICLES;
    } catch {
      return DEFAULT_VEHICLES;
    }
  });

  const [drivers, setDrivers] = useState(() => {
    try {
      const saved = localStorage.getItem('velociq_fleet_drivers');
      return saved ? JSON.parse(saved) : DEFAULT_DRIVERS;
    } catch {
      return DEFAULT_DRIVERS;
    }
  });

  // Initial Sample Electronic OBD-II Pre-Trip Inspection Records
  const [inspections, setInspections] = useState([
    {
      id: 'obd-scan-101',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      type: 'PRE_TRIP_OBD',
      vehicleId: 'v1',
      vehicleName: 'Alpha Cruiser',
      licensePlate: 'NY-482-XA',
      driverId: 'd1',
      driverName: 'Sarah Jenkins',
      odometer: 12450,
      overallStatus: 'PASSED',
      milStatus: 'OFF',
      dtcCount: 0,
      monitorsReady: '4/4 Complete',
      batteryVoltage: 12.6,
      notes: 'Mode 01 readiness complete. Zero active DTCs. High-voltage & 12V bus nominal.',
      certified: true
    }
  ]);

  // Map of vehicleId -> driverId
  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('velociq_fleet_assignments');
      return saved ? JSON.parse(saved) : { 'v1': 'd1', 'v2': 'd2', 'v4': 'd4' };
    } catch {
      return { 'v1': 'd1', 'v2': 'd2', 'v4': 'd4' };
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('velociq_fleet_vehicles', JSON.stringify(vehicles));
    } catch (_) {}
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('velociq_fleet_drivers', JSON.stringify(drivers));
    } catch (_) {}
  }, [drivers]);

  useEffect(() => {
    try {
      localStorage.setItem('velociq_fleet_assignments', JSON.stringify(assignments));
    } catch (_) {}
  }, [assignments]);

  // The vehicle currently being monitored on the live Dashboard
  const [activeVehicleId, setActiveVehicleId] = useState('v1');

  // Background simulation for non-monitored active vehicles in the fleet
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'Active' && v.id !== activeVehicleId) {
          const latDelta = (Math.random() - 0.5) * 0.0005;
          const lonDelta = (Math.random() - 0.5) * 0.0005;
          return { ...v, lat: Number((v.lat + latDelta).toFixed(4)), lon: Number((v.lon + lonDelta).toFixed(4)) };
        }
        return v;
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [activeVehicleId]);

  const addVehicle = (data) => {
    const newId = `v${Date.now()}`;
    const newVehicle = {
      id: newId,
      name: data.name?.trim() || 'New Fleet Asset',
      profile: data.profile || (data.type === 'Heavy Truck' ? 'truck' : data.type === 'Cargo Van' ? 'suv' : 'sedan'),
      type: data.type || 'Sedan',
      engineTypeId: data.engineTypeId || 'i4_petrol',
      status: data.status || 'Active',
      licensePlate: data.licensePlate?.trim().toUpperCase() || 'FL-NEW-01',
      vin: data.vin?.trim() || `1HGCR2F8${Math.floor(100000000 + Math.random() * 900000000)}`,
      mileage: Number(data.mileage) || 0,
      fuelCapacityL: Number(data.fuelCapacityL) || (data.engineTypeId === 'bev_pmsm' ? 85 : 55),
      curbWeightKg: Number(data.curbWeightKg) || 1600,
      maxPowerHp: Number(data.maxPowerHp) || (data.engineTypeId === 'bev_pmsm' ? 320 : data.engineTypeId === 'v8_petrol' ? 385 : 248),
      lat: Number((28.6139 + (Math.random() - 0.5) * 0.04).toFixed(4)),
      lon: Number((77.2090 + (Math.random() - 0.5) * 0.04).toFixed(4)),
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: `REG-${data.licensePlate || 'NEW'}`, expiryDate: "2028-06-30" },
        insurance: { name: "Commercial Fleet Policy", docNumber: `POL-${Math.floor(100000 + Math.random() * 900000)}`, expiryDate: "2027-12-15" },
        puc: { name: "State Emissions / PUC", docNumber: `PUC-${Math.floor(10000 + Math.random() * 90000)}`, expiryDate: "2027-08-30" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: `DOT-${Math.floor(10000 + Math.random() * 90000)}`, expiryDate: "2027-05-20" }
      }
    };

    setVehicles(prev => [newVehicle, ...prev]);

    if (data.driverId) {
      setAssignments(prev => ({ ...prev, [newId]: data.driverId }));
    }

    return newVehicle;
  };

  const addDriver = (data) => {
    const newId = `d${Date.now()}`;
    const newDriver = {
      id: newId,
      name: data.name?.trim() || 'New Driver',
      license: data.license?.trim().toUpperCase() || `CDL-A ${Math.floor(10000 + Math.random() * 90000)}`,
      experience: data.experience?.trim() || '3 Years',
      phone: data.phone?.trim() || '+1 (555) 234-5678',
      email: data.email?.trim() || `${data.name?.toLowerCase().replace(/\s+/g, '.') || 'driver'}@velociq.fleet`,
      rating: Number(data.rating) || 4.7,
      avatar: (data.name || 'DR').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      safetyScore: Number(data.safetyScore) || 92,
      fuelEfficiency: Number(data.fuelEfficiency) || 90,
      onTimeCompliance: Number(data.onTimeCompliance) || 95,
      stopsAvoided: 14,
      weeklyFuelSavedLiters: 10.5,
      rankMovement: 0,
      documents: {
        cdl: { name: "CDL License", docNumber: data.license || `CDL-A ${Math.floor(10000 + Math.random() * 90000)}`, expiryDate: "2028-01-15" },
        medical: { name: "DOT Medical Card", docNumber: `MED-${Math.floor(10000 + Math.random() * 90000)}`, expiryDate: "2027-08-20" },
        hazmat: { name: "HazMat Endorsement", docNumber: `HM-${Math.floor(10000 + Math.random() * 90000)}`, expiryDate: "2027-11-10" },
        mvr: { name: "Annual MVR Review", docNumber: `MVR-${Math.floor(10000 + Math.random() * 90000)}`, expiryDate: "2027-05-15" },
      }
    };

    setDrivers(prev => [...prev, newDriver]);
    return newDriver;
  };

  const deleteVehicle = (vehicleId) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setAssignments(prev => {
      const next = { ...prev };
      delete next[vehicleId];
      return next;
    });
    if (activeVehicleId === vehicleId) {
      const remaining = vehicles.filter(v => v.id !== vehicleId);
      if (remaining.length > 0) setActiveVehicleId(remaining[0].id);
    }
  };

  const assignDriver = (vehicleId, driverId) => {
    setAssignments(prev => ({
      ...prev,
      [vehicleId]: driverId
    }));
  };

  const removeDriver = (vehicleId) => {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[vehicleId];
      return next;
    });
  };

  const setVehicleStatus = (vehicleId, status) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status } : v));
  };

  const monitorVehicle = (vehicleId) => {
    setActiveVehicleId(vehicleId);
  };

  // Execute an automated OBD-II pre-trip electronic scan
  const runObdPreTripScan = (vehicleId, overrides = {}) => {
    const v = vehicles.find(item => item.id === vehicleId);
    const isCritical = overrides.overallStatus === 'CRITICAL_DEFECT' || overrides.criticalDefect;
    const status = isCritical ? 'CRITICAL_DEFECT' : 'PASSED';

    const newScan = {
      id: `obd-scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'PRE_TRIP_OBD',
      vehicleId,
      vehicleName: v?.name || 'Fleet Asset',
      licensePlate: v?.licensePlate || '',
      odometer: v?.mileage || 0,
      overallStatus: status,
      milStatus: isCritical ? 'ON' : 'OFF',
      dtcCount: isCritical ? 2 : 0,
      monitorsReady: '4/4 Complete',
      batteryVoltage: 12.6,
      notes: isCritical 
        ? 'DTCs detected during OBD pre-trip scan. Auto-grounded to maintenance.' 
        : 'Automated OBD-II Mode $01 & $03 pre-flight scan nominal. All monitors ready.',
      certified: true,
      ...overrides
    };

    setInspections(prev => [newScan, ...prev]);

    setVehicles(prev => prev.map(item => {
      if (item.id === vehicleId) {
        return {
          ...item,
          status: isCritical ? 'Maintenance' : item.status,
          lastDvirStatus: status,
          lastObdScanStatus: status,
        };
      }
      return item;
    }));

    return newScan;
  };

  const submitInspection = runObdPreTripScan;

  // Update compliance document expiry date
  const updateDocumentExpiry = (entityType, entityId, docKey, newDate) => {
    if (entityType === 'driver') {
      setDrivers(prev => prev.map(d => {
        if (d.id === entityId && d.documents && d.documents[docKey]) {
          return {
            ...d,
            documents: {
              ...d.documents,
              [docKey]: { ...d.documents[docKey], expiryDate: newDate }
            }
          };
        }
        return d;
      }));
    } else if (entityType === 'vehicle') {
      setVehicles(prev => prev.map(v => {
        if (v.id === entityId && v.documents && v.documents[docKey]) {
          return {
            ...v,
            documents: {
              ...v.documents,
              [docKey]: { ...v.documents[docKey], expiryDate: newDate }
            }
          };
        }
        return v;
      }));
    }
  };

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
  const activeDriver = drivers.find(d => d.id === assignments[activeVehicleId]) || null;

  return (
    <FleetContext.Provider value={{
      vehicles,
      drivers,
      assignments,
      inspections,
      activeVehicleId,
      activeVehicle,
      activeDriver,
      assignDriver,
      removeDriver,
      setVehicleStatus,
      monitorVehicle,
      addVehicle,
      addDriver,
      deleteVehicle,
      submitInspection,
      runObdPreTripScan,
      updateDocumentExpiry
    }}>
      {children}
    </FleetContext.Provider>
  );
}
