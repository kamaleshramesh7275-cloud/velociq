import { useEffect, useState } from 'react';

const alertTemplates = [
  { title: 'Speeding', tone: 'bg-red-50 text-[#D7263D] border-red-200' },
  { title: 'Harsh Cornering', tone: 'bg-amber-50 text-[#B45309] border-amber-200' },
  { title: 'Hard Braking', tone: 'bg-red-50 text-[#D7263D] border-red-200' },
  { title: 'Engine Temp High', tone: 'bg-orange-50 text-orange-700 border-orange-200' },
  { title: 'Engine Knock', tone: 'bg-purple-50 text-purple-700 border-purple-200' },
  { title: 'O2 Sensor Fault', tone: 'bg-blue-50 text-[#0B3D91] border-blue-200' },
];

const formatTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState([
    { title: 'BLE Pairing OK', detail: 'ESP32 connected', time: formatTime(), tone: 'bg-emerald-50 text-[#047857] border-emerald-200' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      setAlerts((prev) => [{ title: template.title, detail: 'Live alert from ECU', time: formatTime(), tone: template.tone }, ...prev].slice(0, 7));
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-xs relative overflow-hidden">
      <div className="racing-stripe" />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#0B3D91]">Telemetry Broadcast</p>
          <h2 className="text-lg font-bold text-slate-900 font-heading">BLE Push Notifications</h2>
        </div>
        <div className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-mono font-bold text-[#047857] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
          Live
        </div>
      </div>
      <div className="space-y-2.5">
        {alerts.map((alert, index) => (
          <div key={`${alert.title}-${index}`} className={`rounded-xl border px-3.5 py-2.5 ${alert.tone}`}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-xs">{alert.title}</p>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-90">{alert.time}</span>
            </div>
            <p className="mt-0.5 text-xs font-medium opacity-90">{alert.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
