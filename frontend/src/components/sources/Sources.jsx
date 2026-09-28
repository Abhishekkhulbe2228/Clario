import React, { useState } from 'react'
import { FileText, Globe, ExternalLink, ChevronDown, AlertCircle, BookOpen } from 'lucide-react'
import clsx from 'clsx'

function SourceItem({ citation }) {
  const isPrivate = citation.type === 'private_kb'

  return (
    <div className={clsx(
      'flex items-start gap-3 p-3 rounded-xl border transition-colors',
      isPrivate
        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40'
        : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/40'
    )}>
      <div className={clsx(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        isPrivate ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
      )}>
        {isPrivate ? (
          <FileText size={14} className="text-blue-600 dark:text-blue-400" />
        ) : (
          <Globe size={14} className="text-amber-600 dark:text-amber-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {citation.url ? (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 group"
          >
            <span className="truncate">{citation.title || citation.url}</span>
            <ExternalLink size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {citation.title || 'Unknown source'}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={clsx(
            'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
            isPrivate
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
          )}>
            {isPrivate ? 'Private HR Knowledge' : 'External Web Source'}
          </span>
          {citation.url && !isPrivate && (
            <span className="text-[10px] text-gray-400 dark:text-gray-600 truncate">
              {new URL(citation.url).hostname}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Sources({ citations = [], sourceUsed }) {
  const [collapsed, setCollapsed] = useState(false)
  const hasWeb = citations.some(c => c.type === 'web')

  if (!citations.length) return null

  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900/50">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        aria-expanded={!collapsed}
        aria-label="Toggle sources"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Sources
          </span>
          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full px-1.5 py-0.5 font-medium">
            {citations.length}
          </span>
        </div>
        <ChevronDown size={13} className={clsx('text-gray-400 transition-transform', collapsed && '-rotate-90')} />
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 space-y-2 pt-3">
          {citations.map((c, i) => <SourceItem key={i} citation={c} />)}

          {hasWeb && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 mt-2">
              <AlertCircle size={13} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                External information may require HR validation before being treated as company policy.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
