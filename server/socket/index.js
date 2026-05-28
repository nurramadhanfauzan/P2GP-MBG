const onlineUsers = []
const roomMoves = {}
const aiMove = require('../helpers/gameAI')
const checkWinner = require('../helpers/checkWinner')

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
            onlineUsers.push({ socketId: socket.id, username })
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

        socket.on('send-challenge', ({ roomName, from }) => {
            io.to(roomName).emit('game-challenge', { from, roomName })
        })

        socket.on('accept-challenge', ({ roomName }) => {
            io.to(roomName).emit('game-start', { roomName })
        })

        socket.on('game-move', ({ roomName, move, username }) => {
            if (!roomMoves[roomName]) roomMoves[roomName] = {}
            roomMoves[roomName][username] = move

            const moves = roomMoves[roomName]
            if (Object.keys(moves).length === 2) {
                const players = Object.keys(moves)
                const result = checkWinner(moves[players[0]], moves[players[1]])
                io.to(roomName).emit('game-result', {
                    moves,
                    winner: result === 'draw' ? 'draw' : players[result === 'player1' ? 0 : 1]
                })
                delete roomMoves[roomName]
            }
        })

        socket.on('fight-ai', async (playerMove) => {
            const { move: aiChoice, hint } = await aiMove()
            socket.emit('ai-result', {
                playerMove,
                aiChoice,
                hint
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
                'User disconnected:', socket.id
            )
        })
    })

}

