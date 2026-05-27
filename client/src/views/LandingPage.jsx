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
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h1 className="text-3xl">Gunting Batu Kertas</h1>
                    <h2 className="text-xl font-bold">MBG</h2>
                    <p className="text-sm text-gray-400">Mengobrol Bersama & Gaming</p>

                    <div className="form-control w-full mt-4">
                        <label className="label">
                            <span className="label-text">Masukkan Username</span>
                        </label>
                        <input
                            type="text"
                            placeholder="contoh: priasolo11"
                            className="input input-bordered w-full"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        {error && <p className="text-error text-sm mt-1">{error}</p>}
                    </div>

                    <button className="btn btn-primary w-full mt-2" onClick={handleJoin}>
                        Masuk
                    </button>
                </div>
            </div>
        </div>
    )
}