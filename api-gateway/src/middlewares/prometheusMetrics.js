const { httpRequestCounter, httpRequestDuration } = require('../utils/metricsPrometheus');

const normalizePath = (path) =>
  path.replace(/\d+/g, ':id').replace(/[a-f0-9]{24}/g, ':objectId');

const reqDuration = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: normalizePath(req.route?.path || req.path),
      status_code: res.statusCode,
    });
  });
  next();
};

const reqCounter = (req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: normalizePath(req.route?.path || req.path),
      status_code: res.statusCode,
    });
  });
  next();
};

module.exports = { reqDuration, reqCounter };
