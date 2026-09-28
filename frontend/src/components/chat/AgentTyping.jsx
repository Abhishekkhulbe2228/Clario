import React, { useEffect, useState } from 'react'
import ClarioLogo from '../common/ClarioLogo.jsx'

export default function AgentTyping({ stage = 'Analyzing your question...' }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-3 px-4 py-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
        <ClarioLogo size={20} />
      </div>
      <div className="flex flex-col gap-2 max-w-md">
        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex gap-1 items-center">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand-400 dark:bg-brand-500 animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{stage}{dots}</span>
        </div>
      </div>
    </div>
  )
}
