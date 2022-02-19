'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscribing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Subscribing.init({
    subscriberUserId: DataTypes.STRING,
    subscribedUserId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Subscribing',
    underscored: true,
  });
  return Subscribing;
};