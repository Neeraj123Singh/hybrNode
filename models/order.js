'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order.init({
    buyerId: DataTypes.INTEGER,
    seller: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
  });
  Order.associate = models => {
    Order.hasMany(models.OrderProduct,  {
      foreignKey: 'orderId'
    });
  }
  return Order;
};