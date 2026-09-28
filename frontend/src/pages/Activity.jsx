import React, { useState, useEffect } from 'react'
import { Activity, CheckCircle, Globe, AlertTriangle, ChevronRight, X } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import AgentActivity from '../components/trace/AgentActivity.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { getAuditLogs, getAuditStats } from '../api/logs.js'
import { TableSkeleton } from '../components/common/Skeleton.jsx'
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

export default function ActivityPage() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAuditLogs().catch(() => ({ logs: [] })),
      getAuditStats().catch(() => null),
    ]).then(([logsData, statsData]) => {
      setLogs(logsData?.logs || logsData || [])
      setStats(statsData)
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Agent Activity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor Clario's reasoning and execution history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Executions" value={stats?.total ?? logs.length} icon={Activity} color="blue" />
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
      </div>
      {selected && <DetailDrawer log={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
