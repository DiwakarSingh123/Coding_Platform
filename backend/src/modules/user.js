const mongoose=require('mongoose');
const {Schema}=mongoose;
const Submission=require('../modules/submitSchema');
const userSchema=new Schema({
    firstName:{
        type:String,
        required:true,
        minlength:3,
        maxlength:30,
        trim:true
    },
    lastName:{
        type:String,
        minlength:3,
        maxlength:30,
        trim:true
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    age:{
        type:Number,
        min:5,
        max:80
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'Problem'
        }],
        uniqe:"true"
    }
},{timestamps:true})

// yeha sey hum delete karenge user ki submision problem.............
userSchema.post('findByIdAndDelete', async function(userInfo){
    if(userInfo){
        await mongoose.model('submission').deleteMany({userId:userInfo._id});
    }
})

const User=mongoose.model("User",userSchema);

module.exports=User;