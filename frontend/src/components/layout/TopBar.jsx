import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Moon, Sun, Bell, User, LogIn, LogOut, Shield, X, MessageSquare } from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import UserAvatar from '../common/UserAvatar.jsx'
import { useTheme } from '../../hooks/useTheme.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getConversations } from '../../utils/storage.js'
import { getUserDisplayName } from '../../utils/user.js'

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const searchRef = useRef(null)
  const notifRef = useRef(null)

  const conversations = useMemo(() => {
    if (!searchOpen) return []
    return getConversations(user?.id)
  }, [searchOpen, user?.id])

  const matchingConversations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return conversations.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.messages || []).some(m => (m.content || '').toLowerCase().includes(q))
    ).slice(0, 5)
  }, [conversations, searchQuery])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-14 border-b border-gray-100 dark:border-gray-800/60 bg-white dark:bg-navy-950
      flex items-center px-4 gap-3 sticky top-0 z-10">
      {/* Mobile menu */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 -ml-1"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2">
        <ClarioLogo size={28} />
        <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight flex items-baseline">
          Clar<span className="text-brand-500 font-extrabold">i</span>o
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        {searchOpen ? (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setSearchOpen(false)
                  setSearchQuery('')
                } else if (e.key === 'Enter' && matchingConversations.length > 0) {
                  navigate(`/conversations/${matchingConversations[0].id}`)
                  setSearchOpen(false)
                  setSearchQuery('')
                }
              }}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-8 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg
                text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}

            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-navy-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50 overflow-hidden">
                {matchingConversations.length > 0 ? (
                  matchingConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        navigate(`/conversations/${conv.id}`)
                        setSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-center gap-2 transition-colors text-xs text-gray-700 dark:text-gray-200"
                    >
                      <MessageSquare size={13} className="text-brand-500 flex-shrink-0" />
                      <span className="truncate">{conv.title || 'Untitled conversation'}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">
                    No matching conversations
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500
              hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search conversations…</span>
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={16} />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 z-50 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Notifications</span>
                <span className="text-[10px] text-gray-400">0 unread</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center py-3">
                No new notifications. You are all caught up!
              </p>
            </div>
          )}
        </div>

        {/* User Account / Sign In */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="User account menu"
            >
              <span className="hidden sm:inline text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[140px] md:max-w-[180px] truncate">
                {getUserDisplayName(user)}
              </span>
              <UserAvatar user={user} size="md" count={1} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-slide-up">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 capitalize flex items-center gap-1 font-medium">
                    {user.role === 'system_admin' ? (
                      <>
                        <Shield size={10} className="text-violet-500" />
                        System Administrator
                      </>
                    ) : user.role === 'hr_admin' ? (
                      <>
                        <Shield size={10} className="text-blue-500" />
                        HR Administrator
                      </>
                    ) : (
                      'Employee'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 text-white text-xs font-medium hover:from-brand-700 hover:to-violet-700 transition-all shadow-sm"
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  )
}
