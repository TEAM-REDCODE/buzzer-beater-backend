const APIError = require('./error')

class InvalidValue extends APIError {
    constructor(message) {
        super(`Invalid Value Input at ${message}` , 400, 4000)
        Object.setPrototypeOf(this, InvalidValue.prototype)
    }
}

module.exports = InvalidValue