require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const {RateLimiterRedis} = require('rate-limiter-flexible')
const Redis = require('ioredis')
const  {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');

const identityRoutes = require('./routes/identity');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logging');

const app = express();
const PORT = process.env.PORT || 3001;
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

// ratelimiter for DDOS protection
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix:'middleware',
    points: 10, // 10 requests
    duration: 1, // per second by IP
});

// register rate limiter as middleware
app.use((req, res, next) => {
    rateLimiter.consume(req.ip) // evaluate rate limit based on IP
    .then(() => {
        next();
    }).catch(() => {
        logger.warn(`Too many requests from IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too Many Requests'});
    });
});


// ip based rate limiting for sensitive endpoints
const sensitiveRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
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

// registering ratelimiter
app.use('/api/auth/register', sensitiveRateLimiter)

// routes
app.use('/api/auth', identityRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Identity Service running on port ${PORT}`);
});



process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});