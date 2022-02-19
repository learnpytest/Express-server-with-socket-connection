const {
  Grouping
} = require("../../models")

module.exports = {
  // @params userId:String
  // @return groups:Array
  async onlyGroupsThatHasTheUserId(userId) {
    return await Grouping.findAll({
      raw: true,
      nest: true,
      where: {
        userId: String(userId)
      }
    })
  },
  // @params userId:String
  // @return newMessagesArray:[number, number]:Array
  async onlyGroupsNewMessagesThatHasTheUserId(userId) {
    const foundGroups = await this.onlyGroupsThatHasTheUserId(String(userId))
    return foundGroups.map(group => group.newMessages)

  },

  // @params roomId:String, userId:String
  // @return [user:Object, userCreated:Boolean]
  async findOrCreateByRoomAndUserId(roomId, userId) {
    return await Grouping.findOrCreate({
      where: {
        roomId,
        userId: String(userId)
      },
    });
  },
  // @params userId:String
  // @return group:Object
  // async findAllByUserId(userId) {
  //   return await Grouping.findAll({
  //     raw: true,
  //     nest:true,
  //     where: {
  //       userId: String(userId)
  //     }
  //   });
  // },

  // @params roomId:String, userId:String, number:Integer
  // @return updatedNewMessagesNumber
  async addNewMessagesNumber(roomId, userId, number) {
    const foundGroup = await Grouping.findOne({
      where: {
        userId,
        roomId
      }
    })
    foundGroup.newMessages++
    foundGroup.save()
    return foundGroup.newMessages
  },
  // @params roomId:String, userId:String, number:Integer
  // @return updatedNewMessagesNumber
  async clearNewMessagesNumber(roomId, userId) {
    const foundGroup = await Grouping.findOne({
      where: {
        userId: String(userId),
        roomId
      }
    })
    foundGroup.newMessages = 0
    foundGroup.save()
    return foundGroup.newMessages
  },


}