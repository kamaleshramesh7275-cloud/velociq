import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SimulationContext } from './context/SimulationContext';
import { FleetProvider, useFleet } from './context/FleetContext';
import FleetManager from './pages/FleetManager';
import Sidebar from './components/Sidebar';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SimulationSettings from './components/SimulationSettings';
import { GEOFENCE_COORDS } from './components/RouteTracker';

import TelemetryPage from './pages/TelemetryPage';
import NavigationPage from './pages/NavigationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MaintenancePage from './pages/MaintenancePage';
import DriverSafetyPage from './pages/DriverSafetyPage';
import SecurityPage from './pages/SecurityPage';

function SimulationWrapper() {
  const { activeVehicle, activeDriver } = useFleet();
  const vehicleProfile = activeVehicle?.profile || 'sedan';

  // Configuration States
  const [isConnected, setIsConnected] = useState(true);
  const [speedLimit, setSpeedLimit] = useState(90);
  const [activeDTCs, setActiveDTCs] = useState(['P0300', 'P0171']);
  const [spiffsCount, setSpiffsCount] = useState(30);
  const [fuelPrice, setFuelPrice] = useState(95);

  // AI Model States
  const [modelState, setModelState] = useState({
    driver: { trained: false, accuracy: 50, isErratic: false, history: [], lr: 0.01, epochs: 20, type: 'Neural Network' },
    maintenance: { trained: false, accuracy: 50, isErratic: false, history: [], lr: 0.01, epochs: 20, type: 'Neural Network' },
    fuel: { trained: false, accuracy: 50, isErratic: false, history: [], lr: 0.01, epochs: 20, type: 'Neural Network' }
  });
  const [aiAgentOptimized, setAiAgentOptimized] = useState(false);

  // New AI Agents States
  const [aiNavigatorEnabled, setAiNavigatorEnabled] = useState(false);
  const [aiMechanicEnabled, setAiMechanicEnabled] = useState(false);
  const [aiThoughtLogs, setAiThoughtLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized.' }]);

  // New States for Safety & Security
  const [securityState, setSecurityState] = useState({ threatLevel: 'Secure', anomalies: [], isGeofenceBreached: false, isImmobilized: false });
  const [safetyLog, setSafetyLog] = useState([]);

  // Trip History log
  const [tripHistory, setTripHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('velociq_trip_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Weather State
  const [weather, setWeather] = useState(null);

  // Telemetry Central State
  const [telemetry, setTelemetry] = useState({
    speed: 55.2,
    rpm: 2450,
    coolant: 85.8,
    maf: 9.4,
    fuel: 40.1,
    tripMileage: 0.0,
    co2: 0.0,
    score: 100,
    voltage: 13.9,
    events: [{ label: 'Smooth launch', delta: 0 }],
    history: Array.from({ length: 8 }, (_, index) => ({ name: `${index + 1}`, voltage: 13.9 + index * 0.04 })),
    activeDuration: 0,
    activeFuelUsed: 0,
    partsWear: { oil: 94.2, brakes: 88.5, battery: 98.1, coolant: 96.4 },
    predictedFailureDays: { oil: 120, brakes: 90, battery: 400, coolant: 150 },
    tripCoordinates: [],
    route: {
      progress: 0,
      lat: 28.6139,
      lon: 77.2090,
      startName: 'Fleet Hub (City Center)',
      endName: 'Airport Cargo Terminal',
      etaMinutes: 30
    }
  });

  // BLE offline package simulation
  useEffect(() => {
    let spiffsInterval;
    if (!isConnected) {
      spiffsInterval = setInterval(() => {
        setSpiffsCount((prev) => prev + 1);
      }, 2000);
    } else {
      setSpiffsCount(0);
    }
    return () => clearInterval(spiffsInterval);
  }, [isConnected]);

  // Weather Polling
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${telemetry.route.lat}&longitude=${telemetry.route.lon}&current_weather=true`);
        const data = await res.json();
        if (data && data.current_weather) {
          setWeather(data.current_weather);
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };
    
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  // Main Telemetry Simulator Loop
  useEffect(() => {
    if (!isConnected || securityState.isImmobilized) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        let maxSpeed = 120;
        let maxRpm = 5000;
        let maxMaf = 18;
        let fuelBurn = 0.015;

        if (vehicleProfile === 'hatchback') {
          maxSpeed = 95;
          maxRpm = 3200;
          maxMaf = 12;
          fuelBurn = 0.008;
        } else if (vehicleProfile === 'suv') {
          maxSpeed = 110;
          maxRpm = 4200;
          maxMaf = 24;
          fuelBurn = 0.028;
        }

        if (aiAgentOptimized) {
          fuelBurn = fuelBurn * 0.85;
        }

        let isBadWeather = false;
        if (weather) {
           const code = weather.weathercode;
           if (code >= 51 || code === 45 || code === 48) {
             isBadWeather = true;
           }
        }

        if (aiNavigatorEnabled && isBadWeather) {
           maxSpeed = maxSpeed * 0.7; // AI slows down the car safely in bad weather
        }

        let speedDelta = (Math.random() - 0.45) * 6;
        if (aiAgentOptimized) {
          speedDelta = (Math.random() - 0.45) * 2.5;
        }
        if (aiNavigatorEnabled && isBadWeather && prev.speed > maxSpeed) {
           speedDelta = -3.0; // AI applies gentle braking to reach safe speed
        }

        const newSpeed = Math.max(0, Math.min(maxSpeed, prev.speed + speedDelta));

        const targetRpm = newSpeed * 35 + 800 + (Math.random() - 0.5) * 200;
        const newRpm = Math.max(700, Math.min(maxRpm, targetRpm));

        const coolantDelta = (newRpm > 3000 ? 0.3 : -0.1) + (Math.random() - 0.5) * 0.2;
        const newCoolant = Math.max(75, Math.min(108, prev.coolant + coolantDelta));

        const targetMaf = (newRpm / 250) + (Math.random() - 0.5) * 1.2;
        const newMaf = Math.max(2, Math.min(maxMaf, targetMaf));

        const newFuel = Math.max(0, prev.fuel - fuelBurn);

        const newVoltage = 13.8 + Math.random() * 0.35;
        const newHistory = [...prev.history.slice(-7), { name: `${prev.history.length + 1}`, voltage: newVoltage }];

        let speedVal = newSpeed;
        let rpmVal = newRpm;
        let mafVal = newMaf;
        let coolantVal = newCoolant;

        let newTripMileage = prev.tripMileage;
        let newProgress = prev.route.progress;

        if (prev.route.progress >= 100) {
          speedVal = 0;
          rpmVal = 800 + (Math.random() - 0.5) * 40;
          mafVal = 2.4 + (Math.random() - 0.5) * 0.4;
          newProgress = 100;
        } else {
          newTripMileage = prev.tripMileage + (speedVal / 3600) * 0.3;
          newProgress = (newTripMileage / 25) * 100;
          if (newProgress >= 100) newProgress = 100;
        }

        let newLat = prev.route.lat;
        let newLon = prev.route.lon;
        if (newProgress < 100 && speedVal > 0) {
          newLat = prev.route.lat + (speedVal / 3600) * 0.3 * 0.00009;
          newLon = prev.route.lon + (speedVal / 3600) * 0.3 * 0.00011;
        }

        const newEtaMinutes = speedVal > 0 ? ((25 - newTripMileage) / speedVal) * 60 : 0;

        const newDuration = prev.activeDuration + 0.3;
        const fuelBurnedThisTick = (mafVal * 0.33 / 3600) * 0.3;
        const newActiveFuelUsed = prev.activeFuelUsed + fuelBurnedThisTick;

        const newTripCoordinates = [...prev.tripCoordinates];
        if (Math.random() < 0.2) {
           newTripCoordinates.push([newLat, newLon]);
        }

        const minLat = Math.min(...GEOFENCE_COORDS.map(c => c[0]));
        const maxLat = Math.max(...GEOFENCE_COORDS.map(c => c[0]));
        const minLon = Math.min(...GEOFENCE_COORDS.map(c => c[1]));
        const maxLon = Math.max(...GEOFENCE_COORDS.map(c => c[1]));
        const isOutsideGeofence = newLat < minLat || newLat > maxLat || newLon < minLon || newLon > maxLon;

        let scorePenalty = 0;
        let eventLabel = '';

        const rand = Math.random();
        if (isOutsideGeofence) {
          scorePenalty = 2.0;
          eventLabel = 'Geofence Exit';
        } else if (speedVal > speedLimit) {
          scorePenalty = 0.8;
          eventLabel = 'Speeding';
        } else if (speedDelta < -4.8) {
          scorePenalty = 3.5;
          eventLabel = 'Harsh Brake';
        } else if (speedDelta > 4.8) {
          scorePenalty = 2.5;
          eventLabel = 'Rapid Accel';
        } else if (rpmVal > 3800) {
          scorePenalty = 0.5;
          eventLabel = 'Engine Overrev';
        } else if (speedVal === 0 && rand < 0.1) {
          scorePenalty = 0.2;
          eventLabel = 'Idle penalty';
        }

        let updatedScore = prev.score;
        let updatedEvents = prev.events;

        if (eventLabel) {
          updatedScore = Math.max(0, prev.score - scorePenalty);
          updatedEvents = [{ label: eventLabel, delta: -scorePenalty }, ...prev.events.slice(0, 3)];
          
          // Log to Safety Coach if it's a driving event
          if (['Harsh Brake', 'Rapid Accel', 'Speeding'].includes(eventLabel)) {
             setSafetyLog(logs => [{ 
               id: Date.now(),
               time: new Date().toLocaleTimeString(), 
               type: eventLabel, 
               penalty: scorePenalty,
               speed: speedVal.toFixed(1)
             }, ...logs].slice(0, 10));
          }
        } else if (rand < 0.2) {
          updatedScore = Math.min(100, prev.score + 0.1);
        }

        // Random Security Anomalies Simulation
        const anomalyRand = Math.random();
        if (anomalyRand < 0.005) { // 0.5% chance per tick of sensor drop
           setSecurityState(s => ({
              ...s,
              threatLevel: 'Elevated',
              anomalies: [{ id: Date.now(), time: new Date().toLocaleTimeString(), type: 'Signal Drop', message: 'Intermittent signal loss from Engine Control Unit.' }, ...s.anomalies].slice(0, 5)
           }));
        } else if (fuelBurn > 0.05) { // Massive fuel drop (simulated theft)
           setSecurityState(s => ({
              ...s,
              threatLevel: 'Critical',
              anomalies: [{ id: Date.now(), time: new Date().toLocaleTimeString(), type: 'Fuel Siphoning', message: 'Rapid fuel loss detected while vehicle is stationary or slow.' }, ...s.anomalies].slice(0, 5)
           }));
        }
        
        if (isOutsideGeofence) {
           setSecurityState(s => ({ ...s, isGeofenceBreached: true, threatLevel: 'Alert' }));
        } else {
           setSecurityState(s => ({ ...s, isGeofenceBreached: false }));
        }

        let brakeWearDelta = 0.0015;

        if (eventLabel === 'Harsh Brake') {
          brakeWearDelta += isBadWeather ? 2.5 : 1.5;
        }
        let oilWearDelta = 0.002;
        if (rpmVal > 3800) {
          oilWearDelta += 0.02;
        }
        let coolantWearDelta = 0.001;
        if (coolantVal > 100) {
          coolantWearDelta += 0.015;
        }

        // AI Navigator Thought Logging
        if (aiNavigatorEnabled) {
          const randLog = Math.random();
          if (isBadWeather && randLog < 0.05) {
             setAiThoughtLogs(logs => [{ time: new Date().toLocaleTimeString(), message: 'Heavy rain detected. Reducing max speed for safety and dynamically recalculating ETA...' }, ...logs].slice(0, 5));
          } else if (randLog < 0.01) {
             setAiThoughtLogs(logs => [{ time: new Date().toLocaleTimeString(), message: 'Traffic flow is optimal. Maintaining current routing coordinates.' }, ...logs].slice(0, 5));
          }
        }

        // AI Mechanic Predictive Failure
        let newPredictedFailureDays = prev.predictedFailureDays;
        if (aiMechanicEnabled) {
           newPredictedFailureDays = {
             oil: Math.max(1, Math.round(prev.partsWear.oil / (oilWearDelta * 200))),
             brakes: Math.max(1, Math.round(prev.partsWear.brakes / (brakeWearDelta * 200))),
             battery: Math.max(1, Math.round(prev.partsWear.battery / (0.0005 * 200))),
             coolant: Math.max(1, Math.round(prev.partsWear.coolant / (coolantWearDelta * 200)))
           };

           if (newPredictedFailureDays.brakes < 15 && Math.random() < 0.1) {
             updatedEvents = [{ label: 'AI Alert: Brake Wear Critical!', delta: 0 }, ...updatedEvents].slice(0, 3);
           }
        }

        const newPartsWear = {
          oil: Math.max(0, prev.partsWear.oil - oilWearDelta),
          brakes: Math.max(0, prev.partsWear.brakes - brakeWearDelta),
          battery: Math.max(0, prev.partsWear.battery - 0.0005),
          coolant: Math.max(0, prev.partsWear.coolant - coolantWearDelta)
        };

        return {
          speed: speedVal,
          rpm: rpmVal,
          coolant: coolantVal,
          maf: mafVal,
          fuel: newFuel,
          tripMileage: newTripMileage,
          co2: newTripMileage * 0.192,
          score: updatedScore,
          events: updatedEvents,
          voltage: newVoltage,
          history: newHistory,
          activeDuration: newDuration,
          activeFuelUsed: newActiveFuelUsed,
          partsWear: newPartsWear,
          predictedFailureDays: newPredictedFailureDays,
          tripCoordinates: newTripCoordinates,
          route: {
            progress: newProgress,
            lat: newLat,
            lon: newLon,
            startName: prev.route.startName,
            endName: prev.route.endName,
            etaMinutes: newEtaMinutes
          }
        };
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isConnected, vehicleProfile, speedLimit, aiAgentOptimized]);

  const handleClearDTCs = () => setActiveDTCs([]);
  const handleTriggerDTC = () => setActiveDTCs(['P0300']);

  const handleEndTrip = () => {
    const distanceCovered = telemetry.tripMileage;
    const durationSeconds = telemetry.activeDuration;
    const fuelConsumed = telemetry.activeFuelUsed;
    const finalScore = telemetry.score;

    if (distanceCovered <= 0) return;

    const newTrip = {
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      distance: distanceCovered,
      avgSpeed: durationSeconds > 0 ? (distanceCovered / (durationSeconds / 3600)) : 0,
      fuelUsed: fuelConsumed,
      score: finalScore,
      path: telemetry.tripCoordinates
    };

    const updatedHistory = [newTrip, ...tripHistory].slice(0, 10);
    setTripHistory(updatedHistory);
    localStorage.setItem('velociq_trip_history', JSON.stringify(updatedHistory));

    setTelemetry((prev) => ({
      ...prev,
      tripMileage: 0.0,
      co2: 0.0,
      score: 100,
      activeDuration: 0,
      activeFuelUsed: 0,
      tripCoordinates: [],
      events: [{ label: 'Smooth launch', delta: 0 }],
      route: {
        ...prev.route,
        progress: 0,
        lat: 28.6139,
        lon: 77.2090,
        etaMinutes: 30
      }
    }));
  };

  const handleClearHistory = () => {
    localStorage.removeItem('velociq_trip_history');
    setTripHistory([]);
  };

  const handleServicePart = (partKey) => {
    setTelemetry((prev) => ({
      ...prev,
      partsWear: {
        ...prev.partsWear,
        [partKey]: 100.0
      }
    }));
  };

  const handleTrainingComplete = (modelKey, trainedData) => {
    setModelState((prev) => ({
      ...prev,
      [modelKey]: trainedData
    }));
  };

  return (
    <SimulationContext.Provider value={{ 
      telemetry, 
      setTelemetry, 
      isConnected, 
      setIsConnected, 
      speedLimit, 
      setSpeedLimit, 
      aiAgentOptimized, 
      setAiAgentOptimized,
      weather,
      aiNavigatorEnabled,
      setAiNavigatorEnabled,
      aiMechanicEnabled,
      setAiMechanicEnabled,
      aiThoughtLogs,
      securityState,
      setSecurityState,
      safetyLog
    }}>
      <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),linear-gradient(135deg,#020617_0%,#030712_100%)]">
        <Sidebar 
          isConnected={isConnected} 
          setIsConnected={setIsConnected} 
          vehicleProfile={vehicleProfile} 
          speedLimit={speedLimit} 
          setSpeedLimit={setSpeedLimit} 
        />
        <div className="relative flex-1 overflow-auto flex flex-col">
          {/* Top bar across all dashboards */}
          <div className="border-b border-slate-800 bg-slate-900/40 px-8 py-4 backdrop-blur z-40">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <h2 className="text-xl font-semibold text-white">Monitoring: {activeVehicle?.name} ({activeVehicle?.licensePlate})</h2>
              <div className="text-sm text-slate-400">Assigned: {activeDriver?.name || 'Unassigned'}</div>
            </div>
          </div>
          
          <Routes>
            <Route path="/dashboard" element={
              <TelemetryPage 
                telemetry={telemetry} 
                isConnected={isConnected} 
                speedLimit={speedLimit} 
                activeDTCs={activeDTCs} 
                spiffsCount={spiffsCount}
                handleClearDTCs={handleClearDTCs} 
                handleTriggerDTC={handleTriggerDTC} 
              />
            } />
            <Route path="/navigation" element={
              <NavigationPage 
                telemetry={telemetry} 
                weather={weather} 
                tripHistory={tripHistory} 
                aiNavigatorEnabled={aiNavigatorEnabled}
                setAiNavigatorEnabled={setAiNavigatorEnabled}
                aiThoughtLogs={aiThoughtLogs}
              />
            } />
            <Route path="/analytics" element={
              <AnalyticsPage 
                telemetry={telemetry} 
                tripHistory={tripHistory} 
                modelState={modelState} 
                setModelState={setModelState}
                aiAgentOptimized={aiAgentOptimized}
                setAiAgentOptimized={setAiAgentOptimized}
                fuelPrice={fuelPrice}
              />
            } />
            <Route path="/maintenance" element={
              <MaintenancePage 
                telemetry={telemetry} 
                handleServicePart={handleServicePart} 
                modelState={modelState} 
                aiMechanicEnabled={aiMechanicEnabled}
                setAiMechanicEnabled={setAiMechanicEnabled}
              />
            } />
            <Route path="/fleet" element={<FleetManager />} />
            <Route path="/safety" element={<DriverSafetyPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </SimulationContext.Provider>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('velociq_logged_in') === 'true');

  const handleLogin = () => {
    sessionStorage.setItem('velociq_logged_in', 'true');
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(sessionStorage.getItem('velociq_logged_in') === 'true');
    };

    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  return (
    <FleetProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? <SimulationWrapper /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </FleetProvider>
  );
}
