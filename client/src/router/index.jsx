import { createBrowserRouter, redirect } from 'react-router-dom'
import LandingPage from '../views/LandingPage'
import GlobalChatPage from '../views/GlobalChatPage'
import PrivateChatPage from '../views/PrivateChatPage'
import GamePage from '../views/GamePage'
import BaseLayout from '../views/BaseLayout'

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
        loader: () => {
            if (sessionStorage.getItem('username')) {
                return redirect('/chat')
            }
            return null
        }
    },
    {
        element: <BaseLayout />,
        loader: () => {
            if (!sessionStorage.getItem('username')) {
                return redirect('/')
            }
            return null
        },
        children: [
            { path: '/chat', element: <GlobalChatPage /> },
            { path: '/chat/:roomId', element: <PrivateChatPage /> },
            { path: '/game/:roomId', element: <GamePage /> },
        ]
    }
])

export default router