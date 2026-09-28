import React, { useState } from 'react'
import { AlertCircle, Check, Key, LogOut, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminPage() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('abhishek2228@')
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
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <ShieldCheck size={20} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Secure administrative access</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          {isAuthenticated && isAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-medium">
                <Check size={16} /> Authenticated administrator session active
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-1 text-xs">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Account:</span> {user.email}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Role:</span> {user.role === 'system_admin' ? 'System Administrator' : 'HR Administrator'}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your access token is valid for all Clario APIs, including document ingestion and audit log viewing.
              </p>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {isAuthenticated && !isAdmin && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <p>
                    You are currently signed in as an Employee (<strong>{user.email}</strong>). Administrative privileges require an administrator account.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Key size={15} className="text-gray-500 dark:text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Administrator sign in</h2>
              </div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200"
                />
              </label>
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Password
                <input
                  required
                  minLength={12}
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200"
                />
              </label>
              {error && (
                <p className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
              <button
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in as Administrator'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
