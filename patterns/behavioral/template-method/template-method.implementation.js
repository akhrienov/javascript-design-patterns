/**
 * BaseApiHandler - Abstract class that defines the template method for handling API requests
 */
class BaseApiHandler {
  /**
   * Template method that defines the skeleton of the API request handling algorithm
   * @param {Object} requestData - The data needed to process the request
   */
  async handleRequest(requestData) {
    try {
      // Step 1: Validate the request data
      this.validateRequest(requestData);

      // Step 2: Prepare the request (format data, add headers, etc.)
      const preparedRequest = this.prepareRequest(requestData);

      // Step 3: Set common headers (fixed implementation)
      const requestWithHeaders = this.setCommonHeaders(preparedRequest);

      // Step 4: Execute the request
      const response = await this.executeRequest(requestWithHeaders);

      // Step 5: Process the response (transform data if needed)
      const processedResponse = this.processResponse(response);

      // Step 6: Cache the response if needed (hook method)
      if (this.shouldCacheResponse(processedResponse)) await this.cacheResponse(processedResponse);

      // Step 7: Log the successful request (hook method)
      this.logRequest(requestData, processedResponse, null);

      return processedResponse;
    } catch (error) {
      // Step 8: Handle error (hook method)
      this.handleError(error, requestData);

      // Log the failed request
      this.logRequest(requestData, null, error);

      throw error;
    }
  }

  // Abstract methods (must be implemented by subclasses)

  /**
   * Validates the request data
   * @param {Object} requestData - The data to validate
   * @throws {Error} If validation fails
   */
  validateRequest(requestData) {
    throw new Error('validateRequest() must be implemented by subclasses');
  }

  /**
   * Prepares the request by formatting data or adding request-specific headers
   * @param {Object} requestData - The data to prepare
   * @returns {Object} The prepared request
   */
  prepareRequest(requestData) {
    throw new Error('prepareRequest() must be implemented by subclasses');
  }

  /**
   * Executes the API request
   * @param {Object} preparedRequest - The prepared request to execute
   * @returns {Promise<Object>} The response from the API
   */
  async executeRequest(preparedRequest) {
    throw new Error('executeRequest() must be implemented by subclasses');
  }

  /**
   * Processes the API response
   * @param {Object} response - The response to process
   * @returns {Object} The processed response
   */
  processResponse(response) {
    throw new Error('processResponse() must be implemented by subclasses');
  }

  // Concrete methods (fixed implementation for all subclasses)

  /**
   * Sets common headers for all API requests
   * @param {Object} request - The request to add headers to
   * @returns {Object} The request with common headers
   */
  setCommonHeaders(request) {
    return {
      ...request,
      headers: {
        ...request.headers,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'TemplateMethodExample/1.0',
        'X-Request-ID': this.generateRequestId(),
      },
    };
  }

  /**
   * Generates a unique request ID
   * @returns {string} A unique request ID
   */
  generateRequestId() {
    return `req-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  // Hook methods (optional methods that subclasses can override)

  /**
   * Determines if the response should be cached
   * @param {Object} response - The response to potentially cache
   * @returns {boolean} Whether to cache the response
   */
  shouldCacheResponse(response) {
    return false; // Default implementation: don't cache
  }

  /**
   * Caches the response for future use
   * @param {Object} response - The response to cache
   * @returns {Promise<void>}
   */
  async cacheResponse(response) {
    // Default implementation does nothing
    console.log(`Caching would happen here for ${response.requestId}`);
  }

  /**
   * Logs information about the request
   * @param {Object} requestData - The original request data
   * @param {Object|null} response - The response (null if error)
   * @param {Error|null} error - The error (null if success)
   */
  logRequest(requestData, response, error) {
    if (error) {
      console.error(`Request failed: ${error.message}`, {
        requestData,
        errorMessage: error.message,
        errorStack: error.stack,
      });
    } else {
      console.log(`Request succeeded: ${response.requestId}`, {
        requestData: this.sanitizeForLogging(requestData),
        responseStatus: response.status,
      });
    }
  }

  /**
   * Sanitizes request data for logging (removes sensitive info)
   * @param {Object} requestData - The request data to sanitize
   * @returns {Object} Sanitized request data
   */
  sanitizeForLogging(requestData) {
    // Default implementation: deep clone and remove password or token fields
    const sanitized = JSON.parse(JSON.stringify(requestData));

    // Remove sensitive fields if they exist
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.token) sanitized.token = '***';
    if (sanitized.apiKey) sanitized.apiKey = '***';

    return sanitized;
  }

  /**
   * Handles errors that occur during request processing
   * @param {Error} error - The error that occurred
   * @param {Object} requestData - The original request data
   */
  handleError(error, requestData) {
    // Default implementation just logs the error
    console.error('Error processing request:', error.message);
  }
}

/**
 * UserApiHandler - Concrete implementation for user-related API requests
 */
class UserApiHandler extends BaseApiHandler {
  /**
   * @param {Object} apiClient - The API client to use for requests
   * @param {Object} userCache - Optional cache for user data
   */
  constructor(apiClient, userCache = null) {
    super();
    this.apiClient = apiClient;
    this.userCache = userCache;
  }

  validateRequest(requestData) {
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
  }

  prepareRequest(requestData) {
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
  }

  async executeRequest(preparedRequest) {
    // Execute the request using the API client
    console.log(`Executing ${preparedRequest.method} request to ${preparedRequest.url}`);

    try {
      // For demo purposes, simulate API call
      // In a real scenario, this would use an actual API client:
      // return await this.apiClient.request(preparedRequest);

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
  }

  processResponse(response) {
    // Process the API response
    return {
      ...response,
      processed: true,
      processedAt: new Date().toISOString(),
      // Format data consistently
      data: {
        ...response.data,
        // Ensure consistent date format
        created: response.data.created ? new Date(response.data.created).toISOString() : undefined,
        updated: response.data.updated ? new Date(response.data.updated).toISOString() : undefined,
      },
    };
  }

  // Override hook method
  shouldCacheResponse(response) {
    // Only cache GET requests with 200 status
    return response.status === 200 && this.userCache !== null;
  }

  // Override hook method
  async cacheResponse(response) {
    if (this.userCache) {
      const userId = response.data.id;
      console.log(`Caching user data for user ID: ${userId}`);

      // In a real implementation, this would store in a real cache
      if (this.userCache.set) await this.userCache.set(userId, response.data);
      else this.userCache[userId] = response.data;
    }
  }

  // Override hook method
  handleError(error, requestData) {
    console.error(`User API Error (${requestData.endpoint}):`, error.message);

    // For user-specific errors, we might want to perform additional actions
    if (requestData.endpoint === 'createUser' && error.message.includes('already exists')) {
      console.warn('Duplicate user registration attempt');
    }
  }
}

/**
 * ProductApiHandler - Concrete implementation for product-related API requests
 */
class ProductApiHandler extends BaseApiHandler {
  /**
   * @param {Object} apiClient - The API client to use for requests
   * @param {Object} options - Configuration options
   */
  constructor(apiClient, options = {}) {
    super();
    this.apiClient = apiClient;
    this.options = {
      enableMetrics: true,
      retryCount: 3,
      ...options,
    };
  }

  validateRequest(requestData) {
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
  }

  prepareRequest(requestData) {
    // Add metrics tracking header if enabled
    const headers = this.options.enableMetrics ? { 'X-Metrics-Enabled': 'true' } : {};

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
  }

  async executeRequest(preparedRequest) {
    // Add retry logic specific to product API
    let lastError = null;
    let attempts = 0;

    while (attempts < this.options.retryCount) {
      try {
        attempts++;
        console.log(
          `Executing product API request to ${preparedRequest.url} (attempt ${attempts})`
        );

        // For demo purposes, simulate API call
        // In a real scenario: return await this.apiClient.request(preparedRequest);

        return await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate random failures (10% chance)
            if (Math.random() < 0.1 && attempts < this.options.retryCount) {
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
        if (attempts < this.options.retryCount) {
          // Exponential backoff with jitter
          const delay = Math.min(100 * Math.pow(2, attempts) + Math.random() * 100, 2000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // If we've exhausted retries, throw the last error
    throw new Error(`Failed after ${attempts} attempts: ${lastError.message}`);
  }

  processResponse(response) {
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
          priceWithCurrency: `$${item.price.toFixed(2)}`,
        })),
      };
    } else if (response.data.price) {
      // Single product, add calculated fields
      processed.data = {
        ...response.data,
        displayPrice: (response.data.price * 1.1).toFixed(2),
        priceWithCurrency: `$${response.data.price.toFixed(2)}`,
      };
    }

    return processed;
  }

  // Override hook methods for product-specific behavior
  logRequest(requestData, response, error) {
    super.logRequest(requestData, response, error);

    // Add product-specific metrics if enabled
    if (this.options.enableMetrics && !error) {
      console.log('Product API Metrics:', {
        endpoint: requestData.endpoint,
        responseTime: new Date() - new Date(response.processedAt),
        status: response.status,
      });
    }
  }
}

export { BaseApiHandler, UserApiHandler, ProductApiHandler };
