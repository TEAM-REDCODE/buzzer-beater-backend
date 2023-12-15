const express = require('express')
const http = require('http');
const controllers = require('./controllers')

require('dotenv').config()
const PORT = process.env.PORT || 5000

module.exports = class API {
    constructor() {
        this.app = express()
        this.server = http.createServer(this.app)

        this.setController()
    }
    setController(){
        this.app.use('/v1/users', controllers.v1.users)
        this.app.use('/v1/meets', controllers.v1.meets)
        this.app.use('/v1/mercs', controllers.v1.mercs)
    }

    listen() {
        this.server = this.app.listen(PORT, () => {
            console.log(`Server is listening on ${PORT} port`)
        })
    }

    async close() {
        return new Promise((resolve)=>{
            this.server.close(()=>{
                resolve()
            })
        })
    }

}