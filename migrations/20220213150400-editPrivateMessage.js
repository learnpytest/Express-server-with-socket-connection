'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.removeColumn('private_messages', 'subscribe_id');


  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('private_messages', 'subscribe_id', {
      type: Sequelize.STRING,
    });

  }
};