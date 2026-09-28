import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getStoredToken,
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  refreshToken as apiRefreshToken,
} from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalReason, setAuthModalReason] = useState('')

  const openAuthModal = useCallback((reason = '') => {
    setAuthModalReason(reason)
    setShowAuthModal(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
    setAuthModalReason('')
  }, [])

  const initAuth = useCallback(async () => {
    setIsLoading(true)
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
      setUser(null)
      const message = e.detail?.message || 'Your session has expired. Please sign in again.'
      openAuthModal(message)
    }

    const handleAuthChange = () => {
      initAuth()
    }

    window.addEventListener('clario:auth_error', handleAuthError)
    window.addEventListener('clario:auth_change', handleAuthChange)

    return () => {
      window.removeEventListener('clario:auth_error', handleAuthError)
      window.removeEventListener('clario:auth_change', handleAuthChange)
    }
  }, [initAuth, openAuthModal])

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

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password)
    const currentUser = await getCurrentUser()
    setUser(currentUser || { email, role: res.role })
    closeAuthModal()
    return res
  }, [closeAuthModal])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isLoading,
    showAuthModal,
    authModalReason,
    openAuthModal,
    closeAuthModal,
    login,
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
