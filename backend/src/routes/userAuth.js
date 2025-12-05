const express=require('express');
const authRouter=express.Router();
const {register, login,logout,adminRegister,deleteProfile} = require('../controllers/userAuthenticat');
const userMiddleware=require('../middleware/userMiddleware');
const adminMiddleware=require('../middleware/adminMiddleware');
const userOrAdminMiddleware=require('../middleware/userOrAdminMiddleware');
const User=require('../modules/user');

// here Routing of user Register,Login,Logout,getProfile
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteprofile',userMiddleware,deleteProfile)
authRouter.get('/getAllUsers',userOrAdminMiddleware, async (req,res)=>{
  try{
     const allUsers=await User.find({}).select('_id firstName');
     if(!allUsers){
       return res.status(400).send("Users Not Found");
     }
     res.status(200).send(allUsers);
  }catch(err){
    console.error("error is"+ err);
  }
})


authRouter.get('/check',userOrAdminMiddleware,(req,res)=>{
     // the code is for checking user is already logon or not.......
    const reply={
      firstName:req.result.firstName,
      emailId:req.result.emailId,
      _id:req.result._id,
      role:req.result.role
    }
     res.status(201).json({
      user:reply,
      message: "valid user" 
      });
});

module.exports=authRouter;