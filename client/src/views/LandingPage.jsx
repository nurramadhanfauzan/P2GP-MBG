import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LandingPage() {
    const [inputUsername, setInputUsername] = useState('')
    const [error, setError] = useState('')
    const { setUsername, socket } = useApp()
    const navigate = useNavigate()

    const handleJoin = () => {
        if (!inputUsername.trim()) {
            setError('Username tidak boleh kosong!')
            return
        }

        socket.connect()
        socket.emit('join-user', inputUsername)

        socket.once('username-error', (msg) => {
            setError(msg)
            socket.disconnect()
        })

        socket.once('online-users', () => {
            setUsername(inputUsername)
            sessionStorage.setItem('username', inputUsername)
            navigate('/chat')
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center arcade-bg grid-bg relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 blur-xl" style={{background: 'var(--neon-pink)'}}></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full opacity-20 blur-xl" style={{background: 'var(--neon-blue)'}}></div>
            <div className="absolute top-1/2 left-5 w-20 h-20 rounded-full opacity-10 blur-xl" style={{background: 'var(--neon-green)'}}></div>

            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center animate-float">
                    <div className="text-6xl mb-2">✂️🪨📄</div>
                    <h1 className="font-arcade text-2xl mb-1" style={{color: 'var(--neon-blue)', textShadow: '0 0 20px var(--neon-blue)'}}>
                        MBG
                    </h1>
                    <p className="text-xs font-arcade" style={{color: 'var(--neon-pink)'}}>
                        Mengobrol Bersama & Gaming
                    </p>
                </div>

                {/* Card */}
                <div className="w-full rounded-2xl p-6 border border-white/10 backdrop-blur-sm" 
                    style={{background: 'rgba(255,255,255,0.05)', boxShadow: '0 0 40px rgba(0,212,255,0.15)'}}>
                    
                    <p className="text-center text-gray-400 text-sm mb-6">
                        Tempatnya ngobrol dan main bareng temen kamu! 🎮
                    </p>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-arcade mb-2" style={{color: 'var(--neon-green)'}}>
                                SIAPA PANGGILANMU?
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan username..."
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
                                style={{caretColor: 'var(--neon-blue)'}}
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                            {error && <p className="text-xs mt-2" style={{color: 'var(--neon-pink)'}}>{error}</p>}
                        </div>

                        <button
                            className="w-full py-3 rounded-xl font-arcade text-sm text-black font-bold transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-green))',
                                boxShadow: '0 0 20px rgba(0,212,255,0.5)'
                            }}
                            onClick={handleJoin}
                        >
                            MASUK! 🚀
                        </button>
                    </div>
                </div>

                <p className="text-xs text-gray-600 font-arcade">v1.0.0 — P2GP MBG</p>
            </div>
        </div>
    )
}