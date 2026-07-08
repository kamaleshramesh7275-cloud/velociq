import { useEffect, useMemo, useState } from 'react';

const gradeFromScore = (score) => {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

const gradeColors = {
  A: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  B: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  C: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  D: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function DriverScore() {
  const [score, setScore] = useState(100);
  const [events, setEvents] = useState([
    { label: 'Smooth launch', delta: 0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      let nextScore = score;
      let label = 'Steady drive';

      if (random < 0.2) {
        nextScore -= 10;
        label = 'Harsh Brake';
      } else if (random < 0.35) {
        nextScore -= 7;
        label = 'Rapid Accel';
      } else if (random < 0.55) {
        nextScore -= 3;
        label = 'Idle penalty';
      } else if (random < 0.7) {
        nextScore -= 5;
        label = 'Speeding';
      }

      setScore((prev) => {
        const updated = Math.max(0, prev + (nextScore - prev) * 0.15);
        return updated;
      });

      setEvents((prev) => [
        { label, delta: nextScore < 0 ? 0 : 0 },
        ...prev.slice(0, 3),
      ]);
    }, 1200);

    return () => clearInterval(interval);
  }, [score]);

  const grade = useMemo(() => gradeFromScore(Math.round(score)), [score]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Driver Score</p>
          <h2 className="text-xl font-semibold text-white">Trip Performance</h2>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${gradeColors[grade]}`}>
          Grade {grade}
        </div>
      </div>
      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-400">Trip Score</p>
            <div className="mt-2 text-5xl font-semibold text-white">{Math.round(score)}</div>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>Adaptive coaching</p>
            <p className="mt-1 text-emerald-300">+12% efficiency</p>
          </div>
        </div>
        <div className="mt-5 h-2.5 rounded-full bg-slate-800">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${Math.max(0, score)}%` }} />
        </div>
        <div className="mt-6 space-y-2">
          {events.map((event, idx) => (
            <div key={`${event.label}-${idx}`} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
              <span>{event.label}</span>
              <span className="text-slate-500">{idx === 0 ? 'Live' : 'Recent'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
