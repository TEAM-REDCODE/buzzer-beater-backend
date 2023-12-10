const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const {accessVerify} = require("../../middlewares/jwt");
const { User, Meet } = require('../../models')
const {INTEGER, NUMBER} = require("sequelize");

const router = express.Router();
router.use(express.json())
router.use(cookieParser())

router.post('/', async (req, res) => {
    try {
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)

        if (accessResult.ok) {
            const { title, maxPerson, place, time } = req.body
            const userId = await jwt.decode(authToken).user_id

            // 1. Meet 인스턴스 생성 및 id 가져오기
            const meet = await Meet.create({
                title: title,
                maxPerson: maxPerson,
                place: place,
                time: time,
                createdBy: await User.convertIdToNickname(userId)
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
        const authToken = req.cookies.accessToken
        const accessResult = accessVerify(authToken)

        if (accessResult.ok) {
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
        }
        else {
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
                attributes: ['title', 'createdBy', 'maxPerson', 'place', 'time', 'createdAt', 'updatedAt']
            })

            res.status(200).json({meet})
        } else {
            res.status(400).send();
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

module.exports = router
