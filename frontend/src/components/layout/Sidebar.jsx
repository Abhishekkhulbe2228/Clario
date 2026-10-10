import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  History,
  FileText,
  Activity,
  ShieldCheck,
  Settings,
  Plus,
  HelpCircle,
  User,
  X,
  LogIn,
  LogOut,
  Lock,
  Compass,
} from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import UserAvatar from '../common/UserAvatar.jsx'
import clsx from 'clsx'
import { useHealth } from '../../hooks/useHealth.js'
import { getConversations } from '../../utils/storage.js'
import { isToday, isYesterday } from 'date-fns'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUserDisplayName, isAdminUser } from '../../utils/user.js'

const primaryNav = [
  { to: '/', label: 'Knowledge Chat', icon: MessageSquare, exact: true },
  { to: '/conversations', label: 'Conversations', icon: History },
  { to: '/documents', label: 'HR Documents', icon: FileText },
]

const systemNav = [
  { to: '/activity', label: 'Agent Activity', icon: Activity, adminOnly: true },
  { to: '/admin', label: 'Administration', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose, onNewChat }) {
  const health = useHealth()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const isAdmin = isAdminUser(user)
  const [conversations, setConversations] = useState(() => getConversations().slice(0, 6))

  useEffect(() => {
    const updateConvs = () => setConversations(getConversations().slice(0, 6))
    updateConvs()
    window.addEventListener('clario:conversations_change', updateConvs)
    window.addEventListener('clario:auth_change', updateConvs)
    return () => {
      window.removeEventListener('clario:conversations_change', updateConvs)
      window.removeEventListener('clario:auth_change', updateConvs)
    }
  }, [user])

  const grouped = conversations.reduce((acc, c) => {
    const d = new Date(c.updatedAt || c.createdAt)
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : 'Older'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'w-[260px] bg-[#fbfbfa] dark:bg-[#111113] border-r border-[#e5e5e0] dark:border-[#27272a]',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#efefea] dark:border-[#1f1f23]">
          <div className="flex items-center gap-3">
            <ClarioLogo size={32} />
            <div>
              <div className="font-brand font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight tracking-tight flex items-baseline">
                Clar<span className="text-amber-500 font-extrabold">i</span>o
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                Workplace Copilot
              </div>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* New conversation action button */}
        <div className="px-3.5 pt-3.5 pb-2">
          <button
            onClick={() => {
              onNewChat?.()
              onClose?.()
            }}
            className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            aria-label="Start new conversation"
          >
            <Plus size={14} aria-hidden="true" />
            <span>New conversation</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin py-2 space-y-5" aria-label="App sections">
          {/* Workspace category */}
          <div>
            <div className="px-2.5 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Workspace
            </div>
            <ul className="space-y-0.5">
              {primaryNav.map(({ to, label, icon: Icon, exact }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-white dark:bg-[#18181b] text-blue-600 dark:text-blue-400 shadow-xs border border-[#e5e5e0] dark:border-[#27272a]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 border border-transparent'
                      )
                    }
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* System & Intelligence category */}
          <div>
            <div className="px-2.5 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Governance
            </div>
            <ul className="space-y-0.5">
              {systemNav.map(({ to, label, icon: Icon, exact, adminOnly }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-white dark:bg-[#18181b] text-blue-600 dark:text-blue-400 shadow-xs border border-[#e5e5e0] dark:border-[#27272a]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 border border-transparent'
                      )
                    }
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="truncate">{label}</span>
                    {adminOnly && !isAdmin && (
                      <span className="ml-auto flex items-center text-zinc-400" title="Admin only">
                        <Lock size={11} aria-hidden="true" />
                        <span className="sr-only">(admin only)</span>
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent conversations */}
          {conversations.length > 0 && (
            <div className="pt-2 border-t border-[#efefea] dark:border-[#1f1f23]">
              <div className="px-2.5 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Recent Queries
              </div>
              {Object.entries(grouped).map(([group, convs]) => (
                <div key={group} className="mb-2">
                  <p className="px-2.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mb-0.5">{group}</p>
                  {convs.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        navigate(`/chat/${c.id}`)
                        onClose?.()
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors truncate block"
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Footer info & user card */}
        <div className="border-t border-[#efefea] dark:border-[#1f1f23] p-3 space-y-2 bg-[#f8f8f6] dark:bg-[#141416]">
          {/* Health status */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b]">
            <span
              className={clsx(
                'w-2 h-2 rounded-full flex-shrink-0',
                health === 'ok'
                  ? 'bg-emerald-500'
                  : health === 'error'
                  ? 'bg-rose-500'
                  : 'bg-zinc-400'
              )}
              aria-hidden="true"
            />
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px] truncate">
              {health === 'ok'
                ? 'Knowledge Base connected'
                : health === 'error'
                ? 'Backend unavailable'
                : 'Checking status…'}
            </span>
          </div>

          {/* User profile / Auth button */}
          {isAuthenticated && user ? (
            <div className="p-2.5 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar user={user} size="sm" count={1} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                    {getUserDisplayName(user)}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate mt-0.5">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <User size={13} className="text-blue-600" />
                <span className="truncate">Sign in to workspace</span>
              </div>
              <LogIn size={13} />
            </button>
          )}

          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2 px-2.5 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <HelpCircle size={12} />
            <span>Preferences & Support</span>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
