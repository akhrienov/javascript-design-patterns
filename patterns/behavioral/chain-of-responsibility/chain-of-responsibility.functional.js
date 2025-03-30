/**
 * Creates a handler function for the Chain of Responsibility pattern
 * @param {Function} handlerFn - The function to handle the request
 * @returns {Object} - Handler object with handle and setNext methods
 */
const createHandler = (handlerFn) => {
  let nextHandler = null;

  /**
   * Handles the request
   * @param {Object} request - The request to be handled
   * @returns {Promise<Object>} - The result of handling the request
   */
  const handle = async (request) => {
    const result = await handlerFn(request);

    if (result || !nextHandler) return result;

    // Otherwise, pass the request to the next handler
    return nextHandler.handle(request);
  };

  /**
   * Sets the next handler in the chain
   * @param {Object} handler - The next handler
   * @returns {Object} - The next handler (for chaining)
   */
  const setNext = (handler) => {
    nextHandler = handler;
    return handler;
  };

  return {
    handle,
    setNext,
  };
};

/**
 * Creates an API rate limiting handler
 * @param {Object} rateLimitService - Service to check and update rate limits
 * @param {Object} options - Configuration options
 * @returns {Object} - Rate limit handler
 */
const createRateLimitHandler = (
  rateLimitService,
  options = { maxRequests: 100, timeWindow: 3600000 }
) => {
  return createHandler(async (request) => {
    try {
      const { userId, clientIp } = request;
      const identifier = userId || clientIp || 'anonymous';

      const currentUsage = await rateLimitService.getCurrentUsage(identifier);

      if (currentUsage >= options.maxRequests) {
        return {
          success: false,
          statusCode: 429,
          message: 'Rate limit exceeded. Please try again later.',
        };
      }

      await rateLimitService.incrementUsage(identifier);

      return null;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return null;
    }
  });
};

/**
 * Creates an authentication handler
 * @param {Object} authService - Service to verify authentication
 * @returns {Object} - Authentication handler
 */
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

      const userData = await authService.verifyToken(token);

      if (!userData) {
        return {
          success: false,
          statusCode: 401,
          message: 'Invalid or expired authentication token',
        };
      }

      request.user = userData;

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

/**
 * Creates an authorization handler
 * @param {Object} permissionService - Service to check permissions
 * @returns {Object} - Authorization handler
 */
const createAuthorizationHandler = (permissionService) => {
  return createHandler(async (request) => {
    try {
      const { user, resource, action } = request;

      if (!user) {
        return {
          success: false,
          statusCode: 403,
          message: 'User data missing for authorization check',
        };
      }

      const hasPermission = await permissionService.checkPermission(user.id, resource, action);

      if (!hasPermission) {
        return {
          success: false,
          statusCode: 403,
          message: `You don't have permission to ${action} this ${resource}`,
        };
      }

      return null;
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Authorization service error',
        error: error.message,
      };
    }
  });
};

/**
 * Creates an input validation handler
 * @param {Object} schema - Validation schema
 * @returns {Object} - Input validation handler
 */
const createInputValidationHandler = (schema) => {
  /**
   * Validate the request body using the provided schema
   * @param {Object} body - Request body to validate
   * @returns {Object} - Validation result
   */
  const validateBody = async (body) => {
    try {
      const result = await schema.validate(body);

      return {
        valid: !result.error,
        data: result.value || body,
        errors: result.error ? result.error.details : [],
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{ message: error.message }],
      };
    }
  };

  return createHandler(async (request) => {
    try {
      const { body } = request;

      const validationResult = await validateBody(body);

      if (!validationResult.valid) {
        return {
          success: false,
          statusCode: 400,
          message: 'Invalid input data',
          errors: validationResult.errors,
        };
      }

      request.validatedData = validationResult.data;

      return null;
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Validation error',
        error: error.message,
      };
    }
  });
};

/**
 * Creates a logging handler
 * @param {Object} logger - Logging service
 * @returns {Object} - Logging handler
 */
const createLoggingHandler = (logger) => {
  return createHandler(async (request) => {
    const startTime = Date.now();

    logger.info('Request received', {
      path: request.path,
      method: request.method,
      userId: request.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    });

    request._startTime = startTime;
    request._logger = logger;

    return null;
  });
};

/**
 * Creates a response formatting handler
 * @returns {Object} - Response formatter handler
 */
const createResponseFormatterHandler = () => {
  return createHandler(async (request) => {
    const result = {
      success: true,
      message: 'Request processed successfully',
      data: request.responseData || {},
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      path: request.path,
    };

    if (request._logger && request._startTime) {
      const processingTime = Date.now() - request._startTime;

      request._logger.info('Request processed successfully', {
        path: request.path,
        method: request.method,
        processingTime,
      });
    }

    return result;
  });
};

/**
 * Creates a final result handler to capture the outcome of the chain
 * This ensures the chain always returns something, even if no other handlers do
 * @returns {Object} - Final result handler
 */
const createFinalHandler = () => {
  return createHandler(async (request) => {
    return {
      success: true,
      message: 'Request processing complete',
      timestamp: new Date().toISOString(),
    };
  });
};

export {
  createHandler,
  createRateLimitHandler,
  createAuthenticationHandler,
  createAuthorizationHandler,
  createInputValidationHandler,
  createLoggingHandler,
  createResponseFormatterHandler,
  createFinalHandler,
};
