import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function GlobalChatPage() {
    const { socket, username, onlineUsers, globalMessages, unreadMessages, setUnreadMessages, incomingChallenge, setIncomingChallenge } = useApp()
    const [input, setInput] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        socket.emit('request-online-users')

        return () => {
            // kosong
        }
    }, [])

    const handleAcceptChallenge = () => {
        socket.emit('accept-challenge', { roomName: incomingChallenge.roomName })
        setIncomingChallenge(null)
        navigate(`/game/${incomingChallenge.roomName}`)
    }

    const handleRejectChallenge = () => {
        socket.emit('reject-challenge', { roomName: incomingChallenge.roomName })
        setIncomingChallenge(null)
    }

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
        <div className="flex w-full h-full overflow-hidden arcade-bg relative">
            {/* Notifikasi tantangan global */}
            {incomingChallenge && (
                <div className="absolute top-16 right-4 z-50 p-4 rounded-xl border flex flex-col gap-2 shadow-2xl"
                    style={{ background: 'rgba(10,10,15,0.95)', borderColor: 'var(--neon-yellow)', boxShadow: '0 0 20px rgba(255,230,0,0.3)', minWidth: '280px' }}>
                    <p className="font-arcade text-xs" style={{ color: 'var(--neon-yellow)' }}>⚔️ TANTANGAN MASUK!</p>
                    <p className="text-sm text-white">
                        <strong style={{ color: 'var(--neon-blue)' }}>{incomingChallenge.from}</strong> menantangmu bermain Suit!
                    </p>
                    <div className="flex gap-2 mt-1">
                        <button
                            className="flex-1 py-1.5 rounded-lg font-arcade text-xs text-black font-bold"
                            style={{ background: 'var(--neon-green)', boxShadow: '0 0 10px rgba(57,255,20,0.4)' }}
                            onClick={handleAcceptChallenge}
                        >
                            TERIMA
                        </button>
                        <button
                            className="flex-1 py-1.5 rounded-lg font-arcade text-xs text-black font-bold"
                            style={{ background: 'var(--neon-pink)', boxShadow: '0 0 10px rgba(255,45,120,0.4)' }}
                            onClick={handleRejectChallenge}
                        >
                            TOLAK
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="w-64 flex flex-col h-full border-r border-white/10"
                style={{ background: 'rgba(10,10,15,0.8)' }}>
                <div className="p-4 border-b border-white/10">
                    <h2 className="font-arcade text-xs" style={{ color: 'var(--neon-green)' }}>
                        🟢 ONLINE
                    </h2>
                </div>
                <ul className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
                    {onlineUsers.filter(u => u.username !== username).map((user) => {
                        const roomId = [username, user.username].sort().join('_')
                        const unread = unreadMessages[roomId] || 0
                        return (
                            <li key={user.socketId}>
                                <button
                                    onClick={() => handleClickUser(user.username)}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full animate-pulse-neon" style={{ background: 'var(--neon-green)' }}></span>
                                        <span className="text-sm font-semibold text-white">{user.username}</span>
                                    </div>
                                    {unread > 0 && (
                                        <span className="text-xs font-arcade px-1.5 py-0.5 rounded-full text-black"
                                            style={{ background: 'var(--neon-pink)', boxShadow: '0 0 8px var(--neon-pink)' }}>
                                            {unread}
                                        </span>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                    {onlineUsers.filter(u => u.username !== username).length === 0 && (
                        <p className="text-xs text-gray-600 text-center mt-4">Belum ada yang online...</p>
                    )}
                </ul>
                <div className="p-4 border-t border-white/10">
                    <button
                        className="w-full py-2 rounded-xl font-arcade text-xs text-black font-bold transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-yellow))', boxShadow: '0 0 15px rgba(255,45,120,0.4)' }}
                        onClick={() => navigate('/game/ai')}
                    >
                        🤖 SUIT VS AI
                    </button>
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-white/10 shrink-0" style={{ background: 'rgba(10,10,15,0.8)' }}>
                    <h2 className="font-arcade text-xs" style={{ color: 'var(--neon-blue)' }}>🌐 OBROLAN GLOBAL</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {globalMessages.map((msg, i) => (
                        <div key={i} className={`chat ${msg.from === username ? 'chat-end' : 'chat-start'}`}>
                            <div className="chat-header text-xs opacity-50 mb-1">{msg.from}</div>
                            <div className={`chat-bubble text-sm ${msg.from === username
                                ? 'text-black font-semibold'
                                : 'bg-white/10 text-white border border-white/10'
                                }`}
                                style={msg.from === username ? {
                                    background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-green))',
                                    boxShadow: '0 0 10px rgba(0,212,255,0.3)'
                                } : {}}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-white/10 flex gap-2 shrink-0" style={{ background: 'rgba(10,10,15,0.8)' }}>
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all text-sm"
                        placeholder="Ketik pesan..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        className="px-4 py-2 rounded-xl font-arcade text-xs text-black font-bold transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-green))', boxShadow: '0 0 15px rgba(0,212,255,0.4)' }}
                        onClick={handleSend}
                    >
                        KIRIM
                    </button>
                </div>
            </main>
        </div>
    )
}