'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grouping extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  };
  Grouping.init({
    roomId: DataTypes.STRING,
    userId: DataTypes.STRING,
    newMessages: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'Grouping',
    underscored: true,
  });
  return Grouping;
};