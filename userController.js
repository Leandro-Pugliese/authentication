const express = require("express")
const Users = require("./User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const expressJwt = require("express-jwt")


const signToken = _id => jwt.sign({_id}, process.env.SECRET)

// Middlewares para ruta con autenticación requerida.
const validateJwt = expressJwt({ secret: process.env.SECRET, algorithms: ["HS256"]})
const findAndAssingUser = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user._id)
        if (!user) {
            return res.status(401).end()
        }
        req.user = user
        next()
    } catch (err) {
        next(err)
    }
}
const isAuthenticated = express.Router().use(validateJwt, findAndAssingUser)

const User = {
    create: async (req, res) => {
        const { body } = req
        console.log( { body } )
        try {
            const isUser = await Users.findOne({ email: body.email})
            if (isUser) {
                return res.status(403).send("El usuario ya existe")
            }
            const salt = await bcrypt.genSalt()
            const hashed = await bcrypt.hash(body.password, salt)
            const user = await Users.create({ email: body.email, password: hashed, salt})
            const signed = signToken(user._id)
            res.status(201).send(signed)
        } catch (err) {
            console.log(err)
            res.status(500).send(err.message)
        }
    },
    login: async (req, res) => {
        const { body } = req
        try {
            const user = await Users.findOne( {email: body.email} )
            if (!user) {
                res.status(403).send("Usuario inválido")
            } else {
                const isMatch = await bcrypt.compare(body.password, user.password)
                if (isMatch) {
                    const signed = signToken(user._id)
                    res.status(200).send(signed)
                } else {
                    res.status(403).send("Contraseña incorrecta")
                }
            }
        } catch (err) {
            res.status(500).send(err.message)
        }
    },
    get: (req, res) => {
        res.status(200).send(req.user)
    }
} 
    

module.exports =  { User, isAuthenticated }