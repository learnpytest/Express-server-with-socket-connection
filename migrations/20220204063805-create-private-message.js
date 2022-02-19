'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('private_messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subscribe_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      account: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      avatar: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      },
      receiver_user_id: {
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
      room_id: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('private_messages');
  }
};