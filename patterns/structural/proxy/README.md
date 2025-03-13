# JavaScript Proxy Pattern

A comprehensive implementation of the Proxy Pattern in JavaScript for real-world enterprise applications.

## Overview

This repository contains both class-based and functional implementations of the Proxy Pattern, focusing on a practical API client with caching and rate limiting capabilities. The implementations follow enterprise-grade best practices for scalable, maintainable JavaScript applications.

The code demonstrates:

- Advanced usage of the JavaScript Proxy object
- Class-based and functional programming approaches
- API client design with caching and rate limiting
- Comprehensive test suite using Vitest
- Real-world examples of the Proxy Pattern in action

## Files

- `proxy.implementation.js` - Class-based implementation
- `proxy.functional.js` - Functional implementation
- `proxy.example.js` - Usage examples
- `proxy.spec.js` - Comprehensive tests

## The Proxy Pattern in Action

This implementation showcases the Proxy Pattern applied to a real-world API client with the following features:

1. **Transparent API Access** - The proxy provides the same interface as the original client
2. **Response Caching** - Automatically caches GET responses to reduce network requests
3. **Cache TTL** - Time-based cache expiration
4. **Rate Limiting** - Protection against API rate limits
5. **Error Enhancement** - Adds context to errors for easier debugging

## Class-Based Implementation

The class-based implementation uses ES6 classes to create a structured, object-oriented approach:

```javascript
// Creating a proxy with custom options
const apiClient = new ApiClientProxy('https://api.example.com', {
  cacheTtl: 30000,  // 30 seconds cache TTL
  rateLimit: 60     // 60 requests per minute
});

// Use just like a regular API client
const users = await apiClient.get('/users');
const newUser = await apiClient.post('/users', { name: 'John' });

// Cache management
apiClient.clearCache();
const stats = apiClient.getCacheStats();
```

## Functional Implementation

The functional implementation uses closures and factory functions for a more functional programming style:

```javascript
// Creating a proxy with custom options
const apiClient = createApiClientProxy('https://api.example.com', {
  cacheTtl: 30000,  // 30 seconds cache TTL
  rateLimit: 60     // 60 requests per minute
});

// Use just like a regular API client
const users = await apiClient.get('/users');
const newUser = await apiClient.post('/users', { name: 'John' });

// Cache management
apiClient.clearCache();
const stats = apiClient.getCacheStats();
```

## Key Features

### Caching

The proxy automatically caches GET requests to reduce network traffic and improve performance:

- Cache keys based on HTTP method, endpoint, and parameters
- Time-based cache expiration (TTL)
- Selective cache clearing
- Cache statistics for monitoring

### Rate Limiting

Protection against API rate limits:

- Configurable requests-per-minute limit
- Sliding window implementation
- Throws informative errors when rate limit is reached

### Error Handling

Enhanced error handling:

- Adds proxy context to errors
- Preserves original error information
- Proper async/await error propagation

## Testing

Comprehensive test suite using Vitest:

```bash
# Run all tests
pnpm test
```

## When to Use the Proxy Pattern

The Proxy Pattern is particularly useful when:

1. You need to add behavior to objects without modifying their code
2. You want to control access to resources
3. You need to add cross-cutting concerns like caching, logging, or validation
4. You want to defer expensive operations until they're needed

## Best Practices

When implementing the Proxy Pattern:

1. Maintain the same interface as the original object
2. Keep proxies lightweight
3. Handle errors gracefully
4. Document added behaviors clearly
5. Consider composition when multiple proxy behaviors are needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world weather service integration requirements

---

If you find this implementation helpful, please consider giving it a star!