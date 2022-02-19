'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PrivateMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  PrivateMessage.init({
    userId: DataTypes.STRING,
    account: DataTypes.STRING,
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    message: DataTypes.TEXT,
    receiverUserId: DataTypes.STRING,
    receiverUserName: DataTypes.STRING,
    receiverUserAccount: DataTypes.STRING,
    receiverUserAvatar: DataTypes.STRING,
    type: DataTypes.STRING,
    roomId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PrivateMessage',
    underscored: true,
  });
  return PrivateMessage;
};