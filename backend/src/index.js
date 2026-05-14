const express=require('express');
const app=express();
require('dotenv').config();
const main=require('./database');
const authRouter=require('./routes/userAuth');
const cookieParser = require('cookie-parser');
const redisClient=require('./config/redis');
const problemRouter =require('./routes/problemCreator');
// const problemCreator = require('./modules/problemSchema')
const submitRouter=require('./routes/submitProblem');
const aiRouter=require('./routes/aiChatting')
var cors = require('cors');

// Configure CORS to allow the live frontend URL (and sanitize trailing slashes)
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, "")) 
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());


// user Authentication code here....
app.use('/api',authRouter);
app.use('/problem',problemRouter);
app.use('/submited',submitRouter);
app.use('/ai',aiRouter);

function inilizeConnection(){

    Promise.all([main(),redisClient.connect()]);
    console.log("Database & Redis connected");

    app.listen(process.env.PORT_NUMBER, ()=>{
    console.log("Server lishening at Port "+process.env.PORT_NUMBER);
    
    })
}

inilizeConnection();
// main()
// .then(()=>{
//     console.log("database connected");

//     app.listen(process.env.PORT_NUMBER, ()=>{
//     console.log("Server lishening at Port "+process.env.PORT_NUMBER);
    
//     })
// })
// .catch((err) => console.log(err));

