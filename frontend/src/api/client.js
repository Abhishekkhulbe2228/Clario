const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
    localStorage.removeItem('clario_user_id')
  } catch {}
}

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 401) {
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
  return handleResponse(res)
}

const client = {
  get: (path, opts = {}) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) =>
    request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
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
