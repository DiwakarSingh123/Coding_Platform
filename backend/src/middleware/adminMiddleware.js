
const User=require('../modules/user');
const jwt=require('jsonwebtoken');
const redisClient=require('../config/redis')

const adminMiddleware = async (req,res,next) =>{

   try{
     const token = req.cookies.token;
     console.log(token);
     
    if(!token){
        throw new Error("Token invalied");
        
    }

    const payload=jwt.verify(token,process.env.SECERATE_KEY);

    if(payload.role!="admin"){
        throw new Error("You are not admin");
    }
   
    const _id=payload._id;
    if(!_id){
        throw new Error("Token invalied");
    }

    const result=await User.findById(_id);
    if(!result){
        throw new Error("User not found");
    }

    //check token is already blocked or not
    const tokenBlocked=await redisClient.exists(`token:${token}`);
    if(tokenBlocked){
        throw new Error("Token is Invalied");
    }

    console.log(result);
    
    req.result=result;
    next();

   }
   catch(err){
    res.status(401).json({message:err.message});
   }

}

module.exports=adminMiddleware;