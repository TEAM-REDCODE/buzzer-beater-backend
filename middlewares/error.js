const { APIError, InternalServerError } = require('../type/errors')

const errorMiddleware = (err, req, res, next) => {
    try {
        if (!(err instanceof APIError)) {
            err = new InternalServerError(err)
        }

        if (err.message === 'Nickname already exists') err.errorCode = 1003
        res.status(err.statusCode).json({
            message: err.message,
            code: err.errorCode,
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', code: 5004 })
    }
}

module.exports = errorMiddleware;