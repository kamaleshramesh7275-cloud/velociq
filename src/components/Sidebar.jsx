import { NavLink } from 'react-router-dom';
import SimulationSettings from './SimulationSettings';

export default function Sidebar({ isConnected, setIsConnected, vehicleProfile, speedLimit, setSpeedLimit }) {
  return (
    <div className="flex w-64 flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur h-screen p-6 overflow-y-auto scrollbar-hide">
      <div className="mb-8 shrink-0">
        <p className="text-sm uppercase tracking-[0.45em] text-cyan-400">VelocIQ</p>
        <div className="mt-1 text-xs text-slate-500">Fleet Operations</div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Live Telemetry
        </NavLink>

        <NavLink
          to="/navigation"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          GPS & Trips
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          AI Analytics
        </NavLink>

        <NavLink
          to="/safety"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Driver Safety
        </NavLink>

        <NavLink
          to="/security"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Security Hub
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Maintenance
        </NavLink>

        <div className="my-2 border-t border-slate-800"></div>

        <NavLink
          to="/fleet"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Fleet Garage
        </NavLink>
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <SimulationSettings
          isConnected={isConnected}
          setIsConnected={setIsConnected}
          vehicleProfile={vehicleProfile}
          setVehicleProfile={() => {}} 
          speedLimit={speedLimit}
          setSpeedLimit={setSpeedLimit}
        />
        
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('velociq_logged_in');
            window.location.href = '/';
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
