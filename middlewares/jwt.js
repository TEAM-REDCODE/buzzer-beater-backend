require('dotenv').config({path: '../.env'})
const jwt = require('jsonwebtoken')
const { Jwt } = require('../models')
const { verify, refreshVerify} = require('./jwt-util')
const {compare} = require("bcrypt");

const secret = process.env

const generateToken = (user) => {
    const accessToken = jwt.sign({
        user_id: user._id,
        nickname: user.nickname
    }, secret.TOKEN_SECRET, {
        subject: "Buzzer-Beater AccessToken",
        algorithm: "HS256",
        expiresIn: 60*60 // 1시간
    });

    console.log("JWT is successfully generated!")

    return accessToken
}

const generateRefreshToken = async (user) => {
    try {
        const refreshToken = jwt.sign({}, secret.TOKEN_SECRET, {
            subject: "Buzzer-Beater RefreshToken",
            algorithm: "HS256",
            expiresIn: 14 * 24 * 60 * 60 // 2주
        });

        const existingToken = await Jwt.findToken(user._id)

        if (existingToken){
            await Jwt.updateRefresh({user_id: user._id, refreshToken: refreshToken})
        } else {
            await Jwt.create({
                user_id: user._id,
                refreshToken: refreshToken
            });
        }
        console.log("refreshToken is successfully generated!")

        return refreshToken
    } catch (error) {
        console.log(error)
        console.error("Error in generating refreshToken")
    }
}

const refresh = async (req, res) => {
    const authToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    if (authToken && refreshToken){
        // access token 검증 - expired여야 함
        const authResult = verify(authToken)

        // jwt에 담긴 유저 정보 복호화
        const decoded = jwt.decode(authToken);

        // 복호화 결과가 없으면 권한 없음 응답
        if (!decoded){
            return res.status(401).send({
                ok: false,
                message: "No authorized!"
            })
        }

        /* access token의 복호화된 값에서
        *  유저의 id를 가져와서 refresh token을 검증한다. */
        const refreshResult =  await refreshVerify(refreshToken, decoded.user_id)

        // 재발급을 위해선 access token이 만료되어 있어야 한다.
        if (!authResult.ok && authResult.message === 'jwt expired'){
            // 1. access token이 만료되고, refresh token도 만료된 경우 -> 새로 로그인을 해야 함.
            if (!refreshResult){
                res.status(401).send({
                    ok: false,
                    message: 'No authorized!'
                })
            } else {
                // 2. access token이 만료되고 refresh token이 유효한 경우 -> 새로운 access token 발급
                const newAccessToken = await generateToken({ _id: decoded.user_id, nickname: decoded.nickname })

                res.cookie('accessToken', newAccessToken, { httpOnly: true })
                res.cookie('refreshToken', refreshToken, { httpOnly: true })

                res.status(200).send({
                    message: 'refresh successful',
                    ok: true,
                })
            }
        } else{
            // 3. access token이 아직 유효한 경우 -> refresh 안 함.
            res.status(200).send({
                ok: false,
                message: "Access Token is not expired!"
            })
        }
    } else {
        // access token 또는 refresh token이 헤더에 없는 경우
        res.status(400).send({
            ok: false,
            message: "Access Token or Refresh Token are needed for refresh!"
        })
    }
}

const accessVerify = (token) => {
    try {
        const decoded = jwt.verify(token, secret.TOKEN_SECRET)
        return {
            ok: true,
            user_id: decoded.user_id
        }
    } catch (error){
        return {
            ok: false,
        }
    }
}

module.exports = {
    generateToken,
    generateRefreshToken,
    refresh,
    accessVerify
}