const logger = require('../utils/logging')


const authenticateReq = (req, res, next) => {
    const userId = req.headers["x-user-id"]
    if (!userId) {
        logger.warn(`Access attempted without user ID`)
        return res.status(401).json({
            success: false,
            message: `Access denied`})
    
        }

    req.user ={userId}
    next()
}

module.exports = authenticateReq