import { useApp } from '../../context/AppContext'

export default function Navbar() {
    const { username } = useApp()

    return (
        <div className="px-6 py-3 flex items-center justify-between border-b border-white/10"
            style={{background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)'}}>
            <div className="flex items-center gap-2">
                
                <span className="font-arcade text-sm" style={{color: 'var(--neon-blue)', textShadow: '0 0 10px var(--neon-blue)'}}>
                    MBG
                </span>
                {/* <span className="text-xl">✂️🪨📄</span> */}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10"
                style={{background: 'rgba(255,255,255,0.05)'}}>
                <span className="text-sm">👤</span>
                <span className="text-sm font-bold" style={{color: 'var(--neon-green)'}}>
                    {username}
                </span>
            </div>
        </div>
    )
}