const {
  UnreadNotification
} = require("../../models")

module.exports = {
  async create(payload) {
    return await UnreadNotification.create(payload)
  },
  async getByUserId(userId) {
    return await UnreadNotification.findOne({
      raw: true,
      where: {
        userId: String(userId)
      }
    })
  },

  async updateOrCreate(userId, where, type) {
    const model = {
      userId: String(userId),
      communityNotification: 0,
      publicMessage: 0
    }

    const foundNotification = await UnreadNotification.findOne({
      where: {
        userId
      }
    })
    if (!foundNotification) {
      const createdNotification = await UnreadNotification.create({
        ...model,
        ...where
      })
      return [createdNotification, true]
    }
    if (type === "increment") {
      foundNotification["communityNotification"] = foundNotification["communityNotification"] + where["communityNotification"]
      foundNotification["publicMessage"] = foundNotification["publicMessage"] + where["publicMessage"]
    } else if (type === "decrement") {
      foundNotification["communityNotification"] = foundNotification["communityNotification"] - where["communityNotification"]
      foundNotification["publicMessage"] = foundNotification["publicMessage"] - where["publicMessage"]
    } else if (type === "clear") {
      for (key in where) {
        foundNotification[key] = where[key]
      }
    }
    foundNotification.save()

    return [foundNotification, false]
  }


}