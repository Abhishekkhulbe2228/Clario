import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, CheckCircle, Globe, AlertTriangle, ChevronRight, X, Lock, ShieldCheck, MessageSquare } from 'lucide-react'
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
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/30',
    amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30',
    red: 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/30',
  }
  return (
    <div className={clsx('p-4 rounded-2xl border flex items-start gap-3', colors[color])}>
      <div className="w-8 h-8 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none mb-1">{value ?? '—'}</p>
        <p className="text-xs opacity-80">{label}</p>
      </div>
    </div>
  )
}

function DetailDrawer({ log, onClose }) {
  if (!log) return null
  const trace = typeof log.trace_json === 'string' ? JSON.parse(log.trace_json) : (log.trace_json || [])
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Execution detail">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[80vh] overflow-y-auto scrollbar-thin animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Execution Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" aria-label="Close"><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Question</p>
            <p className="text-sm text-gray-800 dark:text-gray-200">{log.question}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Source</p>
              <StatusBadge sourceUsed={log.source_used} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Time</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{format(new Date(log.created_at), 'MMM d, HH:mm')}</p>
            </div>
          </div>
          {trace.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Execution Trace</p>
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
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Agent Activity</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor Clario's reasoning and execution history</p>
    </div>
  )
}

/**
 * Purely decorative dashboard silhouette shown behind the lock card.
 * Contains NO audit data — only static shapes — so removing the blur in
 * DevTools reveals nothing. Hidden from assistive tech and non-interactive.
 */
function DecorativePreview() {
  const rowWidths = ['w-3/5', 'w-2/5', 'w-1/2', 'w-2/3', 'w-1/3', 'w-3/5']
  const accents = ['bg-brand-400/50', 'bg-violet-400/50', 'bg-emerald-400/40', 'bg-amber-400/40']
  return (
    <div aria-hidden="true" inert="" className="pointer-events-none select-none blur-[6px] opacity-70 p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {accents.map((accent, i) => (
          <div key={i} className="p-4 rounded-2xl border border-gray-200/70 dark:border-white/5 bg-white/70 dark:bg-white/[0.03] flex items-start gap-3">
            <div className={clsx('w-8 h-8 rounded-xl', accent)} />
            <div className="flex-1 space-y-2 pt-0.5">
              <div className="h-5 w-10 rounded-md bg-gray-300/80 dark:bg-white/15" />
              <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200/70 dark:border-white/5 bg-white/70 dark:bg-white/[0.03]">
        <div className="px-4 py-3 border-b border-gray-200/70 dark:border-white/5">
          <div className="h-2.5 w-24 rounded-full bg-gray-300/80 dark:bg-white/15" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {rowWidths.map((w, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <div className="h-2 w-14 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className={clsx('h-2.5 rounded-full bg-gray-300/80 dark:bg-white/15', w)} />
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
      className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-navy-950 min-h-[460px]"
    >
      <DecorativePreview />

      {/* Overlay: soft scrim + ambient brand glow */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/60 to-white/80 dark:from-navy-950/30 dark:via-navy-950/60 dark:to-navy-950/85" />
      <div aria-hidden="true" className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-brand-500/20 dark:bg-brand-600/25 blur-[90px]" />
      <div aria-hidden="true" className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-violet-500/15 dark:bg-violet-600/20 blur-[90px]" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/85 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] px-6 py-7 animate-slide-up">
          <div className="mx-auto mb-4 h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-600/25">
            <Lock size={18} className="text-white" aria-hidden="true" />
          </div>

          <h2 id="activity-locked-title" className="text-base font-semibold text-gray-900 dark:text-white">
            Admin-only activity logs
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Historical Agent Activity and execution logs are available only to administrators.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            You can still view the Agent Activity for your own responses directly from the chat.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300">
              <ShieldCheck size={13} aria-hidden="true" />
              Admin access required
            </span>
            <Link
              to="/"
              id="activity-locked-back-to-chat"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <MessageSquare size={13} aria-hidden="true" />
              Back to chat
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
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <PageHeader />
        {isLoading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : isAdminUser(user) ? (
          <AdminActivity />
        ) : (
          // Non-admins never mount AdminActivity, so /audit endpoints are not called.
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
      .catch(err => {
        if (cancelled) return
        // Backend is the source of truth: a 403 means this account isn't authorized.
        if (err?.status === 403) setForbidden(true)
        else setError(err?.message || 'Could not load execution logs.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (forbidden) return <RestrictedActivity />

  return (
    <>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Executions" value={error ? null : (stats?.total ?? logs.length)} icon={Activity} color="blue" />
          <StatCard label="Successful" value={stats?.successful} icon={CheckCircle} color="green" />
          <StatCard label="Web Fallbacks" value={stats?.web_fallbacks} icon={Globe} color="amber" />
          <StatCard label="Insufficient" value={stats?.insufficient} icon={AlertTriangle} color="red" />
        </div>

        {/* Logs table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Execution Log</h2>
          </div>

          {loading ? (
            <div className="p-4"><TableSkeleton /></div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error.includes('fetch') ? 'Backend unavailable — connect to view execution logs.' : error}
              </p>
            </div>
          ) : logs.length === 0 ? (
            <EmptyState icon={Activity} title="No executions yet" description="Execution logs will appear here as employees use Clario." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-800">
                    {['Time', 'Question', 'Source', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {logs.map((log, i) => (
                    <tr
                      key={log.id || i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                      onClick={() => setSelected(log)}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setSelected(log)}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {log.created_at ? format(new Date(log.created_at), 'MMM d, HH:mm') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 max-w-xs truncate">{log.question}</td>
                      <td className="px-4 py-3"><StatusBadge sourceUsed={log.source_used} /></td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          log.source_used === 'insufficient_evidence'
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        )}>
                          {log.source_used === 'insufficient_evidence' ? 'Insufficient' : 'Success'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={13} className="text-gray-400" />
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
