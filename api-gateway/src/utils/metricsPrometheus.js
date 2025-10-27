const client = require('prom-client');

const register = new client.Registry();

// Default metrics
client.collectDefaultMetrics({
  app: 'api_gateway',
  prefix: 'apigtw_',
  timeout: 5000,
  register,
});

// Custom metric: HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  })

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestCounter)

module.exports = { register, httpRequestDuration, httpRequestCounter };
