const express = require('express')
const app = express()
const {v4 : uuidv4} = require('uuid')
const server = require('http').Server(app)
const io  = require('socket.io')(server)
const cors = require('cors')
const bodyParser = require('body-parser')
const {ExpressPeerServer} = require('peer')
const peerServer = ExpressPeerServer(server, {
    debug : true
})

//middleware
app.use(cors())
app.set('view engine' , 'ejs')
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : false}))

//static files
app.use(express.static(__dirname + '/public/'))

//peer
app.use('/peerjs', peerServer)

//routes
app.get('/', (req,res) =>{
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room' , (req,res) =>{
    res.render('room' , {roomId : req.params.room})
})

io.on('connection' , (socket)=>{
    socket.on('join-room' , (roomId, userId)=>{
        socket.join(roomId)
        console.log(`User ${userId} Joined room ${roomId}`)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('message' , message =>{
            io.to(roomId).emit('createMessage' , message)
        })
    })

    
})

//listen
const port = process.env.PORT || 4678
server.listen(port, (err) => err ? console.log(err) : console.log(`Server started on port ${port}`))
