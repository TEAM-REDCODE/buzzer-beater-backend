const express = require('express')
const cookieParser = require('cookie-parser')
const {authenticateUser} = require("../../middlewares/authUser");
const errorMiddleware = require('../../middlewares/error')
const { Merc } = require('../../models')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/users', authenticateUser, async (req, res, next) => {
    try{
        const { position, avTime } = req.body
        if (!position || !avTime){
            return res.status(400).json({ error: 'Invalid input data' });
        }
        await Merc.create({
            UserId: req.user.id,
            position: position,
            avTime: avTime
        })

        res.status(201).json({message: 'create meet successfully!'});
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.use(errorMiddleware)

module.exports = router
