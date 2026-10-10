import React from 'react'
import { Shield, Globe, MessageCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import { getSourceLabel } from '../../utils/trace.js'
import clsx from 'clsx'

const icons = {
  shield: Shield,
  globe: Globe,
  'message-circle': MessageCircle,
  'alert-triangle': AlertTriangle,
  'help-circle': HelpCircle,
}

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/40',
  amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40',
  gray: 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  red: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40',
  green: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40',
}

export default function StatusBadge({ sourceUsed, className = '' }) {
  const { label, icon, color } = getSourceLabel(sourceUsed)
  const Icon = icons[icon] || HelpCircle

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border font-mono',
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      <Icon size={11} />
      <span>{label}</span>
    </span>
  )
}
