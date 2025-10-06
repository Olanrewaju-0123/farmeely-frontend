const express = require("express");
const logger = require("../services/logger");
const cacheService = require("../services/cache");
const sequelize = require("../config/sequelize");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/**
 * @swagger
 * /monitoring/health:
 *   get:
 *     summary: Detailed health check with system metrics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *                 metrics:
 *                   type: object
 */
router.get("/health", async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connection
    let dbStatus = "disconnected";
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await sequelize.authenticate();
      dbResponseTime = Date.now() - dbStart;
      dbStatus = "connected";
    } catch (error) {
      logger.error("Database health check failed", { error: error.message });
    }

    // Check Redis connection
    let redisStatus = "disconnected";
    try {
      if (cacheService.isConnected) {
        redisStatus = "connected";
      }
    } catch (error) {
      logger.error("Redis health check failed", { error: error.message });
    }

    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const healthData = {
      status: dbStatus === "connected" ? "OK" : "DEGRADED",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      metrics: {
        responseTime: Date.now() - startTime,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        cache: {
          status: redisStatus,
          connected: cacheService.isConnected,
        },
      },
    };

    logger.info("Health check completed", {
      status: healthData.status,
      responseTime: healthData.metrics.responseTime,
    });

    res.status(200).json(healthData);
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /monitoring/metrics:
 *   get:
 *     summary: Get system performance metrics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: System metrics
 */
router.get("/metrics", async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    // Add database metrics if available
    try {
      const [results] = await sequelize.query(
        'SHOW STATUS LIKE "Threads_connected"'
      );
      if (results && results.length > 0) {
        metrics.database = {
          connections: results[0].Value,
        };
      }
    } catch (error) {
      logger.warn("Could not fetch database metrics", { error: error.message });
    }

    res.json(metrics);
  } catch (error) {
    logger.error("Metrics collection failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /monitoring/logs:
 *   get:
 *     summary: Get recent log entries
 *     tags: [Monitoring]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: Log level filter
 *       - in: query
 *         name: lines
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of log lines to return
 *     responses:
 *       200:
 *         description: Recent log entries
 */
router.get("/logs", (req, res) => {
  try {
    const level = req.query.level || "info";
    const lines = parseInt(req.query.lines) || 100;

    const logFile = path.join(
      __dirname,
      "../logs",
      `combined-${new Date().toISOString().split("T")[0]}.log`
    );

    if (!fs.existsSync(logFile)) {
      return res.json({ logs: [], message: "No log file found for today" });
    }

    // Read last N lines from log file
    const logContent = fs.readFileSync(logFile, "utf8");
    const logLines = logContent.split("\n").filter((line) => line.trim());

    // Filter by level if specified
    let filteredLines = logLines;
    if (level !== "all") {
      filteredLines = logLines.filter(
        (line) =>
          line.includes(`[${level.toUpperCase()}]`) ||
          line.includes(`"level":"${level}"`)
      );
    }

    // Get last N lines
    const recentLogs = filteredLines.slice(-lines);

    res.json({
      logs: recentLogs,
      total: filteredLines.length,
      level,
      lines: recentLogs.length,
    });
  } catch (error) {
    logger.error("Log retrieval failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /monitoring/cache:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Cache statistics
 */
router.get("/cache", async (req, res) => {
  try {
    const cacheStats = {
      connected: cacheService.isConnected,
      status: cacheService.isConnected ? "active" : "inactive",
      timestamp: new Date().toISOString(),
    };

    // If Redis is connected, get additional stats
    if (cacheService.isConnected && cacheService.client) {
      try {
        const info = await cacheService.client.info();
        cacheStats.info = info;
      } catch (error) {
        logger.warn("Could not fetch Redis info", { error: error.message });
      }
    }

    res.json(cacheStats);
  } catch (error) {
    logger.error("Cache stats retrieval failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /monitoring/database:
 *   get:
 *     summary: Get database statistics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Database statistics
 */
router.get("/database", async (req, res) => {
  try {
    const dbStats = {
      connected: false,
      status: "disconnected",
      timestamp: new Date().toISOString(),
    };

    try {
      await sequelize.authenticate();
      dbStats.connected = true;
      dbStats.status = "connected";

      // Get basic database stats
      const [tableCount] = await sequelize.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()"
      );
      const [connectionCount] = await sequelize.query(
        "SHOW STATUS LIKE 'Threads_connected'"
      );

      dbStats.tables = tableCount[0].count;
      dbStats.connections = connectionCount[0].Value;
    } catch (error) {
      logger.error("Database stats retrieval failed", { error: error.message });
      dbStats.error = error.message;
    }

    res.json(dbStats);
  } catch (error) {
    logger.error("Database monitoring failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
