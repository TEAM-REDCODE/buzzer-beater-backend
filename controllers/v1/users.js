const express = require('express');
const bcrypt = require('bcrypt')
const { generateToken, generateRefreshToken, refresh, accessVerify } = require('../../middlewares/jwt')
const cookieParser = require('cookie-parser')
const { authenticateUser } = require('../../middlewares/authUser')
const errorMiddleware = require('../../middlewares/error')
const { signUp, getUserInfo, login} = require('../../services')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

const { User } = require('../../models')

router.post('/signup', async (req, res, next)=>{
    try{
        const {...userData} = req.body
        await signUp(userData)
        res.status(201).json({
            message: 'User registration successful',
        });
    } catch (error){
        console.error(error)
        next(error)
    }
});

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const selfId = req.user.id
        const user = await getUserInfo(selfId)
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.post('/login',  async (req, res, next) => {
    try{
        const { email, password } = req.body
        await login(req, res, email, password)

        res.status(200).json({
            message: 'Login successful',
            nickname: req.nickname
        });
    } catch (error){
        console.error(error)
        next(error)
    }
})

router.get('/refresh', refresh)

router.get('/logout', authenticateUser, async (req, res, next) => {
    try {
        res.clearCookie('accessToken', { path: '/' })
        res.clearCookie('refreshToken', { path: '/' })
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.put('/nickname', authenticateUser, async (req, res, next) => {
    try {
        const nickname = req.body.nickname
        if (!nickname) {
            return res.status(400).json({error: 'Bad request', message: 'Nickname is required.'})
        }
        await User.changeNicknameById(req.user.id, nickname);
        res.status(204).send();
    }
    catch (error) {
        console.error(error)
        next(error)
    }
})

router.put('/height', authenticateUser, async (req, res, next) => {
    try {
        const height = req.body.height
        if (!height) {
            return res.status(400).json({error: 'Bad request', message: 'Height is required.'})
        }
        await User.changeHeightById(req.user.id, height);
        res.status(204).send();
    }
    catch (error) {
        console.error(error)
        next(error)
    }
})

router.get('/belong', authenticateUser, async (req, res, next) => {
    try{
        // 1. pk를 통해 유저 불러오기
        const user = await User.findByPk(req.user.id)
        // 2. 자신이 속한 meet 리스트 가져오기
        if (user) {
            const meets = await user.getMeets({
                attributes: { exclude: ['createdById'] }
            })
            const jsonMeets = meets.map(meet => {
                return { ...meet.toJSON(), UserMeet: undefined }
            })
            res.status(200).json(jsonMeets)
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.use(errorMiddleware)

module.exports = router
