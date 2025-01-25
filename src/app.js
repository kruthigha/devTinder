const express = require("express");
const {connectDb} = require("../src/config/database");
const User = require("../src/models/user")
const { validateSignup }= require("./utils/validation")
const app = express();
const cookieParser = require("cookie-parser")
const {userAuth} = require("./middleware/userAuth")
const authRouter = require('./routes/auth')
const profileRouter = require('./routes/profile')
const requestRouter = require('./routes/request')
const userRouter = require('./routes/user')
const cors = require('cors')

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Only the base origin
  credentials: true, // Allow credentials (cookies, etc.)
}));





app.use('/',authRouter);
app.use('/',profileRouter)
app.use('/',requestRouter)
app.use('/', userRouter)



























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
