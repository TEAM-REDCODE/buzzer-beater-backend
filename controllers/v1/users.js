const express = require('express');
const asyncify = require('express-asyncify');
const bcrypt = require('bcrypt')
const { generateToken, verifyToken } = require('../../middlewares/jwt')

const router = asyncify(express.Router());

const { User } = require('../../models/user')

router.post('/signup', async (req, res)=>{
    const {nickname, password, email, height, mainPosition} = req.body

    try{
        const existingUser = await User.findOne({
            where: {
                email: email
            }
        })
        if (existingUser){
            return res.status(400).json({error: 'Email is already existing'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nickname: nickname,
            password: hashedPassword,
            email: email,
            height: height,
            mainPosition: mainPosition
        });

        const newUserToken = generateToken(newUser)

        console.log("Data is created!")
        res.status(201).json({message: 'User registration successful', token: newUserToken});
    } catch (error){
        console.error(error)
        res.status(500).json({error: 'Internal Sever Error'});
    }
});

module.exports = router
