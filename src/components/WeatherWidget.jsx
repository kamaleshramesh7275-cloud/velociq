export default function WeatherWidget({ weather }) {
  if (!weather) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Live Weather</h2>
        <div className="flex h-16 items-center justify-center text-slate-500">
          Fetching location weather...
        </div>
      </div>
    );
  }

  // Simple mapping of Open-Meteo WMO weather codes to emoji/descriptions
  const getWeatherInfo = (code) => {
    if (code === 0) return { emoji: '☀️', desc: 'Clear sky' };
    if (code >= 1 && code <= 3) return { emoji: '⛅', desc: 'Partly cloudy' };
    if (code >= 45 && code <= 48) return { emoji: '🌫️', desc: 'Foggy' };
    if (code >= 51 && code <= 67) return { emoji: '🌧️', desc: 'Rain' };
    if (code >= 71 && code <= 77) return { emoji: '❄️', desc: 'Snow' };
    if (code >= 80 && code <= 82) return { emoji: '🌦️', desc: 'Rain showers' };
    if (code >= 95 && code <= 99) return { emoji: '⛈️', desc: 'Thunderstorm' };
    return { emoji: '☁️', desc: 'Overcast' };
  };

  const info = getWeatherInfo(weather.weathercode);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur flex justify-between items-center">
      <div>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-400">Live Weather</h2>
        <div className="text-2xl font-bold text-white">
          {weather.temperature}°C
        </div>
        <div className="text-sm text-slate-300">
          {info.desc} • {weather.windspeed} km/h wind
        </div>
      </div>
      <div className="text-5xl">
        {info.emoji}
      </div>
    </div>
  );
}
