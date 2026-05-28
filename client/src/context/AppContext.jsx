import { createContext, useState, useContext, useEffect } from 'react'
import { socket } from '../socket/socket'

export const AppContext = createContext()

export default function AppProvider({ children }) {
    const [username, setUsername] = useState(sessionStorage.getItem('username') || '')
    const [onlineUsers, setOnlineUsers] = useState([])
    const [globalMessages, setGlobalMessages] = useState([])
    const [privateMessages, setPrivateMessages] = useState([])
    const [playerHistory, setPlayerHistory] = useState([])
    const [unreadMessages, setUnreadMessages] = useState({})

    useEffect(() => {
        const savedUsername = sessionStorage.getItem('username')
        if (savedUsername) {
            socket.connect()
            socket.emit('join-user', savedUsername)
        }

        socket.on('new-message', (payload) => {
            setGlobalMessages((prev) => [...prev, payload])
        })

        socket.on('new-private-message', (payload) => {
            setPrivateMessages((prev) => [...prev, payload])
            const currentUsername = sessionStorage.getItem('username')
            if (payload.from !== currentUsername) {
                const currentPath = window.location.pathname
                const isInRoom = currentPath === `/chat/${payload.roomName}`
                if (!isInRoom) {
                    setUnreadMessages((prev) => ({
                        ...prev,
                        [payload.roomName]: (prev[payload.roomName] || 0) + 1
                    }))
                }
            }
        })

        socket.on('online-users', (users) => {
            setOnlineUsers(users)
            const currentUsername = sessionStorage.getItem('username')
            if (currentUsername) {
                users.forEach(user => {
                    if (user.username !== currentUsername) {
                        const roomId = [currentUsername, user.username].sort().join('_')
                        socket.emit('join-room', roomId)
                    }
                })
            }
        })

        return () => {
            socket.off('online-users')
            socket.off('new-message')
            socket.off('new-private-message')
        }
    }, [])

    return (
        <AppContext.Provider value={{
            username,
            setUsername,
            onlineUsers,
            setOnlineUsers,
            globalMessages,
            setGlobalMessages,
            privateMessages,
            setPrivateMessages,
            playerHistory,
            setPlayerHistory,
            unreadMessages,
            setUnreadMessages,
            socket
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    return useContext(AppContext)
}