import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { SimulationContext } from './context/SimulationContext';
import { FleetProvider, useFleet } from './context/FleetContext';
import FleetManager from './pages/FleetManager';
import Sidebar from './components/Sidebar';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SimulationSettings from './components/SimulationSettings';
import { GEOFENCE_COORDS } from './utils/osrmRouting';

import TelemetryPage from './pages/TelemetryPage';
import NavigationPage from './pages/NavigationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MaintenancePage from './pages/MaintenancePage';
import DriverSafetyPage from './pages/DriverSafetyPage';
import SecurityPage from './pages/SecurityPage';
import EngineTwinPage from './pages/EngineTwinPage';
import SimulatorPage from './pages/SimulatorPage';
import LivingDigitalTwinPage from './pages/LivingDigitalTwinPage';
import CommandBar from './components/CommandBar';
import { 
  calculateLimpHomeSpeed, 
  calculateKineticStopPenalty, 
  VEHICLE_PHYSICS_PROFILES 
} from './utils/speedMileagePhysics';
import { 
  DEFAULT_ROAD_COORDINATES, 
  interpolateRoadPosition 
} from './utils/osrmRouting';

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

  // Speed & Mileage Advanced Intelligence States
  const [isLimpModeActive, setIsLimpModeActive] = useState(false);
  const [trafficSignal, setTrafficSignal] = useState({
    distanceMeters: 420,
    phase: 'GREEN',
    timeRemainingSec: 24,
    cycleTotal: 35
  });
  const [kineticWaste, setKineticWaste] = useState({
    stopsCount: 0,
    energyDissipatedKj: 0,
    fuelWastedLiters: 0,
    costPenalty: 0
  });

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
      lat: DEFAULT_ROAD_COORDINATES[0][0],
      lon: DEFAULT_ROAD_COORDINATES[0][1],
      heading: 0,
      startName: 'Fleet Hub (Connaught Place)',
      endName: 'Airport Cargo Terminal (IGI)',
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

  const speedRef = React.useRef(telemetry.speed);
  useEffect(() => {
    speedRef.current = telemetry.speed;
  }, [telemetry.speed]);

  // GLOSA Traffic Light Simulator Tick (1 second interval)
  useEffect(() => {
    if (!isConnected || securityState.isImmobilized) return;

    const signalInterval = setInterval(() => {
      setTrafficSignal((prev) => {
        let newTime = prev.timeRemainingSec - 1;
        let newPhase = prev.phase;
        let newDistance = Math.max(0, prev.distanceMeters - (speedRef.current / 3.6));

        if (newTime <= 0) {
          if (prev.phase === 'GREEN') {
            newPhase = 'YELLOW';
            newTime = 4;
          } else if (prev.phase === 'YELLOW') {
            newPhase = 'RED';
            newTime = 18;
          } else {
            newPhase = 'GREEN';
            newTime = 25;
          }
        }

        if (newDistance <= 5) {
          newDistance = Math.floor(450 + Math.random() * 400);
          newPhase = Math.random() > 0.4 ? 'GREEN' : 'RED';
          newTime = newPhase === 'GREEN' ? 22 : 16;
        }

        return {
          ...prev,
          distanceMeters: Math.round(newDistance),
          phase: newPhase,
          timeRemainingSec: newTime
        };
      });
    }, 1000);

    return () => clearInterval(signalInterval);
  }, [isConnected, securityState.isImmobilized]);


  const handleSimulateStop = () => {
    const massKg = VEHICLE_PHYSICS_PROFILES[vehicleProfile]?.massKg || 1400;
    const penalty = calculateKineticStopPenalty(telemetry.speed, 0, massKg);
    setKineticWaste((prev) => ({
      stopsCount: prev.stopsCount + 1,
      energyDissipatedKj: prev.energyDissipatedKj + penalty.energyKj,
      fuelWastedLiters: prev.fuelWastedLiters + penalty.fuelWastedLiters,
      costPenalty: prev.costPenalty + penalty.costPenalty
    }));
    setTelemetry((prev) => ({
      ...prev,
      speed: 0,
      rpm: 750,
      score: Math.max(0, prev.score - 2.5),
      events: [{ label: 'Full Stop (GLOSA Lost)', delta: -2.5 }, ...prev.events.slice(0, 3)]
    }));
  };

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

        // Limp-Home Velocity Governor Enforced Speed Ceiling
        if (isLimpModeActive) {
          const profile = VEHICLE_PHYSICS_PROFILES[vehicleProfile] || VEHICLE_PHYSICS_PROFILES.sedan;
          const currentFuelLiters = (profile.tankCapacityLiters * prev.fuel) / 100;
          const remainingDist = Math.max(0, 25 - prev.tripMileage);
          const limp = calculateLimpHomeSpeed(remainingDist, currentFuelLiters, vehicleProfile);
          if (limp.recommendedSpeedKmh) {
            maxSpeed = Math.min(maxSpeed, limp.recommendedSpeedKmh);
          }
        }

        let speedDelta = (Math.random() - 0.45) * 6;
        if (aiAgentOptimized) {
          speedDelta = (Math.random() - 0.45) * 2.5;
        }
        if ((aiNavigatorEnabled && isBadWeather && prev.speed > maxSpeed) || (isLimpModeActive && prev.speed > maxSpeed)) {
           speedDelta = -3.2; // AI / Governor applies gentle braking to reach safe speed
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
        let newHeading = prev.route.heading || 0;
        if (newProgress < 100 && speedVal > 0) {
          const roadPos = interpolateRoadPosition(DEFAULT_ROAD_COORDINATES, newProgress);
          newLat = roadPos.lat;
          newLon = roadPos.lon;
          newHeading = roadPos.heading;
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

             if (eventLabel === 'Harsh Brake') {
               const mass = VEHICLE_PHYSICS_PROFILES[vehicleProfile]?.massKg || 1400;
               const penalty = calculateKineticStopPenalty(prev.speed, speedVal, mass);
               setKineticWaste((kw) => ({
                 stopsCount: kw.stopsCount + (speedVal < 5 ? 1 : 0),
                 energyDissipatedKj: kw.energyDissipatedKj + penalty.energyKj,
                 fuelWastedLiters: kw.fuelWastedLiters + penalty.fuelWastedLiters,
                 costPenalty: kw.costPenalty + penalty.costPenalty
               }));
             }
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
            heading: newHeading,
            startName: prev.route.startName,
            endName: prev.route.endName,
            etaMinutes: newEtaMinutes
          }
        };
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isConnected, vehicleProfile, speedLimit, aiAgentOptimized, securityState.isImmobilized]);


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
        lat: DEFAULT_ROAD_COORDINATES[0][0],
        lon: DEFAULT_ROAD_COORDINATES[0][1],
        heading: 0,
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
      safetyLog,
      isLimpModeActive,
      setIsLimpModeActive,
      trafficSignal,
      kineticWaste,
      handleSimulateStop,
      activeDTCs,
      setActiveDTCs,
      handleClearDTCs,
      handleTriggerDTC,
      spiffsCount,
      fuelPrice,
      setFuelPrice,
      tripHistory,
      handleEndTrip,
      handleClearHistory,
      handleServicePart,
      handleTrainingComplete,
      modelState,
      setModelState,
      vehicleProfile
    }}>
      <div className="flex h-screen overflow-hidden bg-[#F4F6F9] text-[#0A0F1D]">
        <Sidebar 
          isConnected={isConnected} 
          setIsConnected={setIsConnected} 
          vehicleProfile={vehicleProfile} 
          speedLimit={speedLimit} 
          setSpeedLimit={setSpeedLimit} 
        />
        <div className="relative flex-1 overflow-auto flex flex-col">
          {/* Top Command Bar */}
          <CommandBar
            isConnected={isConnected}
            spiffsCount={spiffsCount}
            weather={weather}
            aiThoughtLogs={aiThoughtLogs}
            activeDTCs={activeDTCs}
            securityState={securityState}
          />
          
          <Outlet />
        </div>
      </div>
    </SimulationContext.Provider>
  );
}

function TelemetryPageWrapper() {
  const sim = React.useContext(SimulationContext);
  return (
    <TelemetryPage 
      telemetry={sim.telemetry} 
      isConnected={sim.isConnected} 
      speedLimit={sim.speedLimit} 
      activeDTCs={sim.activeDTCs} 
      spiffsCount={sim.spiffsCount}
      handleClearDTCs={sim.handleClearDTCs} 
      handleTriggerDTC={sim.handleTriggerDTC} 
      weather={sim.weather}
      fuelPrice={sim.fuelPrice}
      aiThoughtLogs={sim.aiThoughtLogs}
    />
  );
}

function SimulatorPageWrapper() {
  const sim = React.useContext(SimulationContext);
  return <SimulatorPage telemetry={sim.telemetry} />;
}

function NavigationPageWrapper() {
  const sim = React.useContext(SimulationContext);
  return (
    <NavigationPage 
      telemetry={sim.telemetry} 
      weather={sim.weather} 
      tripHistory={sim.tripHistory} 
      aiNavigatorEnabled={sim.aiNavigatorEnabled}
      setAiNavigatorEnabled={sim.setAiNavigatorEnabled}
      aiThoughtLogs={sim.aiThoughtLogs}
      handleEndTrip={sim.handleEndTrip}
      handleClearHistory={sim.handleClearHistory}
      isLimpModeActive={sim.isLimpModeActive}
      onToggleLimpMode={() => sim.setIsLimpModeActive(!sim.isLimpModeActive)}
      trafficSignal={sim.trafficSignal}
      kineticWaste={sim.kineticWaste}
      onSimulateStop={sim.handleSimulateStop}
    />
  );
}

function AnalyticsPageWrapper() {
  const sim = React.useContext(SimulationContext);
  return (
    <AnalyticsPage 
      telemetry={sim.telemetry} 
      tripHistory={sim.tripHistory} 
      modelState={sim.modelState} 
      setModelState={sim.setModelState}
      aiAgentOptimized={sim.aiAgentOptimized}
      setAiAgentOptimized={sim.setAiAgentOptimized}
      fuelPrice={sim.fuelPrice}
      setFuelPrice={sim.setFuelPrice}
      handleTrainingComplete={sim.handleTrainingComplete}
      isConnected={sim.isConnected}
      speedLimit={sim.speedLimit}
    />
  );
}

function MaintenancePageWrapper() {
  const sim = React.useContext(SimulationContext);
  return (
    <MaintenancePage 
      telemetry={sim.telemetry} 
      handleServicePart={sim.handleServicePart} 
      modelState={sim.modelState} 
      aiMechanicEnabled={sim.aiMechanicEnabled}
      setAiMechanicEnabled={sim.setAiMechanicEnabled}
    />
  );
}

function EngineTwinPageWrapper() {
  const sim = React.useContext(SimulationContext);
  return (
    <EngineTwinPage 
      telemetry={sim.telemetry} 
      onTriggerDTC={sim.handleTriggerDTC} 
      onClearDTCs={sim.handleClearDTCs} 
      activeDTCs={sim.activeDTCs} 
    />
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('velociq_logged_in') !== 'false');

  const handleLogin = () => {
    sessionStorage.setItem('velociq_logged_in', 'true');
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(sessionStorage.getItem('velociq_logged_in') !== 'false');
    };

    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  return (
    <FleetProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route element={isAuthenticated ? <SimulationWrapper /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<TelemetryPageWrapper />} />
          <Route path="/simulator" element={<SimulatorPageWrapper />} />
          <Route path="/navigation" element={<NavigationPageWrapper />} />
          <Route path="/analytics" element={<AnalyticsPageWrapper />} />
          <Route path="/digital-twin" element={<LivingDigitalTwinPage />} />
          <Route path="/maintenance" element={<MaintenancePageWrapper />} />
          <Route path="/engine-twin" element={<EngineTwinPageWrapper />} />
          <Route path="/fleet" element={<FleetManager />} />
          <Route path="/safety" element={<DriverSafetyPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </FleetProvider>
  );
}

