const onlineUsers = []

const io = (io) => {
    
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on('join-user', (username) => {
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
        
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id)
        })
    })

}

module.exports = io