const errors = require("../type/errors")
const { User, Merc} = require("../models")
const {pTypeList} = require('../constants')
async function createMerc(mercData, userId) {
    if (!mercData.position || !mercData.avTime) throw new errors.InvalidValue()
    const user = await User.findByPk(userId)

    await Merc.create({
        UserId: userId,
        position: mercData.position,
        avTime: mercData.avTime,
    })

    user.isMercenary = true
    user.save()
}

async function getMercList(page, size, position) {
    if (!pTypeList.includes(position)) throw new errors.InvalidValue()

    const result = await Merc.returnList(page, size, position)
    const totalPages = Math.ceil(result.total/size)

    return {
        mercs: result.data,
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

async function deleteMerc(userId) {
    const user = await User.findByPk(userId)
    const merc = await user.getMerc()
    if(!merc) throw new errors.NotFoundException()
    await merc.destroy()
    user.isMercenary = false
    user.save()
}

module.exports = { createMerc,  getMercList, deleteMerc}