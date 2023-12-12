const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const {accessVerify} = require("../../middlewares/jwt");
const { User, Meet } = require('../../models')

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)

        if (accessResult.ok) {
            const { title, maxPerson, place, time } = req.body
            const decoded = await jwt.decode(authToken)
            const userId = decoded.user_id

            // 1. Meet 인스턴스 생성 및 id 가져오기
            const meet = await Meet.create({
                title: title,
                maxPerson: maxPerson,
                place: place,
                time: time,
                createdById: userId,
                createdByNick: decoded.nickname
            })

            // 2. UserMeet 모델에 인스턴스 생성
            await meet.addUsers(userId);

            res.status(201).json({message: 'create meet successfully!'});
        } else {
            res.status(400).send();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page || 1)
        const size = Number(req.query.size || 15)

        const result = await Meet.returnList(page, size)
        console.log(result)
        const totalPages = Math.ceil(result.total/size)

        res.status(200).json({
            meets: result.data,
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
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.get('/:id/reg', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)
        const meetId = req.params.id

        if(accessResult.ok) {
            const user = await User.findByPk(accessResult.user_id)
            try {
                await user.addMeets(meetId)
                res.status(200).json({
                    ok: true,
                    message: '등록 완료'
                })
            } catch (err) {
                if (err.name === 'SequelizeUniqueConstraintError') {
                    res.status(400).json({
                        ok: false,
                        message: '이미 등록된 회원',
                        dup: true
                    })
                } else {
                    res.status(500).json({
                        ok: false,
                        message: '등록 중 오류 발생',
                        dup: false
                    })
                }
            }
        } else {
            res.status(400).send();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.get('/:id', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)
        const reqId = req.params.id

        if (accessResult.ok) {
            const meet = await Meet.findOne({
                where: {
                    _id: reqId
                },
                attributes: ['_id', 'title', 'createdByNick', 'maxPerson', 'place', 'time', 'createdAt', 'updatedAt']
            })

            res.status(200).json(meet)
        } else {
            res.status(400).send();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.put('/:id', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)
        const reqId = req.params.id

        const meet = await Meet.findByPk(reqId)

        if (accessResult.ok && accessResult.user_id === meet.createdById) {
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
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)
        const reqId = req.params.id

        const meet = await Meet.findByPk(reqId)

        if (accessResult.ok && accessResult.user_id === meet.createdById) {
            await meet.destroy()
            res.status(200).json({ message: "deleted successfully!" })
        } else {
            res.status(403).json({ error: "Not Allow to Access" })
        }
    } catch(error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

module.exports = router
