import React, { useId, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

const inputBase =
  'w-full h-11 rounded-xl border bg-white dark:bg-gray-900 px-3.5 text-[15px] sm:text-sm ' +
  'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ' +
  'outline-none transition-[border-color,box-shadow] duration-150 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed'

const inputState = (invalid) =>
  invalid
    ? 'border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/30'
    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/40'

function FieldShell({ id, label, error, hint, hintId, errorId, children, trailingLabel }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {trailingLabel}
      </div>
      {children}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
          <AlertCircle size={13} className="mt-px flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
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
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 transition-colors"
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
    </FieldShell>
  )
}
