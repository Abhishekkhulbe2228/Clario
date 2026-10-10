import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import ChatPage from './pages/Chat.jsx'
import ConversationsPage from './pages/Conversations.jsx'
import ConversationView from './pages/ConversationView.jsx'
import DocumentsPage from './pages/Documents.jsx'
import ActivityPage from './pages/Activity.jsx'
import AdminPage from './pages/Admin.jsx'
import SettingsPage from './pages/Settings.jsx'
import AuthPage from './pages/Auth.jsx'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/RouteGuards.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { getTheme } from './utils/storage.js'

export default function App() {
  // Apply saved theme on mount
  useEffect(() => {
    const t = getTheme()
    if (t === 'dark') document.documentElement.classList.add('dark')
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public authentication routes */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
          </Route>

          {/* Protected workspace routes inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<ChatPage />} />
              <Route path="/chat/:id" element={<ChatPage />} />
              <Route path="/conversations" element={<ConversationsPage />} />
              <Route path="/conversations/:id" element={<ConversationView />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  )
}
