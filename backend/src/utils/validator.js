const User=require('../modules/user');
const validate=require('validator');

const validateUser = (data) =>{
    const com=['firstName','emailId','password'];
    const isAllowed=com.every((k) => Object.keys(data).includes(k));
    if(!isAllowed){
        throw new Error("Input is Missing");
        
    }

    const {firstName,emailId,password}=data;
    if(!validate.isEmail(emailId)){
        throw new Error("Invalid Email");
    }

    if(!validate.isStrongPassword(password)){
        throw new Error("Password is not strong");
    }

    if(firstName.length<3 || firstName.length>30){
        throw new Error("First Name should be between 3 to 30");
    }

}

module.exports=validateUser;