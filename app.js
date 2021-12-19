const express = require('express')
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)

const port = 3000

let users = []

let messages = []

let myChannels = [{
  selectedUserId: 21,
  selectedUserAccount: "Benjamin",
  selectedUserAvatar: "",
  messages: [{
    message: "Hello, this is Benjamin",
    createAt: "12/10",
    type: 0,
  }]
}]

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

  socket.on("fetchSelectedUserMessages", (
    selectedUserId
  ) => {


    let myChannels = [{
      selectedUserId: 21,
      selectedUserAccount: "Benjamin",
      selectedUserAvatar: "",
      messages: [{
        message: "Hello, this is Benjamin",
        createAt: "12/10",
        type: 0,
      }]
    }]

    const selectedChannel = myChannels.filter(channel => +channel.selectedUserId === +selectedUserId)
    // // 歷史對話紀錄回傳
    socket.emit("returnSelectedUserMessages", selectedChannel[0])
  })

  socket.on("privateMessageToChannel", obj => {
    console.log("privateMessageToChannel", obj)
    let toSocketId = null
    let selectedChannel = {}
    const selectedUser = users.filter(user => +user.id === +obj.selectedUserId)
    myChannels = myChannels.map(channel => {
      if (+channel.selectedUserId === +obj.selectedUserId) {
        channel.messages.push(obj.content)
        channel.toSocketId = selectedUser.socketId
        toSocketId = selectedUser.socketId
        selectedChannel = {
          ...channel
        }
      }
      return channel
    })
    if (toSocketId) {
      socket.to(toSocketId).emit("returnSelectedUserMessages", selectedChannel)
    }
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
      self: socket.id
    })
    io.emit("allUsers", users)


    socket.on("disconnect", () => {
      console.log(`${socket.username} has left the chatroom.`)
    })

  })

  socket.on("disconnect", () => {
    console.log(`${socket.username} has left the chatroom.`)
  })
})


http.listen(process.env.PORT || port, () => {
  console.log('lab is on.', port)
})