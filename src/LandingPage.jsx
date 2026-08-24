import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Real-Time Telemetry',
    description: 'Track RPM, speed, coolant, and throttle through a live dashboard that feels like a real vehicle command center.',
    icon: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: 'Autonomous Routing AI',
    description: 'Our AI Navigator dynamically optimizes routes based on real-time weather and traffic, reducing delays and increasing fleet safety.',
    icon: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )
  },
  {
    title: 'Predictive Mechanic',
    description: 'Stop reacting to breakdowns. Our AI Mechanic analyzes degradation rates and predicts parts failure weeks before they occur.',
    icon: (
      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

const metrics = [
  { label: 'Fuel Saved', value: '32%' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Maintenance Costs', value: '-24%' },
  { label: 'Vehicles Tracked', value: '10,000+' }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_40%),linear-gradient(135deg,#020617_0%,#0f172a_100%)] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-widest text-white">VELOCIQ</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white">
              Sign In
            </button>
            <Link to="/dashboard" className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25">
              Launch Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300 mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          VelocIQ V2.0 is now live
        </div>
        
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-7xl leading-tight">
          Next-Generation <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Fleet Intelligence</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed sm:text-xl">
          Transform your operations with real-time telemetry, AI-driven dispatch, and predictive maintenance. Empower your fleet to drive smarter, safer, and cheaper.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard" className="rounded-full bg-cyan-500 px-8 py-4 text-base font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-1">
            Explore the Dashboard
          </Link>
          <button onClick={() => navigate('/login')} className="rounded-full border border-slate-700 bg-slate-900/50 px-8 py-4 text-base font-medium text-slate-200 transition-all hover:border-slate-500 hover:bg-slate-800">
            View Documentation
          </button>
        </div>
      </main>

      {/* Metrics Section */}
      <section className="border-y border-slate-800/60 bg-slate-900/30 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-800/50">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col items-center text-center px-4">
              <dt className="text-sm uppercase tracking-widest text-slate-500 font-medium">{metric.label}</dt>
              <dd className="mt-2 text-4xl font-extrabold text-white tracking-tight">{metric.value}</dd>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything you need to scale</h2>
          <p className="mt-4 text-lg text-slate-400">Powerful AI models combined with ultra-low latency hardware.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="group relative rounded-[2rem] border border-slate-800 bg-slate-900/50 p-8 transition-all hover:bg-slate-800/50 hover:border-slate-700">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-20 border-t border-slate-800/60 bg-slate-950/50">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-700 mb-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <p className="text-2xl font-medium text-slate-200 leading-relaxed italic">
            "VelocIQ fundamentally changed how we operate. The Predictive Mechanic AI saved us from three major engine failures in the first month alone, paying for the system ten times over."
          </p>
          <div className="mt-8">
            <p className="font-bold text-white">Sarah Jenkins</p>
            <p className="text-sm text-slate-500">Director of Fleet Operations, Apex Logistics</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest text-slate-300">VELOCIQ</span>
          </div>
          
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
          </div>

          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Novalegion. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
