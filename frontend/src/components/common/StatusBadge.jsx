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
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  gray: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
}

export default function StatusBadge({ sourceUsed, className = '' }) {
  const { label, icon, color } = getSourceLabel(sourceUsed)
  const Icon = icons[icon] || HelpCircle
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      colorMap[color] || colorMap.gray,
      className
    )}>
      <Icon size={11} />
      {label}
    </span>
  )
}
