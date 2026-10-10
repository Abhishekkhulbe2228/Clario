import React from 'react'
import { FileText, ShieldCheck, Check } from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'

/**
 * WorkspaceIllustration component
 * A refined, premium flat-vector illustration of an employee at a modern workspace
 * interacting with Clario's AI knowledge copilot.
 * Integrates subtle floating UI elements (Source Document, Verified Badge, Answer Bubble)
 * in generous whitespace without visual collisions.
 */
export default function WorkspaceIllustration() {
  return (
    <div
      className="relative w-full max-w-[500px] mx-auto select-none"
      role="img"
      aria-label="Illustration of an employee at a workspace using Clario to access verified company knowledge"
    >
      {/* ── 1. Floating Clario Knowledge UI Elements ─────────────────────── */}

      {/* Floating Element A: Evidence Verified Badge (Top Center-Left) */}
      <div
        className="absolute top-1 left-3 z-20 transition-transform duration-300 hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <div className="bg-teal-50/95 dark:bg-teal-950/80 backdrop-blur-xs border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 rounded-full px-2.5 py-1 text-[10px] font-sans flex items-center gap-1.5 shadow-2xs">
          <ShieldCheck size={12} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span className="font-medium">Evidence verified</span>
          <span className="w-1 h-1 rounded-full bg-teal-500/60" />
          <span className="font-mono text-[9px] text-teal-600 dark:text-teal-400">HR-BEN-02</span>
        </div>
      </div>

      {/* Floating Element B: Source Document Card (Middle Left) */}
      <div
        className="absolute top-10 left-3 z-20 transition-transform duration-300 hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <div className="bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xs border border-[#e5e5e0] dark:border-[#27272a] rounded-xl px-2.5 py-2 shadow-2xs flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
            <FileText size={12} />
          </div>
          <div className="text-left font-sans">
            <div className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
              Parental_Leave_Policy.pdf
            </div>
            <div className="text-[9px] text-zinc-500 dark:text-zinc-400">
              Page 4, Sec. 2 · HR Docs
            </div>
          </div>
        </div>
      </div>

      {/* Floating Element C: AI Answer Bubble (Top Right) */}
      <div
        className="absolute top-1 right-2 z-20 w-[215px] sm:w-[225px] transition-transform duration-300 hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <div className="bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xs border border-[#e5e5e0] dark:border-[#27272a] rounded-xl p-2.5 shadow-2xs font-sans text-left">
          {/* Card header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#efefea] dark:border-[#27272a]">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-0.5 border border-[#e5e5e0] dark:border-[#27272a]">
                <ClarioLogo size={11} />
              </div>
              <span className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-100">
                Clario Copilot
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.2 rounded border border-teal-200/60 dark:border-teal-800/40">
              <Check size={8} /> Grounded
            </span>
          </div>

          {/* User query snippet */}
          <div className="text-[9px] text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <span className="text-zinc-400 font-mono">Q:</span>
            <span className="truncate">Parental leave duration?</span>
          </div>

          {/* Verified answer sentence */}
          <p className="text-[11px] leading-snug text-zinc-800 dark:text-zinc-200 font-medium">
            Primary caregivers receive{' '}
            <span className="text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/60 px-1 rounded">
              16 weeks of paid leave
            </span>.
          </p>

          {/* Citation link */}
          <div className="mt-2 pt-1.5 border-t border-[#efefea] dark:border-[#27272a] flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
            <span className="inline-flex items-center gap-1 truncate text-zinc-600 dark:text-zinc-400">
              <FileText size={9} className="text-blue-600 flex-shrink-0" />
              <span>Parental_Leave_Policy.pdf</span>
            </span>
            <span className="text-[8px] text-zinc-400 flex-shrink-0">Page 4</span>
          </div>
        </div>
      </div>

      {/* ── 2. Vector SVG Illustration Scene ────────────────────────────── */}
      <svg
        viewBox="0 0 500 320"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ambient warm radial glow */}
          <radialGradient
            id="ws-glow"
            cx="50%"
            cy="55%"
            r="46%"
            fx="50%"
            fy="55%"
          >
            <stop offset="0%" stopColor="#f3f4f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fafafa" stopOpacity="0" />
          </radialGradient>

          {/* Screen glow cone */}
          <linearGradient
            id="laptop-beam"
            x1="260"
            y1="162"
            x2="218"
            y2="192"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient focal background circle */}
        <ellipse
          cx="255"
          cy="185"
          rx="185"
          ry="115"
          fill="url(#ws-glow)"
          className="dark:opacity-10"
        />

        {/* ── Ground Plane & Shadows ─────────────────────────────────────── */}
        <g id="ground">
          <ellipse
            cx="255"
            cy="305"
            rx="195"
            ry="8.5"
            className="fill-zinc-200/50 dark:fill-zinc-800/50"
          />
          <ellipse
            cx="195"
            cy="306"
            rx="32"
            ry="5.5"
            className="fill-zinc-300/40 dark:fill-zinc-900/70"
          />
          <ellipse
            cx="145"
            cy="306"
            rx="12"
            ry="3.5"
            className="fill-zinc-300/40 dark:fill-zinc-900/60"
          />
          <ellipse
            cx="380"
            cy="306"
            rx="12"
            ry="3.5"
            className="fill-zinc-300/40 dark:fill-zinc-900/60"
          />
          <ellipse
            cx="64"
            cy="305"
            rx="18"
            ry="4.5"
            className="fill-zinc-300/50 dark:fill-zinc-900/70"
          />
        </g>

        {/* ── Floor Plant (Left Foreground) ───────────────────────────────── */}
        <g id="plant-pot">
          <path
            d="M 54 270 L 57 302 Q 64 306 71 302 L 74 270 Z"
            className="fill-zinc-300 dark:fill-zinc-700"
          />
          <rect
            x="52"
            y="267"
            width="24"
            height="3.5"
            rx="1.2"
            className="fill-zinc-400 dark:fill-zinc-600"
          />
          {/* Stems & Leaves */}
          <path
            d="M 64 268 Q 50 242 40 218"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-teal-700 dark:stroke-teal-600 fill-none"
          />
          <path
            d="M 40 218 C 24 210, 28 232, 42 236 C 49 238, 52 226, 40 218 Z"
            className="fill-teal-600/90 dark:fill-teal-500/80"
          />
          <path
            d="M 64 268 Q 72 238 80 206"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-teal-700 dark:stroke-teal-600 fill-none"
          />
          <path
            d="M 80 206 C 94 196, 92 220, 80 224 C 72 226, 68 214, 80 206 Z"
            className="fill-emerald-600/90 dark:fill-emerald-500/80"
          />
          <path
            d="M 64 268 Q 61 222 63 186"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-teal-800 dark:stroke-teal-700 fill-none"
          />
          <path
            d="M 63 186 C 50 178, 52 202, 63 206 C 74 202, 75 178, 63 186 Z"
            className="fill-teal-500/90 dark:fill-teal-400/80"
          />
        </g>

        {/* ── Desk & Furniture ────────────────────────────────────────────── */}
        <g id="desk">
          {/* Desk legs */}
          <line
            x1="145"
            y1="210"
            x2="137"
            y2="304"
            strokeWidth="2.8"
            strokeLinecap="round"
            className="stroke-zinc-400 dark:stroke-zinc-600"
          />
          <line
            x1="375"
            y1="210"
            x2="383"
            y2="304"
            strokeWidth="2.8"
            strokeLinecap="round"
            className="stroke-zinc-400 dark:stroke-zinc-600"
          />
          <line
            x1="141"
            y1="268"
            x2="379"
            y2="268"
            strokeWidth="1.8"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />

          {/* Tabletop */}
          <rect
            x="126"
            y="202"
            width="262"
            height="7.5"
            rx="2.2"
            className="fill-white dark:fill-zinc-800 stroke-zinc-300 dark:stroke-zinc-700 stroke-[1.2]"
          />
          <rect
            x="134"
            y="209.5"
            width="246"
            height="2.5"
            className="fill-zinc-200 dark:fill-zinc-900"
          />

          {/* Ceramic coffee mug */}
          <rect
            x="155"
            y="190"
            width="11"
            height="12"
            rx="1.8"
            className="fill-zinc-100 dark:fill-zinc-700 stroke-zinc-300 dark:stroke-zinc-600 stroke-[0.9]"
          />
          <path
            d="M 155 193 C 151 193, 151 198, 155 198"
            strokeWidth="1.1"
            className="stroke-zinc-300 dark:stroke-zinc-600 fill-none"
          />
          <path
            d="M 158 186 Q 160 183 158 180 M 162 187 Q 164 184 162 181"
            strokeWidth="0.8"
            strokeLinecap="round"
            className="stroke-zinc-300 dark:stroke-zinc-600 fill-none"
          />

          {/* Desk succulent */}
          <rect
            x="358"
            y="192"
            width="12"
            height="10"
            rx="1.8"
            className="fill-zinc-300 dark:fill-zinc-700"
          />
          <path
            d="M 364 192 C 360 186, 368 186, 364 192 M 361 192 C 357 188, 363 187, 361 192 M 367 192 C 371 188, 365 187, 367 192"
            className="fill-teal-500/80 dark:fill-teal-400/80 stroke-teal-600 dark:stroke-teal-500 stroke-[0.7]"
          />
        </g>

        {/* ── Laptop / Monitor ────────────────────────────────────────────── */}
        <g id="laptop-device">
          {/* Base */}
          <rect
            x="233"
            y="198"
            width="58"
            height="4"
            rx="1.2"
            className="fill-zinc-300 dark:fill-zinc-600"
          />

          {/* Screen glow cone */}
          <polygon
            points="246,150 230,138 218,180 238,198"
            fill="url(#laptop-beam)"
          />

          {/* Display frame */}
          <rect
            x="246"
            y="148"
            width="46"
            height="49"
            rx="2.8"
            className="fill-zinc-900 dark:fill-zinc-950 stroke-zinc-700 dark:stroke-zinc-800 stroke-[1.2]"
          />
          {/* Glass */}
          <rect
            x="249"
            y="151"
            width="40"
            height="41"
            rx="1.5"
            className="fill-slate-900"
          />

          {/* Clario Copilot mark & UI lines on screen */}
          <circle cx="254" cy="156" r="1.5" className="fill-blue-500" />
          <line
            x1="259"
            y1="156"
            x2="278"
            y2="156"
            strokeWidth="1.1"
            className="stroke-slate-700"
          />
          {/* Prompt bar */}
          <rect
            x="252"
            y="161"
            width="34"
            height="5.5"
            rx="1.2"
            className="fill-slate-800 stroke-blue-500/40 stroke-[0.7]"
          />
          {/* Verified knowledge text lines */}
          <line
            x1="252"
            y1="172"
            x2="284"
            y2="172"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="stroke-blue-400/80"
          />
          <line
            x1="252"
            y1="177"
            x2="276"
            y2="177"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="stroke-slate-600"
          />
          <line
            x1="252"
            y1="182"
            x2="268"
            y2="182"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="stroke-slate-600"
          />

          {/* Citation badge on screen */}
          <rect
            x="252"
            y="186"
            width="16"
            height="3.5"
            rx="1"
            className="fill-teal-500/30"
          />
          <line
            x1="254"
            y1="188"
            x2="265"
            y2="188"
            strokeWidth="0.9"
            className="stroke-teal-400"
          />
        </g>

        {/* ── Office Chair & Person ───────────────────────────────────────── */}
        <g id="worker-figure">
          {/* Chair base */}
          <line
            x1="188"
            y1="256"
            x2="188"
            y2="288"
            strokeWidth="2.8"
            className="stroke-zinc-500 dark:stroke-zinc-600"
          />
          <path
            d="M 188 288 L 168 304 M 188 288 L 208 304 M 188 288 L 180 306 M 188 288 L 196 306"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-zinc-500 dark:stroke-zinc-600"
          />
          <circle cx="168" cy="305" r="1.8" className="fill-zinc-700 dark:fill-zinc-400" />
          <circle cx="208" cy="305" r="1.8" className="fill-zinc-700 dark:fill-zinc-400" />

          {/* Chair seat */}
          <rect
            x="165"
            y="244"
            width="44"
            height="11"
            rx="3.5"
            className="fill-zinc-800 dark:fill-zinc-900"
          />

          {/* Chair backrest */}
          <path
            d="M 162 168 Q 156 210 164 244"
            strokeWidth="9.5"
            strokeLinecap="round"
            className="stroke-zinc-800 dark:stroke-zinc-900 fill-none"
          />

          {/* Chair armrest */}
          <path
            d="M 168 216 L 194 216 L 194 242"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-zinc-600 dark:stroke-zinc-500 fill-none"
          />

          {/* Trousers (Slate) */}
          <path
            d="M 174 246 Q 205 246 220 248"
            strokeWidth="14"
            strokeLinecap="round"
            className="stroke-zinc-700 dark:stroke-zinc-600 fill-none"
          />
          <path
            d="M 220 248 L 224 298"
            strokeWidth="12"
            strokeLinecap="round"
            className="stroke-zinc-700 dark:stroke-zinc-600 fill-none"
          />
          {/* Sneaker */}
          <path
            d="M 220 298 L 240 300 Q 242 306 232 306 L 217 306 Z"
            className="fill-white dark:fill-zinc-300 stroke-zinc-400 dark:stroke-zinc-600 stroke-[0.9]"
          />

          {/* Person Torso (Cobalt Blue Sweater) */}
          <path
            d="M 170 188 Q 166 230 174 246 L 202 246 Q 210 214 202 184 Z"
            className="fill-blue-600 dark:fill-blue-500"
          />
          <path
            d="M 190 174 L 195 182 L 200 174 Z"
            className="fill-blue-700 dark:fill-blue-600"
          />

          {/* Arms & Hands typing */}
          <path
            d="M 188 186 Q 200 206 210 216"
            strokeWidth="8.5"
            strokeLinecap="round"
            className="stroke-blue-600 dark:stroke-blue-500 fill-none"
          />
          <path
            d="M 210 216 Q 226 210 238 202"
            strokeWidth="7"
            strokeLinecap="round"
            className="stroke-blue-600 dark:stroke-blue-500 fill-none"
          />
          <circle cx="240" cy="201" r="3.2" className="fill-amber-200 dark:fill-amber-300" />

          {/* Neck & Head */}
          <rect
            x="189"
            y="166"
            width="6.5"
            height="10"
            className="fill-amber-200 dark:fill-amber-300"
          />
          <circle cx="194" cy="156" r="12" className="fill-amber-200 dark:fill-amber-300" />
          {/* Hair */}
          <path
            d="M 184 159 C 181 144, 191 140, 202 142 C 208 143, 208 150, 204 154 C 201 149, 194 148, 190 152 C 186 156, 183 162, 184 159 Z"
            className="fill-zinc-900 dark:fill-zinc-950"
          />
          {/* Eyeglasses frame */}
          <circle
            cx="200"
            cy="155"
            r="3"
            className="stroke-zinc-800 dark:stroke-zinc-200 stroke-[0.9] fill-none"
          />
        </g>

        {/* ── Intelligent Retrieval Connecting Rays ───────────────────────── */}
        <g id="knowledge-links" opacity="0.75">
          {/* Ray linking laptop to Answer Bubble */}
          <path
            d="M 270 148 Q 288 95 322 75"
            strokeDasharray="3 3"
            strokeWidth="1.1"
            className="stroke-blue-500 dark:stroke-blue-400 fill-none"
          />
          {/* Ray linking laptop to Source Document */}
          <path
            d="M 255 148 Q 200 105 145 95"
            strokeDasharray="3 3"
            strokeWidth="1.1"
            className="stroke-teal-500 dark:stroke-teal-400 fill-none"
          />

          {/* Micro AI Sparkles */}
          <g transform="translate(300, 102) scale(0.6)">
            <path
              d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z"
              className="fill-blue-500 dark:fill-blue-400"
            />
          </g>
          <g transform="translate(190, 110) scale(0.48)">
            <path
              d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z"
              className="fill-teal-500 dark:fill-teal-400"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
