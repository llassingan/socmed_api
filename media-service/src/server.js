require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const cors = require('cors')
const Redis = require('ioredis');
const  {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');

const mediaRoutes = require('./routes/mediaRoutes')
const errorHandler = require('./middlewares/errorHandler')
const logger = require('./utils/logging')
const {connectRabbitMQ, consumeMessages} = require('./utils/rabbitmq')
const { handlePostDeleted } = require('./eventhandlers/mediaEventHandler')


const app = express()
const PORT=process.env.PORT || 3003
const MONGODB_URI = process.env.MONGODB_URI

mongoose.connect(MONGODB_URI)
.then(() => {
    logger.info('Connected to MongoDB');
}).catch((err) => {
    logger.error('Error connecting to MongoDB: %o', err);
    process.exit(1);
});


const redisClient = new Redis(process.env.REDIS);

app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
// timestamping middleware
app.use((req, res, next) => {
    logger.info(`Received request:${req.method} from: ${req.url} at: ${new Date().toISOString()}`);
    logger.info(`Request Body: ${req.body}`);
    next();
});


const sensitiveRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50,
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Too many requests from IP: ${req.ip} to sensitive endpoint`)
        res.status(429).json({
            success: false,
            message: 'Too Many Requests to sensitive endpoint'
        })
    },
    store : new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
})

app.use('/api/media/upload', sensitiveRateLimiter)
app.use('/api/media', mediaRoutes)


app.use(errorHandler)

async function startServer(){
    try {
        await connectRabbitMQ();
        // consume all the event
        await consumeMessages('post.deleted', handlePostDeleted)
        app.listen(PORT, () => {
            logger.info(`Media Service running on port ${PORT}`);
        });
    } catch (error) {
        logger.error(`Failed to start server ${ error }`);
        process.exit(1);
    }
}

startServer();


process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});