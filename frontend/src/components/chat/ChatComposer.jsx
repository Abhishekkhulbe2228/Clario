import React, { useRef, useEffect, useState } from 'react'
import { Send, Paperclip } from 'lucide-react'
import clsx from 'clsx'

export default function ChatComposer({ onSend, isLoading }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
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
    <div className="border-t border-gray-100 dark:border-gray-800/60 bg-white dark:bg-navy-950 px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className={clsx(
          'flex items-end gap-2 bg-gray-50 dark:bg-gray-900 rounded-2xl border transition-all duration-150',
          'border-gray-200 dark:border-gray-700',
          'focus-within:border-brand-400 dark:focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100 dark:focus-within:ring-brand-900/30'
        )}>
          {/* Attachment button */}
          <button
            className="ml-3 mb-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            aria-label="Attach file"
            tabIndex={-1}
          >
            <Paperclip size={16} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Ask Clario about HR policies..."
            disabled={isLoading}
            aria-label="Message input"
            className="flex-1 bg-transparent resize-none py-3 text-sm text-gray-800 dark:text-gray-200
              placeholder-gray-400 dark:placeholder-gray-600 outline-none leading-relaxed
              disabled:opacity-50 max-h-40"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isLoading}
            aria-label="Send message"
            className={clsx(
              'mr-2 mb-2 p-2 rounded-xl transition-all duration-150 flex-shrink-0',
              value.trim() && !isLoading
                ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm hover:shadow-md active:scale-95'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send size={15} />
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-1.5">
          Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">Enter</kbd> to send
          &nbsp;·&nbsp;
          <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
