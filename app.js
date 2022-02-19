require('dotenv').config()

const express = require('express')
const app = express()
const http = require("http").Server(app)
const io = require("socket.io")(http)

const port = 5000

const db = require('./models')
const Message = db.Message
const OnlineUser = db.OnlineUser

const userHelpers = require("./utils/userHelpers")
const errorHandlers = require("./utils/errorHandlers")

const communityFeedController = require("./controllers/communityFeeds/communityFeed")
const subscribingController = require("./controllers/communityFeeds/scribing")
const privateMessageController = require("./controllers/messages/privateMessage")
const groupingController = require("./controllers/groups/grouping")
const unreadNotificationController = require("./controllers/notifications/notificationController")
const unreadPrivateMessageController = require("./controllers/notifications/unreadPrivateMessageController")

// const {
//   type
// } = require('express/lib/response')
// const notificationController = require('./controllers/notifications/notificationController')
// const communityFeed = require('./controllers/communityFeeds/communityFeed')

let users = []
let messages = []
let currentOnlineUsers = []
let myCommunityFeed = []

// const addNewCurrentOnlineUser = (userObj, socketId) => {
//   const {
//     id: userId,
//     name,
//     account,
//     avatar
//   } = userObj
//     !currentOnlineUsers.some(user => user.userId === userObj.userId) && currentOnlineUsers.push({
//       userId,
//       name,
//       account,
//       avatar,
//       socketId
//     })
// }

const removeCurrentOnlineUser = (socketId) => {
  currentOnlineUsers = currentOnlineUsers.filter(user => user.socketId !== socketId)
}

const getCurrentOnlineUser = (userId) => {
  return currentOnlineUsers.find(user => user.userId && user.userId.toString() === userId.toString())
}



app.get('/', (req, res) => {
  res.send('Hello')
})



io.on("connection", async socket => {
  let userArrivedMsg = {}


  socket.on("newCurrentOnlineUser", async (userObj) => {
    userHelpers.addNewCurrentOnlineUser(userObj, socket.id, currentOnlineUsers)
  })

  // 顯示自己一個人的未讀通知
  socket.on("getUnreadNotification", async (userId) => {
    try {

      const unreadNotificationCounts = await unreadNotificationController.getByUserId(userId)
      socket.emit("displayUnreadNotification", unreadNotificationCounts)
    } catch (err) {
      return socket.emit("subscribingStatus", "error")

    }
  })

  // 顯示自己一個人的各自聊天室的各自未讀通知
  socket.on("getUnreadNotificationNumberForRoom", async (userId) => {
    let unreadNotificationForRoom = []
    try {
      const myGroups = await groupingController.onlyGroupsThatHasTheUserId(userId)
      unreadNotificationForRoom = myGroups.map(group => ({
        roomId: group.roomId,
        newMessages: group.newMessages
      }))
      // socket.emit("displayUnreadNotificationNumberForRoom", unreadNotificationForRoom)
    } catch (err) {
      return socket.emit("subscribingStatus", "error")
    }
  })

  // 取得所有 unread private messages 送出
  socket.on("getAllUnreadPrivateMessages", async (userId) => {
    const allUnreadPrivateMessages = await unreadPrivateMessageController.getAllByUserId(userId)
    socket.emit("displayAllUnreadPrivateMessages", allUnreadPrivateMessages)
  })

  // 顯示自己能夠閱覽的通知，包括所有訂閱人的公開通知以及自己的通知，不包括其他人私人通知
  socket.on("getAllCommunityNotification", async (userObj) => {
    try {
      // 自己與他人互動 only those I am receiver
      myCommunityFeed = await communityFeedController.getByReceiverId(String(userObj.id))

      const mySubscribingUsers = await subscribingController.hasSubscribedTargets(userObj.id)
      const usersThatCanAccess = mySubscribingUsers.map(user => ({
        userId: user.subscribedUserId,
        createdAt: user.createdAt
      }))

      // 訂閱人的action
      for (let i = 0; i < usersThatCanAccess.length; i++) {
        const {
          userId,
          createdAt
        } =
        usersThatCanAccess[i]
        const feeds = await communityFeedController.getBySenderId(userId)
        const filterFeeds = feeds.filter(feed => {
          return new Date(feed.createdAt).getTime() > new Date(createdAt).getTime()
        })

        myCommunityFeed = myCommunityFeed.concat(filterFeeds)
      }

      myCommunityFeed = myCommunityFeed.filter(feed => {
        return (feed.receiverUserId === String(userObj.id) || feed.type !== '7') && feed.senderUserId !== String(userObj.id)
      }).sort((prev, next) => {
        return new Date(next.createdAt).getTime() - new Date(prev.createdAt).getTime()
      })
      socket.emit("getAllCommunityNotification", myCommunityFeed)
      myCommunityFeed = []

    } catch (err) {
      return socket.emit("subscribingStatus", "error")
    }
  })

  // 通知對方也通知訂閱人
  socket.on("sendCommunityNotification", async (formatedNotification) => {
    const {
      receiverUserId,
      senderUserId
    } = formatedNotification
    const subScribers = await subscribingController.hasSubscribers(senderUserId)
    const subScribersId = subScribers.map(subScriber => subScriber.subscriberUserId).filter(id => id.length && id !== "undefined")

    // 資料庫
    // 通知增加一個
    await communityFeedController.create(formatedNotification)
    // 未讀的數量也要增加一個
    const where = {
      communityNotification: 1,
      publicMessage: 0
    }
    for (let i = 0; i < subScribersId.length; i++) {
      await unreadNotificationController.updateOrCreate(subScribersId[i], where, "increment")
    }

    // 畫面
    currentOnlineUsers.forEach(onlineUser => {
      const {
        userId,
        socketId
      } = onlineUser

      if (!String(userId).length && String(userId) === senderUserId) return

      if ((String(userId) === receiverUserId || subScribersId.includes(userId.toString()))) {
        // 通知頁資訊、未讀資訊
        io.to(socketId).emit("addOneCommunityNotification", {
          formatedNotification
        })
      }
    })




  })

  // 只通知對方
  socket.on("oneNewCommunityFeedOfPrivateMessage", async (formatedNotification) => {

    const {
      receiverUserId,
      senderUserId
    } = formatedNotification

    await communityFeedController.create(formatedNotification)
    currentOnlineUsers.forEach(onlineUser => {
      const {
        userId,
        socketId
      } = onlineUser

      if (userId.toString() === senderUserId) return

      if (userId.toString() === receiverUserId) {
        io.to(socketId).emit("addOneCommunityNotification", {
          formatedNotification
        })
      }
    })


  })

  // 社群未讀通知
  // 自己的社群通知歸零
  socket.on("zeroCommunityNotificationUnread", async userId => {
    const where = {
      communityNotification: 0
    }
    const [notification, created] = await unreadNotificationController.updateOrCreate(userId, where, "clear")
  })
  // 前端送出訊息一個，資料庫未讀通知也加一個，並且告訴對方，讓對方畫面也加一個
  socket.on("afterPrivateMessageSend", async formatedUnreadNotification => {
    const {
      type,
      receiverUserId,
      addNumber,
      currentUserId,
      roomId
    } = formatedUnreadNotification

    try {
      if (type !== "2") return
      // 修改資料庫 unread private message 資料，增加一個
      const [updatedUnreadPrivateMessage, isMsgCreated] = await unreadPrivateMessageController.updateOrCreate(roomId,
        receiverUserId,
        addNumber,
        "increment")

      // 修改資料庫 unread notification，移除 privateMessage 這裡，privateMessage 跟 unread notification 分離
      const where = {
        communityNotification: addNumber
      }

      const [newUnreadNotification, created] = await unreadNotificationController.updateOrCreate(receiverUserId, where, "increment")

      // 以下只有修改畫面，告訴對方，讓對方畫面用新的通知更新，只告訴收訊人，所以一定要 socketId
      const receiver = receiverUserId && getCurrentOnlineUser(receiverUserId)
      if (receiver) {
        // 對方在線上
        // 通知
        io.to(receiver.socketId).emit("displayUnreadNotification", newUnreadNotification)

        // 總數
        io.to(receiver.socketId).emit("allUnreadPrivateMessagesSumAddOne")

        // 當前聊天室
        io.to(receiver.socketId).emit("privateMessagesThisRoomAddOne", roomId)

      }
    } catch (err) {

      return errorHandlers.generalErrorHandler(err)(socket)
    }
  })

  // 減去這個聊天室的未讀
  socket.on("afterReadPrivateMessageOfThisRoom", async ({
    roomId,
    currentUserId,
    substractNumber,
    type
  }) => {
    // Try 1 display all, 可能有非同步問題
    try {
      const [result, isMsgCreated] = await unreadPrivateMessageController.updateOrCreate(
        roomId,
        currentUserId,
        substractNumber,
        type
      )

    } catch (err) {
      return errorHandlers.generalErrorHandler("伺服器錯誤，請稍後再試")
    }
  })
  socket.on("afterPublicMessageSend", async (currentUserId) => {
    // // 修改資料庫
    const filteredUsers = currentOnlineUsers.filter(user => String(user.userId) !== String(currentUserId))
    try {

      for (let i = 0; i < filteredUsers.length; i++) {
        // 修改畫面
        socket.to(filteredUsers[i].socketId).emit("unreadNotificationPublicMessageAddOne")

        // 修改資料庫
        const where = {
          publicMessage: 1
        }
        filteredUsers[i] && await unreadNotificationController.updateOrCreate(filteredUsers[i].userId, where, "increment")
      }

    } catch (err) {
      socket.emit("socketMessage", {
        type: "error",
        message: "伺服器錯誤，請稍後再試"
      })
    }
  })
  socket.on("afterReadPublicMessage", async currentUserId => {
    // 修改資料庫
    const where = {
      publicMessage: 0
    }
    currentUserId && await unreadNotificationController.updateOrCreate(String(currentUserId), where, "clear")
  })

  // Todo build a api for front end to get current user and target user subscribing relation
  socket.on("getSubscribingStatus", async ({
    subscriber,
    subscribed
  }) => {
    const isSubscribing = await subscribingController.isSubscribingRegistered(subscriber.id,
      subscribed.UserId)

    if (isSubscribing) return socket.emit("subscribingStatus", "isSubscribing")
    return socket.emit("subscribingStatus", "isNotSubscribing")
  })

  // keep it in socket server
  socket.on("subscribeUser", async ({
    subscriber,
    subscribed
  }) => {
    try {
      const [subscribingShip, subscribingCreated] = await subscribingController.findOrCreate(subscriber.id, subscribed.UserId);
      subscribingCreated && socket.emit("subscribingStatus", "success")
    } catch (err) {
      socket.emit("subscribingStatus", "error")
    }
  })

  socket.on("cancelSubscribeUser", async ({
    subscriber,
    subscribed
  }) => {
    try {
      await subscribingController.cancel(subscriber.id, subscribed.UserId)
      socket.emit("subscribingStatus", "cancelSubscribing")
    } catch (err) {
      socket.emit("subscribingStatus", "error")
    }
  })

  socket.on("socketConnected", async (obj) => {
    // 新增這行
    // 有使用者從前端連線 socket，就將使用者資料存入
    socket.userId = obj.id.toString()
    socket.name = obj.name
    socket.account = obj.account
    socket.avatar = obj.avatar
    userArrivedMsg = {
      userId: socket.userId,
      name: socket.name,
      account: socket.account,
      avatar: socket.avatar,
    }

    const [user, created] = await OnlineUser.findOrCreate({
      where: {
        userId: userArrivedMsg.userId
      },
      defaults: {
        ...userArrivedMsg
      }
    });



  })

  // 從 MySQL 取出所有訊息
  users = []
  messages = []
  messages = await Message.findAll({
    raw: true,
    nest: true
  })

  users = await OnlineUser.findAll({
    raw: true,
    nest: true
  })

  socket.emit("allMessages", messages)
  socket.emit("allUsers", users)

  socket.on("user", async obj => {
    // username來自前端進入公開聊天室的動作
    console.log(`${obj} has arrived the chatroom`)

    // 上線的動作
    // 存入 MySQL，上線的訊息新增一個
    const newMessage = {
      ...userArrivedMsg,
      message: "",
      type: "1",
    }
    await Message.create(newMessage)

    // 通知其他使用者告知新的使用者上線了
    socket.broadcast.emit("userArrived", newMessage)

      // 推進 socket server 的 users 陣列
      !users.some(user => user.userId === obj.id.toString()) && users.push({
        ...obj,
        socketId: socket.id,
      })
    io.emit("allUsers", users)

  })
  // 顯示除了自己以外有其他使用者上線的動作
  // 新增這行
  socket.on("userArrived", newMessage => {
    messages.push({
      ...newMessage
    })
    socket.emit("allMessages", messages)
  })

  // 使用者進入私人聊天室，不論是否指定聊天室 id，給前端資料顯示最新一則訊息
  socket.on("displayLatestPrivateRoomMessages", async (newUser) => {
    const theLatestRoomMessagesArr = []

    const {
      id: userId,
      name,
      account,
      avatar
    } = newUser

    const newUserGroups = await groupingController.onlyGroupsThatHasTheUserId(String(userId))

    for (let i = 0; i < newUserGroups.length; i++) {
      const roomId = newUserGroups[i].roomId
      const eachRoomMessages = await privateMessageController.getByRoomId(roomId)
      const theLatestMsg = eachRoomMessages.slice(-1)[0]
      theLatestRoomMessagesArr.push(theLatestMsg)
      socket.emit("displayLatestPrivateRoomMessages", theLatestRoomMessagesArr)
    }
  })
  // 私人聊天室
  // 有指定一個聊天室 id，確認這個聊天是是否已經建立，如果沒有，建立Group，如果已經建立，並且已經有聊天訊息，給前端資料顯示指定聊天室的訊息，只會回傳給前端這個聊天室的訊息
  // @params room:String, currentUser:Object, otherUser:Object
  // @return {roomId:String, messages:Array}:Object
  socket.on("displayOneRoomMessages", async ({
    roomId,
    currentUser,
    otherUser
  }) => {
    const currentUserId = currentUser.id.toString()
    const otherUserId = otherUser.UserId.toString()

    if (!roomId || roomId === 'undefined') return
    try {

      const [user1, user1Created] = await groupingController.findOrCreateByRoomAndUserId(roomId, currentUserId)
      const [user2, user2Created] = await groupingController.findOrCreateByRoomAndUserId(roomId, otherUserId)

      socket.isAlreadyInOneGroup = true
      socket.join(roomId)

      // 以 roomId 取得所有私人訊息
      const eachRoomMessages = await privateMessageController.getByRoomId(roomId)
      socket.emit("displayOneRoomMessages", {
        roomId,
        messages: [...eachRoomMessages]
      })
    } catch (err) {
      // Todo
      errorHandlers.generalErrorHandler(err)(socket)
    }
  })


  //user send new room message and inform other users excluding self in room 
  socket.on("roomMessage", async (data, fn) => {
    try {
      // save new room message to MySQL server
      const createdMessage = await privateMessageController.create(data)
      if (!createdMessage) throw new Error('訊息傳送失敗，請稍後再試')
      fn("success")
      socket.to(data.roomId).emit("appendRoomMessage", {
        roomId: data.roomId,
        oneNewMessage: {
          ...data
        }
      })
    } catch (err) {
      errorHandlers.generalErrorHandler(err)(socket)
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

    users = users.filter(user => user.id !== obj.id)
    io.emit("allUsers", users)


  })


  socket.on("typing", data => {
    socket.broadcast.emit("typing", data)
  })

  socket.on("stopTyping", data => {
    socket.broadcast.emit("stopTyping", data)
  })

  socket.on("message", async (obj) => {
    console.log("使用者" + obj.name + "傳來訊息" + obj.message)
    messages.push({
      ...obj
    })

    const {
      userId,
      account,
      name,
      avatar,
      message,
      type
    } = obj

    // 存入 MySQL 伺服器 新增這行
    const res = await Message.create({
      userId,
      account,
      name,
      avatar,
      message,
      type: type.toString()
    })

    io.emit("allMessages", messages)

  })


  socket.on("disconnect", () => {
    console.log(`${socket.username} has left the chatroom.`)
    removeCurrentOnlineUser(socket.id)
  })
})


http.listen(process.env.PORT || port, () => {
  console.log('lab is on.', port)
})