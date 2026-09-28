import React, { useState } from 'react'
import {
  CheckCircle, AlertTriangle, XCircle, Globe, RotateCcw,
  MessageCircle, Sparkles, Search, ChevronDown, ChevronRight,
  Navigation, Activity
} from 'lucide-react'
import { parseTrace } from '../../utils/trace.js'
import clsx from 'clsx'

const iconMap = {
  'check': CheckCircle,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  'globe': Globe,
  'refresh-cw': RotateCcw,
  'message-circle': MessageCircle,
  'sparkles': Sparkles,
  'search': Search,
  'route': Navigation,
}

const statusStyles = {
  success: {
    icon: 'text-green-600 dark:text-green-400',
    dot: 'bg-green-500',
    line: 'bg-green-200 dark:bg-green-900',
    badge: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  },
  warning: {
    icon: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    line: 'bg-amber-200 dark:bg-amber-900',
    badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
  info: {
    icon: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    line: 'bg-blue-200 dark:bg-blue-900',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  },
  error: {
    icon: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
    line: 'bg-red-200 dark:bg-red-900',
    badge: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
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
        <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white dark:ring-navy-950', styles.dot, 'bg-opacity-20 dark:bg-opacity-20')}>
          <Icon size={13} className={styles.icon} />
        </div>
        {!isLast && (
          <div className={clsx('w-0.5 flex-1 mt-1 min-h-[16px]', styles.line)} />
        )}
      </div>

      {/* Content */}
      <div className={clsx('pb-3 min-w-0 flex-1', isLast && 'pb-0')}>
        <div
          className={clsx(
            'flex items-start gap-2 cursor-pointer group',
            step.description && 'cursor-pointer'
          )}
          onClick={() => step.description && setExpanded(e => !e)}
          role={step.description ? 'button' : undefined}
          aria-expanded={step.description ? expanded : undefined}
        >
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight mt-0.5 flex-1">
            {step.title}
          </span>
          {step.description && (
            <span className="text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </div>
        {expanded && step.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed animate-fade-in">
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
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900/50">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        aria-expanded={!collapsed}
        aria-label="Toggle agent activity"
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Agent Activity
          </span>
          {isLoading && (
            <span className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-brand-500 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          )}
        </div>
        <ChevronDown size={13} className={clsx('text-gray-400 transition-transform', collapsed && '-rotate-90')} />
      </button>

      {/* Trace steps */}
      {!collapsed && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
          {isLoading && steps.length === 0 ? (
            <div className="pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center animate-pulse-soft">
                  <Activity size={12} className="text-brand-600 dark:text-brand-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse-soft">
                  {loadingStage || 'Processing…'}
                </span>
              </div>
            </div>
          ) : steps.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-600 pt-3">No activity recorded yet.</p>
          ) : (
            <div className="pt-3 space-y-0">
              {steps.map((step, i) => (
                <TraceStep key={step.id} step={step} isLast={i === steps.length - 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
