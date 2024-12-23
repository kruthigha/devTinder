const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require('validator');
const userSchema = new Schema({
    firstName: { 
        type: String,
        required : true,
        minLength : 4,
        unique: true
     },
    lastName: { 
        type: String 
    },
    emailId :  { 
        type: String,
        required : true,
        lowercase : true,
        trim : true,
        unique: true,
        validate(val){
            if(!validator.isEmail(val)){
            throw new Error("EmailId is not valid "+ val)
            }
        }
     },
    password: { 
        type: String ,
        required : true,
        validate(val){
            console.log("val",validator.isStrongPassword(val))
            if(!validator.isStrongPassword(val)){
            throw new Error("Pwd is not strong "+ val)
            }
        }
        
    },
    age: { 
        type: Number,
        min : 18
     },
    gender: { 
        type: String,
        validate(value){
            if(!["male","female","others"].includes(value)){
              throw new Error("Gender is not valid")
            }
        }
    },
    photoUrl :{
        type : String,
        default : "https:defaulturl.com"
    }
} ,{
    timestamps : true
});

const userModel = mongoose.model("User", userSchema); // Pass the schema object here
module.exports = userModel; // Fixed typo 'modules.exports' -> 'module.exports'
