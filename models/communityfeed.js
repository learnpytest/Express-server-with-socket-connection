'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CommunityFeed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CommunityFeed.init({
    senderUserId: DataTypes.STRING,
    senderName: DataTypes.STRING,
    senderAccount: DataTypes.STRING,
    senderAvatar: DataTypes.STRING,
    senderText: DataTypes.TEXT,
    senderTextIndex: DataTypes.STRING,
    receiverUserId: DataTypes.STRING,
    receiverName: DataTypes.STRING,
    receiverAccount: DataTypes.STRING,
    receiverAvatar: DataTypes.STRING,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CommunityFeed',
    underscored: true,
  });
  return CommunityFeed;
};