module.exports = {
  addNewCurrentOnlineUser(userObj, socketId, currentOnlineUsers) {
    const {
      id: userId,
      name,
      account,
      avatar
    } = userObj
      !currentOnlineUsers.some(user => user.userId === userObj.userId) && currentOnlineUsers.push({
        userId,
        name,
        account,
        avatar,
        socketId
      })
  }

  // const removeCurrentOnlineUser = (socketId) => {
  //   currentOnlineUsers = currentOnlineUsers.filter(user => user.socketId !== socketId)
  // }

  // const getCurrentOnlineUser = (userId) => {
  //   return currentOnlineUsers.find(user => user.userId && user.userId.toString() === userId.toString())
  // }

}