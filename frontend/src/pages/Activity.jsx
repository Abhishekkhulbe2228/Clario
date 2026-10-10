import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CheckCircle,
  Globe,
  AlertTriangle,
  ChevronRight,
  X,
  Lock,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import AgentActivity from '../components/trace/AgentActivity.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { getAuditLogs, getAuditStats } from '../api/logs.js'
import { TableSkeleton } from '../components/common/Skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { isAdminUser } from '../utils/user.js'
import { format } from 'date-fns'
import clsx from 'clsx'

function StatCard({ label, value, icon: Icon, color }) {
  const accentColors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/40',
    green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/40',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40',
    red: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/40',
  }

  return (
    <div className="p-4 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-2xs flex items-start gap-3.5">
      <div className={clsx('w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0', accentColors[color])}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-2xl font-bold font-editorial text-zinc-900 dark:text-zinc-100 leading-none mb-1">
          {value !== null && value !== undefined ? value : '—'}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">{label}</p>
      </div>
    </div>
  )
}

function DetailDrawer({ log, onClose }) {
  if (!log) return null
  const trace = typeof log.trace_json === 'string' ? JSON.parse(log.trace_json) : log.trace_json || []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Execution detail"
    >
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] shadow-xl max-h-[85vh] overflow-y-auto scrollbar-thin animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#efefea] dark:border-[#27272a]">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm font-sans">
            Execution Audit Detail
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wide mb-1">
              User Question
            </p>
            <p className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed font-sans bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-[#e5e5e0] dark:border-[#27272a]">
              {log.question}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                Source Type
              </p>
              <StatusBadge sourceUsed={log.source_used} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wide mb-1">
                Timestamp
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
              </p>
            </div>
          </div>
          {trace.length > 0 && (
            <div>
              <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                Execution Trace
              </p>
              <AgentActivity trace={trace} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
        <span>Reasoning Telemetry & Audit</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 font-editorial tracking-tight">
        Agent Activity & Execution Logs
      </h1>
      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed font-sans">
        Inspect query routing, vector retrieval grading, web fallbacks, and real-time execution statistics.
      </p>
    </div>
  )
}

/**
 * Purely decorative dashboard silhouette shown behind the lock card for employees.
 * Hidden from assistive tech and inert.
 */
function DecorativePreview() {
  const rowWidths = ['w-3/5', 'w-2/5', 'w-1/2', 'w-2/3', 'w-1/3', 'w-3/5']
  const accents = ['bg-blue-300/40', 'bg-emerald-300/40', 'bg-amber-300/40', 'bg-rose-300/30']

  return (
    <div aria-hidden="true" inert="" className="pointer-events-none select-none blur-[5px] opacity-60 p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {accents.map((accent, i) => (
          <div key={i} className="p-4 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] flex items-start gap-3">
            <div className={clsx('w-8 h-8 rounded-lg', accent)} />
            <div className="flex-1 space-y-2 pt-0.5">
              <div className="h-5 w-10 rounded-md bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-2 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b]">
        <div className="px-4 py-3 border-b border-[#efefea] dark:border-[#27272a]">
          <div className="h-2.5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="divide-y divide-[#efefea] dark:divide-[#27272a]">
          {rowWidths.map((w, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <div className="h-2 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className={clsx('h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700', w)} />
              <div className={clsx('ml-auto h-5 w-16 rounded-full', accents[i % accents.length])} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RestrictedActivity() {
  return (
    <section
      aria-labelledby="activity-locked-title"
      className="relative overflow-hidden rounded-2xl border border-[#e5e5e0] dark:border-[#27272a] bg-white/40 dark:bg-[#18181b]/40 min-h-[440px]"
    >
      <DecorativePreview />

      <div aria-hidden="true" className="absolute inset-0 bg-white/70 dark:bg-[#111113]/75 backdrop-blur-xs" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] p-6 sm:p-7 text-center shadow-lg animate-slide-up">
          <div className="mx-auto mb-3.5 h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600">
            <Lock size={18} aria-hidden="true" />
          </div>

          <h2 id="activity-locked-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
            Administrator Audit Logs
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
            Historical system audit logs and global execution metrics are restricted to administrators.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 font-sans">
            You can still inspect the real-time reasoning trace for your own answers directly inside each chat response.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300">
              <ShieldCheck size={12} aria-hidden="true" />
              <span>Admin access required</span>
            </span>
            <Link
              to="/"
              id="activity-locked-back-to-chat"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <MessageSquare size={12} aria-hidden="true" />
              <span>Back to chat</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ActivityPage() {
  const { user, isLoading } = useAuth()

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#fbfbfa] dark:bg-[#111113]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        <PageHeader />
        {isLoading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : isAdminUser(user) ? (
          <AdminActivity />
        ) : (
          <RestrictedActivity />
        )}
      </div>
    </div>
  )
}

function AdminActivity() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getAuditLogs(), getAuditStats()])
      .then(([logsData, statsData]) => {
        if (cancelled) return
        setLogs(logsData?.logs || logsData || [])
        setStats(statsData)
      })
      .catch((err) => {
        if (cancelled) return
        if (err?.status === 403) setForbidden(true)
        else setError(err?.message || 'Could not load execution logs.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (forbidden) return <RestrictedActivity />

  return (
    <>
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total executions" value={error ? null : (stats?.total ?? logs.length)} icon={Activity} color="blue" />
        <StatCard label="Successful queries" value={stats?.successful} icon={CheckCircle} color="green" />
        <StatCard label="Web fallbacks" value={stats?.web_fallbacks} icon={Globe} color="amber" />
        <StatCard label="Insufficient evidence" value={stats?.insufficient} icon={AlertTriangle} color="red" />
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#efefea] dark:border-[#27272a] flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
            Execution Log Table
          </h2>
          <span className="text-[10px] font-mono text-zinc-400">
            {logs.length} records recorded
          </span>
        </div>

        {loading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-xs text-zinc-500">
              {error.includes('fetch') ? 'Backend unavailable: connect to view execution logs.' : error}
            </p>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No executions recorded yet"
            description="Audit execution logs will appear here as employees submit queries."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" role="table">
              <thead>
                <tr className="border-b border-[#efefea] dark:border-[#27272a] bg-zinc-50/50 dark:bg-zinc-900/40">
                  {['Timestamp', 'User Question', 'Knowledge Source', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wide px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efefea] dark:divide-[#27272a]">
                {logs.map((log, i) => (
                  <tr
                    key={log.id || i}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                    onClick={() => setSelected(log)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelected(log)}
                  >
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap font-mono">
                      {log.created_at ? format(new Date(log.created_at), 'MMM d, HH:mm') : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-medium max-w-xs truncate font-sans">
                      {log.question}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge sourceUsed={log.source_used} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'text-[10px] font-mono px-2 py-0.5 rounded font-medium border',
                          log.source_used === 'insufficient_evidence'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40'
                        )}
                      >
                        {log.source_used === 'insufficient_evidence' ? 'Insufficient' : 'Success'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight size={13} className="text-zinc-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && <DetailDrawer log={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
