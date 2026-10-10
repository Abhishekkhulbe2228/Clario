import React from 'react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import { Shield, Sparkles, BookOpen, Compass, ArrowUpRight } from 'lucide-react'

const suggestions = [
  {
    q: 'How many annual leave days do full-time employees receive?',
    category: 'Leave Policy',
    tag: 'HR-POL-04',
  },
  {
    q: 'What are the guidelines for remote work and home office stipends?',
    category: 'Remote Work',
    tag: 'HR-OPS-12',
  },
  {
    q: "What is the company's parental leave and caregiver policy?",
    category: 'Benefits',
    tag: 'HR-BEN-02',
  },
  {
    q: 'How do I submit an expense claim for travel and client meals?',
    category: 'Finance & Travel',
    tag: 'FIN-EXP-08',
  },
]

export default function ChatEmptyState({ onSuggestion }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 py-12 text-center animate-fade-in max-w-2xl mx-auto my-auto">
      {/* Brand mark */}
      <div className="mb-5 inline-flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] shadow-xs">
        <ClarioLogo size={48} />
      </div>

      {/* Editorial headline */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2.5 tracking-tight font-editorial">
        Workplace Knowledge Assistant
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed mb-8 font-sans">
        Ask questions in plain language to get accurate, policy-grounded answers with direct document citations.
      </p>

      {/* Suggestion prompt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8 text-left">
        {suggestions.map(({ q, category, tag }) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            className="group p-4 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:border-blue-400 dark:hover:border-blue-500/60 shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200/60 dark:border-teal-800/40">
                  {category}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-blue-600 transition-colors flex items-center gap-0.5">
                  {tag}
                  <ArrowUpRight size={11} />
                </span>
              </div>
              <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-sans">
                {q}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Trust & security badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e5e0] dark:border-[#27272a] bg-white/70 dark:bg-[#18181b]/70 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans shadow-2xs">
        <Shield size={12} className="text-blue-600 flex-shrink-0" />
        <span>Grounded in approved company policies · Cites all reference sources</span>
      </div>
    </div>
  )
}
