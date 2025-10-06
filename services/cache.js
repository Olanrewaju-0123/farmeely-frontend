const redis = require("redis");

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    // Temporarily disable Redis to fix backend startup
    console.log("⚠️ Redis temporarily disabled - running without cache");
    this.isConnected = false;
    this.client = null;

    // TODO: Re-enable Redis connection once Redis client issues are resolved
    /*
    try {
      console.log("🔄 Attempting to connect to Redis...");

      // Create Redis client with simplified configuration
      const redisUrl = `redis://${process.env.REDIS_HOST || "redis"}:${
        process.env.REDIS_PORT || 6379
      }`;
      console.log(`Redis URL: ${redisUrl}`);

      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 3000,
          reconnectStrategy: false, // Disable automatic reconnection for now
        },
      });

      // Set up event listeners
      this.client.on("error", (err) => {
        console.warn("Redis Client Error:", err.message || err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("✅ Redis connected successfully");
        this.isConnected = true;
      });

      this.client.on("ready", () => {
        console.log("✅ Redis ready for operations");
        this.isConnected = true;
      });

      this.client.on("end", () => {
        console.log("Redis connection ended");
        this.isConnected = false;
      });

      // Try to connect with a shorter timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis connection timeout")), 5000)
        ),
      ]);

      console.log("✅ Redis connection established successfully");
    } catch (error) {
      console.warn(
        "⚠️ Redis connection failed, continuing without cache:",
        error.message
      );
      this.isConnected = false;
      this.client = null;
      // Don't throw error, let the app continue without Redis
    }
    */
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn("Redis GET error:", error.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Redis SET error:", error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.warn("Redis DEL error:", error.message);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.warn("Redis EXISTS error:", error.message);
      return false;
    }
  }

  // Cache key generators
  static generateKey(prefix, ...params) {
    return `${prefix}:${params.join(":")}`;
  }

  // Common cache keys
  static keys = {
    USER_PROFILE: (userId) => `user:profile:${userId}`,
    USER_WALLET: (userId) => `user:wallet:${userId}`,
    ACTIVE_GROUPS: () => "groups:active",
    GROUP_DETAILS: (groupId) => `group:details:${groupId}`,
    USER_GROUPS: (userId) => `user:groups:${userId}`,
    LIVESTOCK_LIST: () => "livestock:list",
    USER_TRANSACTIONS: (userId) => `user:transactions:${userId}`,
  };

  // Cache TTL constants (in seconds)
  static ttl = {
    SHORT: 300, // 5 minutes
    MEDIUM: 900, // 15 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  };
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
