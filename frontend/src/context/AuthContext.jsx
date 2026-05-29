import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const BASE_URL = import.meta.env.VITE_API_URL || ''
const API = axios.create({ baseURL: `${BASE_URL}/api` })

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('cl_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cl_token')
    if (token) {
      API.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem('cl_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const r = await API.post('/auth/login', { email, password })
    localStorage.setItem('cl_token', r.data.token)
    setUser(r.data.user)
    return r.data
  }

  const register = async (username, email, password) => {
    const r = await API.post('/auth/register', { username, email, password })
    localStorage.setItem('cl_token', r.data.token)
    setUser(r.data.user)
    return r.data
  }

  const logout = async () => {
    try { await API.post('/auth/logout') } catch {}
    localStorage.removeItem('cl_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, API }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { API }
