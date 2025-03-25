/**
 * Creates an API request handler with customizable operations
 *
 * @param {Object} operations - The operations to use in the template
 * @returns {Function} - The template method function that handles API requests
 */
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
  handleError = defaultHandleError,
  sanitizeForLogging = defaultSanitizeForLogging,
}) {
  // Ensure required operations are provided
  if (!validateRequest || !prepareRequest || !executeRequest || !processResponse) {
    throw new Error(
      'Required operations missing: validateRequest, prepareRequest, executeRequest, and processResponse are required'
    );
  }

  // Return the template method function
  return async function handleRequest(requestData) {
    try {
      // Step 1: Validate the request data
      validateRequest(requestData);

      // Step 2: Prepare the request (format data, add headers, etc.)
      const preparedRequest = prepareRequest(requestData);

      // Step 3: Set common headers (fixed implementation)
      const requestWithHeaders = setCommonHeaders(preparedRequest);

      // Step 4: Execute the request
      const response = await executeRequest(requestWithHeaders);

      // Step 5: Process the response (transform data if needed)
      const processedResponse = processResponse(response);

      // Step 6: Cache the response if needed (hook method)
      if (shouldCacheResponse(processedResponse)) await cacheResponse(processedResponse);

      // Step 7: Log the successful request (hook method)
      logRequest(requestData, processedResponse, null);

      return processedResponse;
    } catch (error) {
      // Step 8: Handle error (hook method)
      handleError(error, requestData);

      // Log the failed request
      logRequest(requestData, null, error);

      throw error;
    }
  };
}

// Default implementations for optional operations

/**
 * Sets common headers for all API requests
 * @param {Object} request - The request to add headers to
 * @returns {Object} The request with common headers
 */
function defaultSetCommonHeaders(request) {
  return {
    ...request,
    headers: {
      ...request.headers,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'TemplateMethodExample/1.0',
      'X-Request-ID': generateRequestId(),
    },
  };
}

/**
 * Generates a unique request ID
 * @returns {string} A unique request ID
 */
function generateRequestId() {
  return `req-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

/**
 * Default implementation for caching responses
 * @param {Object} response - The response to cache
 * @returns {Promise<void>}
 */
async function defaultCacheResponse(response) {
  // Default implementation does nothing
  console.log(`Default caching would happen here for ${response.requestId}`);
}

/**
 * Default implementation for logging requests
 * @param {Object} requestData - The original request data
 * @param {Object|null} response - The response (null if error)
 * @param {Error|null} error - The error (null if success)
 */
function defaultLogRequest(requestData, response, error) {
  if (error) {
    console.error(`Request failed: ${error.message}`, {
      requestData,
      errorMessage: error.message,
    });
  } else {
    console.log(`Request succeeded: ${response.requestId}`, {
      requestData: defaultSanitizeForLogging(requestData),
      responseStatus: response.status,
    });
  }
}

/**
 * Default implementation for sanitizing request data for logging
 * @param {Object} requestData - The request data to sanitize
 * @returns {Object} Sanitized request data
 */
function defaultSanitizeForLogging(requestData) {
  // Default implementation: deep clone and remove password or token fields
  const sanitized = JSON.parse(JSON.stringify(requestData));

  // Remove sensitive fields if they exist
  if (sanitized.password) sanitized.password = '***';
  if (sanitized.token) sanitized.token = '***';
  if (sanitized.apiKey) sanitized.apiKey = '***';

  return sanitized;
}

/**
 * Default implementation for handling errors
 * @param {Error} error - The error that occurred
 * @param {Object} requestData - The original request data
 */
function defaultHandleError(error, requestData) {
  // Default implementation just logs the error
  console.error('Error processing request:', error.message);
}

// User API Handler (functional implementation)

/**
 * Creates a user API request handler
 *
 * @param {Object} apiClient - The API client to use for requests
 * @param {Object} userCache - Optional cache for user data
 * @returns {Function} - The template method function for handling user API requests
 */
function createUserApiHandler(apiClient, userCache = null) {
  return createApiRequestHandler({
    // Required operations
    validateRequest: (requestData) => {
      if (!requestData.endpoint) throw new Error('User API endpoint is required');

      // Validate user-specific fields based on endpoint
      if (requestData.endpoint === 'createUser') {
        if (!requestData.userData || !requestData.userData.email)
          throw new Error('Email is required for user creation');

        if (!requestData.userData.password || requestData.userData.password.length < 8)
          throw new Error('Password must be at least 8 characters long');
      } else if (requestData.endpoint === 'getUserProfile') {
        if (!requestData.userId) throw new Error('User ID is required for profile retrieval');
      }
    },

    prepareRequest: (requestData) => {
      // Prepare different requests based on the endpoint
      switch (requestData.endpoint) {
        case 'createUser':
          return {
            method: 'POST',
            url: '/api/users',
            headers: {},
            body: {
              ...requestData.userData,
              created: new Date().toISOString(),
            },
          };

        case 'getUserProfile':
          return {
            method: 'GET',
            url: `/api/users/${requestData.userId}`,
            headers: {},
            params: requestData.includeDetails ? { include: 'details,preferences' } : {},
          };

        case 'updateUser':
          return {
            method: 'PUT',
            url: `/api/users/${requestData.userId}`,
            headers: {},
            body: {
              ...requestData.userData,
              updated: new Date().toISOString(),
            },
          };

        default:
          throw new Error(`Unknown user endpoint: ${requestData.endpoint}`);
      }
    },

    executeRequest: async (preparedRequest) => {
      // Execute the request using the API client
      console.log(`Executing ${preparedRequest.method} request to ${preparedRequest.url}`);

      try {
        // For demo purposes, simulate API call
        // In a real scenario, this would use an actual API client:
        // return await apiClient.request(preparedRequest);

        return await new Promise((resolve) => {
          setTimeout(() => {
            // Generate dummy response based on the request
            const requestId = preparedRequest.headers['X-Request-ID'];

            if (preparedRequest.method === 'GET') {
              resolve({
                requestId,
                status: 200,
                data: {
                  id: preparedRequest.url.split('/').pop(),
                  email: 'user@example.com',
                  name: 'Test User',
                  created: '2023-01-01T00:00:00.000Z',
                },
              });
            } else if (preparedRequest.method === 'POST') {
              resolve({
                requestId,
                status: 201,
                data: {
                  id: 'new-user-123',
                  ...preparedRequest.body,
                  password: undefined, // Don't return password
                },
              });
            } else {
              resolve({
                requestId,
                status: 200,
                data: {
                  id: preparedRequest.url.split('/').pop(),
                  ...preparedRequest.body,
                  password: undefined, // Don't return password
                },
              });
            }
          }, 100); // Simulate network delay
        });
      } catch (error) {
        console.error('API request failed:', error);
        throw new Error(
          `Failed to ${preparedRequest.method} ${preparedRequest.url}: ${error.message}`
        );
      }
    },

    processResponse: (response) => {
      // Process the API response
      return {
        ...response,
        processed: true,
        processedAt: new Date().toISOString(),
        // Format data consistently
        data: {
          ...response.data,
          // Ensure consistent date format
          created: response.data.created
            ? new Date(response.data.created).toISOString()
            : undefined,
          updated: response.data.updated
            ? new Date(response.data.updated).toISOString()
            : undefined,
        },
      };
    },

    // Override hook methods
    shouldCacheResponse: (response) => {
      // Only cache GET requests with 200 status
      return response.status === 200 && userCache !== null;
    },

    cacheResponse: async (response) => {
      if (userCache) {
        const userId = response.data.id;
        console.log(`Caching user data for user ID: ${userId}`);

        // In a real implementation, this would store in a real cache
        if (userCache.set) {
          await userCache.set(userId, response.data);
        } else {
          // Fallback to simple object cache
          userCache[userId] = response.data;
        }
      }
    },

    handleError: (error, requestData) => {
      console.error(`User API Error (${requestData.endpoint}):`, error.message);

      // For user-specific errors, we might want to perform additional actions
      if (requestData.endpoint === 'createUser' && error.message.includes('already exists')) {
        console.warn('Duplicate user registration attempt');
      }
    },
  });
}

// Product API Handler (functional implementation)

/**
 * Creates a product API request handler
 *
 * @param {Object} apiClient - The API client to use for requests
 * @param {Object} options - Configuration options
 * @returns {Function} - The template method function for handling product API requests
 */
function createProductApiHandler(apiClient, options = {}) {
  const handlerOptions = {
    enableMetrics: true,
    retryCount: 3,
    ...options,
  };

  return createApiRequestHandler({
    // Required operations
    validateRequest: (requestData) => {
      if (!requestData.endpoint) throw new Error('Product API endpoint is required');

      // Validate product-specific fields based on endpoint
      if (requestData.endpoint === 'createProduct') {
        if (!requestData.productData || !requestData.productData.name)
          throw new Error('Product name is required for product creation');

        if (!requestData.productData.price || isNaN(requestData.productData.price))
          throw new Error('Valid product price is required');
      } else if (requestData.endpoint === 'getProduct') {
        if (!requestData.productId) throw new Error('Product ID is required');
      }
    },

    prepareRequest: (requestData) => {
      // Add metrics tracking header if enabled
      const headers = handlerOptions.enableMetrics ? { 'X-Metrics-Enabled': 'true' } : {};

      // Prepare different requests based on the endpoint
      switch (requestData.endpoint) {
        case 'createProduct':
          return {
            method: 'POST',
            url: '/api/products',
            headers,
            body: {
              ...requestData.productData,
              created: new Date().toISOString(),
            },
          };

        case 'getProduct':
          return {
            method: 'GET',
            url: `/api/products/${requestData.productId}`,
            headers,
            params: {},
          };

        case 'searchProducts':
          return {
            method: 'GET',
            url: '/api/products',
            headers,
            params: {
              query: requestData.query || '',
              category: requestData.category || '',
              limit: requestData.limit || 20,
              page: requestData.page || 1,
            },
          };

        default:
          throw new Error(`Unknown product endpoint: ${requestData.endpoint}`);
      }
    },

    executeRequest: async (preparedRequest) => {
      // Add retry logic specific to product API
      let lastError = null;
      let attempts = 0;

      while (attempts < handlerOptions.retryCount) {
        try {
          attempts++;
          console.log(
            `Executing product API request to ${preparedRequest.url} (attempt ${attempts})`
          );

          // For demo purposes, simulate API call
          // In a real scenario: return await apiClient.request(preparedRequest);

          return await new Promise((resolve, reject) => {
            setTimeout(() => {
              // Simulate random failures (10% chance)
              if (Math.random() < 0.1 && attempts < handlerOptions.retryCount) {
                reject(new Error('Temporary network error'));
                return;
              }

              const requestId = preparedRequest.headers['X-Request-ID'];

              if (preparedRequest.url === '/api/products' && preparedRequest.method === 'GET') {
                // Search products response
                resolve({
                  requestId,
                  status: 200,
                  data: {
                    items: [
                      { id: 'prod-1', name: 'Product 1', price: 19.99 },
                      { id: 'prod-2', name: 'Product 2', price: 29.99 },
                    ],
                    total: 2,
                    page: preparedRequest.params.page,
                    limit: preparedRequest.params.limit,
                  },
                });
              } else if (preparedRequest.method === 'GET') {
                // Get single product
                resolve({
                  requestId,
                  status: 200,
                  data: {
                    id: preparedRequest.url.split('/').pop(),
                    name: 'Test Product',
                    price: 99.99,
                    description: 'A fantastic product',
                    created: '2023-01-01T00:00:00.000Z',
                  },
                });
              } else {
                // Create product
                resolve({
                  requestId,
                  status: 201,
                  data: {
                    id: 'new-product-123',
                    ...preparedRequest.body,
                  },
                });
              }
            }, 100); // Simulate network delay
          });
        } catch (error) {
          console.warn(`Attempt ${attempts} failed:`, error.message);
          lastError = error;

          // Only retry if not on the last attempt
          if (attempts < handlerOptions.retryCount) {
            // Exponential backoff with jitter
            const delay = Math.min(100 * Math.pow(2, attempts) + Math.random() * 100, 2000);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // If we've exhausted retries, throw the last error
      throw new Error(`Failed after ${attempts} attempts: ${lastError.message}`);
    },

    processResponse: (response) => {
      // Process the API response for products
      const processed = {
        ...response,
        processed: true,
        processedAt: new Date().toISOString(),
      };

      // If it's a product list (search results), add calculated fields
      if (response.data.items) {
        processed.data = {
          ...response.data,
          items: response.data.items.map((item) => ({
            ...item,
            // Add tax calculation for display purposes
            displayPrice: (item.price * 1.1).toFixed(2),
            priceWithCurrency: `${item.price.toFixed(2)}`,
          })),
        };
      } else if (response.data.price) {
        // Single product, add calculated fields
        processed.data = {
          ...response.data,
          displayPrice: (response.data.price * 1.1).toFixed(2),
          priceWithCurrency: `${response.data.price.toFixed(2)}`,
        };
      }

      return processed;
    },

    // Override hook methods for product-specific behavior
    logRequest: (requestData, response, error) => {
      defaultLogRequest(requestData, response, error);

      // Add product-specific metrics if enabled
      if (handlerOptions.enableMetrics && !error) {
        console.log('Product API Metrics:', {
          endpoint: requestData.endpoint,
          responseTime: new Date() - new Date(response.processedAt),
          status: response.status,
        });
      }
    },
  });
}

export {
  createApiRequestHandler,
  createUserApiHandler,
  createProductApiHandler,
  // Utility functions
  defaultSetCommonHeaders,
  defaultCacheResponse,
  defaultLogRequest,
  defaultSanitizeForLogging,
  defaultHandleError,
  generateRequestId,
};
