/**
 * Creates a logger decorator for functions
 * @param {Function} fn - The function to be decorated
 * @param {Object} options - Configuration options
 * @param {string} options.prefix - Log prefix
 * @param {Function} options.logger - Logger function
 */
function withLogging(fn, options = {}) {
  const {
    prefix = '[Logger]',
    logger = console.log,
    functionName = fn.name || 'anonymous',
  } = options;

  return async function (...args) {
    logger(`${prefix} ${functionName} called with:`, args);

    try {
      const result = await fn.apply(this, args);
      logger(`${prefix} ${functionName} returned:`, result);
      return result;
    } catch (error) {
      logger(`${prefix} ${functionName} error:`, error);
      throw error;
    }
  };
}

/**
 * Creates a performance monitoring decorator for functions
 * @param {Function} fn - The function to be decorated
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Minimum execution time to log (ms)
 * @param {Function} options.logger - Logger function
 */
function withPerformanceMonitoring(fn, options = {}) {
  const { threshold = 0, logger = console.log, functionName = fn.name || 'anonymous' } = options;

  return async function (...args) {
    const startTime = performance.now();

    try {
      const result = await fn.apply(this, args);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      if (executionTime > threshold) {
        logger(`Performance [${functionName}]: ${executionTime.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      logger(`Performance [${functionName}] Error: ${endTime - startTime}ms`);
      throw error;
    }
  };
}

/**
 * Creates a retry decorator for functions
 * @param {Function} fn - The function to be decorated
 * @param {Object} options - Configuration options
 * @param {number} options.maxAttempts - Maximum retry attempts
 * @param {number} options.delay - Delay between retries (ms)
 * @param {Function} options.retryCondition - Function to determine if retry should be attempted
 */
function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    retryCondition = (error) => true,
    logger = console.log,
    functionName = fn.name || 'anonymous',
  } = options;

  // Helper function to delay execution
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return async function (...args) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (attempt > 1) {
          logger(`Retry [${functionName}]: Attempt ${attempt}/${maxAttempts}`);
        }

        return await fn.apply(this, args);
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts && retryCondition(error)) {
          logger(
            `Retry [${functionName}]: Failed attempt ${attempt}/${maxAttempts}. Retrying in ${delay}ms...`
          );
          await wait(delay);
        } else {
          logger(`Retry [${functionName}]: All attempts failed.`);
          throw error;
        }
      }
    }

    throw lastError;
  };
}

/**
 * Creates a caching decorator for functions
 * @param {Function} fn - The function to be decorated
 * @param {Object} options - Configuration options
 * @param {number} options.ttl - Time-to-live for cache entries (ms)
 * @param {Function} options.keyGenerator - Function to generate cache keys
 */
function withCache(fn, options = {}) {
  const {
    ttl = 60000, // 1 minute default TTL
    keyGenerator = (...args) => JSON.stringify(args),
    logger = console.log,
    functionName = fn.name || 'anonymous',
  } = options;

  const cacheStore = new Map();

  return async function (...args) {
    const cacheKey = `${functionName}:${keyGenerator(...args)}`;

    // Check if we have a valid cached value
    if (cacheStore.has(cacheKey)) {
      const { value, expiry } = cacheStore.get(cacheKey);

      if (expiry > Date.now()) {
        logger(`Cache [${functionName}]: Cache hit`);
        return value;
      } else {
        // Expired entry
        cacheStore.delete(cacheKey);
        logger(`Cache [${functionName}]: Cache expired`);
      }
    } else {
      logger(`Cache [${functionName}]: Cache miss`);
    }

    // Execute the original function
    const result = await fn.apply(this, args);

    // Store the result in cache
    cacheStore.set(cacheKey, {
      value: result,
      expiry: Date.now() + ttl,
    });

    return result;
  };
}

/**
 * Compose multiple decorators into a single decorator
 * @param {...Function} decorators - Decorators to compose
 */
function compose(...decorators) {
  return function (fn) {
    return decorators.reduceRight((decorated, decorator) => decorator(decorated), fn);
  };
}

export { withLogging, withPerformanceMonitoring, withRetry, withCache, compose };
