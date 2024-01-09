const { APIError, InternalServerError } = require('../type/errors')
const {logger} = require('../utils/logger')

const errorMiddleware = (error, req, res, next) => {
    try {
        if (!(error instanceof APIError)) {
            error = new InternalServerError(error)
        }

        if (error.message === 'Nickname already exists') error.errorCode = 1003

        res.meta.error = error
        res.status(error.statusCode).json({
            message: error.message,
            code: error.errorCode,
        })
    } catch (err) {
        logger.error('fail in error middleware', { original: error, new: err })
        res.status(500).json({ message: 'Internal server error', code: 5004 })
    }
}

module.exports = errorMiddleware;