const express = require('express')
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)

const port = 3000

let users = []

let messages = []

let rooms = {}


app.get('/', (req, res) => {
  res.send('Hello')
})

// io.use((socket, next) => {
//   const userAccount = socket.handshake.auth.user.account;
//   if (!userAccount) {
//     return next(new Error("invalid userAccount"));
//   }
//   socket.userAccount = userAccount;

//   next();
// });

io.on("connection", socket => {
  socket.emit("allMessages", messages)
  socket.emit("allUsers", users)

  socket.on("joinPrivateRoom", ({

    room,
    selfObj,
    otherUserObj
  }) => {
    // const isOnlineUser = users.find(user => user.account === toAccount)

    // const socketId = isOnlineUser ? isOnlineUser.socketId : null

    // confirm room validation
    if (!room || room === "undefined") return

    // create room and save to server
    if (!rooms[room]) {
      rooms[room] = {
        users: [],
        messages: [],
      }
    }


    const isSelfJoined = rooms[room].users.find(user => user.account === selfObj.account)
    const isOtherUserJoined = rooms[room].users.find(user => user.account === otherUserObj.account)

    if (!isSelfJoined) {
      rooms[room].users.push({
        ...selfObj,

      })
    }
    if (!isOtherUserJoined) {
      rooms[room].users.push({

        ...otherUserObj
      })
    }

    // join room
    socket.join(room)


    // fetch hitsory of all rooms from server upon joining room
    let leaveOnlyJoinedRooms = {}
    for (let [roomId, roomObj] of Object.entries(rooms)) {
      if (roomObj.users.find(user => user.userId === selfObj.userId)) {
        leaveOnlyJoinedRooms[roomId] = {
          ...roomObj
        }
      }
    }


    socket.emit("setOnlyJoinedRooms",
      leaveOnlyJoinedRooms
    )

    // fetch hitsory of this room from server upon joining room
    socket.emit("allRoomMessages", {
      room,
      data: rooms[room],

    })





  })

  //user send new room message and inform other users excluding self in room 
  socket.on("roomMessage", data => {
    const {
      room,

    } = data
    // save new room message on server

    rooms[room].messages.push({
      ...data
    })
    socket.to(room).emit("appendRoomMessage", {
      room,
      message: {
        ...data
      }
    })


  })

  socket.on("leaved", obj => {

    // 下線的動作
    messages.push({
      id: obj.id,
      name: obj.name,
      avatar: obj.avatar,
      message: 0,
      createAt: obj.createAt,
      type: -1,

    })

    socket.broadcast.emit("allMessages", messages)

    // const isExisted = users.find(user => user.id === obj.id)
    // if (!isExisted) return
    users = users.filter(user => user.id !== obj.id)
    io.emit("allUsers", users)


  })


  socket.on("typing", data => {
    socket.broadcast.emit("typing", data)
  })

  socket.on("stopTyping", data => {
    socket.broadcast.emit("stopTyping", data)
  })

  socket.on("message", obj => {
    console.log("使用者" + obj.name + "傳來訊息" + obj.message)
    messages.push({
      ...obj
    })

    io.emit("allMessages", messages)

  })



  socket.on("user", obj => {
    // username來自前端進入聊天室的動作
    console.log(`${obj} has arrived the chatroom`)


    // socket.username = username
    // users.push(socket)

    // 上線的動作
    messages.push({
      id: obj.id,
      name: obj.name,
      account: obj.account,
      avatar: obj.avatar,
      message: 0,
      createAt: obj.createAt,
      type: 1,


    })

    socket.broadcast.emit("allMessages", messages)

    const isExisted = users.find(user => user.id === obj.id)
    if (isExisted) return
    users.push({
      ...obj,
      socketId: socket.id,
    })
    io.emit("allUsers", users)

  })

  socket.on("disconnect", () => {
    console.log(`${socket.username} has left the chatroom.`)
  })
})


http.listen(process.env.PORT || port, () => {
  console.log('lab is on.', port)
})