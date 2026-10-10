import React, { useRef, useEffect } from 'react'
import {
  X,
  BookOpen,
  Activity,
  FileText,
  Globe,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RotateCcw,
  MessageCircle,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  Navigation,
  ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'
import { useChatDrawer } from '../../context/ChatDrawerContext.jsx'
import { parseTrace } from '../../utils/trace.js'

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

function DrawerTraceStep({ step, isLast }) {
  const [expanded, setExpanded] = React.useState(false)
  const styles = statusStyles[step.status] || statusStyles.success
  const Icon = iconMap[step.icon] || CheckCircle

  return (
    <div className="flex gap-3">
      {/* Timeline connector column */}
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
        {!isLast && <div className={clsx('w-px flex-1 mt-1 min-h-[20px]', styles.line)} />}
      </div>

      {/* Step Content */}
      <div className={clsx('pb-4 min-w-0 flex-1', isLast && 'pb-0')}>
        <div
          className={clsx(
            'flex items-start gap-2 select-none',
            step.description ? 'cursor-pointer group' : ''
          )}
          onClick={() => step.description && setExpanded((e) => !e)}
          role={step.description ? 'button' : undefined}
          aria-expanded={step.description ? expanded : undefined}
        >
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug flex-1 font-sans">
            {step.title}
          </span>
          {step.description && (
            <span className="text-zinc-400 flex-shrink-0 mt-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </div>
        {expanded && step.description && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] animate-fade-in font-sans">
            {step.description}
          </p>
        )}
      </div>
    </div>
  )
}

function DrawerSourceCard({ citation, index }) {
  const isPrivate = citation.type === 'private_kb'

  return (
    <div
      className={clsx(
        'p-3.5 rounded-xl border transition-all bg-white dark:bg-[#18181b] shadow-2xs',
        isPrivate
          ? 'border-[#e5e5e0] dark:border-[#27272a]'
          : 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border',
            isPrivate
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/40 text-blue-600'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40 text-amber-600'
          )}
        >
          {isPrivate ? <FileText size={15} /> : <Globe size={15} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Citation {index + 1}
            </span>
          </div>

          {citation.url ? (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 group mt-0.5"
            >
              <span className="truncate">{citation.title || citation.url}</span>
              <ExternalLink size={11} className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate font-sans">
              {citation.title || 'Private HR Document'}
            </h4>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={clsx(
                'text-[10px] font-mono font-medium px-2 py-0.5 rounded border',
                isPrivate
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
              )}
            >
              {isPrivate ? 'Internal HR Policy' : 'External Web Source'}
            </span>

            {citation.url && !isPrivate && (
              <span className="text-[10px] text-zinc-400 font-mono truncate">
                {(() => {
                  try {
                    return new URL(citation.url).hostname
                  } catch {
                    return ''
                  }
                })()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatDrawer() {
  const { isOpen, activeTab, activeMessage, closeDrawer, setActiveTab } = useChatDrawer()
  const drawerRef = useRef(null)

  const citations = activeMessage?.citations || []
  const trace = activeMessage?.trace || []
  const hasSources = citations.length > 0
  const hasTrace = trace.length > 0
  const hasWeb = citations.some((c) => c.type === 'web')

  const parsedSteps = React.useMemo(() => parseTrace(trace), [trace])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={activeTab === 'sources' ? 'Citations and sources drawer' : 'Agent activity reasoning drawer'}
        className={clsx(
          'fixed top-0 bottom-0 right-0 z-50 flex flex-col',
          'w-full sm:w-[420px] md:w-[440px]',
          'bg-white dark:bg-[#18181b] border-l border-[#e5e5e0] dark:border-[#27272a] shadow-drawer',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        )}
      >
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-[#e5e5e0] dark:border-[#27272a] flex items-center justify-between gap-3 flex-shrink-0 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-sm">
          {/* Segmented Tab switcher */}
          {hasSources && hasTrace ? (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('sources')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer',
                  activeTab === 'sources'
                    ? 'bg-white dark:bg-[#121214] text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <BookOpen size={13} />
                <span>Sources ({citations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trace')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer',
                  activeTab === 'trace'
                    ? 'bg-white dark:bg-[#121214] text-teal-600 dark:text-teal-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <Activity size={13} />
                <span>Reasoning Trace</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {activeTab === 'sources' ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600">
                    <BookOpen size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Citations
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {citations.length} documents cited
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center text-teal-600">
                    <Activity size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Reasoning Trace
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Multi-agent pipeline
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
          {activeTab === 'sources' ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight font-editorial">
                  Verified Knowledge Sources
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Documents and approved policies retrieved by Clario to answer this query.
                </p>
              </div>

              {citations.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 border border-[#e5e5e0] dark:border-[#27272a] rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                  No reference sources were recorded for this response.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {citations.map((c, i) => (
                    <DrawerSourceCard key={i} citation={c} index={i} />
                  ))}
                </div>
              )}

              {hasWeb && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 mt-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    External web information was referenced to answer this question. Please confirm company policy with your HR department.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight font-editorial">
                  Agent Execution Sequence
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Multi-agent retrieval, query routing, evidence grading, and answer synthesis.
                </p>
              </div>

              {parsedSteps.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 border border-[#e5e5e0] dark:border-[#27272a] rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                  No execution trace was recorded for this response.
                </div>
              ) : (
                <div className="pt-2 pl-1 space-y-0">
                  {parsedSteps.map((step, i) => (
                    <DrawerTraceStep
                      key={step.id || i}
                      step={step}
                      isLast={i === parsedSteps.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
