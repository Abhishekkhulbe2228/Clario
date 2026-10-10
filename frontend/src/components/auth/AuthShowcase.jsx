import React from 'react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import WorkspaceIllustration from './WorkspaceIllustration.jsx'

/**
 * Editorial brand showcase panel for Clario authentication pages.
 * Features an illustration-led composition with a modern employee workspace
 * and subtle floating Clario knowledge assistant UI elements.
 * Fully compliant with ChaiUI design principles: warm hairlines, generous whitespace,
 * restrained accents, and no em dashes.
 */
export default function AuthShowcase() {
  return (
    <aside
      className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl bg-[#f5f5f2] dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] p-8 xl:p-10 shadow-2xs"
      aria-label="Clario workplace knowledge showcase"
    >
      {/* ── 1. Top Brand Header ─────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ClarioLogo size={34} />
          <span className="text-lg font-bold font-brand tracking-tight text-zinc-900 dark:text-zinc-100 flex items-baseline">
            Clar<span className="text-amber-500 font-extrabold">i</span>o
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded border border-teal-200/60 dark:border-teal-800/40">
          Knowledge Copilot
        </span>
      </div>

      {/* ── 2. Center Illustration with Floating UI Elements ───────────── */}
      <div className="relative my-auto py-6 w-full flex items-center justify-center">
        <WorkspaceIllustration />
      </div>

      {/* ── 3. Bottom Supporting Caption (Section 5) ───────────────────── */}
      <div className="relative pt-4 border-t border-[#e5e5e0]/70 dark:border-[#27272a]/70 flex items-center justify-between">
        <p className="text-xs font-sans text-zinc-500 dark:text-zinc-400">
          Every answer.{' '}
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">
            Grounded in your knowledge.
          </span>
        </p>

        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Active</span>
        </div>
      </div>
    </aside>
  )
}