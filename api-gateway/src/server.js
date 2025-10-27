require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const helmet = require('helmet');
const {rateLimit} = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const proxy = require('express-http-proxy');

const logger = require('./utils/logging');
const errorHandler = require('./middlewares/errorHandler');
const validateToken = require('./middlewares/authMiddleware');
const {register} = require('./utils/metricsPrometheus')
const {reqCounter, reqDuration} = require('./middlewares/prometheusMetrics')


const app = express();
const PORT=process.env.PORT || 3000;
const IDENTITY_SERVICE_HOST = process.env.IDENTITY_SERVICE_URL
const POST_SERVICE_HOST = process.env.POST_SERVICE_URL
const MEDIA_SERVICE_HOST = process.env.MEDIA_SERVICE_URL
const SEARCH_SERVICE_HOST = process.env.SEARCH_SERVICE_URL

const redisClient = new Redis(process.env.REDIS);


app.use(helmet());
app.use(cors());
app.use(express.json());

// rate limiting
const RateLimiter = rateLimit({
    windowMs: 1* 60 * 1000,
    max: 100,
    standardHeaders: true, 
    legacyHeaders: false,
    skip: (req) => req.path === '/metrics',
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

app.use(RateLimiter)

app.use((req, res, next) => {
    logger.info(`Received request:${req.method} from: ${req.url} at: ${new Date().toISOString()}`);
    logger.info(`Request Body: ${req.body}`);
    next();
});



const proxyOptions = {
    proxyReqPathResolver: (req) => {
        
        return req.originalUrl.replace(/^\/v1/, "/api")
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err}`);
        res.status(500).json({ 
            success: false,
            message: `Internal Server Error: ${err}` });
    }
}

app.use(reqCounter);
app.use(reqDuration);


// auth
app.use('/v1/auth',proxy(IDENTITY_SERVICE_HOST, 
    {
        ...proxyOptions,
        proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
            // adding content type
            proxyReqOpts.headers['Content-Type'] = "application/json";
            return proxyReqOpts;
        },
        
        userResDecorator:(proxyRes, proxyResData, userReq, userRes) => {
            // add logging
            logger.info(`Response from identity service with status code: ${proxyRes.statusCode}`);
            return proxyResData;
        }
    })
);

// post
app.use('/v1/posts', validateToken,
    proxy(POST_SERVICE_HOST, 
        {
            ...proxyOptions,
            proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
                proxyReqOpts.headers['Content-Type'] = "application/json";
                // adding user id from token
                proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
                return proxyReqOpts;
            },
            userResDecorator:(proxyRes, proxyResData, userReq, userRes) => {
                logger.info(`Response received from Post service: ${proxyRes.statusCode}`)
                return proxyResData;
            }
        }
))

// media
app.use('/v1/media', validateToken,
    proxy(MEDIA_SERVICE_HOST, 
        {
            ...proxyOptions,
            proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
                
                proxyReqOpts.headers['x-user-id'] = srcReq.user.id;

                // hanlde other request other than multipart
                if(!srcReq.headers['content-type'].startsWith('multipart/form-data')){
                    proxyReqOpts.headers['Content-Type'] = "application/json";
                }
                return proxyReqOpts;
            },
            userResDecorator:(proxyRes, proxyResData, userReq, userRes) => {
                logger.info(`Response received from Media service: ${proxyRes.statusCode}`)
                return proxyResData;
            },
            parseReqBody: false
        }
))

// search
app.use('/v1/search', validateToken,
    proxy(SEARCH_SERVICE_HOST, 
        {
            ...proxyOptions,
            proxyReqOptDecorator:(proxyReqOpts, srcReq) => {
                proxyReqOpts.headers['Content-Type'] = "application/json";
                proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
                return proxyReqOpts;
            },
            userResDecorator:(proxyRes, proxyResData, userReq, userRes) => {
                logger.info(`Response received from Search service: ${proxyRes.statusCode}`)
                return proxyResData;
            }
        }
))

// Expose metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    logger.info(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service URL: ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media Service URL: ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(`Search Service URL: ${process.env.SEARCH_SERVICE_URL}`);
    logger.info(`Redis URL: ${process.env.REDIS}`);
});