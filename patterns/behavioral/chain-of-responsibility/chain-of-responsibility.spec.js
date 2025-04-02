import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  BaseHandler,
  APIRateLimitHandler,
  AuthenticationHandler,
  AuthorizationHandler,
  InputValidationHandler,
  LoggingHandler,
  ResponseFormatterHandler,
} from './chain-of-responsibility.implementation.js';
import {
  createHandler,
  createRateLimitHandler,
  createAuthenticationHandler,
  createAuthorizationHandler,
  createInputValidationHandler,
  createLoggingHandler,
  createResponseFormatterHandler,
  createFinalHandler,
} from './chain-of-responsibility.functional.js';

describe('Chain of Responsibility - Class-based Implementation', () => {
  const mockServices = {
    rateLimitService: {
      getCurrentUsage: vi.fn(),
      incrementUsage: vi.fn(),
    },
    authService: {
      verifyToken: vi.fn(),
    },
    permissionService: {
      checkPermission: vi.fn(),
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    validationSchema: {
      validate: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a chain of handlers', () => {
    const loggingHandler = new LoggingHandler(mockServices.logger);
    const rateLimitHandler = new APIRateLimitHandler(mockServices.rateLimitService);
    const authHandler = new AuthenticationHandler(mockServices.authService);

    loggingHandler.setNext(rateLimitHandler).setNext(authHandler);

    expect(loggingHandler.nextHandler).toBe(rateLimitHandler);
    expect(rateLimitHandler.nextHandler).toBe(authHandler);
    expect(authHandler.nextHandler).toBe(null);
  });

  it('should pass request along the chain when each handler succeeds', async () => {
    mockServices.rateLimitService.getCurrentUsage.mockResolvedValue(10);
    mockServices.authService.verifyToken.mockResolvedValue({ id: '123', username: 'test' });
    mockServices.permissionService.checkPermission.mockResolvedValue(true);

    const loggingHandler = new LoggingHandler(mockServices.logger);
    const rateLimitHandler = new APIRateLimitHandler(mockServices.rateLimitService);
    const authHandler = new AuthenticationHandler(mockServices.authService);
    const authorizationHandler = new AuthorizationHandler(mockServices.permissionService);
    const finalHandler = new BaseHandler(); // Simple handler to end the chain

    loggingHandler
      .setNext(rateLimitHandler)
      .setNext(authHandler)
      .setNext(authorizationHandler)
      .setNext(finalHandler);

    const request = {
      token: 'valid_token',
      user: { id: '123' },
      resource: 'posts',
      action: 'read',
    };

    const result = await loggingHandler.handle(request);

    expect(mockServices.logger.info).toHaveBeenCalled();
    expect(mockServices.rateLimitService.getCurrentUsage).toHaveBeenCalled();
    expect(mockServices.authService.verifyToken).toHaveBeenCalled();
    expect(mockServices.permissionService.checkPermission).toHaveBeenCalled();
    expect(result.success).toBeTruthy();
  });

  it('should stop chain when rate limit is exceeded', async () => {
    mockServices.rateLimitService.getCurrentUsage.mockResolvedValue(200);

    const rateLimitHandler = new APIRateLimitHandler(mockServices.rateLimitService, {
      maxRequests: 100,
    });
    const authHandler = new AuthenticationHandler(mockServices.authService);

    rateLimitHandler.setNext(authHandler);

    const request = {
      clientIp: '127.0.0.1',
    };

    const result = await rateLimitHandler.handle(request);

    expect(mockServices.rateLimitService.getCurrentUsage).toHaveBeenCalled();
    expect(mockServices.authService.verifyToken).not.toHaveBeenCalled();
    expect(result.success).toBeFalsy();
    expect(result.statusCode).toBe(429);
  });

  it('should stop chain when authentication fails', async () => {
    mockServices.rateLimitService.getCurrentUsage.mockResolvedValue(10);
    mockServices.authService.verifyToken.mockResolvedValue(null); // Auth fails

    const rateLimitHandler = new APIRateLimitHandler(mockServices.rateLimitService);
    const authHandler = new AuthenticationHandler(mockServices.authService);
    const authorizationHandler = new AuthorizationHandler(mockServices.permissionService);

    rateLimitHandler.setNext(authHandler).setNext(authorizationHandler);

    const request = {
      token: 'invalid_token',
    };

    const result = await rateLimitHandler.handle(request);

    expect(mockServices.rateLimitService.getCurrentUsage).toHaveBeenCalled();
    expect(mockServices.authService.verifyToken).toHaveBeenCalled();
    expect(mockServices.permissionService.checkPermission).not.toHaveBeenCalled();
    expect(result.success).toBeFalsy();
    expect(result.statusCode).toBe(401);
  });

  it('should stop chain when authorization fails', async () => {
    mockServices.rateLimitService.getCurrentUsage.mockResolvedValue(10);
    mockServices.authService.verifyToken.mockResolvedValue({ id: '123', username: 'test' });
    mockServices.permissionService.checkPermission.mockResolvedValue(false); // Permission denied

    const rateLimitHandler = new APIRateLimitHandler(mockServices.rateLimitService);
    const authHandler = new AuthenticationHandler(mockServices.authService);
    const authorizationHandler = new AuthorizationHandler(mockServices.permissionService);
    const validationHandler = new InputValidationHandler(mockServices.validationSchema);

    rateLimitHandler.setNext(authHandler).setNext(authorizationHandler).setNext(validationHandler);

    const request = {
      token: 'valid_token',
      user: { id: '123' },
      resource: 'users',
      action: 'delete',
    };

    const result = await rateLimitHandler.handle(request);

    expect(mockServices.rateLimitService.getCurrentUsage).toHaveBeenCalled();
    expect(mockServices.authService.verifyToken).toHaveBeenCalled();
    expect(mockServices.permissionService.checkPermission).toHaveBeenCalled();
    expect(mockServices.validationSchema.validate).not.toHaveBeenCalled();
    expect(result.success).toBeFalsy();
    expect(result.statusCode).toBe(403);
  });

  it('should stop chain when validation fails', async () => {
    mockServices.validationSchema.validate.mockResolvedValue({
      error: { details: [{ message: 'Title is required' }] },
      value: {},
    });

    const validationHandler = new InputValidationHandler(mockServices.validationSchema);
    const finalHandler = new ResponseFormatterHandler();

    validationHandler.setNext(finalHandler);

    const request = {
      body: {},
    };
    const result = await validationHandler.handle(request);

    expect(mockServices.validationSchema.validate).toHaveBeenCalled();
    expect(result.success).toBeFalsy();
    expect(result.statusCode).toBe(400);
    expect(result.errors).toBeTruthy();
  });

  it('should add standard fields to response via ResponseFormatterHandler', async () => {
    const responseFormatter = new ResponseFormatterHandler();
    const request = {
      path: '/api/test',
      requestId: 'req-123',
    };

    const result = await responseFormatter.handle(request);

    expect(result.success).toBeTruthy();
    expect(result.timestamp).toBeDefined();
    expect(result.requestId).toBe('req-123');
    expect(result.path).toBe('/api/test');
  });

  it('should log request information via LoggingHandler', async () => {
    const loggingHandler = new LoggingHandler(mockServices.logger);
    const finalHandler = new BaseHandler();

    loggingHandler.setNext(finalHandler);

    const request = {
      path: '/api/test',
      method: 'GET',
      user: { id: '123' },
    };

    await loggingHandler.handle(request);

    expect(mockServices.logger.info).toHaveBeenCalledWith(
      'Request received',
      expect.objectContaining({
        path: '/api/test',
        method: 'GET',
        userId: '123',
      })
    );
  });
});

describe('Chain of Responsibility - Functional Implementation', () => {
  const mockServices = {
    rateLimitService: {
      getCurrentUsage: vi.fn(),
      incrementUsage: vi.fn(),
    },
    authService: {
      verifyToken: vi.fn(),
    },
    permissionService: {
      checkPermission: vi.fn(),
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    validationSchema: {
      validate: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should create a chain of handlers', () => {
    const loggingHandler = createLoggingHandler(mockServices.logger);
    const rateLimitHandler = createRateLimitHandler(mockServices.rateLimitService);
    const authHandler = createAuthenticationHandler(mockServices.authService);

    loggingHandler.setNext(rateLimitHandler).setNext(authHandler);

    expect(typeof loggingHandler.handle).toBe('function');
    expect(typeof loggingHandler.setNext).toBe('function');
    expect(typeof rateLimitHandler.handle).toBe('function');
    expect(typeof authHandler.handle).toBe('function');
  });

  it('should pass request along the chain when each handler succeeds', async () => {
    mockServices.rateLimitService.getCurrentUsage.mockResolvedValue(10);
    mockServices.authService.verifyToken.mockResolvedValue({ id: '123', username: 'test' });
    mockServices.permissionService.checkPermission.mockResolvedValue(true);

    const loggingHandler = createLoggingHandler(mockServices.logger);
    const rateLimitHandler = createRateLimitHandler(mockServices.rateLimitService);
    const authHandler = createAuthenticationHandler(mockServices.authService);
    const authorizationHandler = createAuthorizationHandler(mockServices.permissionService);
    const finalHandler = createFinalHandler();

    loggingHandler
      .setNext(rateLimitHandler)
      .setNext(authHandler)
      .setNext(authorizationHandler)
      .setNext(finalHandler);

    const request = {
      token: 'valid_token',
      user: { id: '123' },
      resource: 'posts',
      action: 'read',
    };

    const result = await loggingHandler.handle(request);

    expect(mockServices.logger.info).toHaveBeenCalled();
    expect(mockServices.rateLimitService.getCurrentUsage).toHaveBeenCalled();
    expect(mockServices.authService.verifyToken).toHaveBeenCalled();
    expect(mockServices.permissionService.checkPermission).toHaveBeenCalled();
    expect(result.success).toBeTruthy();
  });

  it('should stop chain when rate limit is exceeded', async () => {
    mockServices.rateLimitService.getCurrentUsage.mockResolvedValue(200); // Exceeds limit

    const rateLimitHandler = createRateLimitHandler(mockServices.rateLimitService, {
      maxRequests: 100,
    });
    const authHandler = createAuthenticationHandler(mockServices.authService);

    rateLimitHandler.setNext(authHandler);

    const request = {
      clientIp: '127.0.0.1',
    };

    const result = await rateLimitHandler.handle(request);

    expect(mockServices.rateLimitService.getCurrentUsage).toHaveBeenCalled();
    expect(mockServices.authService.verifyToken).not.toHaveBeenCalled();
    expect(result.success).toBeFalsy();
    expect(result.statusCode).toBe(429);
  });

  it('should stop chain when authentication fails', async () => {
    mockServices.rateLimitService.getCurrentUsage.mockResolvedValue(10);
    mockServices.authService.verifyToken.mockResolvedValue(null); // Auth fails

    const rateLimitHandler = createRateLimitHandler(mockServices.rateLimitService);
    const authHandler = createAuthenticationHandler(mockServices.authService);
    const authorizationHandler = createAuthorizationHandler(mockServices.permissionService);

    rateLimitHandler.setNext(authHandler).setNext(authorizationHandler);

    const request = {
      token: 'invalid_token',
    };

    const result = await rateLimitHandler.handle(request);

    expect(mockServices.rateLimitService.getCurrentUsage).toHaveBeenCalled();
    expect(mockServices.authService.verifyToken).toHaveBeenCalled();
    expect(mockServices.permissionService.checkPermission).not.toHaveBeenCalled();
    expect(result.success).toBeFalsy();
    expect(result.statusCode).toBe(401);
  });

  it('should handle validation errors', async () => {
    mockServices.validationSchema.validate.mockResolvedValue({
      error: { details: [{ message: 'Title is required' }] },
      value: {},
    });

    const validationHandler = createInputValidationHandler(mockServices.validationSchema);
    const finalHandler = createResponseFormatterHandler();

    validationHandler.setNext(finalHandler);

    const request = {
      body: {},
    };

    const result = await validationHandler.handle(request);

    expect(mockServices.validationSchema.validate).toHaveBeenCalled();
    expect(result.success).toBeFalsy();
    expect(result.statusCode).toBe(400);
    expect(result.errors).toBeTruthy();
  });

  it('should format successful response', async () => {
    const responseFormatter = createResponseFormatterHandler();
    const request = {
      path: '/api/posts',
      method: 'GET',
      requestId: 'test-123',
      responseData: {
        posts: [{ id: 1, title: 'Test' }],
      },
    };

    const result = await responseFormatter.handle(request);

    expect(result.success).toBeTruthy();
    expect(result.data).toBeTruthy();
    expect(result.timestamp).toBeDefined();
    expect(result.requestId).toBe('test-123');
    expect(result.path).toBe('/api/posts');
  });

  it('should allow creating custom handlers', async () => {
    let requestCount = 0;

    const counterHandler = createHandler(async (request) => {
      requestCount++;
      return null;
    });

    const finalHandler = createHandler(async (request) => {
      return {
        success: true,
        count: requestCount,
      };
    });

    counterHandler.setNext(finalHandler);

    await counterHandler.handle({ id: 1 });
    await counterHandler.handle({ id: 2 });
    const result = await counterHandler.handle({ id: 3 });

    expect(requestCount).toBe(3);
    expect(result.count).toBe(3);
  });
});
