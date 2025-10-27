const {httpRequestCounter, httpRequestDuration} = require('../utils/metricsPrometheus') 

// HTTP request duration
const reqDuration = (req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
      end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
    });
    next();
  };

// HTTP request counter
const reqCounter = (req, res, next) => {
    httpRequestCounter.inc({
        method: req.method,
        route: req.path,
        status: res.statusCode,
      })
      next()
}


module.exports = {reqDuration, reqCounter}