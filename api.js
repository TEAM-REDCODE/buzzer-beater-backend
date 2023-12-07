const express = require('express')
const http = require('http');
const controllers = require('./controllers')

module.exports = class API {
    constructor() {
        this.app = express()
        this.server = http.createServer(this.app)

        this.setController()
    }

    setController(){
        this.app.use('/v1/users', controllers.v1.users)
    }

}