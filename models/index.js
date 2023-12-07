// import Sequelize from "sequelize";
const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const User = require('./user')
const Meet = require('./meet')
const Merc = require('./merc')

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize
db.Sequelize = Sequelize

db.User = User
db.Meet = Meet
db.Merc = Merc

User.initiate(sequelize)
Meet.initiate(sequelize)
Merc.initiate(sequelize)

User.associate(db)
Meet.associate(db)
Merc.associate(db)

module.exports = db