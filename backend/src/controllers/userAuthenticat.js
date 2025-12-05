const User=require('../modules/user');
const validate=require('../utils/validator');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis');
const Submission=require('../modules/submitSchema');


const register= async(req,res) =>{

  try{
    const data=req.body;
    
    
    // Validating user information........
    validate(data);

    const {firstName,emailId,password}=data;
    data.password=await bcrypt.hash(password,10);
    data.role='user';
    const user=await User.create(data);
    // console.log(user);
    
    // the code is for checking user is already logon or not.......
    const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id,
      role:user.role
    }
    
    // now time we provoide token to user to directly access the dashboard so here use jwt tokens..
    const token=jwt.sign({"_id":user._id,"emailId":user.emailId,"role":"user"},process.env.SECERATE_KEY,{expiresIn: 60 * 60})
    res.cookie('token',token,{maxAge: 60 * 60* 1000});

    res.status(200).json({
      user:reply,
       message: "User Resister Seccesfully" 
      });
    
  }catch(err){
    res.status(400).send("Error"+err);
  }

}

const login = async (req,res) =>{
   try{
     const {emailId,password}=req.body;
    // if(!emailId){
    //     throw new Error("EmailId is missing");
        
    // }
    // if(!password){
    //     throw new Error("Password is missing");
        
    // }
    const user = await User.findOne({emailId});
    if(!user){
        throw new Error("Invalid EmailId");
    }
    const comparePassword= await bcrypt.compare(password,user.password);
    if(!comparePassword){
        throw new Error("Invalid Cradential");
    }
    
    // the code is for checking user is already logon or not.......
    const reply={
      firstName:user.firstName,
      emailId:user.emailId,
      _id:user._id,
      role:user.role
    }

    //Now provoiding jwt token user......
    const token=jwt.sign({"_id":user._id,"emailId":user.emailId,"role":user.role},process.env.SECERATE_KEY,{expiresIn: 60 * 60});
    res.cookie('token',token,{maxAge: 60 * 60 * 1000});
    res.status(201).json({
      user:reply,
      message: "User login successfully" 
      });
   }catch(err){
    res.status(401).send("Error"+err)
   }

}

const logout= async (req,res) =>{
  try{
    const token=req.cookies.token;
    
    const payload=jwt.decode(token);
    console.log(payload);
    

    await redisClient.set(`token:${token}`,"Bloacked");

    await redisClient.expireAt(`token:${token}`,payload.exp);
    res.cookie("token",null,{expires: new Date(Date.now())});
    res.status(200).json({ message: "Logout Successfully" });

  }
  catch(err){
    res.status(401).send("Error"+err);
  }
}

const adminRegister= async (req,res) =>{
  try{
    const data=req.body;
    
    
    // Validating user information........
    validate(data);

    const {firstName,emailId,password}=data;
    data.password=await bcrypt.hash(password,10);
    // data.role='admin';
    const user=await User.create(data);
    
    
    // now time we provoide token to user to directly access the dashboard so here use jwt tokens..
    const token=jwt.sign({"_id":user._id,"emailId":user.emailId,"role":user.role},process.env.SECERATE_KEY,{expiresIn: 60 * 60})
    res.cookie('token',token,{maxAge: 60 * 60* 1000});

    res.status(200).json({ message: "Admin Resister Seccesfully" });
    
  }catch(err){
    res.status(400).send("Error"+err);
  }
}

const deleteProfile= async(req,res) =>{
  try{
    const userId=req.result._id;
    await User.findByIdAndDelete(userId);

    // Now submission sey bhi delete karna padega na bhai mere....
    // await Submission.deleteMany(userId) // but hum second tarika apnayenge Dost wo user.js mey hai.......
   res.status(200).send("User Deleted Successfully");

  }catch(err){
    res.status(400).send("User not found")
  }
}
module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile
//   getProfile
};