import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThumbsUp, ThumbsDown, Check, BookOpen, Activity, FileText, Sparkles } from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import UserAvatar from '../common/UserAvatar.jsx'
import { sendFeedback } from '../../api/chat.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useChatDrawer } from '../../context/ChatDrawerContext.jsx'
import clsx from 'clsx'
import { format } from 'date-fns'

function UserMessage({ message }) {
  const { user } = useAuth()

  return (
    <div className="flex justify-end gap-3 px-4 sm:px-6 py-2.5 animate-slide-up">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-3 rounded-2xl rounded-tr-xs text-xs sm:text-sm font-sans leading-relaxed shadow-xs">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-right mt-1 px-1 font-mono">
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
      <UserAvatar user={user} size="sm" count={1} className="mt-1 flex-shrink-0" />
    </div>
  )
}

function AssistantMessage({ message }) {
  const [feedback, setFeedback] = useState(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const { openDrawer } = useChatDrawer()

  const handleFeedback = async (value) => {
    if (feedbackSent) return
    setFeedback(value)
    setFeedbackSent(true)
    await sendFeedback({ message_id: message.id, helpful: value === 'up' })
  }

  const hasSources = message.citations && message.citations.length > 0
  const hasTrace = message.trace && message.trace.length > 0
  const isInsufficient = message.sourceUsed === 'insufficient_evidence'

  return (
    <div className="flex gap-3 px-4 sm:px-6 py-3 animate-slide-up">
      {/* Clario avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] flex items-center justify-center mt-1 overflow-hidden p-0.5 shadow-2xs">
        <ClarioLogo size={24} />
      </div>

      <div className="flex-1 min-w-0 max-w-3xl">
        {/* Main answer surface card */}
        <div
          className={clsx(
            'rounded-xl border bg-white dark:bg-[#18181b] p-5 shadow-xs transition-colors',
            isInsufficient
              ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20'
              : 'border-[#e5e5e0] dark:border-[#27272a]'
          )}
        >
          {/* Header row: Author + Status Badge + Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#efefea] dark:border-[#27272a]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                Clario Copilot
              </span>
              {message.sourceUsed && (
                <StatusBadge sourceUsed={message.sourceUsed} />
              )}
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          </div>

          {/* Answer content with editorial typography */}
          <div className="prose-clario text-xs sm:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Sources and Agent Activity triggers */}
          {(hasSources || hasTrace) && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#efefea] dark:border-[#27272a] flex-wrap">
              {hasSources && (
                <button
                  type="button"
                  onClick={() => openDrawer('sources', message)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                    border border-[#e5e5e0] dark:border-[#27272a] hover:border-blue-400 dark:hover:border-blue-500
                    bg-zinc-50 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800
                    text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shadow-2xs"
                  aria-label={`View ${message.citations.length} cited sources in drawer`}
                >
                  <BookOpen size={12} className="text-blue-600" />
                  <span>Citations ({message.citations.length})</span>
                </button>
              )}

              {hasTrace && (
                <button
                  type="button"
                  onClick={() => openDrawer('trace', message)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                    border border-[#e5e5e0] dark:border-[#27272a] hover:border-teal-400 dark:hover:border-teal-500
                    bg-zinc-50 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800
                    text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shadow-2xs"
                  aria-label="View reasoning activity trace in drawer"
                >
                  <Activity size={12} className="text-teal-600" />
                  <span>Reasoning Trace</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Feedback footer */}
        <div className="flex items-center gap-3 mt-2 px-1">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Was this answer accurate?</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback('up')}
              disabled={feedbackSent}
              aria-label="Helpful"
              className={clsx(
                'p-1.5 rounded-md text-xs transition-colors cursor-pointer',
                feedback === 'up'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              )}
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => handleFeedback('down')}
              disabled={feedbackSent}
              aria-label="Not helpful"
              className={clsx(
                'p-1.5 rounded-md text-xs transition-colors cursor-pointer',
                feedback === 'down'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                  : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              )}
            >
              <ThumbsDown size={12} />
            </button>
          </div>
          {feedbackSent && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in font-medium">
              <Check size={11} /> Feedback recorded. Thank you.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatMessage({ message }) {
  if (message.role === 'user') return <UserMessage message={message} />
  return <AssistantMessage message={message} />
}
