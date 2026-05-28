import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function PrivateChatPage() {
  const { roomId } = useParams()
  const { socket, username, privateMessages, setUnreadMessages } = useApp()
  const opponentName = roomId.split('_').find(name => name !== username)
  const [input, setInput] = useState('')
  const [challengeFrom, setChallengeFrom] = useState(null)
  const [challengeSent, setChallengeSent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    socket.emit('join-room', roomId)
    setUnreadMessages((prev) => ({ ...prev, [roomId]: 0 }))

    socket.on('game-challenge', ({ from, roomName }) => {
      setChallengeFrom({ from, roomName })
    })

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

    return () => {
      socket.off('game-challenge')
      socket.off('game-start')
      socket.off('challenge-sent')
      socket.off('challenge-cancelled')
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
    socket.emit('accept-challenge', { roomName: challengeFrom.roomName })
    setChallengeFrom(null)
  }

  const handleCancel = () => {
    socket.emit('cancel-challenge', { roomName: roomId })
    setChallengeSent(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/chat')}>
            ❮ 𝐊𝐞𝐦𝐛𝐚𝐥𝐢
          </button>
          <h2 className="font-bold">💬 {opponentName}</h2>
        </div>
        <button className="btn btn-warning btn-sm" onClick={handleChallenge}>
          𝐔𝐧𝐣𝐮𝐤 𝐁𝐚𝐤𝐚𝐭
        </button>
      </div>

      {/* Notifikasi untuk yang menantang */}
      {challengeSent && (
        <div className="alert alert-warning mx-4 mt-2 flex justify-between shrink-0">
          <span>⚔️ Kamu menantang <strong>{opponentName}</strong>!</span>
          <button className="btn btn-error btn-sm" onClick={handleCancel}>
            Batalkan
          </button>
        </div>
      )}

      {/* Notifikasi untuk yang ditantang */}
      {challengeFrom && (
        <div className="alert alert-info mx-4 mt-2 flex justify-between shrink-0">
          <span>⚔️ <strong>{challengeFrom.from}</strong> menantangmu!</span>
          <button className="btn btn-success btn-sm" onClick={handleAccept}>
            Terima
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {roomMessages.map((msg, i) => (
          <div key={i} className={`chat ${msg.from === username ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-header text-xs opacity-50">{msg.from}</div>
            <div className={`chat-bubble ${msg.from === username ? 'chat-bubble-primary' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
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
    </div>
  )
}