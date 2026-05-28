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

  useEffect(() => {
    if (!isAiMode) {
      socket.on('game-result', ({ moves, winner }) => {
        const oppUsername = Object.keys(moves).find(u => u !== username)
        setOpponentMove(moves[oppUsername])
        if (winner === 'draw') setResult('draw')
        else if (winner === username) setResult('win')
        else setResult('lose')
        setWaiting(false)
      })
    }

    return () => {
      socket.off('game-result')
    }
  }, [isAiMode])

  const handleMove = async (move) => {
    setMyMove(move)
    setPlayerHistory((prev) => [...prev, move])

    if (isAiMode) {
      setWaiting(true)
      try {
        socket.emit('fight-ai', move)
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
    setMyMove(null)
    setOpponentMove(null)
    setResult(null)
    setAiHint('')
    setWaiting(false)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <h2 className="text-2xl font-bold">
        {isAiMode ? '🤖 Lawan AI' : '⚔️ Lawan Player'}
      </h2>

      {/* Pilih move */}
      {!result && (
        <>
          <p className="text-lg">Pilih gerakanmu!</p>
          <div className="flex gap-4">
            {MOVES.map((m) => (
              <button
                key={m.id}
                className={`btn btn-lg flex-col h-28 w-28 text-4xl ${myMove === m.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleMove(m.id)}
                disabled={!!myMove}
              >
                {m.emoji}
                <span className="text-sm mt-1">{m.label}</span>
              </button>
            ))}
          </div>
          {waiting && <p className="animate-pulse text-gray-400">Menunggu lawan...</p>}
        </>
      )}

      {/* Hasil */}
      {result && (
        <div className="flex flex-col items-center gap-4">
          <h3 className={`text-3xl font-bold ${result === 'win' ? 'text-success' : result === 'lose' ? 'text-error' : 'text-warning'}`}>
            {result === 'win' ? '🎉 Menang!' : result === 'lose' ? '😢 Kalah!' : '🤝 Seri!'}
          </h3>

          <div className="flex items-center gap-8 text-6xl">
            <div className="flex flex-col items-center">
              <span>{MOVE_EMOJI[myMove]}</span>
              <p className="text-sm mt-2">Kamu</p>
            </div>
            <span className="text-2xl text-gray-400">vs</span>
            <div className="flex flex-col items-center">
              <span>{MOVE_EMOJI[opponentMove]}</span>
              <p className="text-sm mt-2">{isAiMode ? 'AI' : 'Lawan'}</p>
            </div>
          </div>

          {isAiMode && aiHint && (
            <div className="alert alert-info max-w-sm">
              <span>🤖 {aiHint}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handlePlayAgain}>Main Lagi?</button>
            <button className="btn btn-ghost" onClick={() => navigate('/chat')}>Kembali ke Obrolan</button>
          </div>
        </div>
      )}
    </div>
  )
}