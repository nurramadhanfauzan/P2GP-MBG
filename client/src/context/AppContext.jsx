import { createContext, useState, useContext } from 'react'
import { socket } from '../socket/socket'

export const AppContext = createContext()

export default function AppProvider({ children }) {
    const [username, setUsername] = useState('')
    const [onlineUsers, setOnlineUsers] = useState([])
    const [globalMessages, setGlobalMessages] = useState([])

    return (
        <AppContext.Provider value={{
            username,
            setUsername,
            onlineUsers,
            setOnlineUsers,
            globalMessages,
            setGlobalMessages,
            socket
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    return useContext(AppContext)
}