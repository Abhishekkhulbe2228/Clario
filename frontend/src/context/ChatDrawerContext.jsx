import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ChatDrawerContext = createContext(null)

export function ChatDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('sources') // 'sources' | 'trace'
  const [activeMessage, setActiveMessage] = useState(null)

  const openDrawer = useCallback((tab, message) => {
    if (tab) setActiveTab(tab)
    if (message) setActiveMessage(message)
    setIsOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeDrawer])

  const value = {
    isOpen,
    activeTab,
    activeMessage,
    openDrawer,
    closeDrawer,
    setActiveTab,
  }

  return (
    <ChatDrawerContext.Provider value={value}>
      {children}
    </ChatDrawerContext.Provider>
  )
}

export function useChatDrawer() {
  const context = useContext(ChatDrawerContext)
  if (!context) {
    throw new Error('useChatDrawer must be used within a ChatDrawerProvider')
  }
  return context
}
