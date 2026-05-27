import { useApp } from "../../context/AppContext";

export default function Navbar() {
    const { username } = useApp()

    return (
        <div className="navbar bg-base-100 border-b border-base-300"> 
            <div className="flex-1">
                <span className="text-xl font-bold">Mengobrol Bersama & Gaming</span>
            </div>
            <div className="flex-none">
                <div  className="badge badge-primary badge-outline">{username}</div>
            </div>
        </div>
    )
}