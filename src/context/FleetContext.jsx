import { createContext, useContext, useState, useEffect } from 'react';

const FleetContext = createContext();

export function useFleet() {
  return useContext(FleetContext);
}

export function FleetProvider({ children }) {
  const [vehicles, setVehicles] = useState([
    {
      id: 'v1',
      name: 'Alpha Cruiser',
      profile: 'sedan',
      type: 'Sedan',
      engineTypeId: 'i4_petrol', // 2.0L I-4 DOHC Turbo
      status: 'Active',
      licensePlate: 'NY-482-XA',
      mileage: 12450,
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
      name: 'Cargo Hauler',
      profile: 'pickup_lcv',
      type: 'Pickup / LCV',
      engineTypeId: 'i4_petrol',
      status: 'Active',
      licensePlate: 'TX-910-BB',
      mileage: 82000,
      lat: 28.6250,
      lon: 77.2150,
      lastDvirStatus: 'MINOR_DEFECT',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-TX910BB", expiryDate: "2027-03-22" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-883011", expiryDate: "2026-10-25" }, // Expiring soon!
        puc: { name: "State Emissions / PUC", docNumber: "PUC-33819", expiryDate: "2027-06-14" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-10294", expiryDate: "2027-04-18" },
      }
    },
    {
      id: 'v3',
      name: 'Eco Commuter',
      profile: 'hatchback',
      type: 'Hatchback',
      engineTypeId: 'i4_petrol',
      status: 'Maintenance',
      licensePlate: 'CA-100-EV',
      mileage: 45000,
      lat: 28.6300,
      lon: 77.2200,
      lastDvirStatus: 'CRITICAL_DEFECT',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-CA100EV", expiryDate: "2026-09-30" }, // Expired!
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-559102", expiryDate: "2027-07-20" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-88201", expiryDate: "2026-10-15" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-33921", expiryDate: "2026-10-02" },
      }
    },
    {
      id: 'v4',
      name: 'City Sprinter',
      profile: 'hatchback',
      type: 'Hatchback',
      engineTypeId: 'i4_petrol',
      status: 'Idle',
      licensePlate: 'WA-777-XYZ',
      mileage: 3100,
      lat: 28.6400,
      lon: 77.2100,
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-WA777XY", expiryDate: "2027-11-05" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-992014", expiryDate: "2027-10-12" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-44102", expiryDate: "2027-09-08" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-88401", expiryDate: "2027-11-19" },
      }
    },
    {
      id: 'v5',
      name: 'Heavy Duty Hauler',
      profile: 'truck',
      type: 'Heavy Truck',
      engineTypeId: 'i4_petrol',
      status: 'Active',
      licensePlate: 'FL-202-CD',
      mileage: 110200,
      lat: 28.6050,
      lon: 77.1950,
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-FL202CD", expiryDate: "2027-05-18" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-110293", expiryDate: "2027-06-25" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-77291", expiryDate: "2027-03-30" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-66201", expiryDate: "2027-02-14" },
      }
    },
    {
      id: 'v6',
      name: 'Volt Cruiser',
      profile: 'hybrid_sedan',
      type: 'Fleet Sedan',
      engineTypeId: 'i4_petrol',
      status: 'Active',
      licensePlate: 'EV-300-QL',
      mileage: 8400,
      lat: 28.6180,
      lon: 77.2120,
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-EV300QL", expiryDate: "2028-02-10" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-332918", expiryDate: "2027-12-01" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-EXEMPT-EV", expiryDate: "2030-01-01" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-99201", expiryDate: "2027-08-20" },
      }
    },
    {
      id: 'v7',
      name: 'Metro Hauler',
      profile: 'hybrid_sedan',
      type: 'Executive Sedan',
      engineTypeId: 'i4_petrol',
      status: 'Active',
      licensePlate: 'HY-450-TX',
      mileage: 19200,
      lat: 28.6220,
      lon: 77.2080,
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-HY450TX", expiryDate: "2027-09-14" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-441029", expiryDate: "2027-07-30" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-66102", expiryDate: "2026-10-22" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-55102", expiryDate: "2027-04-05" },
      }
    },
    {
      id: 'v8',
      name: 'Apex Rider',
      profile: 'motorcycle',
      type: 'Motorcycle',
      engineTypeId: 'i4_petrol',
      status: 'Idle',
      licensePlate: 'MC-250-ZZ',
      mileage: 4100,
      lat: 28.6320,
      lon: 77.2180,
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-MC250ZZ", expiryDate: "2027-04-12" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-661920", expiryDate: "2027-08-19" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-55104", expiryDate: "2027-01-14" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-11928", expiryDate: "2027-03-01" },
      }
    },
    {
      id: 'v9',
      name: 'Boxer Rally Edition',
      profile: 'sedan',
      type: 'AWD Sedan',
      engineTypeId: 'i4_petrol',
      status: 'Active',
      licensePlate: 'BX-500-WD',
      mileage: 15400,
      lat: 28.6150,
      lon: 77.2220,
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-BX500WD", expiryDate: "2027-10-20" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-771829", expiryDate: "2027-11-15" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-22910", expiryDate: "2026-11-28" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-44019", expiryDate: "2027-05-19" },
      }
    },
    {
      id: 'v10',
      name: 'Apex Grand Tourer',
      profile: 'suv',
      type: 'Sport SUV',
      engineTypeId: 'i4_petrol',
      status: 'Active',
      licensePlate: 'GT-600-V6',
      mileage: 22100,
      lat: 28.6290,
      lon: 77.2040,
      lastDvirStatus: 'PASSED',
      documents: {
        registration: { name: "Vehicle Registration", docNumber: "REG-GT600V6", expiryDate: "2028-01-10" },
        insurance: { name: "Commercial Fleet Policy", docNumber: "POL-881920", expiryDate: "2027-09-02" },
        puc: { name: "State Emissions / PUC", docNumber: "PUC-99182", expiryDate: "2027-04-12" },
        dot_inspection: { name: "DOT Periodic Inspection", docNumber: "DOT-77291", expiryDate: "2027-06-30" },
      }
    }
  ]);

  const [drivers, setDrivers] = useState([
    {
      id: 'd1',
      name: 'Sarah Jenkins',
      license: 'CDL-A 92839',
      experience: '8 Years',
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
      name: 'Marcus Cole',
      license: 'CDL-B 10293',
      experience: '3 Years',
      rating: 4.2,
      avatar: 'MC',
      safetyScore: 82,
      fuelEfficiency: 86,
      onTimeCompliance: 88,
      stopsAvoided: 9,
      weeklyFuelSavedLiters: 6.8,
      rankMovement: -1,
      documents: {
        cdl: { name: "CDL License", docNumber: "CDL-B 10293", expiryDate: "2027-03-12" },
        medical: { name: "DOT Medical Card", docNumber: "MED-49102", expiryDate: "2026-10-18" }, // Expiring soon!
        hazmat: { name: "HazMat Endorsement", docNumber: "HM-20192", expiryDate: "2027-01-15" },
        mvr: { name: "Annual MVR Review", docNumber: "MVR-84920", expiryDate: "2027-05-11" },
      }
    },
    {
      id: 'd3',
      name: 'Elena Rodriguez',
      license: 'CDL-A 88392',
      experience: '12 Years',
      rating: 4.9,
      avatar: 'ER',
      safetyScore: 98,
      fuelEfficiency: 96,
      onTimeCompliance: 99,
      stopsAvoided: 24,
      weeklyFuelSavedLiters: 21.5,
      rankMovement: 2,
      documents: {
        cdl: { name: "CDL License", docNumber: "CDL-A 88392", expiryDate: "2028-01-20" },
        medical: { name: "DOT Medical Card", docNumber: "MED-77401", expiryDate: "2027-11-05" },
        hazmat: { name: "HazMat Endorsement", docNumber: "HM-49201", expiryDate: "2027-08-30" },
        mvr: { name: "Annual MVR Review", docNumber: "MVR-33920", expiryDate: "2027-07-14" },
      }
    },
    {
      id: 'd4',
      name: 'James Wilson',
      license: 'Class C 99821',
      experience: '1 Year',
      rating: 3.9,
      avatar: 'JW',
      safetyScore: 74,
      fuelEfficiency: 78,
      onTimeCompliance: 82,
      stopsAvoided: 4,
      weeklyFuelSavedLiters: 2.1,
      rankMovement: 0,
      documents: {
        cdl: { name: "Commercial Driver License", docNumber: "Class C 99821", expiryDate: "2026-11-20" },
        medical: { name: "DOT Medical Card", docNumber: "MED-11029", expiryDate: "2027-02-15" },
        hazmat: { name: "HazMat Endorsement", docNumber: "HM-00293", expiryDate: "2026-09-18" }, // Expired!
        mvr: { name: "Annual MVR Review", docNumber: "MVR-44910", expiryDate: "2026-12-05" },
      }
    }
  ]);

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
    },
    {
      id: 'obd-scan-102',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      type: 'PRE_TRIP_OBD',
      vehicleId: 'v2',
      vehicleName: 'Cargo Hauler',
      licensePlate: 'TX-910-BB',
      driverId: 'd2',
      driverName: 'Marcus Cole',
      odometer: 82000,
      overallStatus: 'MINOR_DEFECT',
      milStatus: 'OFF',
      dtcCount: 1,
      monitorsReady: '4/4 Complete',
      batteryVoltage: 12.4,
      notes: 'Pending DTC P0128 detected (Thermostat temperature threshold).',
      certified: true
    }
  ]);

  // Map of vehicleId -> driverId
  const [assignments, setAssignments] = useState({
    'v1': 'd1',
    'v2': 'd2',
    'v5': 'd3',
    'v6': 'd3',
    'v7': 'd1'
  });

  // The vehicle currently being monitored on the live Dashboard
  const [activeVehicleId, setActiveVehicleId] = useState('v1');

  // Background simulation for non-monitored active vehicles in the fleet
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'Active' && v.id !== activeVehicleId) {
          const latDelta = (Math.random() - 0.5) * 0.0005;
          const lonDelta = (Math.random() - 0.5) * 0.0005;
          return { ...v, lat: v.lat + latDelta, lon: v.lon + lonDelta };
        }
        return v;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [activeVehicleId]);

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
      submitInspection,
      runObdPreTripScan,
      updateDocumentExpiry
    }}>
      {children}
    </FleetContext.Provider>
  );
}
