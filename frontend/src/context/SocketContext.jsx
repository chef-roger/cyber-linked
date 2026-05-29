import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [onlineUsers, setOnlineUsers] = useState({})
  const [typingUsers, setTypingUsers] = useState({})

  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('cl_token')
    const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] })
    socketRef.current = socket

    socket.on('user:status', ({ userId, status }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: status }))
    })

    socket.on('typing:start', ({ userId }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: true }))
    })

    socket.on('typing:stop', ({ userId }) => {
      setTypingUsers(prev => { const n = { ...prev }; delete n[userId]; return n })
    })

    return () => socket.disconnect()
  }, [user])

  const sendMessage = (receiverId, content, onReceived) => {
    if (!socketRef.current) return
    socketRef.current.emit('message:send', { receiverId, content })
    socketRef.current.once('message:received', onReceived)
  }

  const onMessage = (handler) => {
    socketRef.current?.on('message:received', handler)
    return () => socketRef.current?.off('message:received', handler)
  }

  const startTyping = (receiverId) => socketRef.current?.emit('typing:start', { receiverId })
  const stopTyping = (receiverId) => socketRef.current?.emit('typing:stop', { receiverId })

  return (
    <SocketContext.Provider value={{ onlineUsers, typingUsers, sendMessage, onMessage, startTyping, stopTyping, socket: socketRef }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
