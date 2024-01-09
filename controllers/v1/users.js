const express = require('express');
const { refresh } = require('../../middlewares/jwt')
const cookieParser = require('cookie-parser')
const authenticateUser = require('../../middlewares/authUser')
const errorMiddleware = require('../../middlewares/error')
const { UserService} = require('../../services')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/signup', async (req, res, next)=>{
    try{
        const {...userData} = req.body
        await UserService.signUp(userData)
        res.status(201).json({
            message: 'User registration successful',
        });
    } catch (error){
        next(error)
    }
});

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id
        const user = await UserService.getUserInfo(id)
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
})

router.post('/login', async (req, res, next) => {
    try{
        const { email, password } = req.body
        await UserService.login(req, res, email, password)

        res.status(200).json({
            message: 'Login successful',
            nickname: req.nickname
        });
    } catch (error){
        next(error)
    }
})

router.get('/refresh', refresh)

router.get('/logout', authenticateUser, async (req, res, next) => {
    try {
        await UserService.logout(req, res)
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        next(error)
    }
})

router.put('/:update', authenticateUser, async (req, res, next) => {
    try{
        await UserService.updateInfo(req)
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

router.get('/belong', authenticateUser, async (req, res, next) => {
    try{
        const meets = await UserService.belong(req)
        res.status(200).json(meets)
    } catch (error) {
        next(error)
    }
})

router.use(errorMiddleware)

module.exports = router
