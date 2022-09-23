const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const expressJwt = require("express-jwt")
const {User, isAuthenticated} = require("./userController")


// Express y mongoose settings
mongoose.connect("mongodb://localhost:27017/auth")
const app = express()
app.use(express.json())

// Ver clave secreta en la variable de entorno (solo funciona en la maquina local)
console.log(process.env.SECRET)

//Rutas
app.post("/registro", User.create)
app.post("/ingreso", User.login)
app.get("/usuario", isAuthenticated, User.get)


// Port settings
app.listen(8000, () => {
    console.log("App on in port 8000")
})
