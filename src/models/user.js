const mongoose = require("mongoose");
const { Schema } = mongoose;
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
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
        index :  true,
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
        default : "https://media.licdn.com/dms/image/v2/D5603AQFM5r7-OWJ3kw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1720339764212?e=1741824000&v=beta&t=XECyKd80kkZ6cxXcSvhMox5Zk6Kzg4XgcywLa0VOYrw"
    }
} ,{
    timestamps : true
});

//refactoring mongoose methods will make your code look cleaner modular hence easy for testablity
userSchema.methods.getJWT = async function(){
    const user = this
    const token = await jwt.sign({ _id : user._id},"DevTinder@97" ,{ expiresIn: '7d' })
    return token
}

userSchema.methods.isPwdValid = async function(passwordInputByUser){
    const user = this
    const isPwdValid = await bcrypt.compare(passwordInputByUser, user.password)
    return isPwdValid
}
const userModel = mongoose.model("User", userSchema); // Pass the schema object here
module.exports = userModel; // Fixed typo 'modules.exports' -> 'module.exports'
