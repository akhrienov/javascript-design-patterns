# Chain of Responsibility Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Chain of Responsibility Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Chain of Responsibility Pattern creates a chain of receiver objects for a request. Each receiver contains a reference to the next receiver in the chain, and each will either handle the request or pass it to the next receiver. This implementation focuses on an API request processing pipeline, demonstrating practical applications in enterprise-level systems.

## Repository Structure

```
patterns/
└── behavioral/
    └── chain-of-responsibility/
        ├── README.md
        ├── chain-of-responsibility.example.js       # Class-based implementation
        ├── chain-of-responsibility.functional.js    # Functional implementation
        ├── chain-of-responsibility.implementation.js # Usage examples
        └── chain-of-responsibility.spec.js          # Test suite
```

## Features

- Two implementation approaches:
  - ES6 class-based implementation with inheritance
  - Functional approach using closures
- API Request Processing Pipeline:
  - Rate limiting
  - Authentication
  - Authorization
  - Input validation
  - Request logging
  - Response formatting
- Comprehensive test coverage with Vitest

## Implementation Details

### Class-based Approach

```javascript
class BaseHandler {
  constructor() {
    this.nextHandler = null;
  }

  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return { success: true, message: 'Request processing complete' };
  }
}

class AuthenticationHandler extends BaseHandler {
  constructor(authService) {
    super();
    this.authService = authService;
  }

  async handle(request) {
    try {
      const { token } = request;

      if (!token) {
        return {
          success: false,
          statusCode: 401,
          message: 'Authentication required',
        };
      }

      // Verify the token
      const userData = await this.authService.verifyToken(token);

      if (!userData) {
        return {
          success: false,
          statusCode: 401,
          message: 'Invalid or expired authentication token',
        };
      }

      // Add user data to the request for downstream handlers
      request.user = userData;

      // Continue to the next handler
      return super.handle(request);
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Authentication service error',
        error: error.message,
      };
    }
  }
}
```

### Functional Approach

```javascript
const createHandler = (handlerFn) => {
  let nextHandler = null;

  const handle = async (request) => {
    // Execute the handler function
    const result = await handlerFn(request);

    // If the handler returned a result (indicating it handled the request)
    // or there's no next handler, return the result
    if (result || !nextHandler) {
      return result;
    }

    // Otherwise, pass the request to the next handler
    return nextHandler.handle(request);
  };

  const setNext = (handler) => {
    nextHandler = handler;
    return handler;
  };

  return {
    handle,
    setNext,
  };
};

const createAuthenticationHandler = (authService) => {
  return createHandler(async (request) => {
    try {
      const { token } = request;

      if (!token) {
        return {
          success: false,
          statusCode: 401,
          message: 'Authentication required',
        };
      }

      // Verify the token
      const userData = await authService.verifyToken(token);

      if (!userData) {
        return {
          success: false,
          statusCode: 401,
          message: 'Invalid or expired authentication token',
        };
      }

      // Add user data to the request for downstream handlers
      request.user = userData;

      // Return null to continue to the next handler
      return null;
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Authentication service error',
        error: error.message,
      };
    }
  });
};
```

## Usage Examples

### Basic Usage

```javascript
// Create handler instances
const loggingHandler = new LoggingHandler(logger);
const rateLimitHandler = new APIRateLimitHandler(rateLimitService);
const authHandler = new AuthenticationHandler(authService);
const authorizationHandler = new AuthorizationHandler(permissionService);
const validationHandler = new InputValidationHandler(validationSchema);
const responseFormatter = new ResponseFormatterHandler();

// Connect the chain
loggingHandler
  .setNext(rateLimitHandler)
  .setNext(authHandler)
  .setNext(authorizationHandler)
  .setNext(validationHandler)
  .setNext(responseFormatter);

// Process a request
const request = {
  path: '/api/posts',
  method: 'GET',
  token: 'valid_token',
  resource: 'posts',
  action: 'read',
};

const result = await loggingHandler.handle(request);
```

### Functional Implementation

```javascript
// Create handlers
const loggingHandler = createLoggingHandler(logger);
const rateLimitHandler = createRateLimitHandler(rateLimitService);
const authHandler = createAuthenticationHandler(authService);
const authorizationHandler = createAuthorizationHandler(permissionService);
const validationHandler = createInputValidationHandler(validationSchema);
const responseFormatter = createResponseFormatterHandler();

// Connect the chain
loggingHandler
  .setNext(rateLimitHandler)
  .setNext(authHandler)
  .setNext(authorizationHandler)
  .setNext(validationHandler)
  .setNext(responseFormatter);

// Process a request
const request = {
  path: '/api/posts',
  method: 'POST',
  token: 'valid_token',
  resource: 'posts',
  action: 'write',
  body: {
    title: 'New Post',
    content: 'Post content',
  },
};

const result = await loggingHandler.handle(request);
```

### Integration with Express.js

```javascript
const express = require('express');
const app = express();

// Create request chain
const requestChain = createRequestProcessingChain();

app.use(express.json());

app.post('/api/posts', async (req, res) => {
  // Prepare request object for the chain
  const request = {
    path: req.path,
    method: req.method,
    token: req.headers.authorization?.substring(7),
    clientIp: req.ip,
    resource: 'posts',
    action: 'write',
    body: req.body,
  };

  // Process the request through the chain
  const result = await requestChain.handle(request);

  // Send the response
  res.status(result.statusCode || 200).json(result);
});
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- Chain construction and linking
- Request propagation through the chain
- Authentication and authorization checks
- Rate limiting functionality
- Input validation
- Response formatting
- Chain interruption on failure conditions
- Custom handler implementation
- Error handling

## Key Considerations

1. **Chain Construction**

   - Proper sequence of handlers
   - Handler independence and single responsibility
   - Ability to reconfigure the chain at runtime

2. **Request Propagation**

   - Passing request objects between handlers
   - Adding context data for downstream handlers
   - Handling chain interruption

3. **Error Handling**

   - Consistent error response format
   - Proper error propagation
   - Logging and monitoring

4. **Extensibility**
   - Easy addition of new handlers
   - Handler configuration options
   - Support for custom handlers

## Best Practices

1. **Handler Design**

   - Keep handlers focused on a single responsibility
   - Ensure handlers are independent and decoupled
   - Make handlers configurable for different requirements

2. **Error Management**

   - Implement consistent error handling
   - Provide clear error messages
   - Log failures for debugging

3. **Chain Configuration**

   - Configure the chain based on requirements
   - Allow dynamic chain reconfiguration
   - Consider using a factory method to create chains

4. **Performance**
   - Be aware of chain length and complexity
   - Consider resource utilization in handler logic
   - Implement caching where appropriate

## When to Use

The Chain of Responsibility Pattern is particularly useful when:

- Multiple objects might handle a request based on runtime conditions
- You want to issue a request to one of several objects without specifying the receiver explicitly
- The set of objects that can handle a request should be specified dynamically
- You need to decouple senders from receivers
- The processing order is important
- You need to implement middleware-like functionality

## Common Pitfalls to Avoid

1. **Chain Breaks**

   - Ensure proper chain connections
   - Verify handlers properly pass requests to their successors
   - Handle the case when no handler processes the request

2. **Performance Impact**

   - Be careful with long chains that process every request
   - Consider early termination for common cases
   - Monitor performance impact of complex handlers

3. **Request Mutation**

   - Be careful when modifying the request object in handlers
   - Document how handlers change the request
   - Consider immutable approaches for complex scenarios

4. **Dependency Management**
   - Avoid tight coupling between handlers
   - Properly inject dependencies into handlers
   - Consider a dependency injection container for complex chains

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Chain of Responsibility article in the provided document
- Modernized for current JavaScript ecosystem
- Enhanced with real-world API processing requirements
- Designed for enterprise-level applications

---

If you find this implementation helpful, please consider giving it a star!
