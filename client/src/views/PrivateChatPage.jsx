import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function PrivateChatPage() {
  const { roomId } = useParams()
  const { socket, username, privateMessages, setUnreadMessages, incomingChallenge, setIncomingChallenge } = useApp()
  const opponentName = roomId.split('_').find(name => name !== username)
  const [input, setInput] = useState('')
  const [challengeFrom, setChallengeFrom] = useState(null)
  const [challengeSent, setChallengeSent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    socket.emit('join-room', roomId)
    setUnreadMessages((prev) => ({ ...prev, [roomId]: 0 }))

    socket.on('game-start', ({ roomName }) => {
      navigate(`/game/${roomName}`)
    })

    socket.on('challenge-sent', () => {
      setChallengeSent(true)
    })

    socket.on('challenge-cancelled', () => {
      setChallengeFrom(null)
      setChallengeSent(false)
    })
    socket.on('challenge-rejected', () => {
      setChallengeSent(false)
    })

    return () => {
      socket.off('game-start')
      socket.off('challenge-sent')
      socket.off('challenge-cancelled')
      socket.off('challenge-rejected')
    }
  }, [])

  const roomMessages = privateMessages.filter(msg => msg.roomName === roomId)

  const handleSend = () => {
    if (!input.trim()) return
    socket.emit('private-message', { roomName: roomId, from: username, text: input })
    setInput('')
  }

  const handleChallenge = () => {
    socket.emit('send-challenge', { roomName: roomId, from: username, to: opponentName })
  }

  const handleAccept = () => {
    socket.emit('accept-challenge', { roomName: incomingChallenge.roomName })
    setIncomingChallenge(null)
  }

  const handleReject = () => {
    socket.emit('reject-challenge', { roomName: incomingChallenge.roomName })
    setIncomingChallenge(null)
  }

  const handleCancel = () => {
    socket.emit('cancel-challenge', { roomName: roomId })
    setChallengeSent(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden arcade-bg">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0"
        style={{ background: 'rgba(10,10,15,0.8)' }}>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl text-xs font-arcade transition-all hover:scale-105 border border-white/10 text-gray-400 hover:text-white"
            onClick={() => navigate('/chat')}>
            ❮ BACK
          </button>
          <h2 className="font-bold text-sm">💬 <span style={{ color: 'var(--neon-blue)' }}>{opponentName}</span></h2>
        </div>
        <button
          className="px-3 py-1.5 rounded-xl font-arcade text-xs text-black font-bold transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--neon-yellow), var(--neon-pink))', boxShadow: '0 0 10px rgba(255,230,0,0.3)' }}
          onClick={handleChallenge}
        >
          ⚔️ TANTANG
        </button>
      </div>

      {incomingChallenge && incomingChallenge.roomName === roomId && (
        <div className="mx-4 mt-2 p-3 rounded-xl flex justify-between items-center shrink-0 border"
          style={{ background: 'rgba(0,212,255,0.1)', borderColor: 'var(--neon-blue)' }}>
          <span className="text-sm">⚔️ <strong style={{ color: 'var(--neon-blue)' }}>{incomingChallenge.from}</strong> menantangmu!</span>
          <div className="flex gap-2">
            <button className="px-2 py-1 rounded-lg text-xs font-arcade"
              style={{ background: 'var(--neon-green)', color: 'black' }}
              onClick={handleAccept}>TERIMA</button>
            <button className="px-2 py-1 rounded-lg text-xs font-arcade"
              style={{ background: 'var(--neon-pink)', color: 'black' }}
              onClick={handleReject}>TOLAK</button>
          </div>
        </div>
      )}

      {/* Notifikasi challenger */}
      {challengeSent && (
        <div className="mx-4 mt-2 p-3 rounded-xl flex justify-between items-center shrink-0 border"
          style={{ background: 'rgba(255,230,0,0.1)', borderColor: 'var(--neon-yellow)' }}>
          <span className="text-sm">⚔️ Kamu menantang <strong style={{ color: 'var(--neon-yellow)' }}>{opponentName}</strong>!</span>
          <button className="px-2 py-1 rounded-lg text-xs font-arcade"
            style={{ background: 'var(--neon-pink)', color: 'black' }}
            onClick={handleCancel}>BATAL</button>
        </div>
      )}

      {/* Notifikasi yang ditantang */}
      {challengeFrom && (
        <div className="mx-4 mt-2 p-3 rounded-xl flex justify-between items-center shrink-0 border"
          style={{ background: 'rgba(0,212,255,0.1)', borderColor: 'var(--neon-blue)' }}>
          <span className="text-sm">⚔️ <strong style={{ color: 'var(--neon-blue)' }}>{challengeFrom.from}</strong> menantangmu!</span>
          <button className="px-2 py-1 rounded-lg text-xs font-arcade"
            style={{ background: 'var(--neon-green)', color: 'black' }}
            onClick={handleAccept}>TERIMA</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {roomMessages.map((msg, i) => (
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

      {/* Input */}
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
    </div>
  )
}