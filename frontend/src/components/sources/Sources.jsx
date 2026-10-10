import React, { useState } from 'react'
import { FileText, Globe, ExternalLink, ChevronDown, AlertCircle, BookOpen } from 'lucide-react'
import clsx from 'clsx'

function SourceItem({ citation }) {
  const isPrivate = citation.type === 'private_kb'

  return (
    <div
      className={clsx(
        'p-3 rounded-lg border bg-white dark:bg-[#18181b] flex items-start gap-3 transition-colors shadow-2xs',
        isPrivate
          ? 'border-[#e5e5e0] dark:border-[#27272a]'
          : 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/20'
      )}
    >
      <div
        className={clsx(
          'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border',
          isPrivate
            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/40 text-blue-600'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/40 text-amber-600'
        )}
      >
        {isPrivate ? <FileText size={13} /> : <Globe size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        {citation.url ? (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 group font-sans"
          >
            <span className="truncate">{citation.title || citation.url}</span>
            <ExternalLink size={11} className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate font-sans">
            {citation.title || 'Private HR Document'}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={clsx(
              'text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border',
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
  )
}

export default function Sources({ citations = [], sourceUsed }) {
  const [collapsed, setCollapsed] = useState(false)
  const hasWeb = citations.some((c) => c.type === 'web')

  if (!citations.length) return null

  return (
    <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] overflow-hidden shadow-xs">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
        aria-expanded={!collapsed}
        aria-label="Toggle sources"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-sans">
            Reference Sources
          </span>
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded px-1.5 py-0.5 font-medium font-mono">
            {citations.length}
          </span>
        </div>
        <ChevronDown size={13} className={clsx('text-zinc-400 transition-transform', collapsed && '-rotate-90')} />
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 border-t border-[#efefea] dark:border-[#27272a] space-y-2 pt-3">
          {citations.map((c, i) => (
            <SourceItem key={i} citation={c} />
          ))}

          {hasWeb && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 mt-2">
              <AlertCircle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed font-sans">
                External information was referenced. Confirm with HR before treating as official company policy.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
