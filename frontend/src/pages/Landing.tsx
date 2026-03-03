import { useState, useEffect } from 'react'
import {
  Activity,
  Zap,
  Shield,
  Bell,
  ArrowRight,
  Globe,
  Clock,
  BarChart3,
  Terminal,
  ChevronDown,
  Github,
  Twitter,
  Mail,
} from 'lucide-react'
import '../index.css'
import { useNavigate } from 'react-router-dom'

/* ──────────────────── tiny animated ping dot ──────────────────── */
function PingDot({ status = 'up' }: { status?: 'up' | 'down' }) {
  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
          status === 'up' ? 'bg-emerald-400' : 'bg-red-400'
        }`}
      />
      <span
        className={`relative inline-flex h-3 w-3 rounded-full ${
          status === 'up' ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
    </span>
  )
}

/* ──────────────────── feature card ──────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType
  title: string
  desc: string
}) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/30 hover:bg-white/[0.04]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/20">
        <Icon size={24} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-400">{desc}</p>
    </div>
  )
}

/* ──────────────────── fake live log line ──────────────────── */
const LOGS = [
  { url: 'api.gophar.dev', latency: '42ms', status: 200 },
  { url: 'google.com', latency: '12ms', status: 200 },
  { url: 'sketchy-saas.io', latency: '—', status: 503 },
  { url: 'myportfolio.lol', latency: '89ms', status: 200 },
  { url: 'prod-db.internal', latency: '7ms', status: 200 },
  { url: 'payment-gateway.co', latency: '—', status: 522 },
  { url: 'startup-landing.page', latency: '210ms', status: 200 },
]

function LiveTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((p) => (p < LOGS.length ? p + 1 : p))
    }, 600)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0c] font-mono text-[13px] shadow-2xl">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-neutral-500">gophar — worker engine</span>
      </div>

      <div className="space-y-1 p-4">
        <p className="text-neutral-500">
          <span className="text-orange-400">$</span> gophar watch --all
        </p>
        {LOGS.slice(0, visibleLines).map((l, i) => {
          const ok = l.status === 200
          return (
            <p key={i} className="flex gap-3">
              <span className="text-neutral-600">[{String(i + 1).padStart(2, '0')}]</span>
              <span className={ok ? 'text-emerald-400' : 'text-red-400'}>
                {ok ? '✔' : '✘'} {l.status}
              </span>
              <span className="text-neutral-300">{l.url}</span>
              <span className="text-neutral-500">{l.latency}</span>
            </p>
          )
        })}
        {visibleLines < LOGS.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-orange-400/80" />
        )}
        {visibleLines >= LOGS.length && (
          <p className="mt-1 text-neutral-500">
            <span className="text-orange-400">gophar</span> ⚡ all checks complete — {LOGS.filter((l) => l.status !== 200).length} down
          </p>
        )}
      </div>
    </div>
  )
}

/* ──────────────────── stat pill ──────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold text-white md:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
    </div>
  )
}

/* ──────────────────── FAQ item ──────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="cursor-pointer border-b border-white/[0.06] py-5"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-white">{q}</p>
        <ChevronDown
          size={18}
          className={`text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && <p className="mt-3 text-sm leading-relaxed text-neutral-400">{a}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════ */
function App() {
const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#09090b] font-[Inter,sans-serif] text-white selection:bg-orange-500/30">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#09090b]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-black cursor-pointer" onClick={() => navigate("/")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-rail-symbol-icon lucide-rail-symbol"><path d="M5 15h14"/><path d="M5 9h14"/><path d="m14 20-5-5 6-6-5-5"/></svg>
            </div>
            <span className="text-lg font-bold tracking-tight">gophar</span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how" className="transition hover:text-white">How It Works</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button className="cursor-pointer rounded-lg px-4 py-2 text-sm text-neutral-300 transition hover:text-white" onClick={() => navigate("/login")}>
              Log In
            </button>
            <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 cursor-pointer" onClick={() => navigate("/signup")}>
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* gradient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 md:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            {/* pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-neutral-400">
              <PingDot />
              Powered by Go concurrency — your URLs never sleep
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              Your servers called.
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                They were down.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400 md:text-xl">
              <strong className="text-neutral-200">Gophar</strong> watches your endpoints like a
              paranoid sysadmin on 4 espressos — so you can actually go touch grass.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="group flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-semibold shadow-xl shadow-orange-500/25 transition hover:bg-orange-600 cursor-pointer" onClick={() => navigate("/signup")}>
                Start Monitoring — It's Free
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-7 py-3.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:text-white">
                <Terminal size={16} />
                View Demo
              </button>
            </div>
          </div>

          {/* live terminal */}
          <div className="mx-auto mt-16 max-w-2xl">
            <LiveTerminal />
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="border-y border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-around gap-8 px-6 py-12">
          <Stat value="<50ms" label="Avg. Check Latency" />
          <Stat value="20+" label="Concurrent Workers" />
          <Stat value="24/7" label="Always Watching" />
          <Stat value="0$" label="To Get Started" />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
            Features
          </p>
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Everything your uptime deserves.
            <br />
            <span className="text-neutral-500">Nothing it doesn't.</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title="Goroutine-Powered Checks"
            desc="20 concurrent workers pinging your URLs in parallel. Not sequential. Not slow. Not sorry."
          />
          <FeatureCard
            icon={Clock}
            title="Custom Frequency"
            desc="Check every 1 minute or every 5 — your call. We don't judge your paranoia levels."
          />
          <FeatureCard
            icon={Shield}
            title="JWT-Locked Auth"
            desc="No token? No entry. Every route is guarded like it owes us money. Middleware doesn't play nice."
          />
          <FeatureCard
            icon={Bell}
            title="Instant Alerts"
            desc="The moment your endpoint goes down, we scream. Console alerts now, Email & Telegram soon™."
          />
          <FeatureCard
            icon={BarChart3}
            title="Latency Logs & History"
            desc="Every ping is logged — status, latency, timestamp. Your own little black box for debugging at 3 AM."
          />
          <FeatureCard
            icon={Globe}
            title="Monitor Anything"
            desc="APIs, landing pages, databases, that side project you abandoned — if it has a URL, we'll watch it."
          />
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="border-t border-white/[0.04] bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
              How It Works
            </p>
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Simpler than explaining <span className="italic text-neutral-500">why</span> your server crashed.
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-4">
            {[
              {
                step: '01',
                icon: Shield,
                title: 'Sign Up',
                desc: "JWT token generated. You're in. No nonsense onboarding flow.",
              },
              {
                step: '02',
                icon: Globe,
                title: 'Add URLs',
                desc: 'Drop your endpoints, set check frequency. Hit save. Go make chai.',
              },
              {
                step: '03',
                icon: Activity,
                title: 'We Ping. Hard.',
                desc: 'Goroutine workers hammer your URLs on schedule. Parallel. Relentless.',
              },
              {
                step: '04',
                icon: Bell,
                title: 'Get Alerted',
                desc: "Something dies? You'll know before your users start tweeting about it.",
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <p className="mb-4 font-mono text-3xl font-black text-orange-500/20">{s.step}</p>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                  <s.icon size={24} />
                </div>
                <h3 className="mb-2 font-semibold text-white">{s.title}</h3>
                <p className="text-sm text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK STRIP ─── */}
      <section className="border-y border-white/[0.04]">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 py-10">
          {['Go / Gin', 'PostgreSQL', 'Goroutines', 'JWT Auth', 'React', 'Tailwind CSS'].map(
            (t) => (
              <span
                key={t}
                className="rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2 font-mono text-xs text-neutral-400"
              >
                {t}
              </span>
            ),
          )}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
            FAQ
          </p>
          <h2 className="text-3xl font-extrabold md:text-4xl">
            Questions? <span className="text-neutral-500">We anticipated them.</span>
          </h2>
        </div>

        <FaqItem
          q="Is it actually free?"
          a="Yes. The core monitoring is free. We're not running a charity — premium features (more workers, webhooks, multi-region) will come later. But for now, go wild."
        />
        <FaqItem
          q="How fast are the checks?"
          a="Sub-50ms average. We use a pool of 20 Goroutines hitting your URLs in parallel. It's basically your URLs getting a health checkup from The Flash."
        />
        <FaqItem
          q="What happens when my site goes down?"
          a="We log the failure, update the dashboard in real-time, and fire off an alert. Currently to your console/dashboard. Email & Telegram notifications are on the roadmap."
        />
        <FaqItem
          q="Can I monitor internal/private URLs?"
          a="If Gophar's server can reach it, we can monitor it. For truly internal stuff behind firewalls — self-hosting docs are coming soon."
        />
        <FaqItem
          q="Why the name Gophar?"
          a="Go + Gopher = Gophar. It's a Go-powered gopher that keeps digging through your URLs. Also it sounds cool. Don't overthink it."
        />
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Stop refreshing.
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              Start monitoring.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-neutral-400">
            Your uptime isn't gonna monitor itself — well, now it will. Let Gophar do the staring
            so you can do the building.
          </p>
          <button className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-sm font-semibold shadow-xl shadow-orange-500/25 transition hover:bg-orange-600 cursor-pointer" onClick={() => navigate("/signup")}>
            Get Started — Free Forever*
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-3 text-xs text-neutral-600">*until we figure out pricing lol</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.04] bg-[#09090b]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-xs font-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-rail-symbol-icon lucide-rail-symbol"><path d="M5 15h14"/><path d="M5 9h14"/><path d="m14 20-5-5 6-6-5-5"/></svg>
            </div>
            <span className="text-sm font-semibold">gophar</span>
            <span className="ml-2 text-xs text-neutral-600">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-5 text-neutral-500">
            <a href="https://github.com/yansh07" className="transition hover:text-white"><Github size={18} /></a>
            <a href="https://x.com/yansh_08" className="transition hover:text-white"><Twitter size={18} /></a>
            <a href="mailto:pksingh69313@gmail.com" className="transition hover:text-white"><Mail size={18} /></a>
          </div>

          <p className="text-xs text-neutral-600">
            Built with contempt for downtime & too much chai.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App