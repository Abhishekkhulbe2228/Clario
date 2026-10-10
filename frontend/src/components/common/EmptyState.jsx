import React from 'react'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-[#e5e5e0] dark:border-[#27272a] flex items-center justify-center mb-3.5 text-zinc-400">
          <Icon size={20} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 font-sans">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-sans">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
