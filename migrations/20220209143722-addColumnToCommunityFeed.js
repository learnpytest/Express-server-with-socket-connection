'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      `Community_Feeds`,
      `sender_account`, {
        type: Sequelize.STRING,
      })
    await queryInterface.addColumn(
      `Community_Feeds`,
      `sender_text`, {
        type: Sequelize.TEXT,
      })
    await queryInterface.addColumn(
      `Community_Feeds`,
      `sender_text_index`, {
        type: Sequelize.STRING,
      })
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Community_Feeds', 'sender_account')
    queryInterface.removeColumn('Community_Feeds', 'sender_text')
    queryInterface.removeColumn('Community_Feeds', 'sender_text_index')


  }
};