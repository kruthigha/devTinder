const express = require('express')
const authRouter = express.Router()
const { validateSignup } =require('../utils/validation')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const {userAuth} = require('../middleware/userAuth')

// Signup with user fname,lname emailID, password
authRouter.post("/signup", async(req,res) => {
    try {
    console.log("req",req.body)
    validateSignup(req)
    const {firstName,lastName,emailId,password , photoUrl, gender} = req.body
    const passHash =await bcrypt.hash(password, 10)
    console.log(passHash)
    const user = new User ({
      firstName,
      lastName,
      emailId,
      photoUrl,
      gender,
      password : passHash
    })
    const savedUser  = await user.save();
    const token = await savedUser.getJWT()
    console.log("Login Token "+ token)
    res.cookie("token",token, {
          expiresIn : '2d'
        })
     
     res.send("User saved successfully"+ user )
    } catch (err) {
     res.status(400).send("Error saving user" + err)
    }
  
  })
  
  
  //login with emailId and pwd
authRouter.post("/login", async(req,res)=>{
    try{
      const {emailId,password} = req.body
      const user = await User.findOne({ emailId })
      console.log(user)
      if(!user) {
        return res.status(401).send("Invalid credentials")
        // throw new Error("Invalid credentials")
      } 
      const isPwdValid = await user.isPwdValid(password)
      console.log(isPwdValid,user.password)
      if(isPwdValid){
        const token = await user.getJWT()
        console.log("Login Token "+ token)
        res.cookie("token",token, {
          expiresIn : '2d'
        })
        res.status(200).send(user)
      } else {
        res.status(401).send("Invalid credentials")
      }
  
    } catch(err){
      res.status(400).send("Error Logging In: "+ err)
    }
  })


  //logout
authRouter.post("/logout",userAuth,async(req,res)=>{
  res.cookie("token", null, {
    expiresIn : new Date(Date.now())
  }).send( req.user.firstName +" Successfully logged out!!. To continue please login")
})
module.exports = authRouter