'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UnreadNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UnreadNotification.init({
    userId: DataTypes.STRING,
    communityNotification: DataTypes.INTEGER,
    publicMessage: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UnreadNotification',
    underscored: true,
  });
  return UnreadNotification;
};