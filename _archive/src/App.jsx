import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authAPI } from './services/api'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import TrainerProfile from './pages/TrainerProfile'
import BookingsPage from './pages/BookingsPage'
import ChatPage from './pages/ChatPage'
import ChatRoom from './pages/ChatRoom'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookingFlow from './pages/BookingFlow'

function App() {
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('trainersapp_token')
      if (token) {
        try {
          const res = await authAPI.getMe()
          setCurrentUser(res.data)
        } catch (e) {
          localStorage.removeItem('trainersapp_token')
        }
      }
      setAuthLoading(false)
    }
    fetchUser()
  }, [])

  const login = (user, token) => {
    setCurrentUser(user)
    if (token) {
      localStorage.setItem('trainersapp_token', token)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('trainersapp_token')
  }

  const hideBottomNav = ['/login', '/register', '/booking'].some(
    path => location.pathname.startsWith(path)
  ) || location.pathname.includes('/chat/')

  if (authLoading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'var(--text-secondary)'}}>Loading...</div>
  }

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <div className="app">
      <div className="app__content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage user={currentUser} /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/trainer/:id" element={<ProtectedRoute><TrainerProfile user={currentUser} /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingsPage user={currentUser} /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage user={currentUser} /></ProtectedRoute>} />
          <Route path="/chat/:trainerId" element={<ProtectedRoute><ChatRoom user={currentUser} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage user={currentUser} onLogout={logout} /></ProtectedRoute>} />
          <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage onLogin={login} />} />
          <Route path="/register" element={currentUser ? <Navigate to="/" replace /> : <RegisterPage onLogin={login} />} />
          <Route path="/booking/:trainerId" element={<ProtectedRoute><BookingFlow user={currentUser} /></ProtectedRoute>} />
        </Routes>
      </div>
      {!hideBottomNav && currentUser && <BottomNav />}
    </div>
  )
}

export default App
