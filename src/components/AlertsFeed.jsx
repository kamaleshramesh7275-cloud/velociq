import { useEffect, useState } from 'react';

const alertTemplates = [
  { title: 'Speeding', tone: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { title: 'Harsh Cornering', tone: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { title: 'Hard Braking', tone: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { title: 'Engine Temp High', tone: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  { title: 'Engine Knock', tone: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  { title: 'O2 Sensor Fault', tone: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
];

const formatTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState([
    { title: 'BLE Pairing OK', detail: 'ESP32 connected', time: formatTime(), tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      setAlerts((prev) => [{ title: template.title, detail: 'Live alert from ECU', time: formatTime(), tone: template.tone }, ...prev].slice(0, 7));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Alert Feed</p>
          <h2 className="text-xl font-semibold text-white">BLE Push Notifications</h2>
        </div>
        <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
          Live
        </div>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={`${alert.title}-${index}`} className={`rounded-2xl border px-4 py-3 ${alert.tone}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{alert.title}</p>
              <span className="text-xs uppercase tracking-[0.25em] opacity-80">{alert.time}</span>
            </div>
            <p className="mt-1 text-sm opacity-80">{alert.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
