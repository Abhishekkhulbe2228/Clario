import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import AgentActivity from '../trace/AgentActivity.jsx'
import Sources from '../sources/Sources.jsx'
import { sendFeedback } from '../../api/chat.js'
import clsx from 'clsx'
import { format } from 'date-fns'

function UserMessage({ message }) {
  return (
    <div className="flex justify-end gap-3 px-4 py-2 animate-slide-up">
      <div className="max-w-[75%] md:max-w-[60%]">
        <div className="bg-gradient-to-br from-brand-600 to-violet-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-right mt-1 px-1">
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-xs font-semibold text-white">E</span>
      </div>
    </div>
  )
}

function AssistantMessage({ message }) {
  const [feedback, setFeedback] = useState(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [traceExpanded, setTraceExpanded] = useState(false)
  const [sourcesExpanded, setSourcesExpanded] = useState(false)

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
    <div className="flex gap-3 px-4 py-2 animate-slide-up">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mt-1 shadow-sm">
        <ClarioLogo size={20} />
      </div>

      <div className="flex-1 min-w-0 max-w-2xl">
        {/* Main answer card */}
        <div className={clsx(
          'px-4 py-3.5 rounded-2xl rounded-tl-sm border shadow-sm',
          isInsufficient
            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
        )}>
          {/* Source badge */}
          {message.sourceUsed && (
            <div className="mb-3">
              <StatusBadge sourceUsed={message.sourceUsed} />
            </div>
          )}

          {/* Answer content */}
          <div className="prose-clario text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 px-1">
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>

        {/* Sources */}
        {hasSources && (
          <div className="mt-2">
            <Sources citations={message.citations} sourceUsed={message.sourceUsed} />
          </div>
        )}

        {/* Agent trace */}
        {hasTrace && (
          <div className="mt-2">
            <AgentActivity trace={message.trace} />
          </div>
        )}

        {/* Feedback */}
        <div className="flex items-center gap-3 mt-2 px-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Was this helpful?</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback('up')}
              disabled={feedbackSent}
              aria-label="Mark as helpful"
              className={clsx(
                'p-1.5 rounded-lg text-xs transition-all',
                feedback === 'up'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-600'
              )}
            >
              <ThumbsUp size={12} />
            </button>
            <button
              onClick={() => handleFeedback('down')}
              disabled={feedbackSent}
              aria-label="Mark as not helpful"
              className={clsx(
                'p-1.5 rounded-lg text-xs transition-all',
                feedback === 'down'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-600'
              )}
            >
              <ThumbsDown size={12} />
            </button>
          </div>
          {feedbackSent && (
            <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-1 animate-fade-in">
              <Check size={10} /> Thanks for your feedback.
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
