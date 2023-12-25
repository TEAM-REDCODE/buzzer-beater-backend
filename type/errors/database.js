const APIError = require("./error")

class NotFoundException extends APIError {
    constructor() {
        super(404, 4004, 'Not found in DB')
        Object.setPrototypeOf(this, NotFoundException.prototype)
        Error.captureStackTrace(this, NotFoundException)
    }
}

module.exports = NotFoundException