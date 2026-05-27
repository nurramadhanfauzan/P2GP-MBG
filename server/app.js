require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const router = require('./routers')
const errorHandler = require('./middlewares/errorHandler')
const socketHandler = require('./socket')
const app = express()

app.use(cors())

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(router)
app.use(errorHandler)

const server = http.createServer(app)

const io =
    new Server(server, {
        cors: {
            origin: '*'
        }
    })

socketHandler(io)

const PORT =
    process.env.PORT || 3000

server.listen(PORT, () => {

    console.log(
        `Server running on ${PORT}`
    )
})