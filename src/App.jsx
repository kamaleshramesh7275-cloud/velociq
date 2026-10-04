import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { SimulationContext } from './context/SimulationContext';
import { FleetProvider, useFleet } from './context/FleetContext';
import { ThemeProvider } from './context/ThemeContext';
import FleetManager from './pages/FleetManager';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
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
import DriverPortalPage from './pages/DriverPortalPage';
import DigitalCityPage from './pages/DigitalCityPage';
import DualCockpitPage from './pages/DualCockpitPage';
import RemoteControllerPage from './pages/RemoteControllerPage';
import CommandBar from './components/CommandBar';
import FloatingWorldPiP from './components/FloatingWorldPiP';
import AICopilotChatbot from './components/AICopilotChatbot';
import AccessRestrictedGuard from './components/AccessRestrictedGuard';
import { useAuth } from './context/AuthContext';
import { 
  calculateLimpHomeSpeed, 
  calculateKineticStopPenalty, 
  VEHICLE_PHYSICS_PROFILES 
} from './utils/speedMileagePhysics';
import { 
  DEFAULT_ROAD_COORDINATES, 
  interpolateRoadPosition 
} from './utils/osrmRouting';
import { 
  initWorldPhysics, 
  subscribeTelemetry, 
  setSafetyLogHandler, 
  setImmobilized, 
  injectFaultCode, 
  clearFaultCodes,
  setWorldControl 
} from './services/worldPhysicsEngine';

function SimulationWrapper() {
  const { activeVehicle, activeDriver } = useFleet();
  const vehicleProfile = activeVehicle?.profile || 'sedan';

  // Configuration States
  const [isConnected, setIsConnected] = useState(true);
  const [speedLimit, setSpeedLimit] = useState(90);
  const [activeDTCs, setActiveDTCs] = useState(['P0300', 'P0171']);
  const [spiffsCount, setSpiffsCount] = useState(30);
  const [fuelPrice, setFuelPrice] = useState(95);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const location = useLocation();
  const { currentRole, activeRoleData, ROLES, setRole, isRouteAllowed } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Telemetry Central State (Direct Authoritative Mirror of Real-World Physics)
  const [telemetry, setTelemetry] = useState({
    speed: 0.0,
    rpm: 850,
    gear: 'D',
    driveMode: 'SPORT',
    engineOn: true,
    coolant: 85.0,
    oilTemp: 90.0,
    oilPressurePsi: 28.0,
    maf: 2.4,
    fuel: 100.0,
    fuelL: 50.0,
    tripMileage: 0.0,
    co2: 0.0,
    tailpipeCo2: 0.0,
    wellToWheelCo2: 0.0,
    score: 100,
    voltage: 13.9,
    throttle: 0,
    brake: 0,
    steer: 0,
    latG: 0,
    longG: 0,
    tireTempFL: 35,
    tireTempFR: 35,
    brakeTempFL: 45,
    brakeTempFR: 45,
    tirePressureFL: 32.0,
    tirePressureFR: 32.0,
    tirePressureRL: 31.5,
    tirePressureRR: 31.5,
    events: [{ label: 'Real World Physics Online', delta: 0 }],
    history: Array.from({ length: 8 }, (_, index) => ({ name: `${index + 1}`, voltage: 13.9 })),
    activeDuration: 0,
    activeFuelUsed: 0,
    partsWear: { oil: 98.5, brakes: 96.0, battery: 99.2, coolant: 97.8 },
    predictedFailureDays: { oil: 180, brakes: 120, battery: 450, coolant: 220 },
    tripCoordinates: [[DEFAULT_ROAD_COORDINATES[0][0], DEFAULT_ROAD_COORDINATES[0][1]]],
    route: {
      progress: 0,
      lat: DEFAULT_ROAD_COORDINATES[0][0],
      lon: DEFAULT_ROAD_COORDINATES[0][1],
      heading: 0,
      startName: 'Fleet Hub (Connaught Place)',
      endName: 'Airport Cargo Terminal (IGI)',
      etaMinutes: 0
    },
    isRealWorldLive: true,
    lastRealWorldUpdate: Date.now()
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
    setWorldControl({ brake: 1.0, throttle: 0 });
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
      score: Math.max(0, prev.score - 2.5),
      events: [{ label: 'Emergency Brake Stop', delta: -2.5 }, ...prev.events.slice(0, 3)]
    }));
  };

  // ── Authoritative Real-World Telematics Pipeline ──────────────────────────
  // Replaces synthetic random timers with continuous real-world physics streaming
  useEffect(() => {
    initWorldPhysics(vehicleProfile);

    setSafetyLogHandler((log) => {
      setSafetyLog((prev) => [log, ...prev].slice(0, 15));
    });

    const unsubscribe = subscribeTelemetry((realTel) => {
      // Calculate dynamic route progress & ETA from real vehicle coordinates & mileage
      const tripMileage = realTel.tripMileage || 0;
      const progress = Math.min(100, (tripMileage / 25) * 100);
      const etaMinutes = realTel.speed > 3 
        ? Math.max(1, Math.round(((25 - (tripMileage % 25)) / realTel.speed) * 60))
        : 0;

      // Geofence checking on real lat/lon
      const currentLat = realTel.route?.lat || DEFAULT_ROAD_COORDINATES[0][0];
      const currentLon = realTel.route?.lon || DEFAULT_ROAD_COORDINATES[0][1];
      const minLat = Math.min(...GEOFENCE_COORDS.map(c => c[0]));
      const maxLat = Math.max(...GEOFENCE_COORDS.map(c => c[0]));
      const minLon = Math.min(...GEOFENCE_COORDS.map(c => c[1]));
      const maxLon = Math.max(...GEOFENCE_COORDS.map(c => c[1]));
      const isOutsideGeofence = currentLat < minLat || currentLat > maxLat || currentLon < minLon || currentLon > maxLon;

      if (isOutsideGeofence) {
        setSecurityState(s => ({ ...s, isGeofenceBreached: true, threatLevel: 'Alert' }));
      } else {
        setSecurityState(s => ({ ...s, isGeofenceBreached: false }));
      }

      const co2Tailpipe = Number(((realTel.activeFuelUsed || 0) * 2.31).toFixed(2));
      const co2WellToWheel = Number((co2Tailpipe * 1.18).toFixed(2));

      setTelemetry((prev) => {
        const history = [
          ...(prev.history || []).slice(-7),
          { name: `${((prev.history?.length || 0) + 1)}`, voltage: realTel.voltage }
        ];

        return {
          ...prev,
          ...realTel,
          co2: co2Tailpipe,
          tailpipeCo2: co2Tailpipe,
          wellToWheelCo2: co2WellToWheel,
          mileageUnit: 'km/L',
          engineTypeId: 'i4_petrol',
          batterySocPct: null,
          history,
          route: {
            ...realTel.route,
            progress,
            etaMinutes
          }
        };
      });
    });

    return () => unsubscribe();
  }, [vehicleProfile]);

  useEffect(() => {
    setImmobilized(securityState.isImmobilized);
  }, [securityState.isImmobilized]);

  const handleClearDTCs = () => {
    clearFaultCodes();
    setActiveDTCs([]);
  };

  const handleTriggerDTC = (code = 'P0300') => {
    injectFaultCode(code);
    setActiveDTCs((prev) => prev.includes(code) ? prev : [...prev, code]);
  };

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
        heading: 237,
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
      vehicleProfile,
      isPiPActive,
      setIsPiPActive
    }}>
      <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-hi)] transition-colors duration-300">
        <Sidebar 
          isConnected={isConnected} 
          setIsConnected={setIsConnected} 
          vehicleProfile={vehicleProfile} 
          speedLimit={speedLimit} 
          setSpeedLimit={setSpeedLimit} 
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto flex flex-col w-full min-w-0">
          {/* Top Command Bar */}
          <CommandBar
            isConnected={isConnected}
            spiffsCount={spiffsCount}
            weather={weather}
            aiThoughtLogs={aiThoughtLogs}
            activeDTCs={activeDTCs}
            securityState={securityState}
            telemetry={telemetry}
            isPiPActive={isPiPActive}
            onTogglePiP={() => setIsPiPActive(prev => !prev)}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />
          
          <div className="flex-1 w-full min-w-0 pb-16 md:pb-0 flex flex-col">
            {!isRouteAllowed(location.pathname) ? (
              <AccessRestrictedGuard
                pathname={location.pathname}
                activeRoleData={activeRoleData}
                ROLES={ROLES}
                setRole={setRole}
              />
            ) : (
              <Outlet />
            )}
          </div>

          {/* Global Floating 3D Twin Picture-in-Picture Viewport */}
          <FloatingWorldPiP />

          {/* Global Groq-Powered AI Telematics Copilot */}
          <AICopilotChatbot />

          {/* Native Mobile Bottom Navigation Bar */}
          <MobileBottomNav 
            onOpenMenu={() => setIsMobileMenuOpen(true)} 
            totalAlerts={activeDTCs?.length || 0} 
          />
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

function DriverPortalPageWrapper() {
  const sim = React.useContext(SimulationContext);
  return (
    <DriverPortalPage
      telemetry={sim.telemetry}
      trafficSignal={sim.trafficSignal}
      isLimpModeActive={sim.isLimpModeActive}
      onToggleLimpMode={() => sim.setIsLimpModeActive(!sim.isLimpModeActive)}
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
    <ThemeProvider>
      <FleetProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          {/* Standalone phone controller — no auth, no sidebar */}
          <Route path="/remote" element={<RemoteControllerPage />} />
          <Route path="/controller" element={<RemoteControllerPage />} />
          <Route element={isAuthenticated ? <SimulationWrapper /> : <Navigate to="/login" replace />}>
            <Route path="/dashboard" element={<TelemetryPageWrapper />} />
            <Route path="/driver-portal" element={<DriverPortalPageWrapper />} />
            <Route path="/simulator" element={<SimulatorPageWrapper />} />
            <Route path="/navigation" element={<NavigationPageWrapper />} />
            <Route path="/analytics" element={<AnalyticsPageWrapper />} />
            <Route path="/digital-twin" element={<LivingDigitalTwinPage />} />
            <Route path="/maintenance" element={<MaintenancePageWrapper />} />
            <Route path="/engine-twin" element={<EngineTwinPageWrapper />} />
            <Route path="/fleet" element={<FleetManager />} />
            <Route path="/safety" element={<DriverSafetyPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/world" element={<DigitalCityPage />} />
            <Route path="/split-view" element={<DualCockpitPage />} />
            <Route path="/dual-view" element={<DualCockpitPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </FleetProvider>
    </ThemeProvider>
  );
}

