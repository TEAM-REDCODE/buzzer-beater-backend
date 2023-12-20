const { User } = require('../models')
const bcrypt = require("bcrypt");
const errors = require('../type/errors')
const {generateRefreshToken, generateToken} = require("../middlewares/jwt");

async function signUp(userData){
    const existingUser = await User.findOne({
        where: { email: userData.email }
    })

    if (existingUser) throw new errors.ExistingUser()

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    await User.create({
        ...userData,
        password: hashedPassword
    })
}

async function getUserInfo(userId) {
    const userInfo = await User.findByPk(userId, {
        attributes: ['nickname', 'email', 'height', 'mainPosition', 'isMercenary', 'createdAt', 'updatedAt']
    })
    if (!userInfo) throw errors.UserNotFoundException()
    return userInfo
}

async function login( req, res, email, password ){
    const user = await User.findOne({where: {email: email}})
    const passwordMatch = user? await bcrypt.compare(password, user.password): false

    if (!user || !passwordMatch) throw errors.UnmatchedUser()

    const refreshToken = await generateRefreshToken(user)
    if (!refreshToken) throw errors.Unauthorized()

    req.nickname = user.nickname

    res.cookie('accessToken', generateToken(user),
        { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true })
}

module.exports = { signUp, getUserInfo, login }