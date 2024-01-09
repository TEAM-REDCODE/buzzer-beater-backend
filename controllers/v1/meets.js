const express = require('express')
const cookieParser = require('cookie-parser')
const authenticateUser = require('../../middlewares/authUser')
const errorMiddleware = require('../../middlewares/error')
const { MeetService, MercService} = require('../../services')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/', authenticateUser, async (req, res, next) => {
    try {
        const { ...meetData } = req.body
        await MeetService.createMeet(req, meetData)
        res.status(201).json({message: 'create meet successfully!'});
    } catch (error) {
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        const meetList = await MeetService.getMeetList(req)
        res.status(200).json(meetList)
    } catch (error) {
        next(error)
    }
})

router.get('/:id/reg', authenticateUser, async (req, res, next) => {
    try {
        const meetId = req.params.id
        const userId = req.user.id

        await MeetService.register(meetId, userId)
        res.status(200).json({message: 'register successful'})
    } catch (error) {
        next(error)
    }
})

router.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const meetId = req.params.id
        const meet = await MeetService.getMeetInfo(meetId)
        res.status(200).json(meet)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', authenticateUser, async (req, res, next) => {
    try {
        const meetId = req.params.id
        const { ...update } = req.body
        const userId = req.user.id

        await MeetService.updateMeetInfo(meetId, update, userId)
        res.status(204).json({ message: "updated successfully!" })
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const meetId = req.params.id
        const userId = req.user.id

        await MeetService.deleteMeet(meetId, userId)

    } catch(error) {
        next(error)
    }
})

router.post('/:id/mercs', authenticateUser, async (req, res, next) => {
    try {
        const meetId = req.params.id
        const mercId = req.body.mercId
        const userId = req.user.id
        await MeetService.callMerc(meetId, mercId, userId)

        res.status(201).json('successful')
    } catch (error) {
        next(error)
    }
})

router.get('/:id/mercs/:stage', authenticateUser, async (req, res, next) => {
    try {
        const meetId = req.params.id
        const userId = req.user.id
        const stage = req.params.stage

        res.status(200).json(await MeetService.getMercs(meetId, stage, userId))
    } catch (error) {
        next(error)
    }
})

router.use(errorMiddleware)

module.exports = router
