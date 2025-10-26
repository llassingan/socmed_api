const logger = require('../utils/logging');

const errorHandler = (err, req, res, next) => {
    logger.error('Error: %o', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
}



module.exports = errorHandler;