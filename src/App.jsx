import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import TelemetryPanel from './components/TelemetryPanel';
import DriverScore from './components/DriverScore';
import AlertsFeed from './components/AlertsFeed';
import FuelMileageCard from './components/FuelMileageCard';
import CostComparison from './components/CostComparison';
import StatusBar from './components/StatusBar';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import SimulationSettings from './components/SimulationSettings';
import AICoachingPanel from './components/AICoachingPanel';
import ECUDiagnostics from './components/ECUDiagnostics';
import TripLogger from './components/TripLogger';
import MaintenanceTracker from './components/MaintenanceTracker';
import RouteTracker from './components/RouteTracker';
import CostSavingsCalculator from './components/CostSavingsCalculator';

function Dashboard() {
  const navigate = useNavigate();

  // Configuration States
  const [isConnected, setIsConnected] = useState(true);
  const [vehicleProfile, setVehicleProfile] = useState('sedan');
  const [speedLimit, setSpeedLimit] = useState(90);
  const [activeDTCs, setActiveDTCs] = useState(['P0300', 'P0171']);
  const [spiffsCount, setSpiffsCount] = useState(30);
  const [fuelPrice, setFuelPrice] = useState(95);

  // Trip History log
  const [tripHistory, setTripHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('velociq_trip_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Telemetry Central State (with Phase 2 nested properties)
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
      setSpiffsCount(0); // reset on reconnect (simulates syncing data back to cloud)
    }
    return () => clearInterval(spiffsInterval);
  }, [isConnected]);

  // Main Telemetry Simulator Loop
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Vehicle Profile Configs
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

        // Simulate Speed
        const speedDelta = (Math.random() - 0.45) * 6;
        const newSpeed = Math.max(0, Math.min(maxSpeed, prev.speed + speedDelta));

        // Correlate RPM to Speed
        const targetRpm = newSpeed * 35 + 800 + (Math.random() - 0.5) * 200;
        const newRpm = Math.max(700, Math.min(maxRpm, targetRpm));

        // Correlate Coolant Temp to RPM
        const coolantDelta = (newRpm > 3000 ? 0.3 : -0.1) + (Math.random() - 0.5) * 0.2;
        const newCoolant = Math.max(75, Math.min(108, prev.coolant + coolantDelta));

        // Correlate MAF to RPM
        const targetMaf = (newRpm / 250) + (Math.random() - 0.5) * 1.2;
        const newMaf = Math.max(2, Math.min(maxMaf, targetMaf));

        // Fuel reserve decrease
        const newFuel = Math.max(0, prev.fuel - fuelBurn);

        // Alternator voltage (Line chart simulation)
        const newVoltage = 13.8 + Math.random() * 0.35;
        const newHistory = [...prev.history.slice(-7), { name: `${prev.history.length + 1}`, voltage: newVoltage }];

        // Core physics parameters
        let speedVal = newSpeed;
        let rpmVal = newRpm;
        let mafVal = newMaf;
        let coolantVal = newCoolant;

        let newTripMileage = prev.tripMileage;
        let newProgress = prev.route.progress;

        if (prev.route.progress >= 100) {
          // Destination reached: lock speed and idle
          speedVal = 0;
          rpmVal = 800 + (Math.random() - 0.5) * 40;
          mafVal = 2.4 + (Math.random() - 0.5) * 0.4;
          newProgress = 100;
        } else {
          // Distance covering: speed km/h to distance in km for 300ms tick
          newTripMileage = prev.tripMileage + (speedVal / 3600) * 0.3;
          newProgress = (newTripMileage / 25) * 100;
          if (newProgress >= 100) newProgress = 100;
        }

        // GPS Coordinates tracking
        let newLat = prev.route.lat;
        let newLon = prev.route.lon;
        if (newProgress < 100 && speedVal > 0) {
          newLat = prev.route.lat + (speedVal / 3600) * 0.3 * 0.00009;
          newLon = prev.route.lon + (speedVal / 3600) * 0.3 * 0.00011;
        }

        const newEtaMinutes = speedVal > 0 ? ((25 - newTripMileage) / speedVal) * 60 : 0;

        // Trip active timer and active fuel burned metrics
        const newDuration = prev.activeDuration + 0.3;
        const fuelBurnedThisTick = (mafVal * 0.33 / 3600) * 0.3;
        const newActiveFuelUsed = prev.activeFuelUsed + fuelBurnedThisTick;

        // Score events logic
        let scorePenalty = 0;
        let eventLabel = '';

        const rand = Math.random();
        if (speedVal > speedLimit) {
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
        } else if (rand < 0.2) {
          updatedScore = Math.min(100, prev.score + 0.1);
        }

        // Parts wear calculations
        let brakeWearDelta = 0.0015;
        if (eventLabel === 'Harsh Brake') {
          brakeWearDelta += 1.5;
        }
        let oilWearDelta = 0.002;
        if (rpmVal > 3800) {
          oilWearDelta += 0.02;
        }
        let coolantWearDelta = 0.001;
        if (coolantVal > 100) {
          coolantWearDelta += 0.015;
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
  }, [isConnected, vehicleProfile, speedLimit]);

  const handleClearDTCs = () => {
    setActiveDTCs([]);
  };

  const handleTriggerDTC = () => {
    setActiveDTCs(['P0300']);
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
      score: finalScore
    };

    const updatedHistory = [newTrip, ...tripHistory];
    setTripHistory(updatedHistory);
    localStorage.setItem('velociq_trip_history', JSON.stringify(updatedHistory));

    setTelemetry((prev) => ({
      ...prev,
      tripMileage: 0.0,
      co2: 0.0,
      score: 100,
      activeDuration: 0,
      activeFuelUsed: 0,
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),linear-gradient(135deg,#020617_0%,#030712_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-5 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.45em] text-cyan-400">VelocIQ</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Smart Speed & Fuel Management System</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
                Mocked live telemetry from ESP32 + OBD-II + BLE + Cloud AI, tuned to feel like an active vehicle monitoring stream.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <div className="font-semibold">Fleet status</div>
                <div className="mt-1 text-emerald-200">
                  {isConnected ? 'All modules synchronized' : 'Data buffered offline'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('velociq_logged_in');
                  navigate('/');
                }}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <StatusBar isConnected={isConnected} activeDTCs={activeDTCs} spiffsCount={spiffsCount} />

        <main className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="flex flex-col gap-4">
            <TelemetryPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} />
            <div className="grid gap-4 md:grid-cols-2">
              <FuelMileageCard telemetry={telemetry} />
              <CostSavingsCalculator fuelUsed={telemetry.activeFuelUsed} fuelPrice={fuelPrice} setFuelPrice={setFuelPrice} />
            </div>
            <RouteTracker route={telemetry.route} speed={telemetry.speed} />
            <ECUDiagnostics activeDTCs={activeDTCs} onClearDTCs={handleClearDTCs} onTriggerDTC={handleTriggerDTC} />
          </div>
          <div className="flex flex-col gap-4">
            <DriverScore telemetry={telemetry} />
            <AICoachingPanel telemetry={telemetry} isConnected={isConnected} speedLimit={speedLimit} />
            <MaintenanceTracker partsWear={telemetry.partsWear} onServicePart={handleServicePart} />
            <TripLogger 
              tripHistory={tripHistory} 
              onEndTrip={handleEndTrip} 
              onClearHistory={handleClearHistory} 
              activeStats={{
                duration: telemetry.activeDuration,
                distance: telemetry.tripMileage,
                avgSpeed: telemetry.activeDuration > 0 ? (telemetry.tripMileage / (telemetry.activeDuration / 3600)) : 0,
                fuelUsed: telemetry.activeFuelUsed,
                co2: telemetry.co2,
                score: telemetry.score
              }} 
            />
            <AlertsFeed />
          </div>
        </main>

        <SimulationSettings
          isConnected={isConnected}
          setIsConnected={setIsConnected}
          vehicleProfile={vehicleProfile}
          setVehicleProfile={setVehicleProfile}
          speedLimit={speedLimit}
          setSpeedLimit={setSpeedLimit}
        />

        <CostComparison />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('velociq_logged_in') === 'true');

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(sessionStorage.getItem('velociq_logged_in') === 'true');
    };

    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
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
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
