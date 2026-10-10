import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Moon, Sun, Bell, User, LogIn, LogOut, Shield, X, MessageSquare, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
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
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="h-14 border-b border-[#e5e5e0] dark:border-[#27272a] bg-white/90 dark:bg-[#121214]/90 backdrop-blur-md sticky top-0 z-20 flex items-center px-4 sm:px-6 gap-3 transition-colors duration-150">
      {/* Mobile toggle */}
      <button
        className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 -ml-1 transition-colors"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Mobile brand mark */}
      <div className="lg:hidden flex items-center gap-2">
        <ClarioLogo size={26} />
        <span className="font-brand font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight flex items-baseline">
          Clar<span className="text-amber-500 font-extrabold">i</span>o
        </span>
      </div>

      {/* Editorial context label */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-900 dark:text-zinc-100 font-editorial text-sm">Clario</span>
        <ChevronRight size={12} className="text-zinc-400" />
        <span className="text-zinc-600 dark:text-zinc-400 font-medium">Workplace Knowledge</span>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-auto relative" ref={searchRef}>
        {searchOpen ? (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
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
              placeholder="Search HR policies and conversations…"
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-[#18181b] border border-blue-500 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none shadow-xs font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}

            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-lg py-1 z-50 overflow-hidden">
                {matchingConversations.length > 0 ? (
                  matchingConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        navigate(`/conversations/${conv.id}`)
                        setSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 flex items-center gap-2 transition-colors text-xs text-zinc-800 dark:text-zinc-200"
                    >
                      <MessageSquare size={13} className="text-blue-600 flex-shrink-0" />
                      <span className="truncate">{conv.title || 'Untitled conversation'}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-zinc-400 text-center">
                    No matching conversations found
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-between w-full max-w-sm px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] transition-all"
          >
            <div className="flex items-center gap-2">
              <Search size={13} className="text-zinc-400" />
              <span className="hidden sm:inline">Search knowledge base…</span>
              <span className="sm:hidden">Search…</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-[#e5e5e0] dark:border-[#27272a]">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={15} />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xl p-4 z-50 text-xs animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Notifications</span>
                <span className="text-[10px] text-zinc-400 font-mono">0 unread</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-center py-3">
                No new alerts. All knowledge indexes are synced.
              </p>
            </div>
          )}
        </div>

        {/* User Account / Sign In */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
              aria-label="User account menu"
            >
              <span className="hidden sm:inline text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[140px] truncate">
                {getUserDisplayName(user)}
              </span>
              <UserAvatar user={user} size="sm" count={1} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xl py-2 z-50 animate-slide-up">
                <div className="px-4 py-2.5 border-b border-[#efefea] dark:border-[#27272a]">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-mono">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 capitalize flex items-center gap-1 font-medium font-mono">
                    <Shield size={10} className="text-blue-600" />
                    {user.role === 'system_admin'
                      ? 'System Administrator'
                      : user.role === 'hr_admin'
                      ? 'HR Administrator'
                      : 'Employee'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
          >
            <LogIn size={13} />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  )
}
