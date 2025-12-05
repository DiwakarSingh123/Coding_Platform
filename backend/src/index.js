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

// Learn about cors error essey solve karne key liye core use karte hai jo per mision deta hai ki ess ess port number wale url ko access dena hai
app.use(cors({
  origin: "http://localhost:5173", // jahan se frontend run kar raha hai (Vite/React ka port)
  credentials: true // 👈 cookies allow karna hoga
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

