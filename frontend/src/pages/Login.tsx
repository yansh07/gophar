import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const Link = ({ to, children, className }: LinkProps) => (
  <a href={to} className={className} onClick={(e) => e.preventDefault()}>
    {children}
  </a>
);

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({} as Record<string, unknown>));

    if (!res.ok || typeof data.token !== 'string') {
      throw new Error((data.error as string) || 'Invalid email or password. Please try again.');
    }

    localStorage.setItem('access_token', data.token);
    setUserData({ email });

    navigate('/dashboard', { replace: true });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090b] px-4 py-6 font-sans text-white selection:bg-orange-500/30 sm:px-6 sm:py-14 md:py-20">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[300px] w-full max-w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[80px] sm:blur-[120px]" />

      <div className="relative z-10 w-full max-w-[380px] sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 sm:mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-black shadow-lg shadow-orange-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 15h14"/><path d="M5 9h14"/><path d="m14 20-5-5 6-6-5-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">gophar</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-[13px] text-neutral-400 sm:text-sm">
              Log in to keep an eye on your endpoints.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400 sm:mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium text-neutral-300 sm:text-sm">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 sm:left-3.5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 sm:py-3 sm:pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-neutral-300 sm:text-sm">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 sm:left-3.5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-11 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 sm:py-3 sm:pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300 sm:right-3.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-orange-500 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 sm:py-3"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Log In
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-5 text-center text-[13px] text-neutral-500 sm:mt-6 sm:text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-orange-400 transition hover:text-orange-300 underline-offset-4 hover:underline">
            <span onClick={() => navigate("/signup")} className='px-1'>Sign up free</span>
          </Link>
        </p>
      </div>
    </div>
  );
}