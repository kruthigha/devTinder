const mongoose = require('mongoose')
const {model,Schema} = mongoose

const connectionRequestsSchema = new Schema({
    fromUserId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    toUserId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    status : {
        type : String,
        required : true,
        enum : {
            values : ["ignored", "interested" ,"accepted" ,"rejected"],
            message : '{VALUE} invalid status type' // custom error message
        }
    }
}, { timestamps : true})
connectionRequestsSchema.index({ firstName: 1,lastName:1})
connectionRequestsSchema.pre("save", function(next){
    const connectionRequest = this
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Can't send connReq to yourself")
    }
    next()
})

const connectionRequestsModel = new model("connectionRequests", connectionRequestsSchema)
module.exports =  connectionRequestsModel