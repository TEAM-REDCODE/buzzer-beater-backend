// import Sequelize from "sequelize";
const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const User = require('./user')
const Meet = require('./meet')
const UserMeet = require('./usermeet')
const Merc = require('./merc')
const Jwt = require('./jwt')

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize
db.Sequelize = Sequelize

db.User = User
db.Meet = Meet
db.UserMeet = UserMeet
db.Merc = Merc
db.Jwt = Jwt

User.initialize(sequelize)
Meet.initialize(sequelize)
UserMeet.initialize(sequelize)
Merc.initialize(sequelize)
Jwt.initialize(sequelize)

User.associate(db)
Meet.associate(db)
Merc.associate(db)

module.exports = db