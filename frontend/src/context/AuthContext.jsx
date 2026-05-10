import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch {
      // try refresh
      try {
        const refresh = localStorage.getItem('refreshToken')
        if (!refresh) throw new Error()
        const r = await api.post('/auth/refresh', { refreshToken: refresh })
        localStorage.setItem('accessToken',  r.data.accessToken)
        localStorage.setItem('refreshToken', r.data.refreshToken)
        const me = await api.get('/auth/me')
        setUser(me.data)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  // Re-sync user data on window focus (catches admin premium toggle etc.)
  useEffect(() => {
    const onFocus = () => { if (localStorage.getItem('accessToken')) loadUser() }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadUser])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('accessToken',  res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    localStorage.setItem('accessToken',  res.data.accessToken)
    localStorage.setItem('refreshToken', res.data.refreshToken)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try { await api.post('/auth/logout', { refreshToken }) } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const isAdmin  = user?.role === 'admin'
  const isLeader = ['admin','leader'].includes(user?.role)
  const isMember = ['admin','leader','member'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loadUser, refreshUser: loadUser, isAdmin, isLeader, isMember }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
