const jwt = require('jsonwebtoken')
require('dotenv').config()

const generateToken = (user) => {
    const token = jwt.sign({
        nickname: user.nickname, email: user.email
    }, process.env.JWT_SECRET,{
        subject: "Buzzer-Beater jwtToken",
        expiresIn: 60*60
    });

    console.log("JWT is successfully generated!")

    return token
}

const verifyToken = (req, res, next) => {
    const token = req
}

module.exports = {
    generateToken,
    verifyToken
}