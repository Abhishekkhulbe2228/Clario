import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ThumbsUp, ThumbsDown, Check, BookOpen, Activity } from 'lucide-react'
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
    <div className="flex justify-end gap-3 px-4 py-2 animate-slide-up">
      <div className="max-w-[75%] md:max-w-[60%]">
        <div className="bg-gradient-to-br from-brand-600 to-violet-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-right mt-1 px-1">
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
      <UserAvatar user={user} size="sm" count={1} className="mt-1" />
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
    <div className="flex gap-3 px-4 py-2 animate-slide-up">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white dark:bg-navy-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center mt-1 shadow-sm overflow-hidden p-0.5">
        <ClarioLogo size={24} />
      </div>

      <div className="flex-1 min-w-0 max-w-2xl">
        {/* Main answer card */}
        <div
          className={clsx(
            'px-4 py-3.5 rounded-2xl rounded-tl-sm border shadow-sm',
            isInsufficient
              ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          )}
        >
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

        {/* Sources and Agent Activity compact triggers */}
        {(hasSources || hasTrace) && (
          <div className="flex items-center gap-2 mt-2 px-1 flex-wrap">
            {hasSources && (
              <button
                type="button"
                onClick={() => openDrawer('sources', message)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                  bg-gray-50 dark:bg-gray-800/70 hover:bg-brand-50 dark:hover:bg-brand-950/40
                  text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400
                  border border-gray-200/80 dark:border-gray-800 transition-colors shadow-2xs cursor-pointer"
                aria-label={`View ${message.citations.length} sources in side panel`}
              >
                <BookOpen size={12} className="text-brand-500" />
                <span>Sources · {message.citations.length}</span>
              </button>
            )}

            {hasTrace && (
              <button
                type="button"
                onClick={() => openDrawer('trace', message)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                  bg-gray-50 dark:bg-gray-800/70 hover:bg-violet-50 dark:hover:bg-violet-950/40
                  text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400
                  border border-gray-200/80 dark:border-gray-800 transition-colors shadow-2xs cursor-pointer"
                aria-label="View agent activity in side panel"
              >
                <Activity size={12} className="text-violet-500" />
                <span>Agent activity</span>
              </button>
            )}
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
