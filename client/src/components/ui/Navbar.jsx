import { useApp } from '../../context/AppContext'

export default function Navbar() {
    const { username } = useApp()

    return (
        <div className="navbar bg-base-100 border-b border-base-300">
            <div className="flex-1">
                <span className="text-xl font-bold pl-4">𝐌𝐁𝐆</span>
            </div>
            <div className="flex-none items-center gap-2">
                <span className="text-sm text-gray-400">𝙷𝚊𝚕𝚘,</span>
                <span className="text-lg font-bold text-primary">👤 {username}</span>
            </div>
        </div>
    )
}