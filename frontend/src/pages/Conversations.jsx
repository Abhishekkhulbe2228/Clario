import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Trash2, Edit2, Check, X, Shield, Globe, MessageCircle } from 'lucide-react'
import EmptyState from '../components/common/EmptyState.jsx'
import { getConversations, deleteConversation, renameConversation } from '../utils/storage.js'
import { useAuth } from '../context/AuthContext.jsx'
import { format, isToday, isYesterday } from 'date-fns'
import clsx from 'clsx'


function sourceIcon(sourceUsed) {
  if (!sourceUsed) return null
  if (sourceUsed.includes('private') || sourceUsed === 'kb') return <Shield size={10} className="text-blue-500" />
  if (sourceUsed.includes('web') || sourceUsed.includes('web_search')) return <Globe size={10} className="text-amber-500" />
  return <MessageCircle size={10} className="text-gray-400" />
}

function ConvItem({ conv, onDelete, onRename }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(conv.title)

  const handleRename = () => {
    if (title.trim()) { onRename(conv.id, title.trim()); setEditing(false) }
  }

  const lastSource = conv.messages?.filter(m => m.role === 'assistant').slice(-1)[0]?.sourceUsed

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-xl cursor-pointer transition-colors"
      onClick={() => !editing && navigate(`/conversations/${conv.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && !editing && navigate(`/conversations/${conv.id}`)}
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-100 to-violet-100 dark:from-brand-900/30 dark:to-violet-900/30 flex items-center justify-center flex-shrink-0">
        <MessageSquare size={15} className="text-brand-600 dark:text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false) }}
              className="flex-1 text-sm bg-white dark:bg-gray-900 border border-brand-300 dark:border-brand-700 rounded-lg px-2 py-1 outline-none"
            />
            <button onClick={handleRename} className="text-green-600 hover:text-green-700" aria-label="Save"><Check size={14} /></button>
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600" aria-label="Cancel"><X size={14} /></button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              {sourceIcon(lastSource)}
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{conv.title}</p>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5">
              {format(new Date(conv.updatedAt || conv.createdAt), 'MMM d · HH:mm')}
              &nbsp;·&nbsp;{conv.messages?.length || 0} messages
            </p>
          </>
        )}
      </div>
      {!editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Rename conversation"
          ><Edit2 size={13} /></button>
          <button
            onClick={() => onDelete(conv.id)}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Delete conversation"
          ><Trash2 size={13} /></button>
        </div>
      )}
    </div>
  )
}

export default function ConversationsPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState(getConversations)
  const refresh = useCallback(() => setConversations(getConversations()), [])

  useEffect(() => {
    refresh()
    window.addEventListener('clario:auth_change', refresh)
    window.addEventListener('clario:conversations_change', refresh)
    return () => {
      window.removeEventListener('clario:auth_change', refresh)
      window.removeEventListener('clario:conversations_change', refresh)
    }
  }, [user, refresh])

  const handleDelete = useCallback((id) => {
    deleteConversation(id)
    refresh()
  }, [refresh])

  const handleRename = useCallback((id, title) => {
    renameConversation(id, title)
    refresh()
  }, [refresh])


  // Group by date
  const grouped = conversations.reduce((acc, c) => {
    const d = new Date(c.updatedAt || c.createdAt)
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : 'Older'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Conversations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your HR conversation history</p>
        </div>

        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Your HR conversations with Clario will appear here."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, convs]) => (
              <div key={group}>
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-2 px-1">{group}</h2>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
                  {convs.map(conv => (
                    <ConvItem key={conv.id} conv={conv} onDelete={handleDelete} onRename={handleRename} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
