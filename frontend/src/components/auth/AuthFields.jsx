import React, { useId, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

const inputBase =
  'w-full h-11 rounded-lg border bg-white dark:bg-[#18181b] px-3.5 text-xs sm:text-sm ' +
  'text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ' +
  'outline-none transition-all duration-150 font-sans ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

const inputState = (invalid) =>
  invalid
    ? 'border-rose-400 dark:border-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
    : 'border-[#e5e5e0] dark:border-[#27272a] hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'

function FieldShell({ id, label, error, hint, hintId, errorId, children, trailingLabel }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 font-sans">
          {label}
        </label>
        {trailingLabel}
      </div>
      {children}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-sans" role="alert">
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-sans">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextField({ label, error, hint, className, ...props }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} errorId={errorId} hintId={hintId}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={clsx(inputBase, inputState(error), className)}
        {...props}
      />
    </FieldShell>
  )
}

export function PasswordField({ label, error, hint, ...props }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const [visible, setVisible] = useState(false)

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} errorId={errorId} hintId={hintId}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={clsx(inputBase, inputState(error), 'pr-11')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md flex items-center justify-center
            text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors cursor-pointer"
        >
          {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
        </button>
      </div>
    </FieldShell>
  )
}
