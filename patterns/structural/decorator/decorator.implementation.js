/**
 * A factory that creates a logging decorator for class methods
 * @param {Object} options - Configuration options for the logger
 * @param {string} options.prefix - Prefix to add to log messages
 * @param {Function} options.logger - The logger function (defaults to console.log)
 */
function createMethodLogger(options = {}) {
  const { prefix = '[Logger]', logger = console.log } = options;

  /**
   * Method decorator that logs method calls with parameters and return values
   * @param {Object} target - The class prototype
   * @param {string} propertyKey - Name of the method being decorated
   * @param {PropertyDescriptor} descriptor - Property descriptor for the method
   */
  return function methodLogger(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    // Replace the original method with the enhanced version
    descriptor.value = function (...args) {
      const className = this.constructor.name;
      const methodName = propertyKey;

      logger(`${prefix} ${className}.${methodName} called with:`, args);

      try {
        // Call the original method
        const result = originalMethod.apply(this, args);

        // Handle Promises
        if (result && typeof result.then === 'function') {
          return result
            .then((value) => {
              logger(`${prefix} ${className}.${methodName} resolved with:`, value);
              return value;
            })
            .catch((error) => {
              logger(`${prefix} ${className}.${methodName} rejected with:`, error);
              throw error;
            });
        }

        // Handle synchronous returns
        logger(`${prefix} ${className}.${methodName} returned:`, result);
        return result;
      } catch (error) {
        logger(`${prefix} ${className}.${methodName} threw an error:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator factory for measuring method execution time
 * @param {Object} options - Configuration options
 * @param {Function} options.logger - Logger function to use
 */
function createPerformanceMonitor(options = {}) {
  const {
    logger = console.log,
    threshold = 0, // Log all executions by default
  } = options;

  return function performanceMonitor(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      const startTime = performance.now();
      const className = this.constructor.name;

      try {
        const result = originalMethod.apply(this, args);

        // Handle Promise returns
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            const endTime = performance.now();
            const executionTime = endTime - startTime;

            if (executionTime > threshold) {
              logger(`Performance [${className}.${propertyKey}]: ${executionTime.toFixed(2)}ms`);
            }
          });
        }

        // Handle synchronous returns
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        if (executionTime > threshold) {
          logger(`Performance [${className}.${propertyKey}]: ${executionTime.toFixed(2)}ms`);
        }

        return result;
      } catch (error) {
        const endTime = performance.now();
        logger(`Performance [${className}.${propertyKey}] Error: ${endTime - startTime}ms`);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for implementing retry logic on methods
 * @param {Object} options - Retry configuration options
 * @param {number} options.maxAttempts - Maximum number of retry attempts
 * @param {number} options.delay - Delay between retries in milliseconds
 * @param {Function} options.retryCondition - Function to determine if retry should be attempted
 */
function createRetryDecorator(options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    retryCondition = (error) => true, // Retry on any error by default
    logger = console.log,
  } = options;

  // Helper function to delay execution
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return function retry(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      let lastError;
      const className = this.constructor.name;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          if (attempt > 1) {
            logger(`Retry [${className}.${propertyKey}]: Attempt ${attempt}/${maxAttempts}`);
          }

          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;

          if (attempt < maxAttempts && retryCondition(error)) {
            logger(
              `Retry [${className}.${propertyKey}]: Failed attempt ${attempt}/${maxAttempts}. Retrying in ${delay}ms...`
            );
            await wait(delay);
          } else {
            logger(`Retry [${className}.${propertyKey}]: All attempts failed.`);
            throw error;
          }
        }
      }

      // This should not be reached, but just in case
      throw lastError;
    };

    return descriptor;
  };
}

/**
 * Decorator factory for implementing caching on method results
 * @param {Object} options - Cache configuration options
 * @param {number} options.ttl - Time-to-live for cache entries in milliseconds
 * @param {Function} options.keyGenerator - Function to generate cache keys from arguments
 */
function createCacheDecorator(options = {}) {
  const {
    ttl = 60000, // 1 minute default TTL
    keyGenerator = (...args) => JSON.stringify(args),
    logger = console.log,
  } = options;

  return function cache(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const cacheStore = new Map();

    descriptor.value = async function (...args) {
      const className = this.constructor.name;
      const methodName = propertyKey;
      const cacheKey = `${className}.${methodName}:${keyGenerator(...args)}`;

      // Check if we have a valid cached value
      if (cacheStore.has(cacheKey)) {
        const { value, expiry } = cacheStore.get(cacheKey);

        if (expiry > Date.now()) {
          logger(`Cache [${className}.${methodName}]: Cache hit`);
          return value;
        } else {
          // Expired entry
          cacheStore.delete(cacheKey);
          logger(`Cache [${className}.${methodName}]: Cache expired`);
        }
      } else {
        logger(`Cache [${className}.${methodName}]: Cache miss`);
      }

      // Execute the original method
      const result = await originalMethod.apply(this, args);

      // Store the result in cache
      cacheStore.set(cacheKey, {
        value: result,
        expiry: Date.now() + ttl,
      });

      return result;
    };

    return descriptor;
  };
}

export { createMethodLogger, createPerformanceMonitor, createRetryDecorator, createCacheDecorator };
