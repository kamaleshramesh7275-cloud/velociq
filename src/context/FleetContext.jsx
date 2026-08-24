import { createContext, useContext, useState, useEffect } from 'react';

const FleetContext = createContext();

export function useFleet() {
  return useContext(FleetContext);
}

export function FleetProvider({ children }) {
  const [vehicles, setVehicles] = useState([
    { id: 'v1', name: 'Alpha Cruiser', profile: 'sedan', type: 'Sedan', status: 'Active', licensePlate: 'NY-482-XA', mileage: 12450, lat: 28.6139, lon: 77.2090 },
    { id: 'v2', name: 'Cargo Hauler', profile: 'suv', type: 'Truck', status: 'Idle', licensePlate: 'TX-910-BB', mileage: 82000, lat: 28.6250, lon: 77.2150 },
    { id: 'v3', name: 'Eco Commuter', profile: 'hatchback', type: 'Hatchback', status: 'Maintenance', licensePlate: 'CA-100-EV', mileage: 45000, lat: 28.6300, lon: 77.2200 },
    { id: 'v4', name: 'City Sprinter', profile: 'hatchback', type: 'Hatchback', status: 'Idle', licensePlate: 'WA-777-XYZ', mileage: 3100, lat: 28.6400, lon: 77.2100 },
    { id: 'v5', name: 'Heavy Duty', profile: 'suv', type: 'Truck', status: 'Active', licensePlate: 'FL-202-CD', mileage: 110200, lat: 28.6050, lon: 77.1950 },
  ]);

  const [drivers, setDrivers] = useState([
    { id: 'd1', name: 'Sarah Jenkins', license: 'CDL-A 92839', experience: '8 Years', rating: 4.8, avatar: 'SJ' },
    { id: 'd2', name: 'Marcus Cole', license: 'CDL-B 10293', experience: '3 Years', rating: 4.2, avatar: 'MC' },
    { id: 'd3', name: 'Elena Rodriguez', license: 'CDL-A 88392', experience: '12 Years', rating: 4.9, avatar: 'ER' },
    { id: 'd4', name: 'James Wilson', license: 'Class C 99821', experience: '1 Year', rating: 3.9, avatar: 'JW' }
  ]);

  // Map of vehicleId -> driverId
  const [assignments, setAssignments] = useState({
    'v1': 'd1',
    'v5': 'd3'
  });

  // The vehicle currently being monitored on the live Dashboard
  const [activeVehicleId, setActiveVehicleId] = useState('v1');

  // Background simulation for non-monitored active vehicles in the fleet
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'Active' && v.id !== activeVehicleId) {
          // Simulate some random movement
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

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
  const activeDriver = drivers.find(d => d.id === assignments[activeVehicleId]) || null;

  return (
    <FleetContext.Provider value={{
      vehicles,
      drivers,
      assignments,
      activeVehicleId,
      activeVehicle,
      activeDriver,
      assignDriver,
      removeDriver,
      setVehicleStatus,
      monitorVehicle
    }}>
      {children}
    </FleetContext.Provider>
  );
}
