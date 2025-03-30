/**
 * @class BaseHandler
 * @description Abstract base handler class for implementing the Chain of Responsibility pattern
 */
class BaseHandler {
  constructor() {
    this.nextHandler = null;
  }

  /**
   * Sets the next handler in the chain
   * @param {BaseHandler} handler - The next handler in the chain
   * @returns {BaseHandler} - The next handler (for chaining)
   */
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Process the request
   * @param {Object} request - The request object to be processed
   * @returns {Promise<Object>} - The processed result
   */
  async handle(request) {
    if (this.nextHandler) return this.nextHandler.handle(request);
    return { success: true, message: 'Request processing complete' };
  }
}

/**
 * @class APIRateLimitHandler
 * @description Handles API rate limiting for requests
 */
class APIRateLimitHandler extends BaseHandler {
  /**
   * @param {Object} rateLimitService - Service to check and update rate limits
   * @param {Object} options - Configuration options for rate limiting
   */
  constructor(rateLimitService, options = { maxRequests: 100, timeWindow: 3600000 }) {
    super();
    this.rateLimitService = rateLimitService;
    this.options = options;
  }

  /**
   * @inheritdoc
   */
  async handle(request) {
    try {
      // Check if the request is within rate limits
      const { userId, clientIp } = request;
      const identifier = userId || clientIp || 'anonymous';

      const currentUsage = await this.rateLimitService.getCurrentUsage(identifier);

      if (currentUsage >= this.options.maxRequests) {
        return {
          success: false,
          statusCode: 429,
          message: 'Rate limit exceeded. Please try again later.',
        };
      }

      await this.rateLimitService.incrementUsage(identifier);

      return super.handle(request);
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return super.handle(request);
    }
  }
}

/**
 * @class AuthenticationHandler
 * @description Validates that the request has proper authentication
 */
class AuthenticationHandler extends BaseHandler {
  /**
   * @param {Object} authService - Service to verify authentication
   */
  constructor(authService) {
    super();
    this.authService = authService;
  }

  /**
   * @inheritdoc
   */
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

      const userData = await this.authService.verifyToken(token);

      if (!userData) {
        return {
          success: false,
          statusCode: 401,
          message: 'Invalid or expired authentication token',
        };
      }

      request.user = userData;

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

/**
 * @class AuthorizationHandler
 * @description Checks if the authenticated user has proper permissions
 */
class AuthorizationHandler extends BaseHandler {
  /**
   * @param {Object} permissionService - Service to check permissions
   */
  constructor(permissionService) {
    super();
    this.permissionService = permissionService;
  }

  /**
   * @inheritdoc
   */
  async handle(request) {
    try {
      const { user, resource, action } = request;

      if (!user) {
        return {
          success: false,
          statusCode: 403,
          message: 'User data missing for authorization check',
        };
      }

      const hasPermission = await this.permissionService.checkPermission(user.id, resource, action);

      if (!hasPermission) {
        return {
          success: false,
          statusCode: 403,
          message: `You don't have permission to ${action} this ${resource}`,
        };
      }

      return super.handle(request);
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Authorization service error',
        error: error.message,
      };
    }
  }
}

/**
 * @class InputValidationHandler
 * @description Validates the input data according to specified schemas
 */
class InputValidationHandler extends BaseHandler {
  /**
   * @param {Object} schema - Validation schema (e.g., Joi, Yup, Zod)
   */
  constructor(schema) {
    super();
    this.schema = schema;
  }

  /**
   * @inheritdoc
   */
  async handle(request) {
    try {
      const { body } = request;
      const validationResult = await this.validateBody(body);

      if (!validationResult.valid) {
        return {
          success: false,
          statusCode: 400,
          message: 'Invalid input data',
          errors: validationResult.errors,
        };
      }

      request.validatedData = validationResult.data;

      return super.handle(request);
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: 'Validation error',
        error: error.message,
      };
    }
  }

  /**
   * Validate the request body
   * @param {Object} body - The request body to validate
   * @returns {Object} - Validation result
   */
  async validateBody(body) {
    try {
      const result = await this.schema.validate(body);

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
  }
}

/**
 * @class LoggingHandler
 * @description Logs request information
 */
class LoggingHandler extends BaseHandler {
  /**
   * @param {Object} logger - Logging service
   */
  constructor(logger) {
    super();
    this.logger = logger;
  }

  /**
   * @inheritdoc
   */
  async handle(request) {
    const startTime = Date.now();
    this.logger.info('Request received', {
      path: request.path,
      method: request.method,
      userId: request.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    });

    const result = await super.handle(request);
    const processingTime = Date.now() - startTime;

    if (result.success) {
      this.logger.info('Request processed successfully', {
        path: request.path,
        method: request.method,
        statusCode: result.statusCode || 200,
        processingTime,
      });
    } else {
      this.logger.warn('Request processing failed', {
        path: request.path,
        method: request.method,
        statusCode: result.statusCode,
        message: result.message,
        processingTime,
      });
    }

    return result;
  }
}

/**
 * @class ResponseFormatterHandler
 * @description Formats the response according to API standards
 */
class ResponseFormatterHandler extends BaseHandler {
  /**
   * @inheritdoc
   */
  async handle(request) {
    const result = await super.handle(request);
    return {
      ...result,
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      path: request.path,
    };
  }
}

export {
  BaseHandler,
  APIRateLimitHandler,
  AuthenticationHandler,
  AuthorizationHandler,
  InputValidationHandler,
  LoggingHandler,
  ResponseFormatterHandler,
};
