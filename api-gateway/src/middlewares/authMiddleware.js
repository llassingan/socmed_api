const logger = require('../utils/logging')
const jwt = require('jsonwebtoken')


const validateToken = (req,  res, next) => {
    if (req.path === '/metrics') return next();
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        logger.warn(`Access attempted without token`)
        return res.status(401).json({
            success: false,
            message: `Authentication required`
        })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {  
        if (err) {
            logger.warn(`Invalid token: ${err.message}`)
            return res.status(403).json({
                success: false,
                message: `Invalid token`
            })
        }
        req.user = user
        next()
    })

}

module.exports = validateToken;