'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('createGroups', 'totalSlots', 'totalSlot');
  },

down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('createGroups', 'totalSlot', 'totalSlots');
  },
};
