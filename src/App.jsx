import TelemetryPanel from './components/TelemetryPanel';
import DriverScore from './components/DriverScore';
import AlertsFeed from './components/AlertsFeed';
import FuelMileageCard from './components/FuelMileageCard';
import CostComparison from './components/CostComparison';
import StatusBar from './components/StatusBar';

export default function App() {
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
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <div className="font-semibold">Fleet status</div>
              <div className="mt-1 text-emerald-200">All modules synchronized</div>
            </div>
          </div>
        </header>

        <StatusBar />

        <main className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="flex flex-col gap-4">
            <TelemetryPanel />
            <FuelMileageCard />
          </div>
          <div className="flex flex-col gap-4">
            <DriverScore />
            <AlertsFeed />
          </div>
        </main>

        <CostComparison />
      </div>
    </div>
  );
}
