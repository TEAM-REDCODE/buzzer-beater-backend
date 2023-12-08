require('dotenv').config({path: '../.env'})

const jwt = require("jsonwebtoken");
const Jwt = require('../models/jwt')

const secret = process.env.TOKEN_SECRET

module.exports = {
    /** Access Token 유효성 검증 유효한 토큰일 시, 복호화 정보 제공 **/
    verify: (token) => {
        let decoded = null
        try {
            decoded = jwt.verify(token, secret)
            return {
                ok: true,
                nickname: decoded.nickname,
                user_id: decoded.user_id
            };
        } catch (error){
            return {
                ok: false,
                message: error.message
            }
        }
    },

    /** RefreshToken 유효성 검증 유효할 시 true **/
    refreshVerify: async (token, user_id) => {
        try{
            const data = await Jwt.findToken(user_id)
            if (token === data.refreshToken) {
                try {
                    jwt.verify(token, secret)
                    return true
                } catch (error) {
                    return false
                }
            } else {
                return false
            }
        } catch (error){
            return false
        }
    }
}