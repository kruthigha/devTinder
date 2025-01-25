const validator = require('validator')

function validateSignup(req){
    const {firstName, lastName, emailId, password} = req.body
    if(!firstName || ! lastName){
      throw new Error("Name field is required")
    }
    else if(!validator.isEmail(emailId)){
      throw new Error("Please Enter a valid emailId") 
    } else if (!validator.isStrongPassword(password)) {
       throw new Error("Please Enter a strong password") 
    }
}

module.exports ={
    validateSignup
}