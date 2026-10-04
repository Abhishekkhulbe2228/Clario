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
    badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    icon: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    line: 'bg-amber-200 dark:bg-amber-900/60',
    badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  },
  info: {
    icon: 'text-brand-600 dark:text-brand-400',
    dot: 'bg-brand-500',
    line: 'bg-brand-200 dark:bg-brand-900/60',
    badge: 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
  },
  error: {
    icon: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
    line: 'bg-red-200 dark:bg-red-900/60',
    badge: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
}

function DrawerTraceStep({ step, isLast }) {
  const [expanded, setExpanded] = React.useState(false)
  const styles = statusStyles[step.status] || statusStyles.success
  const Icon = iconMap[step.icon] || CheckCircle

  return (
    <div className="flex gap-3">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white dark:ring-navy-950',
            styles.dot,
            'bg-opacity-20 dark:bg-opacity-25'
          )}
        >
          <Icon size={13} className={styles.icon} />
        </div>
        {!isLast && <div className={clsx('w-0.5 flex-1 mt-1 min-h-[18px]', styles.line)} />}
      </div>

      {/* Content */}
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
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug flex-1">
            {step.title}
          </span>
          {step.description && (
            <span className="text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
              {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </div>
        {expanded && step.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed bg-gray-50 dark:bg-navy-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/80 animate-fade-in">
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
        'p-3.5 rounded-xl border transition-all hover:shadow-xs',
        isPrivate
          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-100/80 dark:border-blue-900/30'
          : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-100/80 dark:border-amber-900/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
            isPrivate ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-amber-100 dark:bg-amber-900/40'
          )}
        >
          {isPrivate ? (
            <FileText size={15} className="text-brand-600 dark:text-brand-400" />
          ) : (
            <Globe size={15} className="text-amber-600 dark:text-amber-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Source {index + 1}
            </span>
          </div>

          {citation.url ? (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 group mt-0.5"
            >
              <span className="truncate">{citation.title || citation.url}</span>
              <ExternalLink
                size={12}
                className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ) : (
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
              {citation.title || 'Private HR Document'}
            </h4>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={clsx(
                'text-[10px] font-medium px-2 py-0.5 rounded-md',
                isPrivate
                  ? 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              )}
            >
              {isPrivate ? 'Private HR Knowledge' : 'External Web Source'}
            </span>

            {citation.url && !isPrivate && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
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

      {/* Slide-over Panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={activeTab === 'sources' ? 'Sources drawer' : 'Agent activity drawer'}
        className={clsx(
          'fixed top-0 bottom-0 right-0 z-40 flex flex-col',
          'w-full sm:w-[400px] md:w-[420px]',
          'bg-white dark:bg-navy-950 border-l border-gray-100 dark:border-gray-800/80 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        )}
      >
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3 flex-shrink-0 bg-white/80 dark:bg-navy-950/80 backdrop-blur-sm">
          {/* Tabs or Title */}
          {hasSources && hasTrace ? (
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('sources')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
                  activeTab === 'sources'
                    ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <BookOpen size={13} />
                <span>Sources ({citations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trace')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all',
                  activeTab === 'trace'
                    ? 'bg-white dark:bg-navy-900 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Activity size={13} />
                <span>Agent Activity</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {activeTab === 'sources' ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <BookOpen size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                      Sources
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {citations.length} cited
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Activity size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                      Agent Activity
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      Reasoning process
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
          {activeTab === 'sources' ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                  Reference Sources
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Documents and verified knowledge used by Clario to answer this query.
                </p>
              </div>

              {citations.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-gray-50 dark:bg-navy-900/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-400">
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
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-900/40 mt-3">
                  <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    External information was referenced to answer this question. Please confirm company policy with your HR department.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                  How Clario Reached This Answer
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Multi-agent retrieval, query routing, evidence grading, and synthesis stages.
                </p>
              </div>

              {parsedSteps.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-gray-50 dark:bg-navy-900/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                  No agent activity trace is available for this response.
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
