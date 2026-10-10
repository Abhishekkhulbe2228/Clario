import React from 'react'
import { FileText, Check, ShieldCheck, Search, GitBranch } from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'

/**
 * Editorial brand showcase panel for authentication pages.
 * Clean, light editorial surfaces illustrating Clario's workplace knowledge RAG workflow.
 */
export default function AuthShowcase() {
  return (
    <aside
      className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl bg-[#f5f5f2] dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] p-10 xl:p-12 shadow-2xs"
      aria-label="About Clario"
    >
      {/* Brand header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ClarioLogo size={36} />
          <span className="text-lg font-bold font-brand tracking-tight text-zinc-900 dark:text-zinc-100 flex items-baseline">
            Clar<span className="text-amber-500 font-extrabold">i</span>o
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded border border-teal-200/60 dark:border-teal-800/40">
          Knowledge Copilot
        </span>
      </div>

      {/* Product workflow demonstration */}
      <div className="relative my-8 mx-auto w-full max-w-[420px]" aria-hidden="true">
        {/* User query bubble */}
        <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2.5 text-xs font-sans shadow-xs">
          How many weeks of parental leave do primary caregivers receive?
        </div>

        {/* Assistant response card */}
        <div className="mt-3.5 p-5 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#121214] text-zinc-900 dark:text-zinc-100 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#efefea] dark:border-[#27272a]">
            <div className="h-6 w-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-0.5 border border-[#e5e5e0] dark:border-[#27272a]">
              <ClarioLogo size={16} />
            </div>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
              Clario Copilot
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded font-mono bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-400">
              <ShieldCheck size={11} /> Verified Policy
            </span>
          </div>

          <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans">
            Primary caregivers receive <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">16 weeks of fully paid leave</strong>, with 100% salary continuation. Secondary caregivers receive 6 weeks.
          </p>

          <div className="mt-3.5 pt-3 border-t border-[#efefea] dark:border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded border border-[#e5e5e0] dark:border-[#27272a] bg-zinc-50 dark:bg-zinc-900 px-2 py-1 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                <FileText size={10} className="text-blue-600" /> Parental_Leave_Policy.pdf
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Page 4 · Sec. 2</span>
          </div>
        </div>

        {/* Multi-agent reasoning trace pill */}
        <div className="mt-3 p-3 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-700 dark:text-zinc-300 text-[11px] font-mono">Evidence grading: 100% relevant</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">0 ms fallback</span>
        </div>
      </div>

      {/* Editorial footer statement */}
      <div className="relative max-w-[420px]">
        <h2 className="text-2xl xl:text-3xl font-semibold leading-snug tracking-tight font-editorial text-zinc-900 dark:text-zinc-100">
          Workplace intelligence, verified and cited.
        </h2>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-sans">
          Clario gives employees reliable answers grounded exclusively in approved company documentation.
        </p>
      </div>
    </aside>
  )
}
