const mongoose=require('mongoose');
const {Schema}=mongoose;

const problemSchema=new Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
    },
    difficulty:{
        type:String,
        enum:['Easy','Medium','Hard'],
        required:true
    },
    tags:{
        type: [String],
        default: [],
        
    },
    visibleTestCases:[
        {
            input:{ 
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true
            },
        }
    ],
    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
        }
    ],
    startCode:[
        {
            language:{
                type:String,
                required:true
            },
             initialCode:{
                type:String,
                required:true
            },
        }
    ],
    driverCode:[
        {
            language:{
                type:String,
                required:true
            },
             code:{
                type:String,
                required:true
            },
        }
    ],
    refranceSolution:[
        {
            language:{
                type:String,
                required:true
            },
             completeCode:{
                type:String,
                required:true
            },
        }
    ],
    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:'User', // user wale collection sey direct admin ID fetch kar lenge
        required:true
    },
   
},{timestamps:true})

const Problem=mongoose.model('Problem',problemSchema);
module.exports=Problem;


 // likes: {
    //     type: Number,
    //     default: 0
    // },
    // dislikes: {
    //     type: Number,
    //     default: 0
    // }