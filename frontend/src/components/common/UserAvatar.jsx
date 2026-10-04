import React from 'react'
import clsx from 'clsx'
import { getUserInitial } from '../../utils/user.js'

const SIZES = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export default function UserAvatar({ user, size = 'md', count = 1, className = '' }) {
  const initial = getUserInitial(user, count)
  const sizeClasses = SIZES[size] || SIZES.md

  return (
    <div
      className={clsx(
        'rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-white font-semibold',
        'flex items-center justify-center flex-shrink-0 shadow-sm select-none tracking-tight',
        sizeClasses,
        className
      )}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}
