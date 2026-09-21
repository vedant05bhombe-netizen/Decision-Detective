import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('dd_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('dd_token'))

  const login = (userData, jwt) => {
    localStorage.setItem('dd_token', jwt)
    localStorage.setItem('dd_user', JSON.stringify(userData))
    setToken(jwt)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('dd_token')
    localStorage.removeItem('dd_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
