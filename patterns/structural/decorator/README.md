# Decorator Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Decorator Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Decorator Pattern allows you to add behavior to individual objects dynamically without affecting the behavior of other objects from the same class. This implementation focuses on cross-cutting concerns in enterprise applications like logging, performance monitoring, caching, and retry mechanisms, demonstrating practical applications in real-world scenarios.

## Repository Structure

```
patterns/
└── structural/
    └── decorator/
        ├── README.md
        ├── decorator.implementation.js  # Class-based implementation
        ├── decorator.functional.js      # Functional implementation
        ├── decorator.example.js         # Usage examples
        ├── decorator.spec.js            # Test suite
        ├── package.json                 # Project configuration
        └── vitest.config.js             # Test configuration
```

## Features

- Two implementation approaches:
    - Class-based decorators using property descriptors
    - Functional decorators using higher-order functions
- Cross-cutting Concerns:
    - Method/Function Logging
    - Performance Monitoring
    - Automatic Retry Logic
    - Result Caching with TTL
- Composable decorators with fluent API
- Enterprise-level error handling
- Comprehensive test coverage

## Implementation Details

### Class-based Approach

```javascript
// Create decorator factory instances
const logMethod = createMethodLogger({ prefix: '[API]' });
const withRetryPolicy = createRetryDecorator({ maxAttempts: 3 });

// Define your service class
class UserService {
  async getUser(userId) {
    // Implementation...
  }
}

// Apply decorators to methods
applyDecorators(UserService.prototype, 'getUser', [
  logMethod,
  cacheResults
]);
```

### Functional Approach

```javascript
// Original function
async function fetchProductData(productId) {
  // Implementation...
}

// Apply decorators using composition
const enhancedFetchProduct = compose(
  fn => withCache(fn, { ttl: 120000 }),
  fn => withRetry(fn, { maxAttempts: 3 }),
  fn => withLogging(fn, { prefix: '[Product API]' })
)(fetchProductData);

// Use the enhanced function
const product = await enhancedFetchProduct('product-123');
```

## Usage Examples

### API Service with Retry and Caching

```javascript
class UserService {
  constructor(apiClient, database) {
    this.apiClient = apiClient;
    this.database = database;
  }
  
  async getUser(userId) {
    console.log(`Fetching user with ID: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com'
    };
  }
  
  async updateUserProfile(userId, profileData) {
    console.log(`Updating profile for user ${userId}`);
    if (Math.random() < 0.3) { // Simulate occasional failure
      const error = new Error('Network error');
      error.code = 'ECONNRESET';
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    return {
      id: userId,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
  }
}

// Apply decorators
applyDecorators(UserService.prototype, 'getUser', [
  logMethod,
  cacheResults
]);

applyDecorators(UserService.prototype, 'updateUserProfile', [
  logMethod,
  monitorPerformance,
  withRetryPolicy
]);
```

### Function Composition with Multiple Decorators

```javascript
// Original function
async function calculateOrderTotal(items) {
  console.log(`Calculating total for ${items.length} items`);
  await new Promise(resolve => setTimeout(resolve, 150));
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Apply multiple decorators with composition
const enhancedCalculateTotal = compose(
  fn => withLogging(fn, { prefix: '[Order Service]' }),
  fn => withPerformanceMonitoring(fn),
  fn => withCache(fn, { ttl: 30000 })
)(calculateOrderTotal);

// Use the enhanced function
const total = await enhancedCalculateTotal([
  { id: 'prod1', price: 29.99, quantity: 2 },
  { id: 'prod2', price: 49.99, quantity: 1 }
]);
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- Decorator application and chaining
- Logging behavior for methods and functions
- Performance monitoring accuracy
- Retry behavior with different configurations
- Cache hits, misses, and expiration
- Error handling scenarios
- Decorator composition

## Key Considerations

1. **Decorator Application**
    - Property descriptor manipulation
    - Method chaining
    - Preserving original behavior

2. **Asynchronous Handling**
    - Promise-aware decorators
    - Async function support
    - Error propagation

3. **Performance Impact**
    - Strategic decorator application
    - Configurable thresholds
    - Cache optimization

4. **Composability**
    - Functional composition
    - Order of decorators
    - Clean separation of concerns

## Practical Applications

The Decorator Pattern is especially useful for:

- API clients and service layers
- Database access methods
- Long-running operations
- Network-bound functionality
- Cross-cutting concerns
- Third-party service integration
- Observability and monitoring
- Error resilience and recovery

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with enterprise-level resilience patterns
- Adapted for both synchronous and asynchronous operations

---

If you find this implementation helpful, please consider giving it a star!