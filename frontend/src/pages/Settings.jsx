import React, { useState, useEffect } from 'react'
import { User, Monitor, Bell, Cpu, CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { useHealth } from '../hooks/useHealth.js'
import { useAuth } from '../context/AuthContext.jsx'
import clsx from 'clsx'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <Icon size={15} className="text-brand-600 dark:text-brand-400" />
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
        text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-700"
    />
  )
}

export default function SettingsPage() {
  const { theme, toggle } = useTheme()
  const health = useHealth()
  const { user, isAuthenticated, openAuthModal, logout } = useAuth()
  const [name, setName] = useState(() => (user?.email ? user.email.split('@')[0] : 'Employee'))
  const [notifications, setNotifications] = useState(true)
  const [responseStyle, setResponseStyle] = useState('balanced')

  useEffect(() => {
    if (user?.email) {
      setName(user.email.split('@')[0])
    }
  }, [user])

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your Clario preferences</p>
        </div>

        {/* Profile */}
        <Section title="Account & Profile" icon={User}>
          {isAuthenticated && user ? (
            <>
              <Field label="Display Name">
                <Input value={name} onChange={e => setName(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={user.email} disabled className="opacity-75 cursor-not-allowed bg-gray-100 dark:bg-gray-800" />
              </Field>
              <Field label="Role">
                <Input
                  value={user.role === 'system_admin' ? 'System Administrator' : user.role === 'hr_admin' ? 'HR Administrator' : 'Employee'}
                  disabled
                  className="opacity-75 cursor-not-allowed bg-gray-100 dark:bg-gray-800 capitalize"
                />
              </Field>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={logout}
                  className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You are currently browsing in guest mode. Sign in to access your profile and settings.
              </p>
              <button
                onClick={() => openAuthModal('Sign in to view and edit your profile settings.')}
                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-brand-700 hover:to-violet-700 transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </Section>


        {/* Application */}
        <Section title="Application" icon={Monitor}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle light/dark appearance</p>
            </div>
            <button
              onClick={toggle}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
                theme === 'dark' ? 'bg-gradient-to-r from-brand-600 to-violet-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Toggle dark mode"
            >
              <span className={clsx(
                'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                theme === 'dark' && 'translate-x-6'
              )} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Receive system updates</p>
            </div>
            <button
              onClick={() => setNotifications(n => !n)}
              className={clsx(
                'relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1',
                notifications ? 'bg-gradient-to-r from-brand-600 to-violet-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
              role="switch"
              aria-checked={notifications}
              aria-label="Toggle notifications"
            >
              <span className={clsx(
                'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                notifications && 'translate-x-6'
              )} />
            </button>
          </div>
        </Section>

        {/* AI Assistant */}
        <Section title="AI Assistant" icon={Cpu}>
          <Field label="Response Style">
            <select
              value={responseStyle}
              onChange={e => setResponseStyle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-700"
            >
              <option value="concise">Concise — brief, direct answers</option>
              <option value="balanced">Balanced — clear explanations with context</option>
              <option value="detailed">Detailed — thorough with examples</option>
            </select>
          </Field>
        </Section>

        {/* System */}
        <Section title="System Information" icon={Cpu}>
          <div className="space-y-2">
            {[
              { label: 'Backend API', status: health },
              { label: 'Knowledge Base', status: health },
              { label: 'AI Service (Groq)', status: health },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                <div className={clsx(
                  'flex items-center gap-1.5 text-xs font-medium',
                  status === 'ok' ? 'text-green-600 dark:text-green-400' : status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                )}>
                  {status === 'ok' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                  {status === 'ok' ? 'Available' : status === 'error' ? 'Unavailable' : 'Checking…'}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Clario v1.0.0 · Powered by Groq LLM, HuggingFace Embeddings, Pinecone Vector DB, Tavily Web Search
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}
