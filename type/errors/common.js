const { APIError } = require('./error')

class InvalidValue extends APIError {
    constructor() {
        super('Invalid Value Input', 400, 1001)
        Object.setPrototypeOf(this, InvalidValue.prototype)
    }
}

module.exports = InvalidValue