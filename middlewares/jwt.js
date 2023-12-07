const jwt = require('jsonwebtoken')
require('dotenv').config({path: '../.env'})

const generateToken = (user) => {
    const accessToken = jwt.sign({
        nickname: user.nickname,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, {
        subject: "Buzzer-Beater AccessToken",
        expiresIn: 60*60 // 1시간
    });

    const refreshToken = jwt.sign({
        nickname: user.nickname,
        email: user.email,
    }, process.env.REFRESH_TOKEN_SECRET, {
        subject: "Buzzer-Beater RefreshToken",
        expiresIn: '20d', // 20일
    });

    console.log("JWT is successfully generated!")

    return { accessToken, refreshToken }
}

const verifyToken = (req, res, next) => {
    const token = req
}

module.exports = {
    generateToken,
    verifyToken
}