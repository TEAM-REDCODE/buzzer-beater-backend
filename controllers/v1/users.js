const express = require('express');
const bcrypt = require('bcrypt')
const { generateToken, generateRefreshToken, refresh, accessVerify } = require('../../middlewares/jwt')
const cookieParser = require('cookie-parser')
const { decode } = require('jsonwebtoken')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

const { User } = require('../../models')

router.post('/signup', async (req, res)=>{
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
        if (error.name === 'SequelizeValidationError') {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ error: 'Internal Sever Error' });
        }
    }
});

router.get('/', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)

        if (accessResult.ok) {
            const decoded = decode(authToken)
            const user = await User.findOne({
                where: {
                    _id: decoded.user_id
                },
                attributes: ['nickname', 'email', 'height', 'mainPosition', 'isMercenary', 'createdAt', 'updatedAt']
            })
            res.status(200).json(user)
        } else {
            res.status(401).json({message: 'Invalid access token'})
        }
    } catch (error) {
        console.error(error)
        res.status(400).send();
    }
})

router.post('/login',  async (req, res) => {
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

        res.cookie('accessToken', generateToken(user),
            { httpOnly: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true })

        res.status(200).json({
            message: 'Login successful',
            nickname: user.nickname
        });
    } catch (error){
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.get('/refresh', refresh)

router.get('/logout', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)

        if (accessResult.ok) {
            res.clearCookie('accessToken', { path: '/' })
            res.clearCookie('refreshToken', { path: '/' })
            res.status(200).json({ message: 'Logout successful' });
        }
        else {
            res.status(401).json({ message: 'Invalid access token' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.put('/nickname', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const nickname = req.body.nickname
        const accessResult = accessVerify(authToken)

        if (accessResult.ok) {
            try {
                await User.changeNicknameById(accessResult.user_id, nickname);
                res.status(204).send();
            } catch (error) {
                console.error(`Error updating nickname: ${error.message}`);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        } else {
            res.status(400).send();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.put('/height', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const height = req.body.height
        const accessResult = accessVerify(authToken)

        if (accessResult.ok) {
            try {
                await User.changeHeightById(accessResult.user_id, height);
                res.status(204).send();
            } catch (error) {
                console.error(`Error updating height: ${error.message}`);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        } else {
            res.status(400).send();
        }
    } catch (error){
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.get('/belong', async (req, res) => {
    try{
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)
        if (accessResult.ok) {
            // 1. pk를 통해 유저 불러오기
            const user = await User.findByPk(accessResult.user_id)
            // 2. 자신이 속한 meet 리스트 가져오기
            if (user) {
                const meets = await user.getMeets({
                    attributes: { exclude: ['createdById'] },
                    through: { attributes: [] }
                })

                const sanitizedMeets = meets.map(meet => {
                    const sanitizedMeet = meet.toJSON();
                    delete sanitizedMeet.UserMeet;
                    return sanitizedMeet;
                });

                res.status(200).json(sanitizedMeets)
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        } else {
            res.status(400).send();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

module.exports = router
