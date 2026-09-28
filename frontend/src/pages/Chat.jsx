import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import ChatComposer from '../components/chat/ChatComposer.jsx'
import ChatEmptyState from '../components/chat/ChatEmptyState.jsx'
import AgentTyping from '../components/chat/AgentTyping.jsx'
import { sendMessage } from '../api/chat.js'
import {
  generateId, saveConversation, getConversations, getTitleFromQuestion
} from '../utils/storage.js'
import { getAgentStages } from '../utils/trace.js'
import { AlertCircle, LogIn, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const STAGE_INTERVAL = 1800

export default function ChatPage() {
  const { id: urlId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, openAuthModal } = useAuth()

  const [convId, setConvId] = useState(() => urlId || null)
  const [messages, setMessages] = useState(() => {
    if (!urlId) return []
    const conv = getConversations().find(c => c.id === urlId)
    return conv?.messages || []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const stageTimerRef = useRef(null)

  // Sync state when URL changes (switching conversations from sidebar)
  useEffect(() => {
    if (urlId && urlId !== convId) {
      const conv = getConversations().find(c => c.id === urlId)
      setConvId(urlId)
      setMessages(conv?.messages || [])
      setError(null)
    }
    if (!urlId) {
      setConvId(null)
      setMessages([])
      setError(null)
    }
  }, [urlId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const animateStages = useCallback((stages) => {
    let idx = 0
    setLoadingStage(stages[0] || 'Processing…')
    stageTimerRef.current = setInterval(() => {
      idx++
      if (idx < stages.length) setLoadingStage(stages[idx])
      else clearInterval(stageTimerRef.current)
    }, STAGE_INTERVAL)
  }, [])

  const handleSend = useCallback(async (question) => {
    if (isLoading) return
    setError(null)

    // Check authentication before attempting to send
    if (!isAuthenticated) {
      openAuthModal('Please sign in to chat with Clario.')
      setError('Authentication required. Please sign in to submit a query.')
      return
    }

    setIsLoading(true)

    // Generate a stable id on the first message of a new conversation
    const activeId = convId || generateId()
    if (!convId) {
      setConvId(activeId)
      navigate(`/chat/${activeId}`, { replace: true })
    }

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    animateStages(getAgentStages('private_kb'))

    try {
      const result = await sendMessage(question)
      clearInterval(stageTimerRef.current)

      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: result.answer,
        sourceUsed: result.source_used,
        citations: result.citations || [],
        trace: result.trace || [],
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => {
        const updated = [...prev, assistantMsg]
        saveConversation({
          id: activeId,
          title: getTitleFromQuestion(question),
          messages: updated,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        return updated
      })
    } catch (err) {
      clearInterval(stageTimerRef.current)
      if (err.status === 401 || err.message?.includes('401') || err.message?.includes('expired') || err.message?.includes('Authentication')) {
        setError('Your session has expired or authentication is required. Please sign in again.')
        openAuthModal('Your session has expired. Please sign in again to continue.')
      } else {
        setError(err.message || 'Something went wrong.')
      }
    } finally {
      setIsLoading(false)
      setLoadingStage('')
    }
  }, [isLoading, convId, navigate, animateStages, isAuthenticated, openAuthModal])

  useEffect(() => () => clearInterval(stageTimerRef.current), [])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 && !isLoading ? (
          <ChatEmptyState onSuggestion={handleSend} />
        ) : (
          <div className="max-w-3xl mx-auto py-4 pb-2">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <AgentTyping stage={loadingStage} />}
            {error && (
              <div className="mx-4 my-3 flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl animate-fade-in">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {error.includes('expired') || error.includes('Authentication')
                      ? error
                      : error.includes('Failed to fetch') || error.includes('Network')
                        ? 'Clario is temporarily unavailable. Please check your connection and try again.'
                        : error.includes('timeout') || error.includes('Timeout')
                          ? 'The request took longer than expected. Please try again.'
                          : error}
                  </p>
                  {(error.includes('expired') || error.includes('Authentication')) && (
                    <button
                      onClick={() => openAuthModal('Sign in to continue chatting with Clario.')}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <LogIn size={13} />
                      Sign In Now
                    </button>
                  )}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Guest banner if unauthenticated */}
      {!isAuthenticated && (
        <div className="bg-brand-50/80 dark:bg-brand-950/40 border-t border-brand-100 dark:border-brand-900/40 px-4 py-2 flex items-center justify-between text-xs text-brand-900 dark:text-brand-300">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-brand-600 dark:text-brand-400" />
            <span>Sign in to chat with Clario and save your conversations.</span>
          </div>
          <button
            onClick={() => openAuthModal('Sign in to start your conversation.')}
            className="font-medium underline hover:text-brand-700 dark:hover:text-brand-200"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Composer */}
      <ChatComposer onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}