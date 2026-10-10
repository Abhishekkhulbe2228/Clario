import React, { useEffect, useState } from 'react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import { Sparkles } from 'lucide-react'

export default function AgentTyping({ stage = 'Analyzing policy documentation…' }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-3 px-4 sm:px-6 py-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] flex items-center justify-center p-0.5 shadow-2xs">
        <ClarioLogo size={24} />
      </div>
      <div className="flex flex-col gap-1.5 max-w-md">
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xs">
          <div className="flex gap-1 items-center">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"
                style={{ animationDelay: `${i * 180}ms` }}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            {stage}{dots}
          </span>
        </div>
      </div>
    </div>
  )
}
