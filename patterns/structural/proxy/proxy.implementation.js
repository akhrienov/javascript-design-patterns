/**
 * @fileoverview Implementation of the Proxy Pattern with a real-world use case.
 *
 * This implementation showcases an API client with rate limiting,
 * request caching, and error handling capabilities using the Proxy Pattern.
 */

// Base API Client - RealSubject in Proxy Pattern
class ApiClient {
  /**
   * Creates a new API client instance
   * @param {string} baseUrl - Base URL for the API
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

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
      const response = await fetch(`${this.baseUrl}${endpoint}${queryString}`);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a POST request to the specified endpoint
   * @param {string} endpoint - API endpoint to call
   * @param {Object} data - Data to send
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
  }
}

// Proxy implementation with caching and rate limiting capabilities
class ApiClientProxy {
  /**
   * Creates a proxy around an API client with enhanced capabilities
   * @param {string} baseUrl - Base URL for the API
   * @param {Object} options - Configuration options
   * @param {number} options.cacheTtl - Cache TTL in milliseconds
   * @param {number} options.rateLimit - Max requests per minute
   */
  constructor(baseUrl, options = {}) {
    // Default options
    this.options = {
      cacheTtl: 60000, // 1 minute cache TTL
      rateLimit: 30, // 30 requests per minute
      ...options,
    };

    // Create the real API client
    this.client = new ApiClient(baseUrl);

    // Set up cache
    this.cache = new Map();

    // Set up rate limiting
    this.requestTimestamps = [];
  }

  /**
   * Check if we're within rate limits
   * @returns {boolean} True if within rate limits
   * @throws {Error} If rate limit exceeded
   */
  checkRateLimit() {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    // Remove timestamps older than our window
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => timestamp > windowStart);

    // Check if we've exceeded our rate limit
    if (this.requestTimestamps.length >= this.options.rateLimit) {
      const oldestTimestamp = this.requestTimestamps[0];
      const resetTime = new Date(oldestTimestamp + 60000);

      throw new Error(
        `Rate limit of ${this.options.rateLimit} requests per minute exceeded. ` +
          `Try again after ${resetTime.toLocaleTimeString()}.`
      );
    }

    // Add current timestamp to the list
    this.requestTimestamps.push(now);
    return true;
  }

  /**
   * Generate a cache key for a request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters or data
   * @returns {string} Cache key
   */
  getCacheKey(method, endpoint, params = {}) {
    return `${method}:${endpoint}:${JSON.stringify(params)}`;
  }

  /**
   * Check if a valid cached response exists
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached response or null
   */
  getFromCache(cacheKey) {
    if (!this.cache.has(cacheKey)) return null;

    const { data, timestamp } = this.cache.get(cacheKey);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp > this.options.cacheTtl) {
      // Cache expired
      this.cache.delete(cacheKey);
      return null;
    }

    return data;
  }

  /**
   * Store response in cache
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Response data
   */
  storeInCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Perform a GET request with caching and rate limiting
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}) {
    const cacheKey = this.getCacheKey('GET', endpoint, params);

    // Check cache first
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) return cachedData;

    // Check rate limit
    this.checkRateLimit();

    // Forward to real client
    try {
      const data = await this.client.get(endpoint, params);

      // Cache the successful response
      this.storeInCache(cacheKey, data);

      return data;
    } catch (error) {
      // Enhance error with proxy information
      error.message = `[ApiClientProxy] ${error.message}`;
      throw error;
    }
  }

  /**
   * Perform a POST request with rate limiting (no caching for mutations)
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to send
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}) {
    // Check rate limit
    this.checkRateLimit();

    // Forward to real client
    try {
      return await this.client.post(endpoint, data);
    } catch (error) {
      // Enhance error with proxy information
      error.message = `[ApiClientProxy] ${error.message}`;
      throw error;
    }
  }

  /**
   * Clear the entire cache or a specific entry
   * @param {string} [cacheKey] - Optional specific cache key to clear
   */
  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const stats = {
      size: this.cache.size,
      entries: [],
    };

    for (const [key, { timestamp }] of this.cache.entries()) {
      const expiresAt = new Date(timestamp + this.options.cacheTtl);
      stats.entries.push({
        key,
        expiresAt: expiresAt.toISOString(),
      });
    }

    return stats;
  }
}

export { ApiClient, ApiClientProxy };
