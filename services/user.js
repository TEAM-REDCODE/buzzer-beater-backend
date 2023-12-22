const { User } = require('../models')
const bcrypt = require("bcrypt");
const errors = require('../type/errors')
const {generateRefreshToken, generateToken} = require("../middlewares/jwt");

async function signUp(userData){
    const existingEmail = await User.findOne({
        where: { email: userData.email }
    })

    if (existingEmail) throw new errors.ExistingUser('Email')

    const existingNickname = await User.findOne({
        where: { nickname: userData.nickname }
    })

    if (existingNickname) throw new errors.ExistingUser('Nickname')

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
    if (!userInfo) throw new errors.UserNotFoundException()
    return userInfo
}

async function login(req, res, email, password){
    const user = await User.findOne({where: {email: email}})
    const passwordMatch = user? await bcrypt.compare(password, user.password): false

    if (!user || !passwordMatch) throw new errors.UnmatchedUser()

    const refreshToken = await generateRefreshToken(user)
    if (!refreshToken) throw new errors.JwtCreationError()

    req.nickname = user.nickname
    const accessToken = generateToken(user)
    if (!accessToken) throw new errors.JwtCreationError()

    res.cookie('accessToken', accessToken,
        { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true })
}

async function logout(req, res) {
    res.clearCookie('accessToken', { path: '/' })
    res.clearCookie('refreshToken', { path: '/' })
}

async function belong(req) {
    const user = await User.findByPk(req.user.id)

    if (user) {
        const meets = await user.getMeets({
            attributes: { exclude: ['createdById'] }
        })
        return meets.map(meet => {
            return { ...meet.toJSON(), UserMeet: undefined }
        })
    }
    else {
        throw new errors.UserNotFoundException()
    }
}

async function updateInfo(req) {
    const update = req.params.update
    const avUpdateList = ['nickname', 'height', 'mainPosition']
    if (!avUpdateList.includes(update)) throw new errors.InvalidValue()
    const updateValue = req.body[update]
    if (!updateValue) throw new errors.InvalidValue()
    await User.updateInfoById(req.user.id, { [update]: updateValue })
}

module.exports = { signUp, getUserInfo, login, logout, belong, updateInfo }