// Serverless-compatible logger for Vercel
const winston = require("winston");

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL || process.env.NODE_ENV === "production";

// Console format for serverless
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "HH:mm:ss",
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Create logger instance for serverless (console only)
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "farmeely-backend",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Console transport only for serverless
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === "test",
    }),
  ],
});

// Add request logging method
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.user_id || "anonymous",
  };

  if (res.statusCode >= 400) {
    logger.warn("HTTP Request", logData);
  } else {
    logger.info("HTTP Request", logData);
  }
};

// Add database query logging method
logger.logQuery = (query, duration, error = null) => {
  const logData = {
    query:
      typeof query === "string"
        ? query.replace(/\s+/g, " ").trim()
        : "Unknown query",
    duration: `${duration}ms`,
    error: error?.message || null,
  };

  if (error) {
    logger.error("Database Query Error", logData);
  } else if (duration > 1000) {
    logger.warn("Slow Database Query", logData);
  } else {
    logger.debug("Database Query", logData);
  }
};

// Add performance logging method
logger.logPerformance = (operation, duration, metadata = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  };

  if (duration > 5000) {
    logger.error("Performance Issue", logData);
  } else if (duration > 1000) {
    logger.warn("Slow Operation", logData);
  } else {
    logger.info("Performance Metric", logData);
  }
};

// Add security logging method
logger.logSecurity = (event, details = {}) => {
  logger.warn("Security Event", {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Add business logic logging method
logger.logBusiness = (action, details = {}) => {
  logger.info("Business Logic", {
    action,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Export logger instance
module.exports = logger;
