const errorMiddleware = (err, req, res) => {
    console.error(err.stack);

    if (err.name === 'SequelizeValidationError') {
        // Sequelize Validation Error 처리
        res.status(400).json({ error: err.errors });
    } else {
        // 일반적인 에러 처리
        res.status(500).json({ error: 'Internal Server Error'});
    }
}

module.exports = errorMiddleware;