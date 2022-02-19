'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      `Community_Feeds`,
      `receiver_user_name`, `receiver_name`)
    await queryInterface.renameColumn(
      `Community_Feeds`,
      `receiver_user_account`, `receiver_account`)
    await queryInterface.renameColumn(
      `Community_Feeds`,
      `receiver_user_avatar`, `receiver_avatar`)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      `Community_Feeds`,
      `receiver_name`, `receiver_user_name`)
    await queryInterface.renameColumn(
      `Community_Feeds`,
      `receiver_account`, `receiver_user_account`)
    await queryInterface.renameColumn(
      `Community_Feeds`,
      `receiver_avatar`, `receiver_user_avatar`)
  }
};