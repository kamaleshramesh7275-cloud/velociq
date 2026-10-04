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
    }
  ]);

  // Map of vehicleId -> driverId
  const [assignments, setAssignments] = useState({
    'v1': 'd1'
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
