/**
 * @fileoverview Tests for the Proxy Pattern implementations.
 *
 * This file contains Vitest tests for both class-based and functional
 * implementations of the API client proxy.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ApiClientProxy } from './proxy.implementation';
import { createApiClientProxy } from './proxy.functional';

// Mock the global fetch function
global.fetch = vi.fn();

// Helper to create a mock successful response
function mockSuccessResponse(data) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

// Helper to create a mock error response
function mockErrorResponse(status = 500) {
  return Promise.resolve({
    ok: false,
    status,
  });
}

describe('Class-based API Client Proxy', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new ApiClientProxy('https://api.example.com', {
      cacheTtl: 1000, // 1 second for faster testing
      rateLimit: 5, // 5 requests per minute
    });

    vi.resetAllMocks();

    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should forward GET requests to the real client', async () => {
    global.fetch.mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'Test' }));

    const result = await apiClient.get('/users/1');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  it('should include query parameters in GET requests', async () => {
    global.fetch.mockReturnValueOnce(mockSuccessResponse([{ id: 1 }]));

    await apiClient.get('/users', { page: 1, limit: 10 });

    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/users?page=1&limit=10');
  });

  it('should forward POST requests to the real client', async () => {
    global.fetch.mockReturnValueOnce(mockSuccessResponse({ id: 2, success: true }));

    const data = { name: 'New User', email: 'user@example.com' };
    const result = await apiClient.post('/users', data);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    expect(result).toEqual({ id: 2, success: true });
  });

  it('should handle API errors gracefully', async () => {
    global.fetch.mockReturnValueOnce(mockErrorResponse(404));
    await expect(apiClient.get('/nonexistent')).rejects.toThrow('API error: 404');
  });

  it('should cache GET responses and reuse them', async () => {
    global.fetch
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'First Response' }))
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'Second Response' }));

    const result1 = await apiClient.get('/cached-endpoint');

    expect(result1).toEqual({ id: 1, name: 'First Response' });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const result2 = await apiClient.get('/cached-endpoint');

    expect(result2).toEqual({ id: 1, name: 'First Response' }); // Same as first response
    expect(global.fetch).toHaveBeenCalledTimes(1); // Fetch not called again
  });

  it('should respect cache TTL', async () => {
    global.fetch
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, data: 'Initial' }))
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, data: 'Updated' }));

    const result1 = await apiClient.get('/users/1');

    expect(result1).toEqual({ id: 1, data: 'Initial' });

    Date.now.mockReturnValue(3000); // 2 seconds later, past our 1s TTL

    const result2 = await apiClient.get('/users/1');

    expect(result2).toEqual({ id: 1, data: 'Updated' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should enforce rate limits', async () => {
    Date.now.mockRestore();

    const strictProxy = new ApiClientProxy('https://api.example.com', {
      rateLimit: 2, // Only 2 requests allowed
    });

    global.fetch.mockReturnValue(mockSuccessResponse({ success: true }));

    await strictProxy.get('/endpoint1');
    await strictProxy.get('/endpoint2');

    await expect(strictProxy.get('/endpoint3')).rejects.toThrow('Rate limit');
  });

  it('should clear cache when requested', async () => {
    global.fetch
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'Test' }))
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'Updated Test' }));

    await apiClient.get('/test-endpoint');

    apiClient.clearCache();

    await apiClient.get('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should clear specific cache entries', async () => {
    global.fetch
      .mockReturnValueOnce(mockSuccessResponse({ id: 1 }))
      .mockReturnValueOnce(mockSuccessResponse({ id: 2 }))
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, updated: true }))
      .mockReturnValueOnce(mockSuccessResponse({ id: 2 })); // Not called if cache works

    await apiClient.get('/item/1');
    await apiClient.get('/item/2');

    const cacheKey = 'GET:/item/1:{}';
    apiClient.clearCache(cacheKey);

    await apiClient.get('/item/1');
    await apiClient.get('/item/2');

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should provide accurate cache statistics', async () => {
    Date.now.mockReturnValue(1000);

    global.fetch.mockReturnValue(mockSuccessResponse({ data: 'test' }));

    await apiClient.get('/stats/1');
    await apiClient.get('/stats/2');

    const stats = apiClient.getCacheStats();

    expect(stats.size).toBe(2);
    expect(stats.entries).toHaveLength(2);
    expect(stats.entries[0].key).toContain('GET:/stats/1');
    expect(stats.entries[1].key).toContain('GET:/stats/2');

    const expiryDate = new Date(2000).toISOString();

    expect(stats.entries[0].expiresAt).toBe(expiryDate);
  });
});

describe('Functional API Client Proxy', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = createApiClientProxy('https://api.example.com', {
      cacheTtl: 1000, // 1 second for faster testing
      rateLimit: 5, // 5 requests per minute
    });

    vi.resetAllMocks();

    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should forward GET requests to the real client', async () => {
    global.fetch.mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'Test' }));

    const result = await apiClient.get('/users/1');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/users/1');
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  it('should cache GET responses and reuse them', async () => {
    global.fetch
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'First Response' }))
      .mockReturnValueOnce(mockSuccessResponse({ id: 1, name: 'Second Response' }));

    const result1 = await apiClient.get('/cached-endpoint');

    expect(result1).toEqual({ id: 1, name: 'First Response' });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const result2 = await apiClient.get('/cached-endpoint');

    expect(result2).toEqual({ id: 1, name: 'First Response' }); // Same as first response
    expect(global.fetch).toHaveBeenCalledTimes(1); // Fetch not called again
  });

  it('should enforce rate limits', async () => {
    Date.now.mockRestore();

    const strictProxy = createApiClientProxy('https://api.example.com', {
      rateLimit: 2, // Only 2 requests allowed
    });

    global.fetch.mockReturnValue(mockSuccessResponse({ success: true }));

    await strictProxy.get('/endpoint1');
    await strictProxy.get('/endpoint2');
    await expect(strictProxy.get('/endpoint3')).rejects.toThrow('Rate limit');
  });

  it('should expose internal state for testing', async () => {
    expect(apiClient._internals).toBeDefined();
    expect(apiClient._internals.cache).toBeDefined();
    expect(apiClient._internals.client).toBeDefined();
    expect(apiClient._internals.config).toBeDefined();
    expect(apiClient._internals.config.cacheTtl).toBe(1000);
    expect(apiClient._internals.config.rateLimit).toBe(5);
  });
});

describe('Native JavaScript Proxy usage', () => {
  it('should demonstrate the native Proxy object', () => {
    const user = {
      name: 'John',
      age: 30,
    };

    const accessed = [];
    const modified = [];
    const handler = {
      get(target, prop) {
        accessed.push(prop);
        return target[prop];
      },
      set(target, prop, value) {
        modified.push({ prop, value });
        target[prop] = value;
        return true;
      },
    };

    const userProxy = new Proxy(user, handler);

    const name = userProxy.name;
    userProxy.age = 31;
    userProxy.country = 'USA';

    expect(accessed).toContain('name');
    expect(modified).toHaveLength(2);
    expect(modified[0]).toEqual({ prop: 'age', value: 31 });
    expect(modified[1]).toEqual({ prop: 'country', value: 'USA' });
    expect(user.age).toBe(31);
    expect(user.country).toBe('USA');
  });
});
