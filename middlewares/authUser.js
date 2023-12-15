const { accessVerify } = require('./jwt');

function authenticateUser(req, res, next) {
    const authToken = req.cookies.accessToken
    const accessResult = accessVerify(authToken)

    if (accessResult.ok) {
        req.user = { id: accessResult.user_id, nickname: accessResult.nickname };
        next();
    }
    else {
        res.status(401).json({ message: 'Invalid access token' });
    }
}

module.exports = { authenticateUser }