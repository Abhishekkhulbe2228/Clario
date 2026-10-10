import React, { useRef, useEffect, useState } from 'react'
import { ArrowUp, CornerDownLeft, Sparkles } from 'lucide-react'
import clsx from 'clsx'

export default function ChatComposer({ onSend, isLoading }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px'
  }, [value])

  const handleSend = () => {
    const q = value.trim()
    if (!q || isLoading) return
    onSend(q)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-[#e5e5e0] dark:border-[#27272a] bg-[#fbfbfa]/90 dark:bg-[#111113]/90 backdrop-blur-md px-4 sm:px-6 py-4">
      <div className="max-w-3xl mx-auto">
        <div
          className={clsx(
            'flex items-end gap-2 bg-white dark:bg-[#18181b] rounded-xl border transition-all duration-150 shadow-xs',
            'border-[#e5e5e0] dark:border-[#27272a]',
            'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10'
          )}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Ask Clario about HR policies, leave, compensation, or benefits…"
            disabled={isLoading}
            aria-label="Ask Clario a workplace policy question"
            className="flex-1 bg-transparent resize-none py-3.5 pl-4 pr-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100
              placeholder-zinc-400 dark:placeholder-zinc-500 outline-none leading-relaxed
              disabled:opacity-50 max-h-44 font-sans"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isLoading}
            aria-label="Submit question"
            className={clsx(
              'mr-2 mb-2 p-2 rounded-lg transition-all duration-150 flex-shrink-0 cursor-pointer shadow-2xs',
              value.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-[#e5e5e0] dark:border-[#27272a] cursor-not-allowed'
            )}
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 px-1 font-sans">
          <span>Clario cites approved company documents</span>
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-[#e5e5e0] dark:border-[#27272a] rounded text-[10px] font-mono">
              Return
            </kbd>{' '}
            to send ·{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-[#e5e5e0] dark:border-[#27272a] rounded text-[10px] font-mono">
              Shift + Return
            </kbd>{' '}
            for new line
          </span>
        </div>
      </div>
    </div>
  )
}
