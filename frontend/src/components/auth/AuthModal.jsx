import React, { useState, useEffect } from 'react'
import { X, Lock, Mail, AlertCircle, Shield, User, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AuthModal() {
  const { showAuthModal, closeAuthModal, authModalReason, login } = useAuth()
  const [email, setEmail] = useState('employee@company.com')
  const [password, setPassword] = useState('Employee1234!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Reset fields when modal opens
  useEffect(() => {
    if (showAuthModal) {
      setError('')
      setSuccess(false)
    }
  }, [showAuthModal])

  if (!showAuthModal) return null

  const handleQuickSelect = (selectedEmail, selectedPassword) => {
    setEmail(selectedEmail)
    setPassword(selectedPassword)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email.trim(), password)
      setSuccess(true)
      setTimeout(() => {
        closeAuthModal()
      }, 500)
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Lock size={18} className="text-white" />
              </div>
              <div>
                <h2 id="auth-modal-title" className="text-base font-semibold leading-tight">
                  Sign in to Clario
                </h2>
                <p className="text-xs text-brand-100 mt-0.5">
                  Intelligent Workplace & HR Assistant
                </p>
              </div>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Reason banner if triggered by expiry or auth error */}
          {authModalReason && (
            <div className="mb-4 flex items-start gap-2.5 px-3.5 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <p>{authModalReason}</p>
            </div>
          )}

          {/* Quick preset selector */}
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Select an account to sign in:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('employee@company.com', 'Employee1234!')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                  email === 'employee@company.com'
                    ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-1 ring-brand-500'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">Employee</div>
                  <div className="text-[10px] opacity-75 truncate">Workplace User</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('admin@example.com', 'abhishek2228@')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                  email === 'admin@example.com'
                    ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-1 ring-brand-500'
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                  <Shield size={14} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">Admin</div>
                  <div className="text-[10px] opacity-75 truncate">HR Administrator</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-xl">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span>Signed in successfully!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                'Signing in…'
              ) : success ? (
                'Authenticated'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
