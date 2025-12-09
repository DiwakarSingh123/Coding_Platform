const User=require('../modules/user');
const validate=require('validator');

const validateUser = (data) =>{
    const requiredFields = ['firstName','emailId','password'];
    const isAllowed = requiredFields.every((k) => Object.keys(data).includes(k));
    if(!isAllowed){
        throw new Error("Required fields missing: firstName, emailId, password");

    }

    const {firstName,emailId,password}=data;
    if(!validate.isEmail(emailId)){
        throw new Error("Invalid Email");
    }

    if(password.length < 8){
        throw new Error("Password must be at least 8 characters long");
    }

    if(firstName.length < 3 || firstName.length > 30){
        throw new Error("First Name should be between 3 to 30 characters");
    }

}

module.exports=validateUser;