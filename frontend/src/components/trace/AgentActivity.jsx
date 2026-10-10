import React, { useState } from 'react'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Globe,
  RotateCcw,
  MessageCircle,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  Navigation,
  Activity,
} from 'lucide-react'
import { parseTrace } from '../../utils/trace.js'
import clsx from 'clsx'

const iconMap = {
  check: CheckCircle,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  globe: Globe,
  'refresh-cw': RotateCcw,
  'message-circle': MessageCircle,
  sparkles: Sparkles,
  search: Search,
  route: Navigation,
}

const statusStyles = {
  success: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    line: 'bg-emerald-200 dark:bg-emerald-900/60',
    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40',
  },
  warning: {
    icon: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    line: 'bg-amber-200 dark:bg-amber-900/60',
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40',
  },
  info: {
    icon: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    line: 'bg-blue-200 dark:bg-blue-900/60',
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40',
  },
  error: {
    icon: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    line: 'bg-rose-200 dark:bg-rose-900/60',
    badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40',
  },
}

function TraceStep({ step, isLast }) {
  const [expanded, setExpanded] = useState(false)
  const styles = statusStyles[step.status] || statusStyles.success
  const Icon = iconMap[step.icon] || CheckCircle

  return (
    <div className="flex gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border border-white dark:border-[#18181b]',
            styles.dot,
            'bg-opacity-20'
          )}
        >
          <Icon size={13} className={styles.icon} />
        </div>
        {!isLast && <div className={clsx('w-px flex-1 mt-1 min-h-[16px]', styles.line)} />}
      </div>

      {/* Content */}
      <div className={clsx('pb-3 min-w-0 flex-1', isLast && 'pb-0')}>
        <div
          className={clsx(
            'flex items-start gap-2 cursor-pointer select-none',
            step.description && 'cursor-pointer'
          )}
          onClick={() => step.description && setExpanded((e) => !e)}
          role={step.description ? 'button' : undefined}
          aria-expanded={step.description ? expanded : undefined}
        >
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug flex-1 font-sans">
            {step.title}
          </span>
          {step.description && (
            <span className="text-zinc-400 flex-shrink-0 mt-0.5 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </div>
        {expanded && step.description && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed bg-zinc-50 dark:bg-zinc-850 p-2 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] animate-fade-in font-sans">
            {step.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AgentActivity({ trace = [], isLoading = false, loadingStage = '' }) {
  const [collapsed, setCollapsed] = useState(false)
  const steps = parseTrace(trace)

  return (
    <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] overflow-hidden shadow-xs">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
        aria-expanded={!collapsed}
        aria-label="Toggle agent activity"
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-sans">
            Agent Reasoning Activity
          </span>
          {isLoading && (
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-teal-600 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          )}
        </div>
        <ChevronDown size={13} className={clsx('text-zinc-400 transition-transform', collapsed && '-rotate-90')} />
      </button>

      {/* Trace steps */}
      {!collapsed && (
        <div className="px-4 pb-4 border-t border-[#efefea] dark:border-[#27272a]">
          {isLoading && steps.length === 0 ? (
            <div className="pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center animate-pulse">
                  <Activity size={12} className="text-teal-600" />
                </div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                  {loadingStage || 'Processing query pipeline…'}
                </span>
              </div>
            </div>
          ) : steps.length === 0 ? (
            <p className="text-xs text-zinc-400 pt-3">No activity recorded for this execution.</p>
          ) : (
            <div className="pt-3 space-y-0">
              {steps.map((step, i) => (
                <TraceStep key={step.id || i} step={step} isLast={i === steps.length - 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
