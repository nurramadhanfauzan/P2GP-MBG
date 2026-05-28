import { Outlet } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'

export default function BaseLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 flex overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}