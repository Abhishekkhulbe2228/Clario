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
  if (sourceUsed.includes('private') || sourceUsed === 'kb') return <Shield size={11} className="text-blue-600" />
  if (sourceUsed.includes('web') || sourceUsed.includes('web_search')) return <Globe size={11} className="text-amber-600" />
  return <MessageCircle size={11} className="text-zinc-400" />
}

function ConvItem({ conv, onDelete, onRename }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(conv.title)

  const handleRename = () => {
    if (title.trim()) {
      onRename(conv.id, title.trim())
      setEditing(false)
    }
  }

  const lastSource = conv.messages?.filter((m) => m.role === 'assistant').slice(-1)[0]?.sourceUsed

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
      onClick={() => !editing && navigate(`/conversations/${conv.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && !editing && navigate(`/conversations/${conv.id}`)}
    >
      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center flex-shrink-0 text-blue-600">
        <MessageSquare size={14} />
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="flex-1 text-xs sm:text-sm bg-white dark:bg-[#18181b] border border-blue-500 rounded-md px-2.5 py-1 outline-none text-zinc-900 dark:text-zinc-100 font-sans"
            />
            <button onClick={handleRename} className="text-emerald-600 hover:text-emerald-700 p-1" aria-label="Save">
              <Check size={14} />
            </button>
            <button onClick={() => setEditing(false)} className="text-zinc-400 hover:text-zinc-600 p-1" aria-label="Cancel">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              {sourceIcon(lastSource)}
              <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate font-sans">
                {conv.title}
              </p>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              {format(new Date(conv.updatedAt || conv.createdAt), 'MMM d · HH:mm')}
              &nbsp;·&nbsp;{conv.messages?.length || 0} messages
            </p>
          </>
        )}
      </div>
      {!editing && (
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Rename conversation"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(conv.id)}
            className="p-1 rounded-md hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
            aria-label="Delete conversation"
          >
            <Trash2 size={13} />
          </button>
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

  const handleDelete = useCallback(
    (id) => {
      deleteConversation(id)
      refresh()
    },
    [refresh]
  )

  const handleRename = useCallback(
    (id, title) => {
      renameConversation(id, title)
      refresh()
    },
    [refresh]
  )

  const grouped = conversations.reduce((acc, c) => {
    const d = new Date(c.updatedAt || c.createdAt)
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : 'Older'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#fbfbfa] dark:bg-[#111113]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
            <span>Query History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 font-editorial tracking-tight">
            Saved Conversations
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-sans mt-1">
            Revisit previous queries, policy citations, and assistant responses.
          </p>
        </div>

        {conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations saved"
            description="Your workplace queries and assistant responses will be archived here."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([group, convs]) => (
              <div key={group}>
                <h2 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                  {group}
                </h2>
                <div className="rounded-xl border border-[#e5e5e0] dark:border-[#27272a] bg-white dark:bg-[#18181b] shadow-xs overflow-hidden divide-y divide-[#efefea] dark:divide-[#27272a]">
                  {convs.map((conv) => (
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
