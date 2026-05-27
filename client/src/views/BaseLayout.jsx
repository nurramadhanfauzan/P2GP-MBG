import { Outlet } from "react-router-dom";
import Navbar from '../components/ui/Navbar'

export default function BaseLayout() {
    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            <Navbar />
            <main className="flex-1 flex overflow-hidden">
                <Outlet />
            </main>
        </div>
    )
}