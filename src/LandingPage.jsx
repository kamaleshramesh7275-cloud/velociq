import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Real-Time OBD Telemetry',
    description: 'Track RPM, speed, coolant, throttle and more through a live dashboard that feels like a real vehicle command center.'
  },
  {
    title: 'BLE + Cloud Connectivity',
    description: 'Sync telemetry over BLE and cloud pipelines for live status, fleet visibility and remote monitoring.'
  },
  {
    title: 'AI-Powered Prediction',
    description: 'Surface maintenance risk, bad-driving patterns and efficiency drift before they turn into expensive issues.'
  }
];

const reasons = ['Fuel Waste (20-30% lost to poor driving)', 'Safety Risks', 'Maintenance Gaps'];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),linear-gradient(135deg,#020617_0%,#030712_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-800 bg-slate-900/80 px-6 py-5 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.45em] text-cyan-400">VelocIQ</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Smart Speed & Fuel Management System</h1>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Login
              </button>
              <Link
                to="/dashboard"
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Vehicle Intelligence Platform</p>
                <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                  Real-time vehicle intelligence — live speed, fuel efficiency, driver scoring and predictive maintenance
                </h2>
                <p className="mt-5 max-w-2xl text-lg text-slate-400">
                  ESP32 · OBD-II · BLE · Cloud AI
                </p>
                <p className="mt-3 text-base text-slate-400">
                  Under ₹500 hardware · Post-2000 OBD-II cars · Plug & Play
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Get Started
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Login
                  </button>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/70 p-6 shadow-inner shadow-cyan-500/10">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
                  <div className="text-sm uppercase tracking-[0.3em]">Live fleet pulse</div>
                  <div className="mt-3 text-3xl font-semibold">84.2%</div>
                  <div className="mt-1 text-sm text-emerald-300">Efficiency retention across monitored trips</div>
                </div>
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
                  <div className="text-sm uppercase tracking-[0.3em]">Maintenance forecast</div>
                  <div className="mt-3 text-2xl font-semibold">2.1 weeks</div>
                  <div className="mt-1 text-sm text-amber-300">Until the next service window</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-black/30">
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Why VelocIQ</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">A smarter way to cut waste and improve safety</h3>
              <p className="mt-4 text-slate-400">
                The system turns raw vehicle signals into actionable insight for drivers, fleet owners and service teams.
              </p>
            </div>
            <div className="space-y-3">
              {reasons.map((reason) => (
                <div key={reason} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 text-slate-200">
                  {reason}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-6 text-center shadow-lg shadow-cyan-500/10">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Cost highlight</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Under ₹500 vs ₹5,000-50,000+ for workshop scanners</h3>
          </section>
        </main>
      </div>
    </div>
  );
}
