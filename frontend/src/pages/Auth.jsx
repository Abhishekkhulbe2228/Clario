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

// Must match MIN_PASSWORD_LENGTH in backend app/api/routes.py
const MIN_PASSWORD_LENGTH = 12
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const COPY = {
  login: {
    title: 'Sign in to Clario',
    subtitle: 'Access your organization’s policies, guidelines, and workplace knowledge.',
    cta: 'Sign in to workspace',
    pending: 'Authenticating…',
    switchText: "Don't have an account?",
    switchLink: 'Create account',
    switchTo: '/signup',
    documentTitle: 'Sign in · Clario',
  },
  signup: {
    title: 'Create your account',
    subtitle: "Join your company workspace and ask questions grounded in verified documentation.",
    cta: 'Create account',
    pending: 'Creating account…',
    switchText: 'Already registered?',
    switchLink: 'Sign in',
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
  if (!email) errors.email = 'Enter your work email address.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid work email (e.g., name@company.com).'

  if (mode === 'signup' || values.password) {
    if (!values.password) errors.password = 'Enter your password.'
    else if (values.password.length < MIN_PASSWORD_LENGTH) {
      errors.password =
        mode === 'signup'
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

function friendlyError(mode, err) {
  if (!err || err instanceof TypeError || err.status === undefined) {
    return 'Unable to reach Clario server. Please check your connection.'
  }
  const detail = err.detail || ''

  switch (err.status) {
    case 401:
      return 'Incorrect email or password.'
    case 409:
      return 'An account with this email address already exists.'
    case 422:
      return mode === 'signup'
        ? `Please verify your details. Passwords must be at least ${MIN_PASSWORD_LENGTH} characters.`
        : detail || 'Please check the information entered.'
    case 429:
      return detail || 'Too many attempts. Please wait a minute and try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
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
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#111113] p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-[#18181b] border border-[#e5e5e0] dark:border-[#27272a] shadow-xs overflow-hidden grid lg:grid-cols-[1.1fr_1fr]">
        <AuthShowcase />

        <main className="flex flex-col justify-between px-6 sm:px-10 py-8 lg:py-12 bg-white dark:bg-[#18181b]">
          {/* Mobile brand header */}
          <div className="flex items-center gap-2 lg:hidden mb-6">
            <ClarioLogo size={32} />
            <span className="text-base font-bold font-brand text-zinc-900 dark:text-zinc-100 tracking-tight flex items-baseline">
              Clar<span className="text-amber-500 font-extrabold">i</span>o
            </span>
          </div>

          <div className="my-auto w-full max-w-[380px] mx-auto py-4">
            {success ? (
              <div className="text-center animate-slide-up" role="status" aria-live="polite">
                <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={24} aria-hidden="true" />
                </div>
                <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100 font-editorial">
                  {isSignup ? 'Account created' : 'Welcome back'}
                </h1>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Loading your workplace knowledge session…</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 font-editorial">
                  {copy.title}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {copy.subtitle}
                </p>

                {authNotice && !isSignup && (
                  <div
                    className="mt-5 flex items-start gap-2.5 rounded-lg border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 px-3.5 py-2.5 text-xs text-blue-900 dark:text-blue-300"
                    role="status"
                  >
                    <Info size={15} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>{authNotice}</span>
                  </div>
                )}

                {formError && (
                  <div
                    className="mt-5 flex items-start gap-2.5 rounded-lg border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 px-3.5 py-2.5 text-xs text-rose-800 dark:text-rose-300 animate-fade-in"
                    role="alert"
                  >
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>
                      {formError}
                      {formError.includes('already exists') && (
                        <>
                          {' '}
                          <Link to="/login" className="font-semibold underline">
                            Sign in instead
                          </Link>
                        </>
                      )}
                    </span>
                  </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 space-y-4" aria-busy={submitting}>
                  {isSignup && (
                    <TextField
                      label="Full name"
                      name="name"
                      autoComplete="name"
                      placeholder="Jane Doe"
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
                    placeholder={isSignup ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Enter password'}
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
                        passwordLongEnough ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                      )}
                      aria-live="polite"
                    >
                      <span
                        className={clsx(
                          'h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px] transition-colors',
                          passwordLongEnough
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                        )}
                        aria-hidden="true"
                      >
                        {passwordLongEnough && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span>At least {MIN_PASSWORD_LENGTH} characters</span>
                    </p>
                  )}

                  {isSignup && (
                    <PasswordField
                      label="Confirm password"
                      name="confirm"
                      autoComplete="new-password"
                      placeholder="Re-enter password"
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
                    className="mt-2 w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        <span>{copy.pending}</span>
                      </>
                    ) : (
                      <>
                        <span>{copy.cta}</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 pt-5 border-t border-[#efefea] dark:border-[#27272a] text-xs text-zinc-500 dark:text-zinc-400 text-center">
                  {copy.switchText}{' '}
                  <Link
                    to={copy.switchTo}
                    state={location.state}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {copy.switchLink}
                  </Link>
                </p>
              </>
            )}
          </div>

          <p className="text-center text-[11px] text-zinc-400 font-mono mt-6">
            © {new Date().getFullYear()} Clario Workplace Assistant
          </p>
        </main>
      </div>
    </div>
  )
}
