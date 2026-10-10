import React, { useState } from 'react'
import { AlertCircle, Check, Key, LogOut, ShieldCheck, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminPage() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdmin = user && (user.role === 'system_admin' || user.role === 'hr_admin')

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      setPassword('')
    } catch (err) {
      setError(err.message || 'Sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#fbfbfa] dark:bg-[#111113]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 font-editorial tracking-tight">
              Administration & Governance
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
              Secure administrator access for vector ingestion, index management, and audit controls.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] p-6 shadow-xs">
          {isAuthenticated && isAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold">
                <Check size={16} /> Authenticated administrator session active
              </div>
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-[#e5e5e0] dark:border-[#27272a] rounded-lg space-y-1.5 text-xs">
                <p className="text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">Account:</span> {user.email}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">Role:</span> {user.role === 'system_admin' ? 'System Administrator' : 'HR Administrator'}
                </p>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                Your authorization token permits full access to document uploads, Pinecone vector embeddings, and audit telemetry.
              </p>
              <button
                onClick={logout}
                className="px-3.5 py-1.5 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {isAuthenticated && !isAdmin && (
                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-lg text-amber-800 dark:text-amber-300 text-xs">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-sans">
                    You are currently signed in with standard Employee privileges (<strong>{user.email}</strong>). Administrative capabilities require elevated credentials.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#efefea] dark:border-[#27272a]">
                <Key size={14} className="text-blue-600" />
                <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                  Administrator Authentication
                </h2>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Admin Work Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  required
                  minLength={12}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-sans"
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-sans">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium rounded-lg disabled:opacity-60 transition-colors cursor-pointer shadow-xs"
              >
                {loading ? 'Authenticating…' : 'Sign in as administrator'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
