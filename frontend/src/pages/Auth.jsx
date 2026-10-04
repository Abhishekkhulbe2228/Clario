import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Loader2,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext.jsx'
import ClarioLogo from '../components/common/ClarioLogo.jsx'
import AuthShowcase from '../components/auth/AuthShowcase.jsx'
import { TextField, PasswordField } from '../components/auth/AuthFields.jsx'

// Must match MIN_PASSWORD_LENGTH in app/api/routes.py
const MIN_PASSWORD_LENGTH = 12
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const COPY = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue to your Clario workspace.',
    cta: 'Sign in',
    pending: 'Signing in…',
    switchText: "Don't have an account?",
    switchLink: 'Create one',
    switchTo: '/signup',
    documentTitle: 'Sign in · Clario',
  },
  signup: {
    title: 'Create your Clario account',
    subtitle: "Join your workspace and start working with your organization's knowledge.",
    cta: 'Create account',
    pending: 'Creating account…',
    switchText: 'Already have an account?',
    switchLink: 'Log in',
    switchTo: '/login',
    documentTitle: 'Create account · Clario',
  },
}

function validate(mode, values) {
  const errors = {}
  const email = values.email.trim()
  if (mode === 'signup') {
    const name = values.name.trim()
    if (!name) errors.name = 'Enter your full name.'
    else if (name.length < 2) errors.name = 'Name must be at least 2 characters.'
  }
  if (!email) errors.email = 'Enter your work email.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address, like name@company.com.'

  if (mode === 'signup' || values.password) {
    if (!values.password) errors.password = 'Enter your password.'
    else if (values.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = mode === 'signup'
        ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
        : 'Incorrect email or password.'
    } else if (mode === 'signup' && !values.password.trim()) {
      errors.password = 'Password cannot be only spaces.'
    }
  }

  if (mode === 'signup') {
    if (!values.confirm) errors.confirm = 'Confirm your password.'
    else if (values.confirm !== values.password) errors.confirm = 'Passwords do not match.'
  }
  return errors
}

/** Map API/network failures to safe, human-readable messages (never raw server details). */
function friendlyError(mode, err) {
  if (!err || err instanceof TypeError || err.status === undefined) {
    return 'Unable to connect to Clario. Please try again.'
  }
  const detail = err.detail || ''

  switch (err.status) {
    case 401:
      return 'Incorrect email or password.'
    case 409:
      return 'An account with this email already exists.'
    case 422:
      return mode === 'signup'
        ? `Please check your details. Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`
        : (detail || 'Please check the information entered.')
    case 429:
      return detail || 'Too many attempts. Please wait a minute and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export default function AuthPage({ mode = 'login' }) {
  const copy = COPY[mode]
  const isSignup = mode === 'signup'
  const { login, signup, authNotice, clearAuthNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const formRef = useRef(null)

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.title = copy.documentTitle
  }, [copy.documentTitle])

  // Reset transient state when switching between /login and /signup
  useEffect(() => {
    setErrors({})
    setTouched({})
    setSubmitted(false)
    setFormError('')
    setValues((v) => ({ ...v, password: '', confirm: '' }))
  }, [mode])

  const redirectTarget = (() => {
    const from = location.state?.from
    return from?.pathname && !['/login', '/signup'].includes(from.pathname)
      ? `${from.pathname}${from.search || ''}`
      : '/'
  })()

  const update = (field) => (e) => {
    const next = { ...values, [field]: e.target.value }
    setValues(next)
    if (formError) setFormError('')
    if (submitted || touched[field]) setErrors(validate(mode, next))
  }

  const blur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }))
    if (values[field] || submitted) setErrors(validate(mode, values))
  }

  const visibleError = (field) => (submitted || touched[field] ? errors[field] : undefined)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitted(true)
    clearAuthNotice()
    const found = validate(mode, values)
    setErrors(found)
    if (Object.keys(found).length) {
      const first = ['name', 'email', 'password', 'confirm'].find((f) => found[f])
      formRef.current?.querySelector(`[name="${first}"]`)?.focus()
      return
    }

    setSubmitting(true)
    setFormError('')
    const email = values.email.trim().toLowerCase()
    try {
      if (isSignup) {
        await signup({ name: values.name.trim().replace(/\s+/g, ' '), email, password: values.password })
        setSuccess(true)
        setTimeout(() => navigate('/', { replace: true }), 900)
      } else {
        await login(email, values.password)
        navigate(redirectTarget, { replace: true })
      }
    } catch (err) {
      setFormError(friendlyError(mode, err))
      setValues((v) => ({ ...v, password: '', confirm: '' }))
      setSubmitting(false)
    }
  }

  const passwordLongEnough = values.password.length >= MIN_PASSWORD_LENGTH

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 lg:p-3">
      <div className="min-h-screen lg:min-h-[calc(100vh-1.5rem)] grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-3">
        <AuthShowcase />

        <main className="flex flex-col px-5 sm:px-8 py-8 lg:py-10 bg-white dark:bg-navy-900 lg:rounded-[28px] lg:border lg:border-gray-100 lg:dark:border-gray-800">
          {/* Mobile / tablet brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <ClarioLogo size={32} />
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-baseline">
              Clar<span className="text-brand-500 font-extrabold">i</span>o
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-10 lg:py-0">
            <div className="w-full max-w-[400px] motion-safe:animate-fade-in" key={mode}>
              {success ? (
                <div className="text-center motion-safe:animate-slide-up" role="status" aria-live="polite">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  </div>
                  <h1 className="mt-5 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {isSignup ? 'Account created' : 'Welcome back'}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Taking you to your workspace…</p>
                </div>
              ) : (
                <>
                  <h1 className="text-[28px] sm:text-[30px] font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
                    {copy.title}
                  </h1>
                  <p className="mt-2 text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">{copy.subtitle}</p>

                  {authNotice && !isSignup && (
                    <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 px-3.5 py-3 text-sm text-amber-800 dark:text-amber-300" role="status">
                      <Info size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{authNotice}</span>
                    </div>
                  )}

                  {formError && (
                    <div
                      className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 px-3.5 py-3 text-sm text-red-700 dark:text-red-300 motion-safe:animate-fade-in"
                      role="alert"
                    >
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>
                        {formError}
                        {formError.includes('already exists') && (
                          <> <Link to="/login" className="font-medium underline underline-offset-2">Log in instead</Link></>
                        )}
                      </span>
                    </div>
                  )}

                  <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-7 space-y-4" aria-busy={submitting}>
                    {isSignup && (
                      <TextField
                        label="Full name"
                        name="name"
                        autoComplete="name"
                        placeholder="Jamie Rivera"
                        value={values.name}
                        onChange={update('name')}
                        onBlur={blur('name')}
                        error={visibleError('name')}
                        disabled={submitting}
                        maxLength={120}
                        required
                      />
                    )}

                    <TextField
                      label="Work email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete={isSignup ? 'email' : 'username'}
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="name@company.com"
                      value={values.email}
                      onChange={update('email')}
                      onBlur={blur('email')}
                      error={visibleError('email')}
                      disabled={submitting}
                      maxLength={320}
                      required
                    />

                    <PasswordField
                      label="Password"
                      name="password"
                      autoComplete={isSignup ? 'new-password' : 'current-password'}
                      placeholder={isSignup ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Enter your password'}
                      value={values.password}
                      onChange={update('password')}
                      onBlur={blur('password')}
                      error={visibleError('password')}
                      disabled={submitting}
                      maxLength={256}
                      required
                    />

                    {isSignup && !visibleError('password') && (
                      <p
                        className={clsx(
                          '-mt-2 flex items-center gap-1.5 text-xs transition-colors',
                          passwordLongEnough ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                        )}
                        aria-live="polite"
                      >
                        <span
                          className={clsx(
                            'h-4 w-4 rounded-full flex items-center justify-center transition-colors',
                            passwordLongEnough ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'
                          )}
                          aria-hidden="true"
                        >
                          {passwordLongEnough && <Check size={10} strokeWidth={3} />}
                        </span>
                        At least {MIN_PASSWORD_LENGTH} characters
                        {passwordLongEnough && <span className="sr-only">(requirement met)</span>}
                      </p>
                    )}

                    {isSignup && (
                      <PasswordField
                        label="Confirm password"
                        name="confirm"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={values.confirm}
                        onChange={update('confirm')}
                        onBlur={blur('confirm')}
                        error={visibleError('confirm')}
                        disabled={submitting}
                        maxLength={256}
                        required
                      />
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group mt-2 w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800
                        text-white text-sm font-semibold shadow-sm shadow-brand-600/20
                        flex items-center justify-center gap-2 transition-colors
                        focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-800
                        disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                          {copy.pending}
                        </>
                      ) : (
                        <>
                          {copy.cta}
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </form>

                  {!isSignup && (
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Forgot your password? Contact your HR administrator.
                    </p>
                  )}

                  {/* Footer link to switch between /login and /signup */}
                  <p className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                    {copy.switchText}{' '}
                    <Link
                      to={copy.switchTo}
                      state={location.state}
                      className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      {copy.switchLink}
                    </Link>
                  </p>

                  {isSignup && (
                    <p className="mt-3 text-xs leading-relaxed text-gray-400 dark:text-gray-500">
                      New accounts are created with employee access. Administrator access is granted by your organization.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600">© {new Date().getFullYear()} Clario</p>
        </main>
      </div>
    </div>
  )
}
