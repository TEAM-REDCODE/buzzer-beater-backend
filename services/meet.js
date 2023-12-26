const errors = require("../type/errors");
const { Meet, MeetMerc, Merc, User } = require("../models");


async function isCreatedBy(meet, userId) {
    return userId === meet.createdById;
}

async function createMeet(req, meetData) {
    const requiredFields = ['title', 'maxPerson', 'place', 'time']
    for (let field of requiredFields) {
        if (!meetData[field]) throw new errors.InvalidValue(field);
    }
    meetData.createdById = req.user.id
    meetData.createdByNick = req.user.nickname

    const meet = await Meet.create(meetData)
    await meet.addUser(req.user.id);
}

async function getMeetList(req) {
    const page = parseInt(req.query.page || 1)
    const size = Number(req.query.size || 15)

    const result = await Meet.returnList(page, size)
    const totalPages = Math.ceil(result.total/size)

    return {
        meets: result.data,
        page: {
            totalDataCnt: result.total,
            totalPages: totalPages,
            isLastPage: page >= totalPages,
            isFirstPage: page === 1,
            requestPage: page,
            requestSize: size
        }
    }
}

async function register(meetId, userId) {
    const meet = await Meet.findByPk(meetId)
    const hasUser = await meet.hasUser(userId)

    if (hasUser) throw new errors.MeetError.hasUserError()

    await meet.addUser(userId)

    const users = await meet.getUsers()
    meet.count = users.length
    await meet.save()
}

async function getMeetInfo(meetId) {
    return await Meet.findByPk(meetId, {
        attributes: ['_id', 'title', 'createdByNick', 'maxPerson', 'count', 'place', 'time', 'createdAt', 'updatedAt']
    })
}

async function updateMeetInfo(meetId, update, userId) {
    const meet = await Meet.findByPk(meetId)
    if (await isCreatedBy(meet, userId)){
        if (!Object.keys(update).length) throw new errors.InvalidValue()
        const allowedProperties = ['title', 'maxPerson', 'place', 'time']
        const invalidProps = Object.keys(update).filter(prop => !allowedProperties.includes(prop))
        if (invalidProps.length > 0) throw new errors.InvalidValue()

        await Meet.updateMeetInfo(meetId, update)
    }
    else throw new errors.MeetError.NotCreatedByError()
}

async function deleteMeet(meetId, userId) {
    const meet = await Meet.findByPk(meetId)

    if (await isCreatedBy(meet, userId)) await meet.destroy()
    else throw new errors.MeetError.NotCreatedByError()
}

async function callMerc(meetId, mercId, userId) {
    const meet = await Meet.findByPk(meetId)

    if (!await isCreatedBy(meet, userId)) throw new errors.UserError.Unauthorized()
    await meet.addMerc(mercId)
}

async function getMercs(meetId, stage, userId) {
    const meet = await Meet.findByPk(meetId)

    if (!await isCreatedBy(meet, userId)) throw new errors.UserError.Unauthorized()

    const stageList = ['ap', 'ac']
    if (!stageList.includes(stage)) throw new errors.InvalidValue()

    const meetMercs = await MeetMerc.findAll({
        where: {
            MeetId: meetId,
            stage: stage
        }
    })

    const mercsPromises = meetMercs.map(meetMerc => Merc.findByPk(meetMerc.MercId, {
        include: [{
            model: User,
            attributes: ['nickname', 'height']
        }]
    }))
    const mercs = await Promise.all(mercsPromises)

    return mercs.map(merc => {
        return {
            position: merc.position,
            avTime: merc.avTime,
            nickname: merc.User.nickname,
            height: merc.User.height,
            stage: stage
        }
    })
}

module.exports = {
    createMeet,
    getMeetList,
    register,
    getMeetInfo,
    updateMeetInfo,
    deleteMeet,
    callMerc,
    getMercs,
}