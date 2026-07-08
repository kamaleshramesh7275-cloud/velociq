import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (email.trim() && password.trim()) {
      onLogin();
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_35%),linear-gradient(135deg,#020617_0%,#030712_100%)] px-4 py-6 text-slate-100 sm:px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">VelocIQ</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">Sign in to access the live fleet dashboard.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
              placeholder="driver@velociq.io"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">Demo mode — any email/password will work</p>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-cyan-300 transition hover:text-cyan-200">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
