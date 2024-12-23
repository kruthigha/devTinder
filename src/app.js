const express = require("express");
const {connectDb} = require("../src/config/database");
const User = require("../src/models/user")
const { validateSignup }= require("./utils/validation")
const bcrypt = require("bcrypt")
const app = express();
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const {userAuth} = require("./middleware/userAuth")

app.use(express.json());
app.use(cookieParser())

// Display all the users
app.get("/feed", async(req, res)=>{
  const users = await User.find({})
  // const users = await User.findOne({password : req.body.password})
  //const users = await User.findOne({ firstName : req.body.firstName}).exec()
  console.log("users:",users)
  try{
    if(users.length){
      res.send(users)
    } else{
      res.status(404).send("User not found")
    }
  } catch(err){
    res.status(404).send("Unable to get the users", err)
  }
})

// get by mailId
app.get("/userwithmail", async(req, res) => {
  console.log(req.body.emailId)
  const users = await User.find({ emailId :req.body.emailId })
  // const users = await User.findOne({password : req.body.password})
  //const users = await User.findOne({ firstName : req.body.firstName}).exec()
  console.log("users:",users)
  try{
    if(users.length){
      res.send(users)
    } else{
      res.status(404).send("User not found")
    }
  } catch(err){
    res.status(404).send("Unable to get the users", err)
  }
})

//getwithId
app.get("/userwithid", async(req, res) => {
  console.log(req.body._id)
  const users = await User.findById(req.body._id )
  // const users = await User.findOne({password : req.body.password})
  //const users = await User.findOne({ firstName : req.body.firstName}).exec()
  console.log("users:",users)
  try{
    if(users){
      console.log("Hey")
      res.send(users)
    } else{
      res.status(404).send("User not found")
    }
  } catch(err){
    res.status(404).send("Unable to get the users", err)
  }
})


app.delete("/user", async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).send("User ID is required");
    }

    // Delete the user
    const user = await User.findByIdAndDelete(userId);

    if (user) {
      res.send("User deleted successfully!");
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("An error occurred while deleting the user");
  }
});


app.patch("/user/:userId", async (req, res) => {
  try {
  const userId = req.params?.userId
  const data = req.body; // Destructure to separate userId and other data
  const ALLOWED_UPDATES = [ "age","gender"]

  if (!userId) {
    return res.status(400).send("User ID is required");
  }
    const isUpdatesAllowed = Object.keys(data).every((k)=>
      ALLOWED_UPDATES.includes(k) 
    )
    console.log(data,isUpdatesAllowed)
    if(!isUpdatesAllowed){
      throw new Error("Update not allowed")
    }
    const user = await User.findByIdAndUpdate(userId, data ,{
      returnDocument : "after",
      runValidators : true
    });


    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log("Updated User:", user);
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Unable to update the user", details: err.message });
  }
});

// Signup with user fname,lname emailID, password
app.post("/signup", async(req,res) => {
  try {
  console.log("req",req.body)
  validateSignup(req)
  const {firstName,lastName,emailId,password} = req.body
  const passHash =await bcrypt.hash(password, 10)
  console.log(passHash)
  const user = new User ({
    firstName,
    lastName,
    emailId,
    password : passHash
  })
   await user.save();
   res.send("User saved successfully"+ user )
  } catch (err) {
   res.status(400).send("Error saving user" + err)
  }

})


//login with emailId and pwd
app.post("/login", async(req,res)=>{
  try{
    const {emailId,password} = req.body
    const user = await User.findOne({ emailId })
    console.log(user)
    if(!user) {
      throw new Error("Invalid credentials")
    } 
    const isPwdValid = await bcrypt.compare(password, user.password)
    console.log(isPwdValid,user.password)
    if(isPwdValid){
      const token = await jwt.sign({ _id : user._id},"DevTinder@97")
      console.log("Login Token "+ token)
      res.cookie("token",token)
      res.status(200).send("Login successful! " + user)
    } else {
      res.status(400).send("Invalid credentials")
    }

  } catch(err){
    res.status(400).send("Error Logging In: "+ err)
  }
})


app.get("/profile", userAuth , async(req,res)=>{
  try {
  const user = req.user
  console.log("user",user)
  res.send("User profile: "+ user)
  } catch(err){
    res.status(400).send("Error getting profile : "+ err)
  }
})

connectDb()
  .then((res) => {
    console.log("Database connection established");
    app.listen(7777,()=>{
        console.log("Server listening to port 7777");  
    })
  })
  .catch((err) => {
    console.log("Database connection cant be established");
  });
