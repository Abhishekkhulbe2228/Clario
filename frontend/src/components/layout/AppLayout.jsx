import React, { useState, useCallback } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import ChatDrawer from '../chat/ChatDrawer.jsx'
import { ChatDrawerProvider } from '../../context/ChatDrawerContext.jsx'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleNewChat = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <ChatDrawerProvider>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex selection:bg-blue-500/20 selection:text-blue-500">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={handleNewChat}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {children || <Outlet />}
            <ChatDrawer />
          </main>
        </div>
      </div>
    </ChatDrawerProvider>
  )
}
