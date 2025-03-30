import {
  BaseHandler,
  APIRateLimitHandler,
  AuthenticationHandler,
  AuthorizationHandler,
  InputValidationHandler,
  LoggingHandler,
  ResponseFormatterHandler,
} from './chain-of-responsibility.implementation.js';

// Mock services for demonstration
const mockServices = {
  // Mock rate limiting service
  rateLimitService: {
    getCurrentUsage: async (identifier) => {
      // Simulate rate limit check (always under limit for this example)
      return Math.floor(Math.random() * 50); // Return a number between 0-49
    },
    incrementUsage: async (identifier) => {
      // Simulate incrementing usage counter
      return true;
    },
  },

  // Mock authentication service
  authService: {
    verifyToken: async (token) => {
      // For demo purposes, accept any token starting with 'valid_'
      if (token && token.startsWith('valid_')) {
        return {
          id: '123',
          username: 'demo_user',
          roles: ['user'],
        };
      }
      return null;
    },
  },

  // Mock permission service
  permissionService: {
    checkPermission: async (userId, resource, action) => {
      // Simple permission check for demo
      // Allow 'read' on all resources, but restrict 'write' and 'delete'
      if (action === 'read') return true;
      // For demo, only allow write/delete on 'posts' resource
      if (resource === 'posts' && (action === 'write' || action === 'delete')) return true;

      return false;
    },
  },

  // Mock logger
  logger: {
    info: (message, data) => console.log(`INFO: ${message}`, data),
    warn: (message, data) => console.log(`WARN: ${message}`, data),
    error: (message, data) => console.log(`ERROR: ${message}`, data),
  },

  // Mock validation schema
  validationSchema: {
    validate: async (data) => {
      // Simple validation - ensure title and content exist for a post
      if (data.resource === 'posts') {
        const errors = [];

        if (!data.title) {
          errors.push({ field: 'title', message: 'Title is required' });
        } else if (data.title.length < 3) {
          errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
        }

        if (!data.content) errors.push({ field: 'content', message: 'Content is required' });

        return {
          error: errors.length > 0 ? { details: errors } : null,
          value: data,
        };
      }

      return { error: null, value: data };
    },
  },
};

/**
 * Creates the request processing chain using class-based handlers
 * @returns {BaseHandler} - The first handler in the chain
 */
function createRequestProcessingChain() {
  // Create handler instances
  const loggingHandler = new LoggingHandler(mockServices.logger);
  const rateLimitHandler = new APIRateLimitHandler(mockServices.rateLimitService);
  const authHandler = new AuthenticationHandler(mockServices.authService);
  const authorizationHandler = new AuthorizationHandler(mockServices.permissionService);
  const validationHandler = new InputValidationHandler(mockServices.validationSchema);
  const responseFormatter = new ResponseFormatterHandler();

  // Connect the chain
  loggingHandler
    .setNext(rateLimitHandler)
    .setNext(authHandler)
    .setNext(authorizationHandler)
    .setNext(validationHandler)
    .setNext(responseFormatter);

  // Return the first handler in the chain
  return loggingHandler;
}

// Simulate HTTP request processing without Express
async function processRequest(request) {
  console.log(`Processing ${request.method} request to ${request.path}`);

  // Create request ID
  request.requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Extract authentication token from header
  const authHeader = request.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    request.token = authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Create the request chain
  const requestChain = createRequestProcessingChain();

  try {
    // Process the request through the chain
    const result = await requestChain.handle(request);
    console.log('Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      success: false,
      statusCode: 500,
      message: 'Internal server error',
      error: error.message,
    };
  }
}

// Example usage
async function runExamples() {
  console.log('=== Running Chain of Responsibility Examples ===');

  // Example 1: Get posts (read access, no auth needed)
  const getPostsRequest = {
    path: '/api/posts',
    method: 'GET',
    headers: {},
    resource: 'posts',
    action: 'read',
    clientIp: '127.0.0.1',
  };
  await processRequest(getPostsRequest);

  // Example 2: Create post (write access, auth needed, validation)
  const createPostRequest = {
    path: '/api/posts',
    method: 'POST',
    headers: {
      authorization: 'Bearer valid_token',
    },
    resource: 'posts',
    action: 'write',
    clientIp: '127.0.0.1',
    body: {
      resource: 'posts',
      title: 'Test Post',
      content: 'This is a test post',
    },
  };
  await processRequest(createPostRequest);

  // Example 3: Create post with invalid data (validation fails)
  const invalidPostRequest = {
    path: '/api/posts',
    method: 'POST',
    headers: {
      authorization: 'Bearer valid_token',
    },
    resource: 'posts',
    action: 'write',
    clientIp: '127.0.0.1',
    body: {
      resource: 'posts',
      title: '', // Missing title
      content: 'This is a test post',
    },
  };
  await processRequest(invalidPostRequest);

  // Example 4: Delete user (permission denied)
  const deleteUserRequest = {
    path: '/api/users/123',
    method: 'DELETE',
    headers: {
      authorization: 'Bearer valid_token',
    },
    resource: 'users',
    action: 'delete',
    resourceId: '123',
    clientIp: '127.0.0.1',
  };
  await processRequest(deleteUserRequest);

  // Example 5: Invalid authentication
  const invalidAuthRequest = {
    path: '/api/users',
    method: 'GET',
    headers: {
      authorization: 'Bearer invalid_token',
    },
    resource: 'users',
    action: 'read',
    clientIp: '127.0.0.1',
  };
  await processRequest(invalidAuthRequest);
}

runExamples().catch(console.error);
