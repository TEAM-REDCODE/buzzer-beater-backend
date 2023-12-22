const { APIError } = require('./error')

class ExistingUser extends APIError {
    constructor(message) {
        super(`${message} already exists`, 400, 1001)
        Object.setPrototypeOf(this, ExistingUser.prototype)
    }
}

class UnmatchedUser extends APIError {
    constructor() {
        super('Invalid email or password', 404, 1001)
        Object.setPrototypeOf(this, UnmatchedUser.prototype)
    }
}

class Unauthorized extends APIError {
    constructor() {
        super('Unauthorized', 401, 4001)
        Object.setPrototypeOf(this, Unauthorized.prototype)
        Error.captureStackTrace(this, Unauthorized)
    }
}

module.exports = { ExistingUser, UnmatchedUser, Unauthorized }