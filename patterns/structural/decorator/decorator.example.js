import {
  createMethodLogger,
  createPerformanceMonitor,
  createRetryDecorator,
  createCacheDecorator,
} from './decorator.implementation.js';
import {
  withLogging,
  withPerformanceMonitoring,
  withRetry,
  withCache,
  compose,
} from './decorator.functional.js';
import { applyDecorators } from './decorator.utils.js';

// ----------------- CLASS-BASED APPROACH EXAMPLES -----------------

// Create decorator instances with specific configurations
const logMethod = createMethodLogger({
  prefix: '[API]',
  logger: console.log,
});

const monitorPerformance = createPerformanceMonitor({
  threshold: 100, // Only log methods that take more than 100ms
});

const withRetryPolicy = createRetryDecorator({
  maxAttempts: 3,
  delay: 1000,
  retryCondition: (error) => {
    // Only retry on network errors or 5xx responses
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      (error.response && error.response.status >= 500)
    );
  },
});

const cacheResults = createCacheDecorator({
  ttl: 5 * 60 * 1000, // 5 minutes cache
  keyGenerator: (...args) =>
    args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(':'),
});

// Example class using the decorators
class UserService {
  constructor(apiClient, database) {
    this.apiClient = apiClient;
    this.database = database;
  }

  // Apply multiple decorators to a method
  async getUser(userId) {
    // Simulate API call
    console.log(`Fetching user with ID: ${userId}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Simulate response
    return {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date().toISOString(),
    };
  }

  async updateUserProfile(userId, profileData) {
    console.log(`Updating profile for user ${userId}`);

    // Validate input
    if (!profileData || typeof profileData !== 'object') throw new Error('Invalid profile data');

    // Simulate API call with potential for failure
    if (Math.random() < 0.3) {
      // 30% chance of failure
      const error = new Error('Network error');
      error.code = 'ECONNRESET';
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      id: userId,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
  }

  async getUserActivity(userId, startDate, endDate) {
    console.log(`Fetching activity for user ${userId} from ${startDate} to ${endDate}`);

    // Simulate database query
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate random activity data
    return Array.from({ length: 5 }, (_, i) => ({
      id: `act-${i}`,
      userId,
      type: ['login', 'purchase', 'pageView'][Math.floor(Math.random() * 3)],
      timestamp: new Date(
        new Date(startDate).getTime() +
          Math.random() * (new Date(endDate).getTime() - new Date(startDate).getTime())
      ).toISOString(),
    }));
  }
}

// Apply decorators to methods
applyDecorators(UserService.prototype, 'getUser', [logMethod, cacheResults]);

applyDecorators(UserService.prototype, 'updateUserProfile', [
  logMethod,
  monitorPerformance,
  withRetryPolicy,
]);

applyDecorators(UserService.prototype, 'getUserActivity', [
  logMethod,
  cacheResults,
  monitorPerformance,
]);

// ----------------- FUNCTIONAL APPROACH EXAMPLES -----------------

// Raw functions that we want to decorate
async function fetchProductData(productId) {
  console.log(`Fetching product data for ID: ${productId}`);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 250));

  // Simulate occasional failure
  if (Math.random() < 0.2) throw new Error('API request failed');

  return {
    id: productId,
    name: `Product ${productId}`,
    price: Math.floor(Math.random() * 100) + 1,
    inStock: Math.random() > 0.3,
  };
}

async function calculateOrderTotal(items) {
  console.log(`Calculating total for ${items.length} items`);

  // Simulate complex calculation
  await new Promise((resolve) => setTimeout(resolve, 150));

  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Apply decorators using composition
const enhancedFetchProduct = compose(
  (fn) => withCache(fn, { ttl: 120000 }), // 2 minute cache
  (fn) => withRetry(fn, { maxAttempts: 3 }),
  (fn) => withLogging(fn, { prefix: '[Product API]' }),
  (fn) => withPerformanceMonitoring(fn, { threshold: 200 })
)(fetchProductData);

const enhancedCalculateTotal = compose(
  (fn) => withLogging(fn, { prefix: '[Order Service]' }),
  (fn) => withPerformanceMonitoring(fn)
)(calculateOrderTotal);

// Example usage:
async function runExample() {
  console.log('---- CLASS-BASED DECORATOR EXAMPLE ----');
  const userService = new UserService();

  try {
    // This will be cached after first call
    const user1 = await userService.getUser('user123');
    console.log('First call result:', user1);

    // This should hit the cache
    const user2 = await userService.getUser('user123');
    console.log('Second call result (should be cached):', user2);

    // This demonstrates retry logic
    const updatedUser = await userService.updateUserProfile('user123', {
      name: 'Updated Name',
      email: 'updated@example.com',
    });
    console.log('Profile update result:', updatedUser);

    // This demonstrates performance monitoring on a slow operation
    const activities = await userService.getUserActivity('user123', '2023-01-01', '2023-12-31');
    console.log(`Retrieved ${activities.length} activities`);
  } catch (error) {
    console.error('Error in class-based example:', error);
  }

  console.log('\n---- FUNCTIONAL DECORATOR EXAMPLE ----');

  try {
    // This will demonstrate retry and caching
    const product = await enhancedFetchProduct('prod456');
    console.log('Product data:', product);

    // This will demonstrate logging and performance monitoring
    const orderTotal = await enhancedCalculateTotal([
      { id: 'prod1', price: 29.99, quantity: 2 },
      { id: 'prod2', price: 49.99, quantity: 1 },
      { id: 'prod3', price: 9.99, quantity: 5 },
    ]);
    console.log('Order total:', orderTotal);

    // Second call to demonstrate caching
    const cachedProduct = await enhancedFetchProduct('prod456');
    console.log('Cached product data:', cachedProduct);
  } catch (error) {
    console.error('Error in functional example:', error);
  }
}

runExample().catch(console.error);
