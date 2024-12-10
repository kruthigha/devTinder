const express = require("express")
const app = express()

const adminAuth =  (req,res,next)=>{
    console.log("Admin is getting Authenticated")
    const token = "xyz"
    const authToken = req.headers["authorization"]
    const isAuthorized = token === authToken
    if(isAuthorized){
        next()
    } else {
        res.status(401).send("User Not Authorized")
    }
}

const userAuth = (req,res,next)=>{
    if (req.method === "POST" && req.path === "/login") {
        console.log("Auth Getting Skipped!")
        return next(); // Skip authentication for user login
    }
    console.log("User is getting Authenticated",req.method,req.path, req.headers,req.headers.Authorization)
    const token = "xyz"
    const authToken = req.headers["authorization"]
    const isAuthorized = token === authToken
    if(isAuthorized){
        next()
    } else {
        res.status(401).send("User Not Authorized")
    }
}

module.exports = {
    adminAuth,
    userAuth
}
