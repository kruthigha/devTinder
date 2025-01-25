const express = require('express')
const userRouter = express.Router()
const {userAuth} = require('../middleware/userAuth')
const connectionRequest = require('../models/request')
const User = require('../models/user')

// loggedIn user will be displayed with persons who sent interested status via connReq
userRouter.get("/user/requests/recieved", userAuth, async(req,res)=>{
    const loggedInUser = req.user
    try{
    console.log("user",loggedInUser)
    const recievedConnReq = await connectionRequest.find({
        toUserId : loggedInUser._id,
        status : "interested"
    }).populate("fromUserId", "firstName lastName photoUrl age gender") //string separated
    // }).populate("fromUserId", ["firstName","lastName"]) // separated in array list
    console.log("recievedConnReq",recievedConnReq)
    if(recievedConnReq.length === 0){
        return res.status(200).send({
            message : "recieved " +recievedConnReq.length+ " connection requests"
        })
    }
    if(!recievedConnReq){
        return res.status(200).send({
            message : "Unable to retrieve connection requests"
        })
    }
    res.json({
        message : "Fetched Connection requests of "+ loggedInUser.firstName,
        data : recievedConnReq
    })
} catch (err){
    res.status(400).send({
        message : "Failed to fetch Connection requests of "+ loggedInUser.firstName,
        err 
    })
}

})


//user will get all the connections which is accepted either he accepted or he was accepted
userRouter.get('/user/connection', userAuth, async(req,res) => {
    const user = req.user
    try {
        
        const userConnections = await connectionRequest.find({
          $or : [  { toUserId : user._id , status : "accepted" },
            { fromUserId : user._id , status: "accepted"}] 
        }).populate("fromUserId", ["firstName", "lastName"])
        .populate("toUserId", ["firstName", "lastName"])
        if(userConnections.length === 0){
            return res
            .json({
                message :  user.firstName + " has" + userConnections.length +" connections"
            })
        }
        if(!userConnections){
            return res.status(400).json({
                message : "Unable to get the connections of "+ user.firstName
            })
        }
        
        const data = userConnections.map((person)=>{
           if(person.fromUserId._id.toString() === req.user._id.toString()){
            return person.toUserId
           } 
            return person.fromUserId
        })
        console.log("data",data)
        console.log( userConnections)
        res.json({
            message : user.firstName + " has " + userConnections.length +" connections.",
            data 

        })

    } catch(err) {
        res.status(400).json({
            message : "Unable to get the connections of "+ user.firstName
        })
    }

})

//user will get feeds of other profiles in the platform, if other people havent ignored the loggedInUser

userRouter.get('/user/feed' , userAuth, async(req, res)=>{
    const loggedInUser = req.user
    try{

        const feedProfiles = await User.find({
            $nor : [
                { _id : loggedInUser._id},
                { emailId  : loggedInUser.emailId}
            ]
        })
        if(!feedProfiles || feedProfiles.length === 0){
            return res.status(400).send({
                message : "Unable to find other users in the platform"
            })
        }
        const invalidConnRequest = await connectionRequest.find({
         $or : [
            { fromUserId : loggedInUser._id , status : 'ignored'},
            { fromUserId : loggedInUser._id , status : 'accepted'},
            { fromUserId : loggedInUser._id , status : 'rejected'},
            { toUserId : loggedInUser._id , status : 'accepted'},
            { toUserId : loggedInUser._id , status : 'ignored'},
            { toUserId : loggedInUser._id , status : 'rejected'},
         ]
        })
        console.log("invalidConnRequest", invalidConnRequest)
        let ignoredProfiles
        if (invalidConnRequest) {
            ignoredProfiles = await Promise.all(
                invalidConnRequest.map(async (req) => {
                    if (req.fromUserId.toString() === loggedInUser._id.toString()) {
                        const ignoredUser = await User.findById(req.toUserId);
                        console.log("Finding toUser", ignoredUser);
                        if (ignoredUser) {
                            const { firstName, lastName } = ignoredUser;
                            console.log("ignoredUser", { firstName, lastName });
                            return { firstName, lastName }; // Ensure a return value
                        }
                    } else {
                        const ignoredUser = await User.findById(req.fromUserId);
                        console.log("Finding fromUser", ignoredUser);
                        if (ignoredUser) {
                            const { firstName, lastName } = ignoredUser;
                            console.log("ignoredUser", { firstName, lastName });
                            return { firstName, lastName }; // Ensure a return value
                        }
                    }
                    return null; // Return null if the user is not found
                })
            );
        }
        
        // Filter out any `null` values
        ignoredProfiles = ignoredProfiles.filter(Boolean);
        
        console.log("ignoredProfiles", ignoredProfiles);
        let allUsers= feedProfiles.map((person)=>{
           const { firstName , lastName } = person 
           return { firstName , lastName }
        }) 
        if(ignoredProfiles){
         allUsers = allUsers.filter( person => 
            !ignoredProfiles.some((ign =>
                ign.firstName === person.firstName &&
                ign.lastName === person.lastName

            ))
         )
        }

        // if(ignoredProfiles){
        //   console.log("ignoredUserssss", ignoredProfiles)
        //   ignoredProfiles =await ignoredProfiles.map((person)=>{
        //     const { firstName , lastName , age, gender } = person 
        //     return { firstName , lastName , age, gender }
        //  })
        //  console.log("ignoredUserssss",ignoredProfiles)
        //    allUsers = allUsers.filter((person)=>{
        //     return !ignoredProfiles.includes(person)
        //    })
        // }

        res.json({
            message : "Here is the feed  ( with "+ allUsers.length+" profiles ) for loggedInUser : " + loggedInUser.firstName,
            data : allUsers
            })
           
    } catch(err){
        res.status(400).json({
            message : "Unable to get the other profiles for the logged in user " + loggedInUser.firstName,
            err
        })
    }
})

//Akshay's version of feed
userRouter.get('/user/feeds', userAuth, async(req,res)=>{
    console.log("Hitted Feed API")
    const loggedInUser = req.user  
    try{
        const page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 10
        limit = limit > 10 ? 13
         : limit 
        const skip = (page - 1) *10
        const connectionRequestForTheUser = await connectionRequest.find({
         $or : [
            { fromUserId : loggedInUser._id } , { toUserId : loggedInUser._id }
         ]
        }).select("fromUserId toUserId").populate("fromUserId", ["firstName","lastName"])
        .populate("toUserId", ["firstName","lastName"])

        const hideUsersFromFeed = new Set()
        connectionRequestForTheUser.forEach((req)=>{
            hideUsersFromFeed.add(req.fromUserId._id.toString())
            hideUsersFromFeed.add(req.toUserId._id.toString())
        })

        const usersInFeed = await User.find({  
        $and : [
        {_id : { $ne : loggedInUser._id }},
        {_id : { $nin : Array.from(hideUsersFromFeed) }}
        ]
        }).select("firstName lastName age gender photoUrl").skip(skip).limit(limit)


        console.log("Generate_", usersInFeed  ,"ToBeHidedUsers:",hideUsersFromFeed)
        res.json({
            message : "Here is the feed  ( with "+ usersInFeed.length+" profiles ) for User : " + loggedInUser.firstName,
            data :  usersInFeed 
        })
    } catch(err){
        res.status(400).json({
            message : "Unable to get the other profiles for the logged in user " + loggedInUser.firstName,
            err
        })
    }
})

module.exports = userRouter