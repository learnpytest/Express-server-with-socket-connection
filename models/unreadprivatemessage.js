'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UnreadPrivateMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UnreadPrivateMessage.init({
    userId: DataTypes.STRING,
    roomId: DataTypes.STRING,
    unread: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UnreadPrivateMessage',
    underscored: true,
  });
  return UnreadPrivateMessage;
};