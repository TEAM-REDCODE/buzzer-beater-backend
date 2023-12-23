const errors = require("../type/errors");
const Meet = require("../models");

async function createMeet(req, meetData) {
    const requiredFields = ['title', 'maxPerson', 'place', 'time']
    for (let field of requiredFields) {
        if (!meetData[field]) throw new errors.InvalidValue(field);
    }

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

module.exports = { createMeet, getMeetList }