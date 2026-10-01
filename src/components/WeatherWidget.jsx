import React, { useMemo } from 'react';

// Dedicated, project-themed meteorological vector icons
function ClearSkyIcon({ className = "w-10 h-10 text-[#B45309]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="4" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
      <path strokeLinecap="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
    </svg>
  );
}

function PartlyCloudyIcon({ className = "w-10 h-10 text-[#0284C7]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor" fillOpacity="0.15" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

function OvercastIcon({ className = "w-10 h-10 text-slate-600" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor" fillOpacity="0.15" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

function FogIcon({ className = "w-10 h-10 text-slate-600" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeWidth="2" d="M4 8h16M2 12h20M6 16h12M8 20h8" />
    </svg>
  );
}

function RainIcon({ className = "w-10 h-10 text-[#0284C7]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor" fillOpacity="0.15" d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25" />
      <path strokeLinecap="round" strokeWidth="2" d="M8 17v4m4-4v4m4-4v4" />
    </svg>
  );
}

function SnowIcon({ className = "w-10 h-10 text-[#0B3D91]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v20m10-10H2m17.07-7.07L4.93 19.07m0-14.14l14.14 14.14" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function ThunderstormIcon({ className = "w-10 h-10 text-[#B45309]" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor" fillOpacity="0.15" d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor" d="M13 14l-4 6h4l-1 4 6-7h-4l1-3z" />
    </svg>
  );
}

export default function WeatherWidget({ weather }) {
  if (!weather) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0B3D91]">Live Meteorology</h2>
        <div className="flex h-16 items-center justify-center text-slate-700 font-mono text-xs">
          Fetching location weather...
        </div>
      </div>
    );
  }

  // Mapping Open-Meteo WMO weather codes to vector icons and descriptions
  const getWeatherInfo = (code) => {
    if (code === 0) return { Icon: ClearSkyIcon, desc: 'Clear sky' };
    if (code >= 1 && code <= 3) return { Icon: PartlyCloudyIcon, desc: 'Partly cloudy' };
    if (code >= 45 && code <= 48) return { Icon: FogIcon, desc: 'Foggy' };
    if (code >= 51 && code <= 67) return { Icon: RainIcon, desc: 'Rain' };
    if (code >= 71 && code <= 77) return { Icon: SnowIcon, desc: 'Snow' };
    if (code >= 80 && code <= 82) return { Icon: RainIcon, desc: 'Rain showers' };
    if (code >= 95 && code <= 99) return { Icon: ThunderstormIcon, desc: 'Thunderstorm' };
    return { Icon: OvercastIcon, desc: 'Overcast' };
  };

  const roadTraction = useMemo(() => {
    if (weather?.weathercode >= 71 && weather?.weathercode <= 77) return { score: 62, state: 'Snow / Ice Advisory' };
    if (weather?.weathercode >= 51 && weather?.weathercode <= 67) return { score: 82, state: 'Wet Asphalt' };
    if (weather?.weathercode >= 80) return { score: 76, state: 'Standing Water' };
    return { score: 98, state: 'Dry Asphalt Nominal' };
  }, [weather?.weathercode]);

  const { Icon, desc } = getWeatherInfo(weather?.weathercode ?? 0);

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
      <div className="racing-stripe" />
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#0B3D91] font-bold mb-1">
          METEOROLOGY & ROAD TRACTION
        </div>
        <div className="text-2xl font-bold text-[#0F172A] font-mono tabular-nums">
          {weather.temperature}°C
        </div>
        <div className="text-xs text-slate-700 font-medium mt-0.5">
          {desc} • <span className="font-mono text-[#0B3D91] font-bold">{weather.windspeed} km/h wind</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-700 font-bold">Road Friction:</span>
          <span className="font-bold text-[#047857]">{roadTraction.score}%</span>
          <span className="text-[10px] bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded border border-line">
            {roadTraction.state}
          </span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 border border-line flex items-center justify-center self-start sm:self-center">
        <Icon className="w-9 h-9" />
      </div>
    </div>
  );
}

