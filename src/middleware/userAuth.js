const jwt = require("jsonwebtoken")
const User = require("../models/user")

const userAuth  = async(req,res,next)=>{
    try {
        const { token } = req.cookies
        const decodedId = await jwt.verify( token , "DevTinder@97")
        if(!token ||  !decodedId){
            throw new Error("Invalid Token")
        }
        const {_id} = decodedId
        const user = await User.findById(_id)
        if(!user){
            throw new Error("User not found")
        }
        req.user = user
        next();
    } catch(err){
        res.status(400).send("Unable to auth user, err: "+ err)
      }
}

module.exports = {
    userAuth
}