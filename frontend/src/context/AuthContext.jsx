import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  getStoredToken,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  refreshToken as apiRefreshToken,
} from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  // Message shown on the login page after a forced sign-out (e.g. expired session)
  const [authNotice, setAuthNotice] = useState('')
  const userRef = useRef(null)
  userRef.current = user

  const initAuth = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    initAuth()

    const handleAuthError = (e) => {
      // Only surface a notice if someone was actually signed in
      if (userRef.current) {
        setAuthNotice('Your session has expired. Please sign in again.')
      }
      setUser(null)
    }

    const handleAuthChange = (e) => {
      // login/register already set the user directly; only re-sync for other changes
      if (e.detail?.action === 'login' || e.detail?.action === 'register') return
      initAuth()
    }

    window.addEventListener('clario:auth_error', handleAuthError)
    window.addEventListener('clario:auth_change', handleAuthChange)

    return () => {
      window.removeEventListener('clario:auth_error', handleAuthError)
      window.removeEventListener('clario:auth_change', handleAuthChange)
    }
  }, [initAuth])

  // Periodic proactive token refresh every 20 minutes if authenticated
  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      try {
        await apiRefreshToken()
      } catch {
        // Handled by auth_error if 401
      }
    }, 20 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  const completeSignIn = useCallback(async (res) => {
    const currentUser = await getCurrentUser()
    setUser(currentUser || { email: res.email, role: res.role, full_name: res.full_name })
    setAuthNotice('')
    return res
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password)
    return completeSignIn(res)
  }, [completeSignIn])

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await apiRegister(name, email, password)
    return completeSignIn(res)
  }, [completeSignIn])

  const logout = useCallback(() => {
    apiLogout()
    setAuthNotice('')
    setUser(null)
  }, [])

  const clearAuthNotice = useCallback(() => setAuthNotice(''), [])

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isLoading,
    authNotice,
    clearAuthNotice,
    login,
    signup,
    logout,
    refreshToken: apiRefreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
