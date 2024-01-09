const express = require('express')
const cookieParser = require('cookie-parser')
const authenticateUser = require("../../middlewares/authUser")
const isMerc = require('../../middlewares/isMerc')
const errorMiddleware = require('../../middlewares/error')
const {MercService, MeetService} = require("../../services")

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/', authenticateUser, async (req, res, next) => {
    try{
        const { ...mercData } = req.body
        await MercService.createMerc(mercData, req.user.id)

        res.status(201).json({message: 'create meet successfully!'});
    } catch (error) {
        next(error)
    }
})

router.get('/meets', authenticateUser, isMerc, async (req, res, next) => {
    try{
        const meets = await MercService.getMeets(req.user.id)
        res.status(200).json(meets)
    } catch (error) {
        next(error)
    }
})

router.get('/meets/:id/reg', authenticateUser, isMerc, async (req, res, next) => {
    try {
        const meetId = req.params.id
        const userId = req.user.id

        await MeetService.register(meetId, userId)
        await MercService.changeStage(meetId, userId, 'ac')
        res.status(200).json({message: 'register successful'})
    } catch (error) {
        next(error)
    }
})

router.get('/:position', authenticateUser, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || 1)
        const size = Number(req.query.size || 15)
        const position = req.params.position
        const mercList = await MercService.getMercList(page, size, position)

        res.status(200).json(mercList)
    } catch (error) {
        next(error)
    }
})

router.delete('/', authenticateUser, isMerc, async (req, res, next) => {
    try{
        await MercService.deleteMerc(req.user.id)
        res.status(200).json({ message: "deleted successfully!" });
    } catch (error) {
        next(error)
    }
})



router.use(errorMiddleware)

module.exports = router
