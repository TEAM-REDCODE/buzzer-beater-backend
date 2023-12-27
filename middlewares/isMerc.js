const {User} = require("../models")

async function isMerc(req, res, next) {
    const user = await User.findByPk(req.user.id)
    if (user.isMercenary) next()
    else res.status(401).json({ message: 'You are not mercenary' })
}

module.exports = isMerc