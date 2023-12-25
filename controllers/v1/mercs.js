const express = require('express')
const cookieParser = require('cookie-parser')
const authenticateUser = require("../../middlewares/authUser");
const errorMiddleware = require('../../middlewares/error')
const {MercService} = require("../../services");

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/', authenticateUser, async (req, res, next) => {
    try{
        const { ...mercData } = req.body
        await MercService.createMerc(mercData, req.user.id)

        res.status(201).json({message: 'create meet successfully!'});
    } catch (error) {
        console.error(error)
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
        console.error(error)
        next(error)
    }
})

router.delete('/', authenticateUser, async (req, res, next) => {
    try{
        await MercService.deleteMerc(req.user.id)
        res.status(200).json({ message: "deleted successfully!" });
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.use(errorMiddleware)

module.exports = router
