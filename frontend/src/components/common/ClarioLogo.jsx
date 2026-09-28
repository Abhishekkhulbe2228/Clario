import React from 'react'

export default function ClarioLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Clario logo"
      role="img"
    >
      <defs>
        <linearGradient id="clario-grad-a" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="clario-grad-b" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect width="48" height="48" rx="13" fill="url(#clario-grad-a)" />
      {/* Chat bubble body */}
      <path
        d="M11 15C11 13.343 12.343 12 14 12H34C35.657 12 37 13.343 37 15V28C37 29.657 35.657 31 34 31H27L22 36V31H14C12.343 31 11 29.657 11 28V15Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Sparkle dots representing intelligence */}
      <circle cx="19" cy="21.5" r="2" fill="url(#clario-grad-b)" />
      <circle cx="24" cy="21.5" r="2" fill="url(#clario-grad-b)" />
      <circle cx="29" cy="21.5" r="2" fill="url(#clario-grad-b)" />
      {/* Top-right sparkle */}
      <path
        d="M38 9 L39.5 11 L41 9 L39.5 7 Z"
        fill="white"
        fillOpacity="0.7"
      />
      <path
        d="M39.5 6 L39.5 12 M36.5 9 L42.5 9"
        stroke="white"
        strokeOpacity="0.6"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}
