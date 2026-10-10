import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { getConversations } from '../utils/storage.js'

export default function ConversationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const conv = getConversations().find((c) => c.id === id)

  if (!conv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#fbfbfa] dark:bg-[#111113]">
        <EmptyState
          icon={MessageSquare}
          title="Conversation not found"
          description="This conversation may have been deleted or moved."
          action={
            <button
              onClick={() => navigate('/conversations')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Back to conversations
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#fbfbfa] dark:bg-[#111113]">
      <div className="max-w-3xl mx-auto">
        {/* Sticky Header with Back Nav */}
        <div className="sticky top-0 bg-[#fbfbfa]/90 dark:bg-[#111113]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#e5e5e0] dark:border-[#27272a] flex items-center gap-3 z-10">
          <button
            onClick={() => navigate('/conversations')}
            className="p-1.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate font-sans">
              {conv.title}
            </h1>
          </div>
        </div>

        {/* Message sequence */}
        <div className="py-5">
          {conv.messages?.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      </div>
    </div>
  )
}
