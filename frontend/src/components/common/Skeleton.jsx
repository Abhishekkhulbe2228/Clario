import React from 'react'
import clsx from 'clsx'

export function Skeleton({ className = '' }) {
  return (
    <div className={clsx('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} />
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="flex-shrink-0">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function SourceSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map(i => (
        <div key={i} className="flex gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
          <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
