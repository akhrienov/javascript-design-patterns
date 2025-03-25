# Template Method Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Template Method Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Template Method Pattern defines the skeleton of an algorithm in a base class/function but lets subclasses/implementations override specific steps without changing the algorithm's structure. This implementation focuses on API request handling and data processing workflows, demonstrating practical applications in real-world enterprise scenarios.

## Repository Structure

```
patterns/
└── behavioral/
    └── template-method/
        ├── README.md
        ├── template-method.example.js      # Class-based implementation
        ├── template-method.functional.js   # Functional implementation
        ├── template-method.implementation.js # Real-world examples
        └── template-method.spec.js         # Test suite
```

## Features

- Two implementation approaches:
    - Class-based Template Method using ES6 classes
    - Functional approach using factory functions and closures
- API Request Handling:
    - Consistent request flow with customizable steps
    - Validation, preparation, execution, and processing
    - Conditional steps with hook methods
    - Error handling and logging
- Data Processing Workflows:
    - E-commerce checkout process
    - User management operations
    - Product catalog operations
- Comprehensive test coverage with Vitest

## Implementation Details

### Class-based Approach

```javascript
// Base class with template method
class BaseApiHandler {
  // Template method
  async handleRequest(requestData) {
    try {
      // Step 1: Validate the request data
      this.validateRequest(requestData);
      
      // Step 2: Prepare the request
      const preparedRequest = this.prepareRequest(requestData);
      
      // Step 3: Set common headers (fixed implementation)
      const requestWithHeaders = this.setCommonHeaders(preparedRequest);
      
      // Step 4: Execute the request
      const response = await this.executeRequest(requestWithHeaders);
      
      // Step 5: Process the response
      const processedResponse = this.processResponse(response);
      
      // Step 6: Cache the response if needed (hook method)
      if (this.shouldCacheResponse(processedResponse)) {
        await this.cacheResponse(processedResponse);
      }
      
      // Step 7: Log the successful request (hook method)
      this.logRequest(requestData, processedResponse, null);
      
      return processedResponse;
    } catch (error) {
      // Error handling (hook method)
      this.handleError(error, requestData);
      
      // Log the failed request
      this.logRequest(requestData, null, error);
      
      throw error;
    }
  }
  
  // Abstract methods that subclasses must implement
  validateRequest(requestData) {
    throw new Error('validateRequest() must be implemented by subclasses');
  }
  
  // Other abstract methods...
  
  // Concrete methods with fixed implementation
  setCommonHeaders(request) {
    return {
      ...request,
      headers: {
        ...request.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TemplateMethodExample/1.0',
        'X-Request-ID': this.generateRequestId()
      }
    };
  }
  
  // Hook methods with default implementations
  shouldCacheResponse(response) {
    return false; // Default: don't cache
  }
  
  // Other hook methods...
}

// Concrete implementation
class UserApiHandler extends BaseApiHandler {
  constructor(apiClient, userCache = null) {
    super();
    this.apiClient = apiClient;
    this.userCache = userCache;
  }
  
  validateRequest(requestData) {
    // Implementation for user-specific validation
  }
  
  // Other implemented methods...
  
  // Override hook methods as needed
  shouldCacheResponse(response) {
    return response.status === 200 && this.userCache !== null;
  }
  
  // Other overridden hook methods...
}
```

### Functional Approach

```javascript
// Factory function that creates a template method
function createApiRequestHandler({
  // Required operations
  validateRequest,
  prepareRequest,
  executeRequest,
  processResponse,
  
  // Optional operations with default implementations
  setCommonHeaders = defaultSetCommonHeaders,
  shouldCacheResponse = () => false,
  cacheResponse = defaultCacheResponse,
  logRequest = defaultLogRequest,
  handleError = defaultHandleError
}) {
  // Ensure required operations are provided
  if (!validateRequest || !prepareRequest || !executeRequest || !processResponse) {
    throw new Error('Required operations missing');
  }
  
  // Return the template method function
  return async function handleRequest(requestData) {
    try {
      // Step 1: Validate the request data
      validateRequest(requestData);
      
      // Step 2: Prepare the request
      const preparedRequest = prepareRequest(requestData);
      
      // Step 3: Set common headers
      const requestWithHeaders = setCommonHeaders(preparedRequest);
      
      // Step 4: Execute the request
      const response = await executeRequest(requestWithHeaders);
      
      // Step 5: Process the response
      const processedResponse = processResponse(response);
      
      // Step 6: Cache the response if needed
      if (shouldCacheResponse(processedResponse)) {
        await cacheResponse(processedResponse);
      }
      
      // Step 7: Log the successful request
      logRequest(requestData, processedResponse, null);
      
      return processedResponse;
    } catch (error) {
      // Error handling
      handleError(error, requestData);
      
      // Log the failed request
      logRequest(requestData, null, error);
      
      throw error;
    }
  };
}

// Create a specific handler using the factory
function createUserApiHandler(apiClient, userCache = null) {
  return createApiRequestHandler({
    validateRequest: (requestData) => {
      // Implementation for user-specific validation
    },
    
    // Other required operations...
    
    // Override hook methods as needed
    shouldCacheResponse: (response) => {
      return response.status === 200 && userCache !== null;
    },
    
    // Other overridden hook methods...
  });
}
```

## Usage Examples

### Class-based Approach

```javascript
// Create a user API handler
const userHandler = new UserApiHandler(apiClient, userCache);

// Use the template method to handle a request
try {
  const result = await userHandler.handleRequest({
    endpoint: 'getUserProfile',
    userId: '123',
    includeDetails: true
  });
  
  console.log('User profile:', result.data);
} catch (error) {
  console.error('Failed to get user profile:', error.message);
}
```

### Functional Approach

```javascript
// Create a user API handler
const handleUserRequest = createUserApiHandler(apiClient, userCache);

// Use the handler function
try {
  const result = await handleUserRequest({
    endpoint: 'getUserProfile',
    userId: '123',
    includeDetails: true
  });
  
  console.log('User profile:', result.data);
} catch (error) {
  console.error('Failed to get user profile:', error.message);
}
```

### E-commerce Checkout Example

```javascript
// Class-based checkout
const standardCheckout = new StandardCheckoutProcessor(apiClient);
const standardOrder = await standardCheckout.handleRequest({
  items: [
    { id: 'prod1', name: 'Product 1', price: 49.99, quantity: 1 },
    { id: 'prod2', name: 'Product 2', price: 29.99, quantity: 2 }
  ],
  customer: { id: 'cust123', email: 'customer@example.com' },
  shippingAddress: { line1: '123 Main St', city: 'Anytown' }
});

// Functional checkout
const processStandardCheckout = createStandardCheckoutProcessor();
const functionalOrder = await processStandardCheckout({
  items: [{ id: 'prod3', name: 'Product 3', price: 99.99, quantity: 1 }],
  customer: { id: 'cust789', email: 'functional@example.com' },
  shippingAddress: { line1: '456 Oak St', city: 'Othertown' }
});
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- Abstract method enforcement
- Template method flow
- Hook method overriding
- Error handling
- Class-based implementation functionality
- Functional implementation behavior
- Real-world usage scenarios

## Key Considerations

1. **Algorithm Structure**
    - Fixed sequence of steps
    - Clear separation between fixed and variable steps
    - Proper abstraction of common behaviors

2. **Extensibility**
    - Abstract methods for required customization
    - Hook methods for optional customization
    - Easy addition of new concrete implementations

3. **Asynchronous Operations**
    - Promise-based template methods
    - Proper error handling and propagation
    - Async hook methods

4. **Implementation Approaches**
    - Class-based for clear hierarchies and inheritance
    - Functional for flexibility and composition

## Practical Applications

The Template Method Pattern is especially useful for:

- API request/response handling
- Data processing pipelines
- Workflow orchestration
- Form validation and submission
- Report generation
- ETL (Extract, Transform, Load) processes
- Payment processing flows
- Multi-step business processes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem with ES6+ features
- Enhanced with real-world enterprise application requirements

---

If you find this implementation helpful, please consider giving it a star!