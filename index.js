require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const {
  rateLimits,
  securityHeaders,
  sanitizeInput,
  securityLogger,
} = require("./middleware/security");
const { enhancedAuthorization } = require("./middleware/refreshToken");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const app = express();
const sequelize = require("./config/sequelize");
const cacheService = require("./services/cache");
// Use serverless logger for Vercel deployment
const logger = require("./services/logger-serverless");
const {
  requestLogger,
  errorLogger,
  performanceMonitor,
  queryLogger,
} = require("./middleware/requestLogger");
const port = process.env.APP_PORT || 2025;
const UserRoutes = require("./routes/userRouter");
const AdminRoutes = require("./routes/adminRouter");
const MonitoringRoutes = require("./routes/monitoring");

// ✅ Load models
const { Users } = require("./models/userModel");
const { UserTemp } = require("./models/userTemp");
const { Otp } = require("./models/otpModel");
const { ResetOtp } = require("./models/resetOtpModel");
const { Wallets } = require("./models/walletModel");
const { Livestocks } = require("./models/livestockModel");
const { CreateGroups } = require("./models/createGroupModel");
const { joinGroups } = require("./models/joinGroupModel");
const { PendingPayments } = require("./models/pendingPaymentModel");
const { Transactions } = require("./models/transactionModel");

// ✅ Define associations
const defineAssociations = require("./models/associations");
defineAssociations();

// ✅ Environment Variables Validation
const requiredEnvVars = [
  "JWT_SECRET",
  "DATABASE_USER",
  "DATABASE_PASSWORD",
  "DATABASE_NAME",
  "DATABASE_HOST",
  "PAYSTACK_SECRET_KEY",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

console.log("✅ All required environment variables are present");

// ✅ Initialize logging
logger.info("Application starting up", {
  environment: process.env.NODE_ENV || "development",
  port: port,
  timestamp: new Date().toISOString(),
});

// ✅ Enhanced Security Middleware
app.use(securityHeaders);
app.use(securityLogger);

// ✅ Enhanced Rate Limiting
app.use(rateLimits.general);

// ✅ Logging Middleware
app.use(requestLogger);
app.use(performanceMonitor);

// ✅ PAYSTACK WEBHOOK (comes BEFORE body parsers)
/**
 * @swagger
 * /paystack-webhook:
 *   post:
 *     summary: Paystack webhook endpoint for payment notifications
 *     description: Receives webhook notifications from Paystack for payment events
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event type from Paystack
 *                 example: "charge.success"
 *               data:
 *                 type: object
 *                 properties:
 *                   reference:
 *                     type: string
 *                     description: Payment reference
 *                   amount:
 *                     type: number
 *                     description: Amount in kobo
 *                   status:
 *                     type: string
 *                     description: Payment status
 *                   customer:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Customer email
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Webhook received"
 *       400:
 *         description: Invalid webhook signature
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid signature"
 *     security: []
 */
app.post(
  "/paystack-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("Webhook signature verification failed!");
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    console.log("Received Paystack Webhook Event:", event.event);
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const amount = event.data.amount / 100;
      const status = event.data.status;
      const email = event.data.customer.email;
      console.log(
        `Charge Success: Reference ${reference}, Amount ${amount}, Status ${status}, Email ${email}`
      );
    }

    res.status(200).send("Webhook received");
  }
);

// ✅ CORS Middleware - Security Enhanced
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3003",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "access_token"],
    exposedHeaders: ["access_token"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// ✅ Body Parsers (after Paystack webhook)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Enhanced Input Sanitization
app.use(sanitizeInput);

// ✅ Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Farmeely API Documentation",
  })
);

// ✅ Apply specific rate limiting to sensitive routes
app.use("/users/login", rateLimits.auth);
app.use("/users/signup", rateLimits.auth);
app.use("/users/forgot-password", rateLimits.passwordReset);
app.use("/users/resend-otp", rateLimits.otp);
app.use("/wallet/funding", rateLimits.payment);
app.use("/groups/create/complete", rateLimits.payment);
app.use("/groups/join/complete", rateLimits.payment);
app.use("/groups/create/start", rateLimits.groupCreation);

// ✅ Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// ✅ Database Health Check Endpoint
app.get("/health/db", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Connection Failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ✅ Routes
console.log("🔧 Registering UserRoutes...");
app.use(UserRoutes);
console.log("✅ UserRoutes registered");

console.log("🔧 Registering AdminRoutes...");
app.use("/admin", AdminRoutes);
console.log("✅ AdminRoutes registered");

console.log("🔧 Registering MonitoringRoutes...");
app.use("/monitoring", MonitoringRoutes);
console.log("✅ MonitoringRoutes registered");

// ✅ 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ status: "error", message: "Not Found" });
});

// ✅ Global Error Handler
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  res.status(500).json({ status: "error", message: "Internal Server Error" });
});

// ✅ DB Connection and Cache Initialization
const connection = async () => {
  try {
    // Initialize Redis cache
    await cacheService.connect();
    logger.info("Cache service initialized");

    // Initialize database query logging
    queryLogger(sequelize);

    // Connect to database
    await sequelize.authenticate();
    logger.info("Database connection established successfully");

    // Sync database tables
    await sequelize.sync();
    logger.info("Database tables synced successfully");

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(
        `📊 Health check available at: http://localhost:${port}/health`
      );
      console.log(
        `📚 API docs available at: http://localhost:${port}/api-docs`
      );
      console.log(
        `📈 Monitoring dashboard at: http://localhost:${port}/monitoring/health`
      );

      logger.info("Server started successfully", {
        port: port,
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    if (error.parent) {
      console.error("Database Error Code:", error.parent.code);
      console.error("Database Error Message:", error.parent.sqlMessage);
      console.error("SQL Query:", error.parent.sql);
    }
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("Foreign key checks re-enabled after error.");
    } catch (reEnableError) {
      console.error("Failed to re-enable foreign key checks:", reEnableError);
    }
  }
};

connection();
