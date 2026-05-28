import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function PrivateChatPage() {
  const { roomId } = useParams()
  const { socket, username, privateMessages, setPrivateMessages } = useApp()
  const [input, setInput] = useState('')
  const [challengeFrom, setChallengeFrom] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    socket.on('new-private-message', (payload) => {
      setPrivateMessages((prev) => [...prev, payload])
    })

    socket.on('game-challenge', ({ from, roomName }) => {
      setChallengeFrom({ from, roomName })
    })

    socket.on('game-start', ({ roomName }) => {
      navigate(`/game/${roomName}`)
    })

    return () => {
      socket.off('new-private-message')
      socket.off('game-challenge')
      socket.off('game-start')
    }
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    socket.emit('private-message', { roomName: roomId, from: username, text: input })
    setInput('')
  }

  const handleChallenge = () => {
    socket.emit('send-challenge', { roomName: roomId, from: username })
  }

  const handleAccept = () => {
    socket.emit('accept-challenge', { roomName: challengeFrom.roomName })
    setChallengeFrom(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-100 flex justify-between items-center">
        <h2 className="font-bold">Obrolan Pribadi</h2>
        <button className="btn btn-warning btn-sm" onClick={handleChallenge}>
          Unjuk Bakat
        </button>
      </div>

      {/* Challenge notification */}
      {challengeFrom && (
        <div className="alert alert-info mx-4 mt-2 flex justify-between">
          <span>⚔️ <strong>{challengeFrom.from}</strong> menantangmu!</span>
          <button className="btn btn-success btn-sm" onClick={handleAccept}>
            Terima
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {privateMessages.map((msg, i) => (
          <div key={i} className={`chat ${msg.from === username ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-header text-xs opacity-50">{msg.from}</div>
            <div className={`chat-bubble ${msg.from === username ? 'chat-bubble-primary' : ''}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
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
    </div>
  )
}