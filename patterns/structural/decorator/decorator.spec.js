import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  createMethodLogger,
  createPerformanceMonitor,
  createCacheDecorator,
} from './decorator.implementation.js';
import { withLogging, withPerformanceMonitoring, withCache } from './decorator.functional.js';
import { applyDecorators } from './decorator.utils.js';

// Utility to create a mock class for testing
function createMockClass() {
  return class TestClass {
    async successMethod(param) {
      return `Success: ${param}`;
    }

    async failMethod() {
      throw new Error('Intentional failure');
    }

    async delayedMethod(ms) {
      await new Promise((resolve) => setTimeout(resolve, ms));
      return 'Completed';
    }
  };
}

describe('Class-based Decorators', () => {
  let consoleSpy;
  let performanceSpy;
  let originalNow;

  beforeEach(() => {
    // Mock console.log
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock performance.now
    originalNow = performance.now;
    let time = 0;
    performanceSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
      time += 100; // Simulate 100ms passing between calls
      return time;
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    performanceSpy.mockRestore();
    performance.now = originalNow;
    vi.useRealTimers();
  });

  describe('methodLogger decorator', () => {
    it('should log method calls and results', async () => {
      const TestClass = createMockClass();
      const logMethod = createMethodLogger({ prefix: '[Test]' });

      applyDecorators(TestClass.prototype, 'successMethod', [logMethod]);

      const instance = new TestClass();
      const result = await instance.successMethod('test');

      expect(result).toBe('Success: test');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[0][0]).toContain('[Test] TestClass.successMethod called with:');
      expect(consoleSpy.mock.calls[1][0]).toContain('resolved with:');
    });

    it('should log errors when methods throw', async () => {
      const TestClass = createMockClass();
      const logMethod = createMethodLogger();

      applyDecorators(TestClass.prototype, 'failMethod', [logMethod]);

      const instance = new TestClass();

      await expect(instance.failMethod()).rejects.toThrow('Intentional failure');

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[0][0]).toContain('called with:');
      expect(consoleSpy.mock.calls[1][0]).toContain('rejected with:');
    });
  });

  describe('performanceMonitor decorator', () => {
    it('should track and log method execution time', async () => {
      const TestClass = createMockClass();
      const monitor = createPerformanceMonitor();

      applyDecorators(TestClass.prototype, 'delayedMethod', [monitor]);

      const instance = new TestClass();

      await instance.delayedMethod(50);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy.mock.calls[0][0]).toContain('Performance [TestClass.delayedMethod]:');
    });

    it('should respect threshold setting', async () => {
      const TestClass = createMockClass();
      const monitor = createPerformanceMonitor({ threshold: 200 });

      applyDecorators(TestClass.prototype, 'delayedMethod', [monitor]);

      const instance = new TestClass();

      performanceSpy.mockReset();
      performanceSpy.mockImplementation(() => 10);

      await instance.delayedMethod(10);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('cache decorator', () => {
    it('should cache method results', async () => {
      const TestClass = createMockClass();
      let callCount = 0;

      TestClass.prototype.expensiveOperation = async (param) => {
        callCount++;
        return `Result: ${param} (call ${callCount})`;
      };

      const cache = createCacheDecorator({
        ttl: 1000,
      });

      applyDecorators(TestClass.prototype, 'expensiveOperation', [cache]);

      const instance = new TestClass();
      const result1 = await instance.expensiveOperation('test');
      const result2 = await instance.expensiveOperation('test');
      const result3 = await instance.expensiveOperation('different');

      expect(result1).toBe('Result: test (call 1)');
      expect(result2).toBe('Result: test (call 1)');
      expect(result3).toBe('Result: different (call 2)');
      expect(callCount).toBe(2);
    });

    it('should expire cache entries after ttl', async () => {
      const TestClass = createMockClass();
      let callCount = 0;

      TestClass.prototype.expensiveOperation = async (param) => {
        callCount++;
        return `Result: ${param} (call ${callCount})`;
      };

      let currentTime = Date.now();
      const dateSpy = vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

      const cache = createCacheDecorator({
        ttl: 500,
      });

      applyDecorators(TestClass.prototype, 'expensiveOperation', [cache]);

      const instance = new TestClass();
      const result1 = await instance.expensiveOperation('test');
      const result2 = await instance.expensiveOperation('test');

      currentTime += 600;

      const result3 = await instance.expensiveOperation('test');

      expect(result1).toBe('Result: test (call 1)');
      expect(result2).toBe('Result: test (call 1)');
      expect(result3).toBe('Result: test (call 2)');
      expect(callCount).toBe(2);

      dateSpy.mockRestore();
    });
  });
});

describe('Functional Decorators', () => {
  let consoleSpy;
  let performanceSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    performanceSpy = vi.spyOn(performance, 'now').mockImplementation(() => {
      return Date.now();
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    performanceSpy.mockRestore();
    vi.useRealTimers();
  });

  describe('withLogging decorator', () => {
    it('should log function calls and results', async () => {
      const testFn = async (param) => `Success: ${param}`;
      const decorated = withLogging(testFn, { prefix: '[Test]' });
      const result = await decorated('test-param');

      expect(result).toBe('Success: test-param');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[0][0]).toContain('[Test]');
      expect(consoleSpy.mock.calls[0][0]).toContain('called with:');
      expect(consoleSpy.mock.calls[1][0]).toContain('returned:');
    });

    it('should log errors for failed functions', async () => {
      const failFn = async () => {
        throw new Error('Function failed');
      };
      const decorated = withLogging(failFn);

      await expect(decorated()).rejects.toThrow('Function failed');

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[0][0]).toContain('called with:');
      expect(consoleSpy.mock.calls[1][0]).toContain('error:');
    });
  });

  describe('withPerformanceMonitoring decorator', () => {
    it('should monitor function execution time', async () => {
      let callTime = 0;

      performanceSpy.mockImplementation(() => {
        callTime += 200;
        return callTime;
      });

      const slowFn = async () => {
        return 'Completed slow operation';
      };
      const decorated = withPerformanceMonitoring(slowFn);

      await decorated();

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy.mock.calls[0][0]).toContain('Performance');
    });
  });

  describe('withCache decorator', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const expensiveFn = async (param) => {
        callCount++;
        return `Result: ${param} (call ${callCount})`;
      };

      const decorated = withCache(expensiveFn);
      const result1 = await decorated('test');
      const result2 = await decorated('test');
      const result3 = await decorated('different');

      expect(result1).toBe('Result: test (call 1)');
      expect(result2).toBe('Result: test (call 1)');
      expect(result3).toBe('Result: different (call 2)');
      expect(callCount).toBe(2);
    });
  });
});
