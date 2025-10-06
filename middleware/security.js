const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");

/**
 * Enhanced rate limiting configurations
 */
const createRateLimit = (
  windowMs,
  max,
  message,
  skipSuccessfulRequests = false
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: "error",
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        status: "error",
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Rate limit configurations
const rateLimits = {
  // General API rate limiting
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    "Too many requests from this IP, please try again later."
  ),

  // Authentication rate limiting (stricter)
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 requests per window
    "Too many authentication attempts, please try again later."
  ),

  // Password reset rate limiting
  passwordReset: createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // 3 requests per hour
    "Too many password reset attempts, please try again later."
  ),

  // Payment rate limiting
  payment: createRateLimit(
    5 * 60 * 1000, // 5 minutes
    5, // 5 requests per window
    "Too many payment attempts, please try again later."
  ),

  // OTP rate limiting
  otp: createRateLimit(
    5 * 60 * 1000, // 5 minutes
    3, // 3 requests per window
    "Too many OTP requests, please try again later."
  ),

  // Group creation rate limiting
  groupCreation: createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 groups per hour
    "Too many group creation attempts, please try again later."
  ),
};

/**
 * Enhanced security headers configuration
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.paystack.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/data:text\/html/gi, "")
        .replace(/vbscript:/gi, "")
        .replace(/expression\s*\(/gi, "")
        .trim();
    }
    if (typeof obj === "object" && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Request validation middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

/**
 * IP whitelist middleware (for admin endpoints)
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      console.warn(`Blocked request from unauthorized IP: ${clientIP}`);
      return res.status(403).json({
        status: "error",
        message: "Access denied from this IP address",
      });
    }

    next();
  };
};

/**
 * Request size limiting middleware
 */
const requestSizeLimit = (maxSize = "10mb") => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers["content-length"] || "0");
    const maxSizeBytes = parseSize(maxSize);

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        status: "error",
        message: `Request size too large. Maximum allowed: ${maxSize}`,
      });
    }

    next();
  };
};

/**
 * Parse size string to bytes
 */
const parseSize = (size) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);

  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || "b";

  return Math.floor(value * units[unit]);
};

/**
 * Security logging middleware
 */
const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\s*\(/i, // Code injection
    /exec\s*\(/i, // Command injection
  ];

  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
  });

  const isSuspicious = suspiciousPatterns.some((pattern) =>
    pattern.test(requestString)
  );

  if (isSuspicious) {
    console.warn(`🚨 Suspicious request detected from IP: ${req.ip}`, {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });
  }

  // Log response time for performance monitoring
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    if (responseTime > 5000) {
      // Log slow requests
      console.warn(
        `🐌 Slow request detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`
      );
    }
  });

  next();
};

module.exports = {
  rateLimits,
  securityHeaders,
  sanitizeInput,
  validateRequest,
  ipWhitelist,
  requestSizeLimit,
  securityLogger,
};
