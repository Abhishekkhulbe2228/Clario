import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { getConversations } from '../utils/storage.js'

export default function ConversationView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const conv = getConversations().find(c => c.id === id)

  if (!conv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <EmptyState
          icon={MessageSquare}
          title="Conversation not found"
          description="This conversation may have been deleted."
          action={
            <button onClick={() => navigate('/conversations')} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
              Back to conversations
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto">
        {/* Back nav */}
        <div className="sticky top-0 bg-gray-50 dark:bg-navy-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 z-10">
          <button
            onClick={() => navigate('/conversations')}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{conv.title}</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="py-4">
          {conv.messages?.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      </div>
    </div>
  )
}
