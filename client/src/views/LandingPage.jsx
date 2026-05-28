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
        <div className="min-h-screen flex items-center justify-center bg-base-300">
            <div className="card w-200 h-100 bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h1 className="text-5xl font-bold">𝐒𝐄𝐋𝐀𝐌𝐀𝐓 𝐃𝐀𝐓𝐀𝐍𝐆 𝐃𝐈 𝐌𝐁𝐆</h1>
                    <h2 className="text-3xl font-bold">💬 𝐌𝐞𝐧𝐠𝐨𝐛𝐫𝐨𝐥 𝐁𝐞𝐫𝐬𝐚𝐦𝐚 & 𝐆𝐚𝐦𝐢𝐧𝐠 🎮</h2>
                    {/* <h3 className="text-xl">𝐌𝐞𝐧𝐠𝐨𝐛𝐫𝐨𝐥 𝐁𝐞𝐫𝐬𝐚𝐦𝐚 & 𝐆𝐚𝐦𝐢𝐧𝐠</h3> */}
                    <p className="text-sm text-gray-400">Tempatnya ngobrol dan main bareng temen kamu!</p>
                    <div className="form-control w-full mt-4">
                        <label className="label w-full pb-2">
                            <span className="label-text w-full text-left">𝘚𝘪𝘢𝘱𝘢 𝘱𝘢𝘯𝘨𝘨𝘪𝘭𝘢𝘯𝘮𝘶?</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan Username..."
                            className="input input-bordered w-full"
                            value={inputUsername}
                            onChange={(e) => setInputUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        {error && <p className="text-error text-sm mt-1">{error}</p>}
                    </div>

                    <button className="btn btn-primary w-full mt-2" onClick={handleJoin}>
                        Join Obrolan
                    </button>
                </div>
            </div>
        </div>
    )
}