const express = require('express');
const bcrypt = require('bcrypt')
const { generateToken, generateRefreshToken, refresh, accessVerify } = require('../../middlewares/jwt')
const cookieParser = require('cookie-parser')
const { authenticateUser } = require('../../middlewares/authUser')
const errorMiddleware = require('../../middlewares/error')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

const { User } = require('../../models')

router.post('/signup', async (req, res, next)=>{
    try{
        const {nickname, password, email, height, mainPosition} = req.body
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        })
        if (existingUser){
            return res.status(400).json({error: 'Email is already existing'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nickname: nickname,
            password: hashedPassword,
            email: email,
            height: height,
            mainPosition: mainPosition
        });

        console.log("Data is created!")
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
        const user = await User.findByPk(req.user.id, {
            attributes: ['nickname', 'email', 'height', 'mainPosition', 'isMercenary', 'createdAt', 'updatedAt']
        })
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.post('/login',  async (req, res, next) => {
    try{
        const { email, password } = req.body
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch){
            return res.status(401).json({ error: 'Invalid password' });
        }

        console.log('Login!')

        const refreshToken = await generateRefreshToken(user)

        if (!refreshToken) {
            return res.status(500).json({ error: 'Failed to generate refresh token' });
        }

        res.cookie('accessToken', generateToken(user),
            { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true })

        res.status(200).json({
            message: 'Login successful',
            nickname: user.nickname
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
