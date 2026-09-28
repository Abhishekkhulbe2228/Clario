import React from 'react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import { Shield } from 'lucide-react'

const suggestions = [
  { q: 'How many annual leave days do employees receive?', category: 'Leave Policy' },
  { q: 'How many days can I work remotely per week?', category: 'Remote Work' },
  { q: 'What is the company\'s parental leave policy?', category: 'Benefits' },
  { q: 'How do I submit an expense claim?', category: 'Finance' },
]

export default function ChatEmptyState({ onSuggestion }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
      {/* Logo */}
      <div className="mb-6">
        <ClarioLogo size={64} className="mx-auto drop-shadow-lg" />
      </div>

      {/* Headline */}
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
        How can I help you today?
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md leading-relaxed mb-8">
        Ask about company policies, leave, benefits, payroll, remote work,
        attendance, onboarding, and more.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-8">
        {suggestions.map(({ q, category }) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            className="text-left p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
              rounded-xl hover:border-brand-300 dark:hover:border-brand-700
              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
              group"
          >
            <span className="block text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-1.5">
              {category}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-white">
              {q}
            </span>
          </button>
        ))}
      </div>

      {/* Trust note */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-600">
        <Shield size={12} className="text-brand-400" />
        Clario prioritises approved company HR knowledge and clearly identifies external information.
      </div>
    </div>
  )
}
