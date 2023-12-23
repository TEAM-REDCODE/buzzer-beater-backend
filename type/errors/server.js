const APIError = require('./error')

class InternalServerError extends APIError {
    constructor() {
        super('Internal serve error', 500, 5001)
        Object.setPrototypeOf(this, InternalServerError.prototype)
        Error.captureStackTrace(this, InternalServerError)
    }
}

module.exports = InternalServerError
