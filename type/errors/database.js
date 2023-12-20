const {APIError} = require("./error")

class UserNotFoundException extends APIError {
    constructor() {
        super(404, 4004, 'User not found in DB')
        Object.setPrototypeOf(this, UserNotFoundException.prototype)
        Error.captureStackTrace(this, UserNotFoundException)
    }
}

module.exports = UserNotFoundException