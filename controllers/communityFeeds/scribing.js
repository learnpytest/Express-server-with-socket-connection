const {
  Op
} = require("sequelize")

const {
  Subscribing
} = require("../../models")

module.exports = {
  async hasSubscribedTargets(subscriberUserId) {
    return await Subscribing.findAll({
      raw: true,
      nest: true,
      where: {
        subscriberUserId: String(subscriberUserId)
      }
    })
  },

  async hasSubscribers(userId) {
    return await Subscribing.findAll({
      raw: true,
      nest: true,
      where: {
        subscribedUserId: String(userId)
      }
    })
  },

  async isSubscribingRegistered(subscriberUserId,
    subscribedUserId) {
    return await Subscribing.findOne({
      raw: true,
      where: {
        [Op.and]: [{
          subscriberUserId: String(subscriberUserId)
        }, {
          subscribedUserId: String(subscribedUserId)
        }],
      }
    })
  },

  async findOrCreate(subscriberUserId, subscribedUserId) {
    return await Subscribing.findOrCreate({
      where: {
        subscriberUserId: String(subscriberUserId),
        subscribedUserId: String(subscribedUserId)
      }
    })
  },

  async cancel(subscriberUserId, subscribedUserId) {
    const subscribingship = await Subscribing.findOne({
      where: {
        subscriberUserId: String(subscriberUserId),
        subscribedUserId: String(subscribedUserId)
      }
    })

    subscribingship && subscribingship.destroy()
  }
}