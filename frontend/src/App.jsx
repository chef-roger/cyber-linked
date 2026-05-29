import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import AuthPage from './pages/AuthPage'
import SearchPage from './pages/SearchPage'
import FriendsPage from './pages/FriendsPage'
import Layout from './components/Layout'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="boot-screen"><span>INITIALIZING NEURAL LINK...</span></div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/friends" /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><SocketProvider><Layout /></SocketProvider></ProtectedRoute>}>
        <Route index element={<Navigate to="/friends" />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="friends/:chatId" element={<FriendsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/friends" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
