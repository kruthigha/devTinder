const express = require('express')
const mongoose = require('mongoose')
const requestRouter = express.Router()
const User = require('../models/user')
const {userAuth} = require('../middleware/userAuth')
const ConnectionRequest = require('../models/request')

requestRouter.post("/request/send/:status/:toUserId", userAuth , async(req,res)=>{
    try {
    const fromUserId  = req.user._id
    const status = req.params.status
    const toUserId = req.params.toUserId
    const connectionRequest = new ConnectionRequest({
      fromUserId ,
      toUserId ,
      status
    })
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    console.log(fromUserId , toUserId )
    if( fromUserId.toString() === toUserId){
      console.log("HEy FOOl")
      return res.status(400).json({message : "Cant send connection request to yourself"})
    }
    const toUser = await User.findById(toUserId)
    console.log('Found User:', toUser);
    if(!toUser){
      return res.status(400).json({message : "User not found!"})
    }
    const ALLOWED_STATUS = ["ignored" , "interested"]
    if(!ALLOWED_STATUS.includes(status)){
     return res.status(400).json({message : "Invalid Status Type: "+status})
    }
    const existingConnReq = await ConnectionRequest.findOne({
      $or : [
        { fromUserId , toUserId },
        { fromUserId :toUserId , toUserId : fromUserId }
      ]
    })
    if(existingConnReq){
      return res.status(400).json({message : "Connection Request Already Exists"})
    }
    const data = await connectionRequest.save()

    res.json({
      message :status==="interested"? req.user.firstName+" is "+status+ " in " +toUser.firstName : req.user.firstName +" "+ status+ " " +toUser.firstName  ,
      data
    })
    } catch(err){
      res.status(400).send("Error Sending Requests "+ err)
    }
  })
  
  requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
  
      const ALLOWED_STATUS = ["accepted", "rejected"];
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ message: "Invalid status type: " + status });
      }
  
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: "Invalid Request ID" });
      }
  
      const validReqId = await ConnectionRequest.findById(requestId);
      if (!validReqId) {
        return res.status(400).json({ message: "Invalid Request ID" });
      }
  
      const connReq = await ConnectionRequest.findOne({ _id : requestId, toUserId:loggedInUser._id , status: "interested" });
      console.log("connReq",connReq)
      if (!connReq) {
        return res.status(404).send("Connection Request not found");
      }
  
      connReq.status = status;
      const data = await connReq.save();
  
      const requestor = await User.findById(validReqId.fromUserId);
      res.json({
        message: `${loggedInUser.firstName} ${status} ${requestor.firstName}'s request`,
        data,
      });
    } catch (err) {
      console.error("Error reviewing connection request:", err); // Debugging line
      res.status(500).send("Error processing request: " + err.message);
    }
  });
  

module.exports = requestRouter