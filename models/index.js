// import Sequelize from "sequelize";
const config = require('../config/config')
const {Sequelize} = require("sequelize");

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize

module.exports = db