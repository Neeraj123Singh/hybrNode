'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CatalogProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CatalogProduct.init({
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    catalogId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CatalogProduct',
  });
  return CatalogProduct;
};