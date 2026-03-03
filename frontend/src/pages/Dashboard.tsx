import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Globe,
  Clock,
  Activity,
  Trash2,
  RefreshCw,
  LogOut,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Zap,
  BarChart3,
  Bell,
} from 'lucide-react'
import { logoutUser, getUserData } from '../utils/auth'
import '../index.css'

/* ─── types ─── */
interface Monitor {
  id: string
  url: string
  frequency: number          // minutes
  status: 'up' | 'down' | 'pending'
  latency: number | null     // ms
  lastChecked: string | null  // ISO
  createdAt: string
}

interface LogEntry {
  id: string
  monitorId: string
  url: string
  status: number
  latency: number
  checkedAt: string
}

/* ─── frequency options ─── */
const FREQ_OPTIONS = [
  { value: 1, label: 'Every 1 min' },
  { value: 3, label: 'Every 3 min' },
  { value: 5, label: 'Every 5 min' },
  { value: 10, label: 'Every 10 min' },
  { value: 15, label: 'Every 15 min' },
  { value: 30, label: 'Every 30 min' },
]

/* ─── mock seed data ─── */
const MOCK_MONITORS: Monitor[] = [
  { id: '1', url: 'https://google.com', frequency: 5, status: 'up', latency: 12, lastChecked: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '2', url: 'https://api.gophar.dev', frequency: 1, status: 'up', latency: 42, lastChecked: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '3', url: 'https://sketchy-saas.io', frequency: 5, status: 'down', latency: null, lastChecked: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: '4', url: 'https://myportfolio.lol', frequency: 10, status: 'up', latency: 89, lastChecked: new Date().toISOString(), createdAt: new Date().toISOString() },
]

const MOCK_LOGS: LogEntry[] = [
  { id: 'l1', monitorId: '1', url: 'https://google.com', status: 200, latency: 12, checkedAt: new Date().toISOString() },
  { id: 'l2', monitorId: '2', url: 'https://api.gophar.dev', status: 200, latency: 42, checkedAt: new Date(Date.now() - 60000).toISOString() },
  { id: 'l3', monitorId: '3', url: 'https://sketchy-saas.io', status: 503, latency: 0, checkedAt: new Date(Date.now() - 120000).toISOString() },
  { id: 'l4', monitorId: '4', url: 'https://myportfolio.lol', status: 200, latency: 89, checkedAt: new Date(Date.now() - 180000).toISOString() },
  { id: 'l5', monitorId: '1', url: 'https://google.com', status: 200, latency: 14, checkedAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'l6', monitorId: '3', url: 'https://sketchy-saas.io', status: 522, latency: 0, checkedAt: new Date(Date.now() - 360000).toISOString() },
  { id: 'l7', monitorId: '2', url: 'https://api.gophar.dev', status: 200, latency: 38, checkedAt: new Date(Date.now() - 420000).toISOString() },
  { id: 'l8', monitorId: '1', url: 'https://google.com', status: 200, latency: 11, checkedAt: new Date(Date.now() - 600000).toISOString() },
]

/* ═══════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════ */

function PingDot({ status }: { status: 'up' | 'down' | 'pending' }) {
  if (status === 'pending')
    return <span className="relative flex h-2.5 w-2.5"><span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500/80" /></span>
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${status === 'up' ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} />
    </span>
  )
}

function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
        <Icon size={18} />
      </div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/* ═══════════════════════════════════════════════════════
   ADD MONITOR MODAL
   ═══════════════════════════════════════════════════════ */
function AddMonitorModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (url: string, frequency: number) => void
}) {
  const [url, setUrl] = useState('')
  const [freq, setFreq] = useState(5)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = () => {
    setError('')
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`)
      onAdd(u.toString(), freq)
      setUrl('')
      setFreq(5)
      onClose()
    } catch {
      setError('Enter a valid URL (e.g. https://google.com)')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#111113] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Monitor</h2>
          <button onClick={onClose} className="text-neutral-500 transition hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* URL */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">URL</label>
          <div className="relative">
            <Globe size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Check Frequency</label>
          <div className="relative">
            <Clock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <select
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-10 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
            >
              {FREQ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#111113] text-white">
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
        >
          Start Monitoring
          <Zap size={16} className="transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
   ═══════════════════════════════════════════════════════ */
function DeleteModal({
  open,
  url,
  onClose,
  onConfirm,
}: {
  open: boolean
  url: string
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.06] bg-[#111113] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center gap-2 text-red-400">
          <AlertTriangle size={20} />
          <h2 className="text-lg font-bold">Delete Monitor</h2>
        </div>
        <p className="mb-6 text-sm text-neutral-400">
          Stop monitoring <span className="font-medium text-neutral-200">{url}</span>? This will also delete all associated logs.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:text-white">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate()
  const user = getUserData()

  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // modals
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Monitor | null>(null)

  // tab
  const [tab, setTab] = useState<'monitors' | 'logs'>('monitors')

  /* ─── initial load ─── */
  const didLoad = useRef(false)
  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    // TODO: replace with actual API call — GET /api/monitors + GET /api/logs
    const load = async () => {
      await new Promise((r) => setTimeout(r, 600))
      setMonitors(MOCK_MONITORS)
      setLogs(MOCK_LOGS)
      setLoading(false)
    }
    load()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // TODO: replace with actual API call
    await new Promise((r) => setTimeout(r, 600))
    setMonitors(MOCK_MONITORS)
    setLogs(MOCK_LOGS)
    setRefreshing(false)
  }

  /* ─── add monitor ─── */
  const handleAddMonitor = (url: string, frequency: number) => {
    // TODO: replace with POST /api/monitors
    const newMon: Monitor = {
      id: Date.now().toString(),
      url,
      frequency,
      status: 'pending',
      latency: null,
      lastChecked: null,
      createdAt: new Date().toISOString(),
    }
    setMonitors((prev) => [newMon, ...prev])
  }

  /* ─── delete monitor ─── */
  const handleDelete = () => {
    if (!deleteTarget) return
    // TODO: replace with DELETE /api/monitors/:id
    setMonitors((prev) => prev.filter((m) => m.id !== deleteTarget.id))
    setLogs((prev) => prev.filter((l) => l.monitorId !== deleteTarget.id))
    setDeleteTarget(null)
  }

  /* ─── derived stats ─── */
  const upCount = monitors.filter((m) => m.status === 'up').length
  const downCount = monitors.filter((m) => m.status === 'down').length
  const avgLatency = monitors.filter((m) => m.latency !== null).length
    ? Math.round(
        monitors.filter((m) => m.latency !== null).reduce((a, m) => a + (m.latency ?? 0), 0) /
          monitors.filter((m) => m.latency !== null).length,
      )
    : 0

  /* ─── loading state ─── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] font-[Inter,sans-serif]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] font-[Inter,sans-serif] text-white selection:bg-orange-500/30">
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.04] bg-[#09090b]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* left */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-orange-500 text-sm font-black"
              onClick={() => navigate('/')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 15h14"/><path d="M5 9h14"/><path d="m14 20-5-5 6-6-5-5"/></svg>
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">gophar</span>
          </div>

          {/* right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-neutral-400 transition hover:border-white/10 hover:text-white disabled:opacity-50 sm:text-sm"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => { logoutUser(); navigate('/') }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-400 transition hover:text-red-400 sm:text-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        {/* ─── HEADER ─── */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {user?.email ? `Monitoring as ${user.email}` : 'Your uptime command center.'}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 sm:w-auto"
          >
            <Plus size={18} />
            Add Monitor
          </button>
        </div>

        {/* ─── STAT CARDS ─── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={Globe} value={monitors.length} label="Total Monitors" />
          <StatCard icon={CheckCircle2} value={upCount} label="Up" />
          <StatCard icon={XCircle} value={downCount} label="Down" />
          <StatCard icon={Zap} value={`${avgLatency}ms`} label="Avg Latency" />
        </div>

        {/* ─── DOWN ALERT BANNER ─── */}
        {downCount > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 sm:mb-8">
            <Bell size={18} className="shrink-0 text-red-400" />
            <p className="text-sm text-red-300">
              <span className="font-semibold">{downCount} monitor{downCount > 1 ? 's' : ''}</span>{' '}
              currently down — check immediately!
            </p>
          </div>
        )}

        {/* ─── TABS ─── */}
        <div className="mb-5 flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 sm:mb-6 sm:w-fit">
          {(['monitors', 'logs'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition sm:flex-none ${
                tab === t
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t === 'monitors' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Activity size={14} />
                  Monitors
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <BarChart3 size={14} />
                  Logs
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════ MONITORS TAB ═══════════ */}
        {tab === 'monitors' && (
          <>
            {monitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
                <Globe size={40} className="mb-4 text-neutral-600" />
                <p className="text-lg font-semibold text-neutral-400">No monitors yet</p>
                <p className="mb-6 mt-1 text-sm text-neutral-600">
                  Add your first URL to start watching it like a hawk.
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                >
                  <Plus size={16} />
                  Add Monitor
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {monitors.map((m) => (
                  <div
                    key={m.id}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.1] sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* left info */}
                      <div className="flex items-start gap-3 sm:items-center">
                        <div className="mt-1 sm:mt-0">
                          <PingDot status={m.status} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white sm:text-base">
                            {m.url}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              Every {m.frequency}m
                            </span>
                            {m.latency !== null && (
                              <span className="flex items-center gap-1">
                                <Zap size={12} />
                                {m.latency}ms
                              </span>
                            )}
                            {m.lastChecked && (
                              <span>Checked {timeAgo(m.lastChecked)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* right badges + actions */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            m.status === 'up'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : m.status === 'down'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {m.status === 'up' ? 'Up' : m.status === 'down' ? 'Down' : 'Pending'}
                        </span>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="rounded-lg p-2 text-neutral-600 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Delete monitor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══════════ LOGS TAB ═══════════ */}
        {tab === 'logs' && (
          <>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
                <BarChart3 size={40} className="mb-4 text-neutral-600" />
                <p className="text-lg font-semibold text-neutral-400">No logs yet</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Logs will appear here once monitors start running checks.
                </p>
              </div>
            ) : (
              <>
                {/* desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-white/[0.06] sm:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-neutral-500">
                        <th className="px-5 py-3 font-medium">URL</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Latency</th>
                        <th className="px-5 py-3 font-medium">Checked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => {
                        const ok = l.status >= 200 && l.status < 400
                        return (
                          <tr key={l.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                            <td className="max-w-[260px] truncate px-5 py-3 font-medium text-neutral-200">
                              {l.url}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {l.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-mono text-neutral-400">
                              {l.latency > 0 ? `${l.latency}ms` : '—'}
                            </td>
                            <td className="px-5 py-3 text-neutral-500">{timeAgo(l.checkedAt)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* mobile cards */}
                <div className="space-y-3 sm:hidden">
                  {logs.map((l) => {
                    const ok = l.status >= 200 && l.status < 400
                    return (
                      <div key={l.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="max-w-[200px] truncate text-sm font-semibold text-white">{l.url}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            {l.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Zap size={11} />
                            {l.latency > 0 ? `${l.latency}ms` : '—'}
                          </span>
                          <span>{timeAgo(l.checkedAt)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ─── MODALS ─── */}
      <AddMonitorModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddMonitor} />
      <DeleteModal
        open={!!deleteTarget}
        url={deleteTarget?.url ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
