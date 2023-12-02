require('dotenv').config({path: __dirname + '/../.env'})

module.exports = { username: process.env.USER, password: process.env.PASSWORD, database: process.env.DATABASE, host: process.env.HOST, dialect: process.env.DIALECT}
