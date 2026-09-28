import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import ChatPage from './pages/Chat.jsx'
import ConversationsPage from './pages/Conversations.jsx'
import ConversationView from './pages/ConversationView.jsx'
import DocumentsPage from './pages/Documents.jsx'
import ActivityPage from './pages/Activity.jsx'
import AdminPage from './pages/Admin.jsx'
import SettingsPage from './pages/Settings.jsx'
import { getTheme } from './utils/storage.js'

export default function App() {
  // Apply saved theme on mount
  useEffect(() => {
    const t = getTheme()
    if (t === 'dark') document.documentElement.classList.add('dark')
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat/:id" element={<ChatPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route path="/conversations/:id" element={<ConversationView />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  )
}
