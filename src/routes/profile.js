const express = require('express')
const profileRouter = express.Router()
const bcrypt = require('bcrypt')
const {userAuth} = require('../middleware/userAuth')
const User = require("../models/user")

//Logged in user profile
profileRouter.get("/profile/view", userAuth , async(req,res)=>{
    try {
    const user = req.user
    console.log("user",user)
    res.send( user)
    } catch(err){
      res.status(400).send("Error getting profile : "+ err)
    }
})

//Editing logged in user info
profileRouter.patch("/profile/edit", userAuth, async(req,res)=>{
  try {
      const user = req.user
      console.log(user)
      const {firstName, lastName, age ,gender ,photoUrl} = req.body
      const updateFields = {
        firstName,
        lastName,
        age,
        gender,
        photoUrl
      }
      const updatedUser = await User.findByIdAndUpdate(user._id , updateFields, {
        returnDocument : "after",
        runValidators : true
      });
      console.log("UpdatedUser:", updatedUser)
      res.status(200).send( updatedUser)

  } catch(err){
    res.status(400).send("Error Editing profile : "+ err)
  }
})

profileRouter.patch("/profile/password",userAuth, async(req,res) => {
  try{
    const user = req.user
    const { email , password } = req.body
    const passHash = await bcrypt.hash(password, 10)
    const updateFields = {
      password : passHash
    }
    const isNewAndOldPwdSame = await bcrypt.compare(password, user.password)
    console.log("comparing old and new password",isNewAndOldPwdSame)
    if(isNewAndOldPwdSame){
      res.status(400).send("Your old password is same as the new password.Kindly try a new password")
    }
    const updatedUser = await User.findByIdAndUpdate(user._id , updateFields, {
      returnDocument : "after",
      runValidators : true
    });
   res.status(200).send(user.firstName+" updated the password")

  } catch(err) {
    res.status(400).send("Error resetting password, Err: "+ err)
  }

})

module.exports = profileRouter