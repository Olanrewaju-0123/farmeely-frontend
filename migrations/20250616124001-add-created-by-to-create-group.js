"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("createGroups", "created_by", {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "Users", // Ensure this matches your Users table name
        key: "user_id",
      },
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("createGroups", "created_by");
  },
};
