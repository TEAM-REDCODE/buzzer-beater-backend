const express = require('express')
const cookieParser = require('cookie-parser')
const {authenticateUser} = require("../../middlewares/authUser");
const errorMiddleware = require('../../middlewares/error')
const { Merc, User} = require('../../models')
const {compare} = require("bcrypt");

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/', authenticateUser, async (req, res, next) => {
    try{
        const { position, avTime } = req.body
        if (!position || !avTime){
            return res.status(400).json({ error: 'Invalid input data' });
        }
        const user = await User.findByPk(req.user.id)
        await Merc.create({
            UserId: req.user.id,
            position: position,
            avTime: avTime,
        })

        user.isMercenary = true
        user.save()

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
        const posList = ['c', 'pf', 'sf', 'sg', 'pg']
        if (!posList.includes(position)){
            return res.status(400).json({ error: 'Invalid position data' });
        }

        const result = await Merc.returnList(page, size, position)
        const totalPages = Math.ceil(result.total/size)

        res.status(200).json({
            mercs: result.data,
            page: {
                totalDataCnt: result.total,
                totalPages: totalPages,
                isLastPage: page >= totalPages,
                isFirstPage: page === 1,
                requestPage: page,
                requestSize: size
            }
        })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete('/', authenticateUser, async (req, res, next) => {
    try{
        const user = await User.findByPk(req.user.id);
        const meet = await user.getMerc()
        if(!meet) return res.status(500).json({error: 'The mercenary can\'t find'})
        await meet.destroy();
        user.isMercenary = false
        user.save()
        res.status(200).json({ message: "deleted successfully!" });
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.use(errorMiddleware)

module.exports = router
