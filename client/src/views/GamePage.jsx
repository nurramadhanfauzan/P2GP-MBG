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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-100 flex items-center shrink-0">
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (!isAiMode) {
              socket.emit('leave-game', { roomName: roomId })
            }
            navigate(-1)
          }}>
            ❮ 𝐊𝐞𝐦𝐛𝐚𝐥𝐢
          </button>
          <h2 className="font-bold">
            {isAiMode ? '🤖 𝐋𝐚𝐰𝐚𝐧 𝐀𝐈' : '⚔️ 𝐋𝐚𝐰𝐚𝐧 𝐏𝐥𝐚𝐲𝐞𝐫'}
          </h2>
        </div>
      </div>

      {/* Konten game */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto">

        {/* Notifikasi lawan keluar */}
        {opponentLeft && (
          <div className="alert alert-warning max-w-sm shrink-0">
            <span>Lawan meninggalkan game!</span>
          </div>
        )}

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
              <button className="btn btn-primary" onClick={handlePlayAgain}>𝐌𝐚𝐢𝐧 𝐋𝐚𝐠𝐢</button>
              <button className="btn btn-ghost" onClick={() => {
                socket.emit('leave-game', { roomName: roomId })
                navigate(-1)
              }}>
                ❮ 𝐊𝐞𝐦𝐛𝐚𝐥𝐢 𝐤𝐞 𝐎𝐛𝐫𝐨𝐥𝐚𝐧
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}