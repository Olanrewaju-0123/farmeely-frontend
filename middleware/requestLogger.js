const logger = require("../services/logger");

/**
 * Request logging middleware
 * Logs all HTTP requests with timing and metadata
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Store original res.end method
  const originalEnd = res.end;

  // Override res.end to log request completion
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;

    // Log the request
    logger.logRequest(req, res, responseTime);

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  // Log request start for debugging
  if (process.env.LOG_LEVEL === "debug") {
    logger.debug("Request Started", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    });
  }

  next();
};

/**
 * Error logging middleware
 * Logs errors with full context
 */
const errorLogger = (err, req, res, next) => {
  // Log the error
  logger.error("Request Error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.user_id || "anonymous",
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Call next error handler
  next(err);
};

/**
 * Performance monitoring middleware
 * Monitors slow requests and logs performance metrics
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Store original res.end method
  const originalEnd = res.end;

  // Override res.end to log performance metrics
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };

    // Log performance metrics for slow requests
    if (responseTime > 1000) {
      logger.logPerformance("Slow Request", responseTime, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        memoryDelta,
        userId: req.user?.user_id || "anonymous",
      });
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Security event logging middleware
 * Logs potential security events
 */
const securityLogger = (req, res, next) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /on\w+\s*=/i, // Event handler injection
  ];

  const requestString = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      logger.logSecurity("Suspicious Request Pattern", {
        pattern: pattern.toString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        userId: req.user?.user_id || "anonymous",
      });
      break;
    }
  }

  next();
};

/**
 * Database query logging middleware
 * Logs database queries for monitoring
 */
const queryLogger = (sequelize) => {
  sequelize.addHook("beforeQuery", (options) => {
    options.startTime = Date.now();
  });

  sequelize.addHook("afterQuery", (options) => {
    const duration = Date.now() - options.startTime;
    logger.logQuery(options.sql || options.query, duration, options.error);
  });
};

module.exports = {
  requestLogger,
  errorLogger,
  performanceMonitor,
  securityLogger,
  queryLogger,
};
