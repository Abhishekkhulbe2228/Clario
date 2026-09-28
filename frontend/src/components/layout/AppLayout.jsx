import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import AuthModal from '../auth/AuthModal.jsx'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleNewChat = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>

      {/* Global authentication modal */}
      <AuthModal />
    </div>
  )
}
