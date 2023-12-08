const express = require('express');
const bcrypt = require('bcrypt')
const { generateToken, generateRefreshToken, refresh, accessVerify } = require('../../middlewares/jwt')
const Jwt = require('../../models/jwt')

const router = express.Router();
router.use(express.json())

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

        const refreshToken = generateRefreshToken(user)
        await Jwt.updateRefresh({user_id: user._id, refreshToken: refreshToken})

        res.status(200).json({
            message: 'Login successful',
            nickname: user.nickname,
            jwt: {
                accessToken: generateToken(user),
                refreshToken: refreshToken
            }
        });
    } catch (error){
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.get('/refresh', refresh)

router.put('/nickname', async (req, res) => {
    try {
        const authToken = req.headers.authorization.split("Bearer ")[1];
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
        const authToken = req.headers.authorization.split("Bearer ")[1];
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

module.exports = router
