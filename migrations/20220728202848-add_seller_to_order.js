'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Orders',
      'seller',
      Sequelize.INTEGER
    );

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Orders',
      'seller'
    );
  }
}
