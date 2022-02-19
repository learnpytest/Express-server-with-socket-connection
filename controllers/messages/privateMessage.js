const {
  PrivateMessage
} = require("../../models")

module.exports = {
  async getByRoomId(roomId) {
    return await PrivateMessage.findAll({
      raw: true,
      nest: true,
      where: {
        roomId
      }
    })
  },
  async create(data) {
    const {
      roomId,
      userId,
      account,
      name,
      avatar,
      message,
      receiverUserId,
      receiverUserName,
      receiverUserAccount,
      receiverUserAvatar,
      type
    } = data
    return await PrivateMessage.create({
      roomId,
      userId: String(userId),
      account,
      name,
      avatar,
      message,
      receiverUserId,
      receiverUserName,
      receiverUserAccount,
      receiverUserAvatar,
      type: String(type)
    })
  }
}