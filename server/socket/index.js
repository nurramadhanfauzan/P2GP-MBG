const onlineUsers = []
const aiMove = require('../helpers/gameAI')

module.exports = (io) => {
    
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on('join-user', (username) => {
            const isExist = onlineUsers.find(
                user => 
                    user.username === username
            )
            if (isExist) {
                socket.emit(
                    'username-error',
                    'Username sudah ada'
                )
                return
            }
            onlineUsers.push({socketId: socket.id, username})
            io.emit('online-users', onlineUsers)  
        })

        socket.on('send-message', (payload) => {
            io.emit('new-message', payload)
        })


        socket.on('join-room', (roomName) => {
            socket.join(roomName)
        })

        socket.on('private-message', (payload) => {
            io.to(payload.roomName).emit(
                'new-private-message', payload
            )
        })

        socket.on('game-move', (payload) => {
            io.to(payload.roomName).emit(
                'game-update', payload
            )
        })

        socket.on('fight-ai', (playerMove) => {
            const aiChoice = aiMove()
            socket.emit('ai-result', {
                playerMove,
                aiChoice
            })
        })
        
        socket.on('disconnect', () => {
            const index = onlineUsers.findIndex(
                user => user.socketId === socket.id
            )

             if (index !== -1) {
                onlineUsers.splice(index, 1)
            }

            io.emit('online-users', onlineUsers)

            console.log(
                'User disconnected:',socket.id
            )
        })
    })

}

