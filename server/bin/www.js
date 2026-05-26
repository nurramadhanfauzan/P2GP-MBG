const app = require('../app')
const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

const socketHandler = require('../socket')
socketHandler(io)
const port = 3000

server.listen(port, () => {
    console.log(`Server running on ${port}`)
})