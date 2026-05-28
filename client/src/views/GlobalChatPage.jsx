import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function GlobalChatPage() {
    const { socket, username, onlineUsers, globalMessages, unreadMessages, setUnreadMessages } = useApp()
    const [input, setInput] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        socket.emit('request-online-users')

        return () => {
            // kosong
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
        setUnreadMessages((prev) => ({ ...prev, [roomId]: 0 }))
        navigate(`/chat/${roomId}`)
    }

    return (
        <div className="flex w-full h-full overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col h-full">
                <div className="p-4 border-b border-base-300 shrink-0">
                    <h2 className="font-bold">𝐏𝐞𝐧𝐠𝐠𝐮𝐧𝐚 𝐀𝐤𝐭𝐢𝐟</h2>
                </div>
                <ul className="menu flex-1 overflow-y-auto p-2">
                    {onlineUsers.filter(u => u.username !== username).map((user) => {
                        const roomId = [username, user.username].sort().join('_')
                        const unread = unreadMessages[roomId] || 0
                        return (
                            <li key={user.socketId}>
                                <button onClick={() => handleClickUser(user.username)} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
                                        {user.username}
                                    </div>
                                    {unread > 0 && (
                                        <span className="badge badge-error badge-sm">{unread}</span>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
                <div className="p-4 border-t border-base-300 shrink-0">
                    <button className="btn btn-accent w-full btn-sm font-bold" onClick={() => navigate('/game/ai')}>
                        𝐒𝐮𝐢𝐭 𝐕𝐬 𝐀𝐈 🤖
                    </button>
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-base-300 bg-base-100 shrink-0">
                    <h2 className="font-bold">𝐎𝐛𝐫𝐨𝐥𝐚𝐧 𝐆𝐥𝐨𝐛𝐚𝐥</h2>
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
                <div className="p-4 border-t border-base-300 flex gap-2 shrink-0">
                    <input
                        type="text"
                        className="input input-bordered flex-1"
                        placeholder="Ketik pesan..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-primary" onClick={handleSend}>𝐊𝐢𝐫𝐢𝐦</button>
                </div>
            </main>
        </div>
    )
}