const APIError = require('./error')

class JwtCreationError extends APIError {
    constructor() {
        super('Email already exists', 400, 1001)
        Object.setPrototypeOf(this, JwtCreationError.prototype)
    }
}

module.exports = { JwtCreationError }