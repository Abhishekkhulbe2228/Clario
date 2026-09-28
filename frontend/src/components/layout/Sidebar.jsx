import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MessageSquare, History, FileText, Activity, ShieldCheck,
  Settings, Plus, HelpCircle, User, CheckCircle, AlertCircle,
  X, LogIn, LogOut
} from 'lucide-react'
import ClarioLogo from '../common/ClarioLogo.jsx'
import clsx from 'clsx'
import { useHealth } from '../../hooks/useHealth.js'
import { getConversations } from '../../utils/storage.js'
import { format, isToday, isYesterday } from 'date-fns'
import { useAuth } from '../../context/AuthContext.jsx'

const navItems = [
  { to: '/', label: 'Chat', icon: MessageSquare, exact: true },
  { to: '/conversations', label: 'Conversations', icon: History },
  { to: '/documents', label: 'HR Documents', icon: FileText },
  { to: '/activity', label: 'Agent Activity', icon: Activity },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose, onNewChat }) {
  const health = useHealth()
  const navigate = useNavigate()
  const { user, isAuthenticated, openAuthModal, logout } = useAuth()
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
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 h-full z-30 flex flex-col',
        'w-[260px] bg-white dark:bg-navy-950 border-r border-gray-100 dark:border-gray-800/60',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )} aria-label="Main navigation">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <ClarioLogo size={34} />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">Clario</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Intelligent Workplace</div>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* New conversation */}
        <div className="px-3 pb-3">
          <button
            onClick={() => { onNewChat?.(); onClose?.() }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700
              text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            aria-label="Start new conversation"
          >
            <Plus size={15} />
            New Conversation
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 overflow-y-auto scrollbar-thin" aria-label="App sections">
          <ul className="space-y-0.5">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={exact}
                  onClick={onClose}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Recent conversations */}
          {conversations.length > 0 && (
            <div className="mt-4 mb-2">
              <p className="px-3 text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1">Recent</p>
              {Object.entries(grouped).map(([group, convs]) => (
                <div key={group}>
                  <p className="px-3 text-[10px] text-gray-400 dark:text-gray-600 mt-2 mb-0.5">{group}</p>
                  {convs.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { navigate(`/chat/${c.id}`); onClose?.() }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400
                        hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white
                        transition-colors truncate"
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800/60 px-3 py-3 space-y-1.5">
          {/* System status */}
          <div className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
            health === 'ok'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : health === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-500'
          )}>
            {health === 'ok' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
            {health === 'ok' ? 'All systems operational' : health === 'error' ? 'Backend unavailable' : 'Checking status…'}
          </div>

          {/* User profile / Auth button */}
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-tight truncate">
                    {user.role === 'system_admin' ? 'System Admin' : user.role === 'hr_admin' ? 'HR Admin' : 'Employee'}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('Sign in to chat with Clario and access your company knowledge base.')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 text-brand-700 dark:text-brand-300 hover:bg-brand-100/70 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-brand-200 dark:bg-brand-900/60 flex items-center justify-center flex-shrink-0">
                  <User size={13} className="text-brand-700 dark:text-brand-300" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-xs font-semibold leading-tight">Guest Mode</div>
                  <div className="text-[10px] opacity-80 leading-tight">Sign in to start</div>
                </div>
              </div>
              <LogIn size={14} className="text-brand-600 dark:text-brand-400" />
            </button>
          )}

          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <HelpCircle size={12} />
            Help & Support
          </NavLink>
        </div>
      </aside>
    </>
  )
}
