import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  BaseApiHandler,
  UserApiHandler,
  ProductApiHandler,
} from './template-method.implementation.js';
import {
  createApiRequestHandler,
  createUserApiHandler,
  createProductApiHandler,
} from './template-method.functional.js';

// Helper regex for ISO8601 date validation
const ISO8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

// Mock console methods to avoid cluttering test output
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('Template Method Pattern - Class-based Implementation', () => {
  describe('BaseApiHandler', () => {
    it('should throw errors for abstract methods', async () => {
      const handler = new BaseApiHandler();

      expect(() => handler.validateRequest({})).toThrow(/must be implemented/);
      expect(() => handler.prepareRequest({})).toThrow(/must be implemented/);

      await expect(handler.executeRequest({})).rejects.toThrow(/must be implemented/);

      expect(() => handler.processResponse({})).toThrow(/must be implemented/);
    });
  });

  describe('Template Method Pattern - Functional Implementation', () => {
    describe('createApiRequestHandler', () => {
      it('should throw errors for missing required operations', () => {
        expect(() => createApiRequestHandler({})).toThrow(/Required operations missing/);
        expect(() =>
          createApiRequestHandler({
            validateRequest: () => {},
            prepareRequest: () => {},
            executeRequest: () => {},
          })
        ).toThrow(/Required operations missing/);
      });

      it('should create a handler function with the template method', async () => {
        const handler = createApiRequestHandler({
          validateRequest: vi.fn(),
          prepareRequest: vi.fn().mockReturnValue({ headers: {} }),
          executeRequest: vi.fn().mockResolvedValue({ status: 200, data: {} }),
          processResponse: vi.fn().mockReturnValue({ processed: true }),
        });

        expect(typeof handler).toBe('function');

        const result = await handler({ test: true });

        expect(result.processed).toBe(true);
      });

      it('should handle errors correctly', async () => {
        const error = new Error('Test error');
        const operations = {
          validateRequest: vi.fn().mockImplementation(() => {
            throw error;
          }),
          prepareRequest: vi.fn(),
          executeRequest: vi.fn(),
          processResponse: vi.fn(),
          handleError: vi.fn(),
          logRequest: vi.fn(),
        };

        const handler = createApiRequestHandler(operations);
        const requestData = { test: true };

        await expect(handler(requestData)).rejects.toThrow('Test error');

        expect(operations.handleError).toHaveBeenCalledWith(error, requestData);
        expect(operations.logRequest).toHaveBeenCalledWith(requestData, null, error);
      });
    });

    describe('createUserApiHandler', () => {
      let userHandler;
      let mockApiClient;
      let mockCache;

      beforeEach(() => {
        mockApiClient = {
          request: vi.fn().mockResolvedValue({ status: 200, data: { id: 'user123' } }),
        };

        mockCache = {
          set: vi.fn().mockResolvedValue(undefined),
          get: vi.fn().mockResolvedValue(null),
        };

        userHandler = createUserApiHandler(mockApiClient, mockCache);
      });

      it('should create a function that handles user requests', () => {
        expect(typeof userHandler).toBe('function');
      });

      it('should validate user requests correctly', async () => {
        // Valid request
        await expect(
          userHandler({
            endpoint: 'getUserProfile',
            userId: '123',
          })
        ).resolves.not.toThrow();

        // Invalid request (missing userId)
        await expect(
          userHandler({
            endpoint: 'getUserProfile',
          })
        ).rejects.toThrow(/User ID is required/);
      });

      it('should handle the complete user request flow', async () => {
        const result = await userHandler({
          endpoint: 'getUserProfile',
          userId: '123',
        });

        expect(result).toEqual({
          requestId: expect.any(String),
          status: 200,
          processed: true,
          processedAt: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            email: expect.any(String),
            created: expect.any(String),
          }),
        });
      });
    });

    describe('createProductApiHandler', () => {
      let productHandler;
      let mockApiClient;

      beforeEach(() => {
        mockApiClient = {
          request: vi.fn().mockResolvedValue({ status: 200, data: { id: 'prod123' } }),
        };

        productHandler = createProductApiHandler(mockApiClient, {
          enableMetrics: true,
          retryCount: 2,
        });
      });

      it('should create a function that handles product requests', () => {
        expect(typeof productHandler).toBe('function');
      });

      it('should validate product requests correctly', async () => {
        // Valid request
        await expect(
          productHandler({
            endpoint: 'getProduct',
            productId: '123',
          })
        ).resolves.not.toThrow();

        // Invalid request (missing productId)
        await expect(
          productHandler({
            endpoint: 'getProduct',
          })
        ).rejects.toThrow(/Product ID is required/);
      });
    });
  });

  it('should provide default implementations for hook methods', () => {
    const handler = new BaseApiHandler();

    expect(handler.shouldCacheResponse({})).toBe(false);
    expect(() => handler.cacheResponse({})).not.toThrow();
    expect(() => handler.logRequest({}, {}, null)).not.toThrow();
    expect(() => handler.handleError(new Error('test'), {})).not.toThrow();
  });
});

describe('UserApiHandler', () => {
  let userHandler;
  let mockApiClient;
  let mockCache;

  beforeEach(() => {
    mockApiClient = {
      request: vi.fn().mockResolvedValue({ status: 200, data: { id: 'user123' } }),
    };

    mockCache = {
      set: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
    };

    userHandler = new UserApiHandler(mockApiClient, mockCache);
  });

  it('should validate user requests correctly', () => {
    // Valid request
    expect(() =>
      userHandler.validateRequest({
        endpoint: 'getUserProfile',
        userId: '123',
      })
    ).not.toThrow();

    // Invalid request (missing userId)
    expect(() =>
      userHandler.validateRequest({
        endpoint: 'getUserProfile',
      })
    ).toThrow(/User ID is required/);

    // Invalid request for user creation (missing email)
    expect(() =>
      userHandler.validateRequest({
        endpoint: 'createUser',
        userData: { password: 'password123' },
      })
    ).toThrow(/Email is required/);

    // Invalid request for user creation (short password)
    expect(() =>
      userHandler.validateRequest({
        endpoint: 'createUser',
        userData: { email: 'user@example.com', password: 'pass' },
      })
    ).toThrow(/Password must be at least 8 characters/);
  });

  it('should prepare user requests correctly', () => {
    const getUserRequest = userHandler.prepareRequest({
      endpoint: 'getUserProfile',
      userId: '123',
      includeDetails: true,
    });

    expect(getUserRequest.method).toBe('GET');
    expect(getUserRequest.url).toBe('/api/users/123');
    expect(getUserRequest.params).toEqual({ include: 'details,preferences' });

    const createUserRequest = userHandler.prepareRequest({
      endpoint: 'createUser',
      userData: {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      },
    });

    expect(createUserRequest.method).toBe('POST');
    expect(createUserRequest.url).toBe('/api/users');
    expect(createUserRequest.body).toEqual({
      email: 'user@example.com',
      password: 'password123',
      name: 'Test User',
      created: expect.any(String),
    });
  });

  it('should process user responses correctly', () => {
    const response = {
      status: 200,
      requestId: 'req-123',
      data: {
        id: 'user123',
        email: 'user@example.com',
        created: '2023-01-01T12:34:56Z',
      },
    };

    const processed = userHandler.processResponse(response);

    expect(processed.processed).toBe(true);
    expect(processed.processedAt).toMatch(ISO8601_REGEX);
    expect(processed.data.created).toMatch(ISO8601_REGEX);
  });

  it('should handle the complete user request flow', async () => {
    const result = await userHandler.handleRequest({
      endpoint: 'getUserProfile',
      userId: '123',
    });

    expect(result).toEqual({
      requestId: expect.any(String),
      status: 200,
      processed: true,
      processedAt: expect.any(String),
      data: expect.objectContaining({
        id: expect.any(String),
        email: expect.any(String),
        created: expect.any(String),
      }),
    });
  });

  it('should cache successful GET responses', async () => {
    // Configure the handler to cache responses
    vi.spyOn(userHandler, 'shouldCacheResponse').mockReturnValue(true);
    vi.spyOn(userHandler, 'cacheResponse');

    await userHandler.handleRequest({
      endpoint: 'getUserProfile',
      userId: '123',
    });

    expect(userHandler.cacheResponse).toHaveBeenCalled();
  });
});

describe('ProductApiHandler', () => {
  let productHandler;
  let mockApiClient;

  beforeEach(() => {
    mockApiClient = {
      request: vi.fn().mockResolvedValue({ status: 200, data: { id: 'prod123' } }),
    };

    productHandler = new ProductApiHandler(mockApiClient, {
      enableMetrics: true,
      retryCount: 2,
    });
  });

  it('should validate product requests correctly', () => {
    // Valid request
    expect(() =>
      productHandler.validateRequest({
        endpoint: 'getProduct',
        productId: '123',
      })
    ).not.toThrow();

    // Invalid request (missing productId)
    expect(() =>
      productHandler.validateRequest({
        endpoint: 'getProduct',
      })
    ).toThrow(/Product ID is required/);

    // Invalid request for product creation (missing name)
    expect(() =>
      productHandler.validateRequest({
        endpoint: 'createProduct',
        productData: { price: 19.99 },
      })
    ).toThrow(/Product name is required/);

    // Invalid request for product creation (invalid price)
    expect(() =>
      productHandler.validateRequest({
        endpoint: 'createProduct',
        productData: { name: 'Test Product', price: 'invalid' },
      })
    ).toThrow(/Valid product price is required/);
  });

  it('should add price calculations to product responses', () => {
    const singleProductResponse = {
      status: 200,
      requestId: 'req-123',
      data: {
        id: 'prod123',
        name: 'Test Product',
        price: 19.99,
        created: '2023-01-01T12:34:56Z',
      },
    };

    const processed = productHandler.processResponse(singleProductResponse);

    expect(processed.processed).toBe(true);
    expect(processed.data.displayPrice).toBe('21.99');
    expect(processed.data.priceWithCurrency).toBe('$19.99');
  });

  it('should add price calculations to product search results', () => {
    const searchResponse = {
      status: 200,
      requestId: 'req-123',
      data: {
        items: [
          { id: 'prod1', name: 'Product 1', price: 19.99 },
          { id: 'prod2', name: 'Product 2', price: 29.99 },
        ],
        total: 2,
        page: 1,
        limit: 20,
      },
    };

    const processed = productHandler.processResponse(searchResponse);

    expect(processed.processed).toBe(true);
    expect(processed.data.items[0].displayPrice).toBe('21.99');
    expect(processed.data.items[0].priceWithCurrency).toBe('$19.99');
    expect(processed.data.items[1].displayPrice).toBe('32.99');
    expect(processed.data.items[1].priceWithCurrency).toBe('$29.99');
  });

  it('should handle the complete product search flow', async () => {
    const result = await productHandler.handleRequest({
      endpoint: 'searchProducts',
      query: 'test',
      category: 'electronics',
      limit: 10,
      page: 1,
    });

    expect(result).toEqual({
      requestId: expect.any(String),
      status: 200,
      processed: true,
      processedAt: expect.any(String),
      data: expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
      }),
    });

    // Verify that items have price calculations
    if (result.data.items.length > 0) {
      expect(result.data.items[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
        displayPrice: expect.any(String),
        priceWithCurrency: expect.stringMatching(/\$\d+\.\d{2}/),
      });
    }
  });
});
