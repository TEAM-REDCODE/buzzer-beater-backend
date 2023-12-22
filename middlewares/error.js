const { APIError, InternalServerError } = require('../type/errors')

const errorMiddleware = (err, req, res, next) => {
    try {
        console.log(err instanceof APIError)

        //todo: fix error type

        if (!(err instanceof APIError)) {
            err = new InternalServerError(err)
        }
        res.meta.error = err
        res.status(err.statusCode).json({
            message: err.message,
            code: err.errorCode,
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', code: 5004 })
    }
}

module.exports = errorMiddleware;