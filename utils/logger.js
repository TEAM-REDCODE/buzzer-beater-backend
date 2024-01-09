const winston = require('winston')
const { mkdirSync, existsSync } = require('fs')
const winstonDaily = require('winston-daily-rotate-file')
const { join } = require('path')
const expressWinston = require('express-winston')

const logDir = join(__dirname, '../logs')
const errorLogDir = join(logDir, '/error')

if (!existsSync(logDir)) {
    mkdirSync(logDir);
}
if (!existsSync(errorLogDir)) {
    mkdirSync(errorLogDir);
}

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const winstonOption = {
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({stack: true}),
        winston.format.prettyPrint()
    ),
    transports: [
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',
            filename: '%DATE%.error.log',
            maxFiles: 90,
            json: false
        }),
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: '%DATE%.log',
            maxFiles: 90,
            json: false
        }),
        new winston.transports.Console()
    ],
    exceptionHandlers: [
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',
            filename: '%DATE%.exception.log',
            maxFiles: 90,
            json: false
        })
    ]
}

const logger = winston.createLogger(winstonOption)

const loggerMiddleware = expressWinston.logger({
    winstonInstance: logger,
    requestWhitelist: ['header.origin', 'body', 'query', 'params'],
    responseWhitelist: ['body'],
    bodyBlacklist: ['password'],
    headerBlacklist: ['cookie'],
    ignoreRoute: function (req, res) {
        return false
    },
    level: function (req, res) {
        if (res.statusCode >= 500) {
            return 'error'
        } else if (res.statusCode >= 400) {
            return 'warn'
        }
        return 'info'
    },
    meta: true,
    dynamicMeta: function (req, res) {
        return res.meta
    }
})

module.exports = {logger, loggerMiddleware}