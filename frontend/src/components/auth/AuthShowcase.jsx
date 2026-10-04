import React from 'react'
import { FileText, Check, Sparkles, ShieldCheck, Search, GitBranch } from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'

/**
 * Left-hand brand panel for the auth pages.
 * The "illustration" is a stylised preview of Clario's own UI (question → cited
 * answer → decision trace) so the visual explains the product instead of decorating it.
 */
export default function AuthShowcase() {
  return (
    <aside
      className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-[28px] bg-navy-950 text-white p-10 xl:p-12"
      aria-label="About Clario"
    >
      {/* Soft ambient light + faint grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-brand-600/25 blur-[110px]" />
        <div className="absolute bottom-[-140px] right-[-80px] h-[380px] w-[380px] rounded-full bg-violet-600/20 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse at 40% 45%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 40% 45%, black 30%, transparent 75%)',
          }}
        />
      </div>

      {/* Brand */}
      <div className="relative flex items-center gap-2.5">
        <ClarioLogo size={38} />
        <span className="text-xl font-bold tracking-tight text-white flex items-baseline">
          Clar<span className="text-brand-400 font-extrabold">i</span>o
        </span>
      </div>

      {/* Product preview */}
      <div className="relative my-10 mx-auto w-full max-w-[420px]" aria-hidden="true">
        {/* Question */}
        <div className="ml-auto w-fit max-w-[82%] rounded-2xl rounded-br-md bg-white/10 border border-white/10 px-4 py-2.5 text-[13px] text-white/90 backdrop-blur-sm motion-safe:animate-slide-up">
          How many days of parental leave do we get?
        </div>

        {/* Answer card */}
        <div
          className="mt-4 rounded-2xl bg-white text-gray-800 shadow-[0_24px_60px_-20px_rgba(8,15,35,0.7)] p-5 motion-safe:animate-slide-up"
          style={{ animationDelay: '80ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center p-0.5">
              <ClarioLogo size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 flex items-baseline">
              Clar<span className="text-brand-500 font-extrabold">i</span>o
            </span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <ShieldCheck size={11} /> Company policy
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-gray-700">
            Primary caregivers receive <span className="font-semibold text-gray-900">16 weeks</span> of fully paid
            leave, and secondary caregivers receive <span className="font-semibold text-gray-900">6 weeks</span>.
          </p>
          <div className="mt-3.5 space-y-1.5">
            <div className="h-1.5 w-11/12 rounded-full bg-gray-100" />
            <div className="h-1.5 w-8/12 rounded-full bg-gray-100" />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['Leave_Policy.pdf', 'Benefits_Guide.docx'].map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600"
              >
                <FileText size={11} className="text-brand-500" /> {name}
              </span>
            ))}
          </div>
        </div>

        {/* Decision trace */}
        <div
          className="absolute -left-6 xl:-left-10 -bottom-12 w-[220px] rounded-2xl border border-white/10 bg-navy-900/90 backdrop-blur-md p-3.5 shadow-xl motion-safe:animate-slide-up"
          style={{ animationDelay: '160ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-2.5">
            <GitBranch size={11} /> Decision trace
          </div>
          {[
            { icon: Search, label: 'Searched knowledge base' },
            { icon: ShieldCheck, label: 'Evidence graded relevant' },
            { icon: Check, label: 'Answer cited · 2 sources' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 py-1 text-[11.5px] text-white/80">
              <span className="h-5 w-5 rounded-md bg-brand-500/20 flex items-center justify-center">
                <Icon size={11} className="text-brand-300" />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Positioning */}
      <div className="relative max-w-[440px]">
        <h2 className="text-[28px] xl:text-[32px] font-semibold leading-[1.15] tracking-tight">
          Your intelligent knowledge workspace.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/60">
          Ask questions in plain language and get answers grounded in your organization's own documents,
          with the sources to prove it.
        </p>
      </div>
    </aside>
  )
}
