'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Community_Feeds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sender_user_Id: {
        type: Sequelize.STRING
      },
      sender_name: {
        type: Sequelize.STRING
      },
      sender_avatar: {
        type: Sequelize.STRING
      },
      receiver_user_Id: {
        type: Sequelize.STRING
      },
      receiver_user_name: {
        type: Sequelize.STRING
      },
      receiver_user_account: {
        type: Sequelize.STRING
      },
      receiver_user_avatar: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Community_Feeds');
  }
};