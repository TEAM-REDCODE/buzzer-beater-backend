// import Sequelize from "sequelize";
const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const User = require('./user')
const Meet = require('./meet')

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.User = User
db.Meet = Meet

db.sequelize = sequelize
db.Sequelize = Sequelize

User.initiate()
Meet.initiate()

module.exports = db