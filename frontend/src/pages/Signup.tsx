import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { setUserData } from '../utils/auth'
import '../index.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const signupRes = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const signupData = await signupRes.json().catch(() => ({} as Record<string, unknown>))
      if (!signupRes.ok) {
        throw new Error((signupData.error as string) || 'Signup failed.')
      }

      // auto-login right after signup
      const loginRes = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const loginData = await loginRes.json().catch(() => ({} as Record<string, unknown>))
      if (!loginRes.ok || typeof loginData.token !== 'string') {
        throw new Error((loginData.error as string) || 'Signup succeeded but login failed.')
      }

      localStorage.setItem('access_token', loginData.token)
      setUserData({ email })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[#09090b] px-5 py-10 font-[Inter,sans-serif] text-white selection:bg-orange-500/30 sm:px-6 sm:py-14 md:py-20">
      {/* gradient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[90vw] max-w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[420px] sm:max-w-md">
          {/* logo */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 sm:mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 15h14"/><path d="M5 9h14"/><path d="m14 20-5-5 6-6-5-5"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">gophar</span>
          </Link>

          {/* card */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm sm:p-8">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="text-[1.4rem] font-extrabold leading-tight tracking-tight sm:text-3xl">Create your account</h1>
              <p className="mt-2 text-[13px] text-neutral-400 sm:text-sm">
                Start monitoring your endpoints for free.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400 sm:mb-5 sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* email */}
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

              {/* password */}
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
                    placeholder="Min. 8 characters"
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

              {/* confirm password */}
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-[13px] font-medium text-neutral-300 sm:text-sm">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 sm:left-3.5" />
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-11 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 sm:py-3 sm:pl-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300 sm:right-3.5"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:opacity-60 sm:py-3"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* footer link */}
          <p className="mt-5 text-center text-[13px] text-neutral-500 sm:mt-6 sm:text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-orange-400 transition hover:text-orange-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
  )
}
