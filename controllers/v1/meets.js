const express = require('express')
const cookieParser = require('cookie-parser')
const { Meet } = require('../../models')
const authenticateUser = require('../../middlewares/authUser')
const errorMiddleware = require('../../middlewares/error')
const { MeetService } = require('../../services')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/', authenticateUser, async (req, res, next) => {
    try {
        const { ...meetData } = req.body
        await MeetService.createMeet(req, meetData)
        res.status(201).json({message: 'create meet successfully!'});
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        const meetList = await MeetService.getMeetList(req)
        res.status(200).json(meetList)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.get('/:id/reg', authenticateUser, async (req, res) => {
    try {
        const meetId = req.params.id

        const meet = await Meet.findByPk(meetId)
        const hasUser = await meet.hasUser(req.user.id)

        if (hasUser){
            return res.status(400).json({
                ok: false,
                message: '이미 등록된 회원',
                dup: true
            })
        }

        await meet.addUser(req.user.id)

        const users = await meet.getUsers()
        meet.count = users.length
        await meet.save()

        res.status(200).json({
            ok: true,
            message: '등록 완료',
            dup: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: '등록 중 오류 발생',
            dup: false
        });
    }
})

router.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const reqId = req.params.id

        const meet = await Meet.findByPk(reqId, {
            attributes: ['_id', 'title', 'createdByNick', 'maxPerson', 'count', 'place', 'time', 'createdAt', 'updatedAt']
        })

        res.status(200).json(meet)
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.put('/:id', authenticateUser, async (req, res, next) => {
    try {
        const reqId = req.params.id
        const meet = await Meet.findByPk(reqId)

        if (req.user.id === meet.createdById) {
            const { ...info } = req.body;
            if (!Object.keys(info).length) return res.status(400).json({error: "값이 없습니다."})
            const allowedProperties = ['title', 'maxPerson', 'place', 'time'];
            const invalidProps = Object.keys(info).filter(prop => !allowedProperties.includes(prop));
            if (invalidProps.length > 0) {
                return res.status(400).json({ error: "허용되지 않은 값이 포함되었습니다." })
            }
            await Meet.updateMeetInfo(reqId, info)
            res.status(200).json({ message: "updated successfully!" })
        } else {
            res.status(403).json({ error: "Not Allowed to Access" })
        }
    } catch (error) {
        console.error(error)
        next(error)
    }
})

router.delete('/:id', authenticateUser, async (req, res, next) => {
    try {
        const reqId = req.params.id
        const meet = await Meet.findByPk(reqId)

        if (req.user.id === meet.createdById) {
            await meet.destroy()
            res.status(200).json({ message: "deleted successfully!" })
        } else {
            res.status(403).json({ error: "Not Allow to Access" })
        }
    } catch(error) {
        console.error(error)
        next(error)
    }
})

router.use(errorMiddleware)

module.exports = router
