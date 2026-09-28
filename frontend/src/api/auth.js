import client, { clearAuthStorage } from './client.js'

export function decodeTokenPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    const payloadStr = parts.length >= 2 ? parts[parts.length === 3 ? 1 : 0] : null
    if (!payloadStr) return null
    const padded = payloadStr + '='.repeat((4 - (payloadStr.length % 4)) % 4)
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function getStoredToken() {
  try {
    const token = localStorage.getItem('clario_access_token')
    if (!token) return null
    const payload = decodeTokenPayload(token)
    if (payload && payload.exp && payload.exp * 1000 <= Date.now()) {
      clearAuthStorage()
      return null
    }
    return token
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getStoredToken())
}

export async function login(email, password) {
  const result = await client.post('/api/v1/auth/login', { email, password })
  try {
    localStorage.setItem('clario_access_token', result.access_token)
    localStorage.setItem('clario_user_role', result.role)
    if (result.email) {
      localStorage.setItem('clario_user_email', result.email)
    }
    const payload = decodeTokenPayload(result.access_token)
    if (payload?.sub) {
      localStorage.setItem('clario_user_id', payload.sub)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clario:auth_change', { detail: { action: 'login', role: result.role } }))
    }
  } catch {}
  return result
}

export function logout() {
  clearAuthStorage()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('clario:auth_change', { detail: { action: 'logout' } }))
  }
}

export async function getCurrentUser() {
  const token = getStoredToken()
  if (!token) return null
  try {
    const user = await client.get('/api/v1/auth/me')
    if (user?.id) {
      localStorage.setItem('clario_user_id', String(user.id))
      localStorage.setItem('clario_user_email', user.email)
      localStorage.setItem('clario_user_role', user.role)
    }
    return user
  } catch (err) {
    if (err.status === 401) {
      clearAuthStorage()
    }
    return null
  }
}

export async function refreshToken() {
  const token = getStoredToken()
  if (!token) return null
  try {
    const result = await client.post('/api/v1/auth/refresh')
    if (result?.access_token) {
      localStorage.setItem('clario_access_token', result.access_token)
      if (result.role) localStorage.setItem('clario_user_role', result.role)
      if (result.email) localStorage.setItem('clario_user_email', result.email)
    }
    return result
  } catch (err) {
    if (err.status === 401) {
      clearAuthStorage()
    }
    return null
  }
}
