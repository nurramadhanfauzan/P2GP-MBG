import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function GlobalChatPage() {
    const { socket, username, onlineUsers, setOnlineUsers, globalMessages, setGlobalMessages } = useApp()
    const [input, setInput] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        socket.on('online-users', (users) => {
            setOnlineUsers(users)
        })

        socket.on('new-message', (payload) => {
            setGlobalMessages((prev) => [...prev, payload])
        })

        return () => {
            socket.off('online-users')
            socket.off('new-message')
        }
    }, [])

    const handleSend = () => {
        if (!input.trim()) return
        socket.emit('send-message', { from: username, text: input })
        setInput('')
    }

    const handleClickUser = (targetUser) => {
        const roomId = [username, targetUser].sort().join('_')
        socket.emit('join-room', roomId)
        navigate(`/chat/${roomId}`)
    }

    return (
        <div className="flex w-full h-full">
            {/* Sidebar */}
            <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="font-bold">Pengguna Aktif</h2>
                </div>
                <ul className="menu flex-1 overflow-y-auto p-2">
                    {onlineUsers.filter(u => u.username !== username).map((user) => (
                        <li key={user.socketId}>
                            <button onClick={() => handleClickUser(user.username)} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
                                {user.username}
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="p-4 border-t border-base-300">
                    <button className="btn btn-accent w-full btn-sm" onClick={() => navigate('/game/ai')}>
                        Duel Lawan AI
                    </button>
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col">
                <div className="p-4 border-b border-base-300 bg-base-100">
                    <h2 className="font-bold">Obrolan Global</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {globalMessages.map((msg, i) => (
                        <div key={i} className={`chat ${msg.from === username ? 'chat-end' : 'chat-start'}`}>
                            <div className="chat-header text-xs opacity-50">{msg.from}</div>
                            <div className={`chat-bubble ${msg.from === username ? 'chat-bubble-primary' : ''}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-base-300 flex gap-2">
                    <input
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder="Ketik pesan..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={handleSend}>Kirim</button>
                </div>
            </main>
        </div>
    )
}