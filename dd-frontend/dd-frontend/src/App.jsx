import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login    from './pages/Login'
import Register from './pages/Register'
import Chat     from './pages/Chat'
import Upload   from './pages/Upload'
import Dashboard from './pages/Dashboard'
import Layout   from './components/Layout'

function Protected({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="grain" />
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index             element={<Navigate to="/chat" replace />} />
            <Route path="chat"       element={<Chat />} />
            <Route path="upload"     element={<Upload />} />
            <Route path="dashboard"  element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
