import React, { useState, useRef, useEffect } from 'react'
import { Menu, Search, Moon, Sun, Bell, User, LogIn, LogOut, Shield } from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import { useTheme } from '../../hooks/useTheme.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function TopBar({ onMenuClick }) {
  const { theme, toggle } = useTheme()
  const { user, isAuthenticated, openAuthModal, logout } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
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
        <ClarioLogo size={26} />
        <span className="font-semibold text-gray-900 dark:text-white text-sm">Clario</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md">
        {searchOpen ? (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg
                text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-700"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500
              hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search…</span>
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
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* User Account / Sign In */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="User account menu"
            >
              <span className="hidden sm:inline text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                {user.email.split('@')[0]}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
                <User size={14} />
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-slide-up">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 capitalize flex items-center gap-1">
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
            onClick={() => openAuthModal('Sign in to chat with Clario and access your documents.')}
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
