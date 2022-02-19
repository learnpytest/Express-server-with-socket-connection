const {
  Op
} = require("sequelize")

const {
  CommunityFeed
} = require("../../models")

module.exports = {
  async create(formatedNotification) {
    return await CommunityFeed.create({
      ...formatedNotification
    })

  },
  // async getAll() {
  //   return await CommunityFeed.findAll({
  //     raw: true,
  //     nest: true,
  //     orders: ['createdAt', 'ASC']
  //   })
  // },
  async getByBothId(userId) {
    return await CommunityFeed.findAll({
      raw: true,
      nest: true,
      where: {
        [Op.or]: [{
          senderUserId: String(userId),
        }, {
          receiverUserId: String(userId)
        }]

      }
    })
  },
  async getBySenderId(userId) {
    return await CommunityFeed.findAll({
      // raw: true,
      nest: true,
      where: {
        senderUserId: String(userId),
      },
      order: [
        ['createdAt', 'DESC']
      ],
    })
  },
  async getByReceiverId(userId) {
    return await CommunityFeed.findAll({
      raw: true,
      nest: true,
      where: {
        receiverUserId: String(userId),
      }
    })
  }
}