const BASE_URL = import.meta.env.VITE_API_URL || ''

export const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem('clario_access_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch { return {} }
}

export const clearAuthStorage = () => {
  try {
    localStorage.removeItem('clario_access_token')
    localStorage.removeItem('clario_user_role')
    localStorage.removeItem('clario_user_email')
    localStorage.removeItem('clario_user_name')
    localStorage.removeItem('clario_user_id')
  } catch {}
}

// A 401 from these endpoints means "wrong credentials", not "session expired".
const CREDENTIAL_ENDPOINTS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
]

const handleResponse = async (res, path = '') => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 401 && !CREDENTIAL_ENDPOINTS.includes(path)) {
      clearAuthStorage()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('clario:auth_error', {
            detail: {
              status: 401,
              message: err.detail || 'Authentication required',
            },
          })
        )
      }
    }
    const error = new Error(err.detail || `HTTP ${res.status}`)
    error.status = res.status
    error.detail = err.detail
    throw error
  }
  if (res.status === 204) return null
  return res.json()
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(options.headers || {}),
  }
  const res = await fetch(url, {
    ...options,
    headers,
  })
  return handleResponse(res, path)
}

const client = {
  get: (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) =>
    request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
  postForm: async (path, formData, opts = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      body: formData,
      headers: { ...getAuthHeaders(), ...(opts.headers || {}) },
    })
    return handleResponse(res)
  },
}

export default client
