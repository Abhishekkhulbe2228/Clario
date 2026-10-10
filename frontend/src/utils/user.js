/**
 * Utility functions for extracting and formatting user profile information.
 */

/**
 * Roles allowed to access admin-only endpoints (documents, audit).
 * Mirrors the backend's `require_roles("hr_admin", "system_admin")`.
 * This only drives UI presentation: the backend remains the source of truth.
 */
export const ADMIN_ROLES = ['system_admin', 'hr_admin']

export function isAdminUser(user) {
  return Boolean(user && ADMIN_ROLES.includes(user.role))
}

/**
 * Returns the human-friendly display name of the authenticated user.
 * 
 * Preference order:
 * 1. user.full_name (from database /me or login payload)
 * 2. user.name
 * 3. Formatted email username (e.g. "abhishek.khulbe" -> "Abhishek Khulbe")
 * 4. Role title fallback ("System Administrator", "HR Administrator", "Employee")
 */
export function getUserDisplayName(user) {
  if (!user) return 'Guest'

  if (typeof user.full_name === 'string' && user.full_name.trim()) {
    return user.full_name.trim()
  }

  if (typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim()
  }

  if (typeof user.email === 'string' && user.email.includes('@')) {
    const raw = user.email.split('@')[0].trim()
    // Convert dot or underscore separated usernames to Title Case (e.g. "john.doe" -> "John Doe")
    const words = raw
      .replace(/[._-]+/g, ' ')
      .replace(/\d+$/, '') // strip trailing numbers if name part exists
      .trim()

    if (words.length >= 2) {
      return words
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }
    return raw
  }

  if (user.role === 'system_admin') return 'System Administrator'
  if (user.role === 'hr_admin') return 'HR Administrator'
  return 'Employee'
}

/**
 * Derives avatar initials from the user's name.
 * 
 * Examples:
 * - "Abhishek Khulbe", count=1 -> "A"
 * - "Abhishek Khulbe", count=2 -> "AK"
 * - Fallback -> "E" or "U"
 */
export function getUserInitial(user, count = 1) {
  const name = getUserDisplayName(user)
  if (!name || name === 'Guest') return 'U'

  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'

  if (count === 2 && parts.length >= 2) {
    const first = parts[0][0] || ''
    const last = parts[parts.length - 1][0] || ''
    return (first + last).toUpperCase()
  }

  return parts[0][0].toUpperCase()
}
