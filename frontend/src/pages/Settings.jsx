import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Monitor, Cpu, CheckCircle, AlertCircle, Sparkles, Shield, LogOut } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { useHealth } from '../hooks/useHealth.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserDisplayName } from '../utils/user.js'
import clsx from 'clsx'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xs overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#efefea] dark:border-[#27272a]">
        <Icon size={15} className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
          {title}
        </h2>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] rounded-lg
        text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-sans"
    />
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const health = useHealth()
  const { user, isAuthenticated, logout } = useAuth()
  const [name, setName] = useState(() => (user ? getUserDisplayName(user) : 'Employee'))
  const [responseStyle, setResponseStyle] = useState(() => {
    try {
      return localStorage.getItem('clario_response_style') || 'balanced'
    } catch {
      return 'balanced'
    }
  })

  useEffect(() => {
    if (user) {
      setName(getUserDisplayName(user))
    }
  }, [user])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#fbfbfa] dark:bg-[#111113]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7 space-y-5">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
            <span>Configuration & Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 font-editorial tracking-tight">
            Workspace Preferences
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-sans mt-1">
            Manage your account credentials, visual preferences, and assistant response style.
          </p>
        </div>

        {/* Profile Section */}
        <Section title="Account & Identity" icon={User}>
          {isAuthenticated && user ? (
            <>
              <Field label="Display Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Work Email">
                <Input
                  value={user.email}
                  disabled
                  className="opacity-75 cursor-not-allowed bg-zinc-50 dark:bg-zinc-850"
                />
              </Field>
              <Field label="Assigned Role">
                <Input
                  value={
                    user.role === 'system_admin'
                      ? 'System Administrator'
                      : user.role === 'hr_admin'
                      ? 'HR Administrator'
                      : 'Employee'
                  }
                  disabled
                  className="opacity-75 cursor-not-allowed bg-zinc-50 dark:bg-zinc-850 capitalize"
                />
              </Field>
              <div className="pt-2 border-t border-[#efefea] dark:border-[#27272a] flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-sans">Active JWT session</span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                You are currently in guest mode. Sign in to customize your profile and save sessions.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Sign in to workspace
              </button>
            </div>
          )}
        </Section>

        {/* Appearance Section */}
        <Section title="Visual Interface" icon={Monitor}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans">Dark Mode</p>
              <p className="text-xs text-zinc-500 mt-0.5">Toggle between soft ivory and deep obsidian surfaces</p>
            </div>
            <button
              onClick={toggle}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer',
                theme === 'dark' ? 'bg-blue-600' : 'bg-zinc-200'
              )}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-2xs',
                  theme === 'dark' && 'translate-x-5'
                )}
              />
            </button>
          </div>
        </Section>

        {/* AI Assistant Configuration */}
        <Section title="Synthesis & Response Depth" icon={Cpu}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 font-sans">
                Response Depth
              </label>
              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 px-2 py-0.5 rounded">
                User Preference
              </span>
            </div>
            <select
              value={responseStyle}
              onChange={(e) => {
                setResponseStyle(e.target.value)
                try {
                  localStorage.setItem('clario_response_style', e.target.value)
                } catch {}
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] rounded-lg
                text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-sans"
            >
              <option value="concise">Concise: Brief, direct policy summaries</option>
              <option value="balanced">Balanced: Clear answers with contextual excerpts (Default)</option>
              <option value="detailed">Detailed: In-depth policy breakdown with procedure steps</option>
            </select>
          </div>
        </Section>

        {/* System Health Section */}
        <Section title="Connected Services & Models" icon={Shield}>
          <div className="space-y-2">
            {[
              { label: 'FastAPI Backend Core', status: health },
              { label: 'Pinecone Vector Index', status: health },
              { label: 'Groq LLM (Llama 3.3 70B)', status: health },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-zinc-700 dark:text-zinc-300 font-sans">{label}</span>
                <div
                  className={clsx(
                    'flex items-center gap-1.5 font-mono font-medium',
                    status === 'ok'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : status === 'error'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-zinc-400'
                  )}
                >
                  {status === 'ok' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                  <span>{status === 'ok' ? 'Operational' : status === 'error' ? 'Degraded' : 'Checking…'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#efefea] dark:border-[#27272a]">
            <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
              Clario v1.0.0 · Groq Inference · HuggingFace MiniLM Embeddings · Pinecone Vector Index · Tavily Web Search
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}
