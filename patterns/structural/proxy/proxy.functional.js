/**
 * @fileoverview Functional implementation of the Proxy Pattern with a real-world use case.
 *
 * This implementation showcases an API client with rate limiting,
 * request caching, and error handling capabilities using the Proxy Pattern
 * with a functional programming approach.
 */

/**
 * Creates a base API client
 * @param {string} baseUrl - Base URL for the API
 * @returns {Object} API client object
 */
function createApiClient(baseUrl) {
  return {
    /**
     * Perform a GET request to the specified endpoint
     * @param {string} endpoint - API endpoint to call
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Response data
     */
    async get(endpoint, params = {}) {
      // Convert params object to query string
      const queryString = Object.keys(params).length
        ? '?' + new URLSearchParams(params).toString()
        : '';

      try {
        const response = await fetch(`${baseUrl}${endpoint}${queryString}`);

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        return await response.json();
      } catch (error) {
        throw error;
      }
    },

    /**
     * Perform a POST request to the specified endpoint
     * @param {string} endpoint - API endpoint to call
     * @param {Object} data - Data to send
     * @returns {Promise<Object>} Response data
     */
    async post(endpoint, data = {}) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        return await response.json();
      } catch (error) {
        throw error;
      }
    },
  };
}

/**
 * Creates a proxy around an API client with enhanced capabilities
 * @param {string} baseUrl - Base URL for the API
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced API client proxy
 */
function createApiClientProxy(baseUrl, options = {}) {
  // Default options
  const config = {
    cacheTtl: 60000, // 1 minute cache TTL
    rateLimit: 30, // 30 requests per minute
    ...options,
  };

  // Create the real API client
  const client = createApiClient(baseUrl);

  // Set up cache and rate limiting state
  const cache = new Map();
  let requestTimestamps = [];

  /**
   * Check if we're within rate limits
   * @returns {boolean} True if within rate limits
   * @throws {Error} If rate limit exceeded
   */
  function checkRateLimit() {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    // Remove timestamps older than our window
    requestTimestamps = requestTimestamps.filter((timestamp) => timestamp > windowStart);

    // Check if we've exceeded our rate limit
    if (requestTimestamps.length >= config.rateLimit) {
      const oldestTimestamp = requestTimestamps[0];
      const resetTime = new Date(oldestTimestamp + 60000);

      throw new Error(
        `Rate limit of ${config.rateLimit} requests per minute exceeded. ` +
          `Try again after ${resetTime.toLocaleTimeString()}.`
      );
    }

    // Add current timestamp to the list
    requestTimestamps.push(now);
    return true;
  }

  /**
   * Generate a cache key for a request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters or data
   * @returns {string} Cache key
   */
  function getCacheKey(method, endpoint, params = {}) {
    return `${method}:${endpoint}:${JSON.stringify(params)}`;
  }

  /**
   * Check if a valid cached response exists
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached response or null
   */
  function getFromCache(cacheKey) {
    if (!cache.has(cacheKey)) return null;

    const { data, timestamp } = cache.get(cacheKey);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp > config.cacheTtl) {
      // Cache expired
      cache.delete(cacheKey);
      return null;
    }

    return data;
  }

  /**
   * Store response in cache
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Response data
   */
  function storeInCache(cacheKey, data) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  // Return the proxy object
  return {
    /**
     * Perform a GET request with caching and rate limiting
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Response data
     */
    async get(endpoint, params = {}) {
      const cacheKey = getCacheKey('GET', endpoint, params);

      // Check cache first
      const cachedData = getFromCache(cacheKey);
      if (cachedData) return cachedData;

      // Check rate limit
      checkRateLimit();

      // Forward to real client
      try {
        const data = await client.get(endpoint, params);

        // Cache the successful response
        storeInCache(cacheKey, data);

        return data;
      } catch (error) {
        // Enhance error with proxy information
        error.message = `[ApiClientProxy] ${error.message}`;
        throw error;
      }
    },

    /**
     * Perform a POST request with rate limiting (no caching for mutations)
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @returns {Promise<Object>} Response data
     */
    async post(endpoint, data = {}) {
      // Check rate limit
      checkRateLimit();

      // Forward to real client
      try {
        return await client.post(endpoint, data);
      } catch (error) {
        // Enhance error with proxy information
        error.message = `[ApiClientProxy] ${error.message}`;
        throw error;
      }
    },

    /**
     * Clear the entire cache or a specific entry
     * @param {string} [cacheKey] - Optional specific cache key to clear
     */
    clearCache(cacheKey = null) {
      if (cacheKey) {
        cache.delete(cacheKey);
      } else {
        cache.clear();
      }
    },

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
      const stats = {
        size: cache.size,
        entries: [],
      };

      for (const [key, { timestamp }] of cache.entries()) {
        const expiresAt = new Date(timestamp + config.cacheTtl);
        stats.entries.push({
          key,
          expiresAt: expiresAt.toISOString(),
        });
      }

      return stats;
    },

    // For testing purposes, expose internals
    _internals: {
      cache,
      get requestTimestamps() {
        return [...requestTimestamps];
      },
      client,
      config,
    },
  };
}

export { createApiClient, createApiClientProxy };
