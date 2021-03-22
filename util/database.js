const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "open", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
