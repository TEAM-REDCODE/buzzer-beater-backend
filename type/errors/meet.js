const APIError = require('./error')

class hasUserError extends APIError {
    constructor() {
        super(`Already Belong`, 400, 1004)
        Object.setPrototypeOf(this, hasUserError.prototype)
    }
}

class NotCreatedByError extends APIError {
    constructor() {
        super(`Already Belong`, 400, 1005)
        Object.setPrototypeOf(this, NotCreatedByError.prototype)
    }
}

 module.exports =  { hasUserError, NotCreatedByError }