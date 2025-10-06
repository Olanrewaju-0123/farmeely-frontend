const cacheService = require("../services/cache");

/**
 * Cache middleware factory
 * @param {string} keyGenerator - Function to generate cache key
 * @param {number} ttl - Time to live in seconds
 * @param {boolean} skipCache - Function to determine if cache should be skipped
 */
const cache = (keyGenerator, ttl = 300, skipCache = () => false) => {
  return async (req, res, next) => {
    // Skip cache if condition is met
    if (skipCache(req)) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator(req);

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache HIT for key: ${cacheKey}`);
        return res.status(200).json({
          status: "success",
          message: "Data retrieved from cache",
          data: cachedData,
          cached: true,
        });
      }

      console.log(`❌ Cache MISS for key: ${cacheKey}`);

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.status === "success" && data.data) {
          cacheService.set(cacheKey, data.data, ttl).catch((err) => {
            console.warn("Failed to cache response:", err.message);
          });
        }

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.warn("Cache middleware error:", error.message);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * @param {string[]} patterns - Cache key patterns to invalidate
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to invalidate cache after successful response
    res.json = function (data) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(async (pattern) => {
          try {
            // For now, we'll use a simple pattern matching
            // In production, you might want to use Redis SCAN for pattern matching
            await cacheService.del(pattern);
          } catch (error) {
            console.warn(
              "Failed to invalidate cache pattern:",
              pattern,
              error.message
            );
          }
        });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Predefined cache configurations for common endpoints
 */
const cacheConfigs = {
  // User profile cache (5 minutes)
  userProfile: (req) =>
    cache(
      (req) => cacheService.constructor.keys.USER_PROFILE(req.user.user_id),
      cacheService.constructor.ttl.SHORT
    ),

  // User wallet cache (2 minutes)
  userWallet: (req) =>
    cache(
      (req) => cacheService.constructor.keys.USER_WALLET(req.user.user_id),
      cacheService.constructor.ttl.SHORT
    ),

  // Active groups cache (10 minutes)
  activeGroups: () =>
    cache(
      () => cacheService.constructor.keys.ACTIVE_GROUPS(),
      cacheService.constructor.ttl.MEDIUM
    ),

  // Group details cache (15 minutes)
  groupDetails: (req) =>
    cache(
      (req) => cacheService.constructor.keys.GROUP_DETAILS(req.params.groupId),
      cacheService.constructor.ttl.MEDIUM
    ),

  // User groups cache (5 minutes)
  userGroups: (req) =>
    cache(
      (req) => cacheService.constructor.keys.USER_GROUPS(req.user.user_id),
      cacheService.constructor.ttl.SHORT
    ),

  // Livestock list cache (30 minutes)
  livestockList: () =>
    cache(
      () => cacheService.constructor.keys.LIVESTOCK_LIST(),
      cacheService.constructor.ttl.LONG
    ),

  // User transactions cache (2 minutes)
  userTransactions: (req) =>
    cache(
      (req) =>
        cacheService.constructor.keys.USER_TRANSACTIONS(req.user.user_id),
      cacheService.constructor.ttl.SHORT
    ),
};

module.exports = {
  cache,
  invalidateCache,
  cacheConfigs,
  cacheService,
};
