const {
  UnreadPrivateMessage
} = require("../../models")

module.exports = {
  async updateOrCreate(
    roomId,
    userId,
    number,
    type
  ) {
    if (!userId) return [null, false]
    let result, isMsgCreated

    if (type === "increment") {
      const [found, created] = await UnreadPrivateMessage.findOrCreate({
        where: {
          userId: String(userId),
          roomId
        },
        defaults: {
          userId: String(userId),
          roomId,
          unread: number
        }
      })

      if (!created) {
        found.unread += number
        found.save()
      }
      isMsgCreated = created
      result = found
    }



    if (type === "decrement") {

      const [found, created] = await UnreadPrivateMessage.findOrCreate({
        where: {
          userId: String(userId),
          roomId
        },
        defaults: {
          userId: String(userId),
          roomId,
          unread: 0
        }
      })
      if (!created) {
        found.unread = 0
        found.save()
      }
      isMsgCreated = created
      result = found
    }

    return [result, isMsgCreated]

  },
  async getAllByUserId(userId) {
    return await UnreadPrivateMessage.findAll({
      raw: true,
      nest: true,
      where: {
        userId: String(userId)
      }
    })
  },

}