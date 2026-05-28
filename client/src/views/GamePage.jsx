import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MOVES = [
  { id: 'rock', emoji: '🪨', label: 'Batu' },
  { id: 'paper', emoji: '📄', label: 'Kertas' },
  { id: 'scissors', emoji: '✂️', label: 'Gunting' },
]

const MOVE_EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' }

export default function GamePage() {
  const { roomId } = useParams()
  const { socket, username, playerHistory, setPlayerHistory } = useApp()
  const isAiMode = roomId === 'ai'
  const navigate = useNavigate()

  const [myMove, setMyMove] = useState(null)
  const [opponentMove, setOpponentMove] = useState(null)
  const [result, setResult] = useState(null)
  const [aiHint, setAiHint] = useState('')
  const [waiting, setWaiting] = useState(false)
  const [opponentLeft, setOpponentLeft] = useState(false)

  useEffect(() => {
    if (!isAiMode) {
      socket.emit('join-room', roomId)

      socket.on('game-result', ({ moves, winner }) => {
        const oppUsername = Object.keys(moves).find(u => u !== username)
        setOpponentMove(moves[oppUsername])
        if (winner === 'draw') setResult('draw')
        else if (winner === username) setResult('win')
        else setResult('lose')
        setWaiting(false)
      })

      socket.on('opponent-left', () => {
        setOpponentLeft(true)
        setResult('win')
        setWaiting(false)
      })
    }

    return () => {
      socket.off('game-result')
      socket.off('opponent-left')
    }
  }, [isAiMode])

  const handleMove = async (move) => {
    setMyMove(move)
    setPlayerHistory((prev) => [...prev, move])

    if (isAiMode) {
      setWaiting(true)
      try {
        socket.emit('fight-ai', { move, playerHistory })
        socket.once('ai-result', ({ playerMove, aiChoice, hint }) => {
          setOpponentMove(aiChoice)
          setAiHint(hint || '')
          if (playerMove === aiChoice) setResult('draw')
          else if (
            (playerMove === 'rock' && aiChoice === 'scissors') ||
            (playerMove === 'paper' && aiChoice === 'rock') ||
            (playerMove === 'scissors' && aiChoice === 'paper')
          ) setResult('win')
          else setResult('lose')
          setWaiting(false)
        })
      } catch (err) {
        console.error(err)
        setWaiting(false)
      }
    } else {
      setWaiting(true)
      socket.emit('game-move', { roomName: roomId, move, username })
    }
  }

  const handlePlayAgain = () => {
    if (!isAiMode) {
      socket.emit('send-challenge', { roomName: roomId, from: username, to: '' })
    }
    setMyMove(null)
    setOpponentMove(null)
    setResult(null)
    setAiHint('')
    setWaiting(false)
    setOpponentLeft(false)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden arcade-bg grid-bg">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center shrink-0"
        style={{ background: 'rgba(10,10,15,0.8)' }}>
        <button className="px-3 py-1.5 rounded-xl text-xs font-arcade border border-white/10 text-gray-400 hover:text-white transition-all mr-3"
          onClick={() => {
            if (!isAiMode) socket.emit('leave-game', { roomName: roomId })
            navigate(-1)
          }}>
          ❮ BACK
        </button>
        <h2 className="font-arcade text-xs" style={{ color: isAiMode ? 'var(--neon-pink)' : 'var(--neon-yellow)' }}>
          {isAiMode ? '🤖 LAWAN AI' : '⚔️ LAWAN PLAYER'}
        </h2>
      </div>

      {/* Konten */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto">

        {/* Notif lawan keluar */}
        {opponentLeft && (
          <div className="px-6 py-3 rounded-xl border text-sm font-bold"
            style={{ background: 'rgba(255,230,0,0.1)', borderColor: 'var(--neon-yellow)', color: 'var(--neon-yellow)' }}>
            🚪 Lawan meninggalkan game! Kamu menang!
          </div>
        )}

        {/* Pilih move */}
        {!result && (
          <>
            <p className="font-arcade text-xs text-gray-400">PILIH GERAKANMU!</p>
            <div className="flex gap-4">
              {MOVES.map((m) => (
                <button
                  key={m.id}
                  className="flex flex-col items-center justify-center h-28 w-28 rounded-2xl text-4xl transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: myMove === m.id
                      ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-green))'
                      : 'rgba(255,255,255,0.05)',
                    border: myMove === m.id
                      ? 'none'
                      : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: myMove === m.id ? '0 0 25px rgba(0,212,255,0.5)' : 'none'
                  }}
                  onClick={() => handleMove(m.id)}
                  disabled={!!myMove}
                >
                  {m.emoji}
                  <span className="text-xs font-arcade mt-1 text-white">{m.label}</span>
                </button>
              ))}
            </div>
            {waiting && (
              <p className="font-arcade text-xs animate-pulse-neon" style={{ color: 'var(--neon-blue)' }}>
                MENUNGGU LAWAN...
              </p>
            )}
          </>
        )}

        {/* Hasil */}
        {result && (
          <div className="flex flex-col items-center gap-6">
            <h3 className="font-arcade text-2xl"
              style={{
                color: result === 'win' ? 'var(--neon-green)' : result === 'lose' ? 'var(--neon-pink)' : 'var(--neon-yellow)',
                textShadow: `0 0 20px currentColor`
              }}>
              {result === 'win' ? '🎉 MENANG!' : result === 'lose' ? '😢 KALAH!' : '🤝 SERI!'}
            </h3>

            <div className="flex items-center gap-8 text-6xl">
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(0,212,255,0.15)', border: '2px solid var(--neon-blue)' }}>
                  {MOVE_EMOJI[myMove]}
                </div>
                <span className="text-xs font-arcade text-gray-400">KAMU</span>
              </div>
              <span className="font-arcade text-base" style={{ color: 'var(--neon-yellow)' }}>VS</span>
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(255,45,120,0.15)', border: '2px solid var(--neon-pink)' }}>
                  {MOVE_EMOJI[opponentMove]}
                </div>
                <span className="text-xs font-arcade text-gray-400">{isAiMode ? 'AI' : 'LAWAN'}</span>
              </div>
            </div>

            {isAiMode && aiHint && (
              <div className="px-4 py-3 rounded-xl text-sm max-w-sm text-center border"
                style={{ background: 'rgba(0,212,255,0.1)', borderColor: 'var(--neon-blue)', color: 'var(--neon-blue)' }}>
                🤖 {aiHint}
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="px-4 py-2 rounded-xl font-arcade text-xs text-black font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--neon-green), var(--neon-blue))', boxShadow: '0 0 15px rgba(57,255,20,0.4)' }}
                onClick={handlePlayAgain}
              >
                MAIN LAGI
              </button>
              <button
                className="px-4 py-2 rounded-xl font-arcade text-xs border border-white/20 text-gray-400 hover:text-white transition-all"
                onClick={() => {
                  socket.emit('leave-game', { roomName: roomId })
                  navigate(-1)
                }}
              >
                ❮ KEMBALI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}