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
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
})

module.exports = router
