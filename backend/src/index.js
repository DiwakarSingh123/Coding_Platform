const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./database');
const authRouter = require('./routes/userAuth');
const cookieParser = require('cookie-parser');
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submitProblem');
const aiRouter = require('./routes/aiChatting');
const cors = require('cors');

const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://coding-platform-umber.vercel.app"
];

const allowedOrigins = process.env.FRONTEND_URL
    ? [...defaultOrigins, ...process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ""))]
    : defaultOrigins;

console.log("Allowed Origins:", allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const clean = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(clean)) {
            callback(null, true);
        } else {
            console.log("CORS Rejected:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', authRouter);
app.use('/problem', problemRouter);
app.use('/submited', submitRouter);
app.use('/ai', aiRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

async function inilizeConnection() {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("Database & Redis connected");
    } catch (err) {
        console.error("Connection error:", err.message);
    }

    app.listen(process.env.PORT_NUMBER || 8000, () => {
        console.log("Server listening at Port " + (process.env.PORT_NUMBER || 8000));
    });
}

inilizeConnection();
