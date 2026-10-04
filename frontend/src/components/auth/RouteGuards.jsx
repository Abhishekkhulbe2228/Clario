import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import ClarioLogo from '../common/ClarioLogo.jsx'

function FullScreenLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-950"
      role="status"
      aria-live="polite"
    >
      <ClarioLogo size={40} className="motion-safe:animate-pulse-soft" />
      <span className="sr-only">Loading Clario…</span>
    </div>
  )
}

/** Renders child routes only for signed-in users; otherwise redirects to /login. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

/** For /login and /signup: signed-in users are sent back into the app. */
export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullScreenLoader />
  if (isAuthenticated) {
    const from = location.state?.from
    const target = from?.pathname && !['/login', '/signup'].includes(from.pathname)
      ? `${from.pathname}${from.search || ''}`
      : '/'
    return <Navigate to={target} replace />
  }
  return <Outlet />
}
