import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ConfigManager, createConfigManager } from './singleton.implementation.js';

// Test Suite for Class-based ConfigManager
describe('Class-based ConfigManager', () => {
  beforeEach(() => {
    // Setup test environment variables
    process.env = {
      APP_TEST_KEY: 'test-value',
      APP_API_URL: 'https://api.test.com',
      NON_APP_KEY: 'should-not-be-loaded',
    };

    ConfigManager.getInstance().reset();
  });

  test('should create singleton instance', () => {
    const instance1 = ConfigManager.getInstance();
    const instance2 = ConfigManager.getInstance();

    expect(instance1).toBe(instance2);
  });

  test('should throw error when using new keyword', () => {
    expect(() => new ConfigManager()).toThrow('Use ConfigManager.getInstance()');
  });

  test('should load initial config from environment', () => {
    const config = ConfigManager.getInstance();

    expect(config.get('APP_TEST_KEY')).toBe('test-value');
    expect(config.get('APP_API_URL')).toBe('https://api.test.com');
    expect(config.get('NON_APP_KEY')).toBeUndefined();
  });

  test('should set and get configuration values', () => {
    const config = ConfigManager.getInstance();

    config.set('APP_NEW_KEY', 'new-value');
    expect(config.get('APP_NEW_KEY')).toBe('new-value');
  });

  test('should notify subscribers of changes', () => {
    const config = ConfigManager.getInstance();
    const listener = vi.fn();

    const unsubscribe = config.subscribe(listener);
    config.set('APP_TEST_KEY', 'updated-value');

    expect(listener).toHaveBeenCalledWith({
      key: 'APP_TEST_KEY',
      newValue: 'updated-value',
      oldValue: 'test-value',
    });

    unsubscribe();
  });

  test('should unsubscribe listeners', () => {
    const config = ConfigManager.getInstance();
    const listener = vi.fn();

    const unsubscribe = config.subscribe(listener);
    unsubscribe();

    config.set('APP_TEST_KEY', 'new-value');
    expect(listener).not.toHaveBeenCalled();
  });

  test('should get all configuration', () => {
    const config = ConfigManager.getInstance();
    const allConfig = config.getAll();

    expect(allConfig).toEqual({
      APP_TEST_KEY: 'test-value',
      APP_API_URL: 'https://api.test.com',
    });
  });

  test('should reset configuration to initial state', () => {
    const config = ConfigManager.getInstance();

    config.set('APP_TEST_KEY', 'modified');
    config.set('APP_NEW_KEY', 'new-value');

    config.reset();

    expect(config.get('APP_TEST_KEY')).toBe('test-value');
    expect(config.get('APP_NEW_KEY')).toBeUndefined();
  });

  test('should handle multiple subscribers', () => {
    const config = ConfigManager.getInstance();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    config.subscribe(listener1);
    config.subscribe(listener2);

    config.set('APP_TEST_KEY', 'multi-test');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});

// Test Suite for Functional ConfigManager
describe('Functional ConfigManager', () => {
  let configManagerFactory;
  let configManager;

  beforeEach(() => {
    process.env = {
      APP_TEST_KEY: 'test-value',
      APP_API_URL: 'https://api.test.com',
      NON_APP_KEY: 'should-not-be-loaded',
    };

    // Get fresh instance
    configManagerFactory = createConfigManager();

    // Get singleton instance
    configManager = configManagerFactory.getInstance();
  });

  test('should maintain singleton instance', () => {
    const instance1 = configManagerFactory.getInstance();
    const instance2 = configManagerFactory.getInstance();

    expect(instance1).toBe(instance2);
  });

  test('should load initial config from environment', () => {
    expect(configManager.get('APP_TEST_KEY')).toBe('test-value');
    expect(configManager.get('APP_API_URL')).toBe('https://api.test.com');
    expect(configManager.get('NON_APP_KEY')).toBeUndefined();
  });

  test('should set and get configuration values', () => {
    configManager.set('APP_NEW_KEY', 'new-value');
    expect(configManager.get('APP_NEW_KEY')).toBe('new-value');
  });

  test('should notify subscribers of changes', () => {
    const listener = vi.fn();

    const unsubscribe = configManager.subscribe(listener);
    configManager.set('APP_TEST_KEY', 'updated-value');

    expect(listener).toHaveBeenCalledWith({
      key: 'APP_TEST_KEY',
      newValue: 'updated-value',
      oldValue: 'test-value',
    });

    unsubscribe();
  });

  test('should unsubscribe listeners', () => {
    const listener = vi.fn();

    const unsubscribe = configManager.subscribe(listener);
    unsubscribe();

    configManager.set('APP_TEST_KEY', 'new-value');
    expect(listener).not.toHaveBeenCalled();
  });

  test('should get all configuration', () => {
    const allConfig = configManager.getAll();

    expect(allConfig).toEqual({
      APP_TEST_KEY: 'test-value',
      APP_API_URL: 'https://api.test.com',
    });
  });

  test('should reset configuration to initial state', () => {
    configManager.set('APP_TEST_KEY', 'modified');
    configManager.set('APP_NEW_KEY', 'new-value');

    configManager.reset();

    expect(configManager.get('APP_TEST_KEY')).toBe('test-value');
    expect(configManager.get('APP_NEW_KEY')).toBeUndefined();
  });

  test('should handle multiple subscribers', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    configManager.subscribe(listener1);
    configManager.subscribe(listener2);

    configManager.set('APP_TEST_KEY', 'multi-test');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  test('should handle concurrent operations', async () => {
    const promises = [];
    const subscribers = [];

    // Create multiple subscribers
    for (let i = 0; i < 5; i++) {
      const listener = vi.fn();
      subscribers.push(listener);
      configManager.subscribe(listener);
    }

    // Perform concurrent operations
    for (let i = 0; i < 10; i++) {
      promises.push(
        Promise.resolve().then(() => {
          configManager.set(`APP_CONCURRENT_${i}`, `value-${i}`);
        })
      );
    }

    await Promise.all(promises);

    // Verify all subscribers were called for each operation
    subscribers.forEach((listener) => {
      expect(listener).toHaveBeenCalledTimes(10);
    });
  });

  test('should handle edge cases', () => {
    // Test with undefined value
    configManager.set('APP_UNDEFINED', undefined);
    expect(configManager.get('APP_UNDEFINED')).toBeUndefined();

    // Test with null value
    configManager.set('APP_NULL', null);
    expect(configManager.get('APP_NULL')).toBeNull();

    // Test with empty string
    configManager.set('APP_EMPTY', '');
    expect(configManager.get('APP_EMPTY')).toBe('');

    // Test with special characters
    configManager.set('APP_SPECIAL@#$%', 'special!@#$%');
    expect(configManager.get('APP_SPECIAL@#$%')).toBe('special!@#$%');
  });
});

// Integration Tests
describe('ConfigManager Integration Tests', () => {
  test('should work with async operations', async () => {
    const configManager = createConfigManager().getInstance();
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const asyncListener = vi.fn().mockImplementation(async () => {
      await delay(10);
    });

    configManager.subscribe(asyncListener);

    await Promise.all([
      configManager.set('APP_ASYNC_1', 'value1'),
      configManager.set('APP_ASYNC_2', 'value2'),
      configManager.set('APP_ASYNC_3', 'value3'),
    ]);

    expect(asyncListener).toHaveBeenCalledTimes(3);
  });

  test('should handle high-frequency updates', async () => {
    const configManager = createConfigManager().getInstance();
    const updates = new Set();
    const listener = vi.fn(({ key, newValue }) => {
      updates.add(`${key}:${newValue}`);
    });

    configManager.subscribe(listener);

    // Rapid updates
    for (let i = 0; i < 100; i++) {
      configManager.set('APP_RAPID', `value-${i}`);
    }

    expect(updates.size).toBe(100);
    expect(listener).toHaveBeenCalledTimes(100);
  });
});
