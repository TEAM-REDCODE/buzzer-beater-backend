class APIError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message)

        this.statusCode = statusCode
        this.errorCode = errorCode
        this.message = message
        Object.setPrototypeOf(this, new.target.prototype)
    }

    toJson() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errorCode: this.errorCode,
            stack: this.stack,
        }
    }
}

module.exports = APIError