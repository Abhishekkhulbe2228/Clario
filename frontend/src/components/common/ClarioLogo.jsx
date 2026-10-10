import React, { useState } from 'react'
import clsx from 'clsx'

/**
 * ClarioLogo Component
 * Renders the dimensional ribbon "C" mark with chat dots and sparkle stars,
 * matched precisely to Clario's brand identity.
 */
export default function ClarioLogo({
  size = 36,
  className = '',
  showText = false,
  showTagline = false,
  textClassName = '',
  taglineClassName = '',
}) {
  const [imgError, setImgError] = useState(false)

  const icon = imgError ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('flex-shrink-0 select-none', className)}
      aria-label="Clario logo"
      role="img"
    >
      <defs>
        <linearGradient id="clario-svg-c" x1="22" y1="18" x2="82" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4da8fb" />
          <stop offset="28%" stopColor="#1f6dfa" />
          <stop offset="65%" stopColor="#104ae2" />
          <stop offset="100%" stopColor="#6a60fc" />
        </linearGradient>
        <linearGradient id="clario-svg-star" x1="64" y1="23" x2="82" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6b53fc" />
        </linearGradient>
      </defs>
      {/* Dimensional curved C */}
      <path
        d="M 68 25 C 57 16 38 18 28 28 C 16 41 16 61 28 73 C 40 84 58 85 71 75 C 76 71 73 63 66 64 C 57 65 46 63 38 55 C 31 47 31 36 38 29 C 46 22 58 22 66 28 C 70 30 72 27 68 25 Z"
        fill="url(#clario-svg-c)"
      />
      {/* 3 Chat dots */}
      <circle cx="43" cy="50" r="3.6" fill="#2573f2" />
      <circle cx="53" cy="50" r="3.6" fill="#2573f2" />
      <circle cx="63" cy="50" r="3.6" fill="#2573f2" />
      {/* Top large sparkle star */}
      <path
        d="M 74 25 Q 74 34 83 34 Q 74 34 74 43 Q 74 34 65 34 Q 74 34 74 25 Z"
        fill="url(#clario-svg-star)"
      />
      {/* Bottom small sparkle star */}
      <path
        d="M 80 43 Q 80 47.5 84.5 47.5 Q 80 47.5 80 52 Q 80 47.5 75.5 47.5 Q 80 47.5 80 43 Z"
        fill="#1f72f1"
      />
    </svg>
  ) : (
    <img
      src="/clario-mark.png"
      width={size}
      height={size}
      alt="Clario logo"
      onError={() => setImgError(true)}
      className={clsx('object-contain select-none flex-shrink-0 pointer-events-none', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="eager"
      decoding="async"
    />
  )

  if (!showText) return icon

  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="flex flex-col min-w-0">
        <span
          className={clsx(
            'font-bold font-onest tracking-tight text-gray-900 dark:text-white leading-tight flex items-baseline',
            textClassName || 'text-base'
          )}
        >
          Clar<span className="text-amber-500 font-extrabold">i</span>o
        </span>
        {showTagline && (
          <span
            className={clsx(
              'text-[10px] text-gray-500 dark:text-gray-400 font-normal tracking-tight leading-tight truncate',
              taglineClassName
            )}
          >
            Your Intelligent Workplace Assistant
          </span>
        )}
      </div>
    </div>
  )
}
