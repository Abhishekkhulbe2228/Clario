const LEGACY_CONVERSATIONS_KEY = 'clario_conversations'
const THEME_KEY = 'clario_theme'

export function getActiveUserId() {
  try {
    const directId = localStorage.getItem('clario_user_id')
    if (directId) return String(directId)

    const token = localStorage.getItem('clario_access_token')
    if (token) {
      const parts = token.split('.')
      const payloadStr = parts.length >= 2 ? parts[parts.length === 3 ? 1 : 0] : null
      if (payloadStr) {
        const padded = payloadStr + '='.repeat((4 - (payloadStr.length % 4)) % 4)
        const payload = JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')))
        if (payload?.sub) return String(payload.sub)
      }
    }
  } catch {}
  return 'guest'
}

export function getConversationsStorageKey(userId) {
  const uid = userId !== undefined ? String(userId) : getActiveUserId()
  return `clario_conversations_${uid}`
}

export function getConversations(userId) {
  try {
    const key = getConversationsStorageKey(userId)
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }

    // Migration: if active user has no stored conversations yet, check legacy un-scoped key
    const legacy = localStorage.getItem(LEGACY_CONVERSATIONS_KEY)
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy)
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        // Copy to current user key
        localStorage.setItem(key, JSON.stringify(parsedLegacy))
        return parsedLegacy
      }
    }

    return []
  } catch {
    return []
  }
}

export function saveConversation(conv, userId) {
  const key = getConversationsStorageKey(userId)
  const convs = getConversations(userId)
  const idx = convs.findIndex(c => c.id === conv.id)
  if (idx >= 0) convs[idx] = conv
  else convs.unshift(conv)
  try {
    localStorage.setItem(key, JSON.stringify(convs.slice(0, 100)))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clario:conversations_change', { detail: { id: conv.id } }))
    }
  } catch {}
}

export function deleteConversation(id, userId) {
  const key = getConversationsStorageKey(userId)
  const convs = getConversations(userId).filter(c => c.id !== id)
  try {
    localStorage.setItem(key, JSON.stringify(convs))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clario:conversations_change', { detail: { id } }))
    }
  } catch {}
}

export function renameConversation(id, title, userId) {
  const key = getConversationsStorageKey(userId)
  const convs = getConversations(userId).map(c => c.id === id ? { ...c, title } : c)
  try {
    localStorage.setItem(key, JSON.stringify(convs))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clario:conversations_change', { detail: { id, title } }))
    }
  } catch {}
}

export function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'light' } catch { return 'light' }
}

export function setTheme(t) {
  try { localStorage.setItem(THEME_KEY, t) } catch {}
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getTitleFromQuestion(question) {
  return question.length > 50 ? question.slice(0, 50) + '…' : question
}
