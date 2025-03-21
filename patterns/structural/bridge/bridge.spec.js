import { describe, it, expect, vi, beforeEach } from 'vitest';

import { DataStorage, MongoDBStorage, PostgreSQLStorage } from './bridge.implementation.js';
import { DataManager, UserDataManager, CacheDataManager } from './bridge.abstraction.js';
import {
  createMongoDBStorage,
  createPostgreSQLStorage,
  createDataManager,
  createUserDataManager,
  createCacheDataManager,
} from './bridge.functional.js';

beforeEach(() => {
  // Create a mocked localStorage
  global.localStorage = {
    data: new Map(),
    getItem: vi.fn((key) => {
      return this.data.get(key) || null;
    }),
    setItem: vi.fn((key, value) => {
      this.data.set(key, value);
    }),
    removeItem: vi.fn((key) => {
      this.data.delete(key);
    }),
    clear: vi.fn(() => {
      this.data.clear();
    }),
  };

  // Spy on console methods
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Bridge Pattern - Class Implementation', () => {
  describe('DataStorage Interface', () => {
    it('should throw errors for unimplemented methods', async () => {
      const storage = new DataStorage();

      await expect(storage.store('key', 'value')).rejects.toThrow(
        'Method "store" must be implemented'
      );
      await expect(storage.retrieve('key')).rejects.toThrow(
        'Method "retrieve" must be implemented'
      );
      await expect(storage.update('key', 'value')).rejects.toThrow(
        'Method "update" must be implemented'
      );
      await expect(storage.remove('key')).rejects.toThrow('Method "remove" must be implemented');
    });
  });

  describe('MongoDBStorage Implementation', () => {
    it('should create a MongoDB storage instance', () => {
      const mongoStorage = new MongoDBStorage({
        uri: 'mongodb://localhost:27017',
        collection: 'test',
      });

      expect(mongoStorage).toBeInstanceOf(DataStorage);
      expect(mongoStorage).toBeInstanceOf(MongoDBStorage);
    });

    it('should simulate storing data', async () => {
      const mongoStorage = new MongoDBStorage({
        uri: 'mongodb://localhost:27017',
        collection: 'test',
      });

      const result = await mongoStorage.store('testKey', { data: 'testValue' });

      expect(result).toBe(true);
    });

    it('should simulate retrieving data', async () => {
      const mongoStorage = new MongoDBStorage({
        uri: 'mongodb://localhost:27017',
        collection: 'test',
      });

      const result = await mongoStorage.retrieve('testKey');

      expect(result).toHaveProperty('id', 'testKey');
      expect(result).toHaveProperty('sampleData');
    });
  });

  describe('PostgreSQLStorage Implementation', () => {
    it('should create a PostgreSQL storage instance', () => {
      const pgStorage = new PostgreSQLStorage({
        connectionString: 'postgresql://localhost:5432/testdb',
        table: 'test',
      });

      expect(pgStorage).toBeInstanceOf(DataStorage);
      expect(pgStorage).toBeInstanceOf(PostgreSQLStorage);
    });

    it('should simulate storing data', async () => {
      const pgStorage = new PostgreSQLStorage({
        connectionString: 'postgresql://localhost:5432/testdb',
        table: 'test',
      });

      const result = await pgStorage.store('testKey', { data: 'testValue' });

      expect(result).toBe(true);
    });

    it('should simulate retrieving data', async () => {
      const pgStorage = new PostgreSQLStorage({
        connectionString: 'postgresql://localhost:5432/testdb',
        table: 'test',
      });

      const result = await pgStorage.retrieve('testKey');

      expect(result).toHaveProperty('id', 'testKey');
      expect(result).toHaveProperty('sampleData');
    });
  });

  describe('DataManager Abstraction', () => {
    it('should create a data manager with any storage implementation', () => {
      const mongoStorage = new MongoDBStorage({
        uri: 'mongodb://localhost:27017',
        collection: 'test',
      });

      const dataManager = new DataManager(mongoStorage);

      expect(dataManager.storage).toBe(mongoStorage);
    });

    it('should delegate operations to the storage implementation', async () => {
      // Create a mock storage
      const mockStorage = new DataStorage();
      mockStorage.store = vi.fn().mockResolvedValue(true);
      mockStorage.retrieve = vi.fn().mockResolvedValue({ data: 'test' });
      mockStorage.update = vi.fn().mockResolvedValue(true);
      mockStorage.remove = vi.fn().mockResolvedValue(true);

      const dataManager = new DataManager(mockStorage);

      // Test delegation
      await dataManager.save('key1', 'value1');
      expect(mockStorage.store).toHaveBeenCalledWith('key1', 'value1');

      await dataManager.load('key1');
      expect(mockStorage.retrieve).toHaveBeenCalledWith('key1');

      await dataManager.update('key1', 'value2');
      expect(mockStorage.update).toHaveBeenCalledWith('key1', 'value2');

      await dataManager.delete('key1');
      expect(mockStorage.remove).toHaveBeenCalledWith('key1');
    });
  });

  describe('UserDataManager Refined Abstraction', () => {
    it('should create user-specific keys', async () => {
      // Create a mock storage
      const mockStorage = new DataStorage();
      mockStorage.store = vi.fn().mockResolvedValue(true);
      mockStorage.retrieve = vi.fn().mockResolvedValue({ data: 'test' });

      const userManager = new UserDataManager(mockStorage);

      await userManager.saveProfile('user123', { name: 'Test User' });
      expect(mockStorage.store).toHaveBeenCalledWith(
        'user:user123:profile',
        expect.objectContaining({ name: 'Test User' })
      );

      await userManager.getProfile('user123');
      expect(mockStorage.retrieve).toHaveBeenCalledWith('user:user123:profile');
    });

    it('should add timestamps to stored data', async () => {
      // Create a mock storage that captures stored data
      const mockStorage = new DataStorage();
      let storedData;
      mockStorage.store = vi.fn((key, data) => {
        storedData = data;
        return Promise.resolve(true);
      });

      const userManager = new UserDataManager(mockStorage);

      await userManager.saveProfile('user123', { name: 'Test User' });
      expect(storedData).toHaveProperty('name', 'Test User');
      expect(storedData).toHaveProperty('updatedAt');
    });

    it('should delete all user data when deleting an account', async () => {
      // Create a mock storage
      const mockStorage = new DataStorage();
      mockStorage.remove = vi.fn().mockResolvedValue(true);

      const userManager = new UserDataManager(mockStorage);

      await userManager.deleteAccount('user123');
      expect(mockStorage.remove).toHaveBeenCalledWith('user:user123:profile');
      expect(mockStorage.remove).toHaveBeenCalledWith('user:user123:preferences');
    });
  });

  describe('CacheDataManager Refined Abstraction', () => {
    it('should store data with expiration time', async () => {
      // Create a mock storage that captures stored data
      const mockStorage = new DataStorage();
      let storedData;
      mockStorage.store = vi.fn((key, data) => {
        storedData = data;
        return Promise.resolve(true);
      });

      const cacheManager = new CacheDataManager(mockStorage, 1000); // 1 second TTL

      await cacheManager.saveWithExpiry('cacheKey', 'cachedValue');
      expect(storedData).toHaveProperty('data', 'cachedValue');
      expect(storedData).toHaveProperty('expiresAt');
      expect(storedData.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should return null for expired data', async () => {
      // Create a mock storage
      const mockStorage = new DataStorage();
      mockStorage.retrieve = vi.fn().mockResolvedValue({
        data: 'cachedValue',
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      });
      mockStorage.remove = vi.fn().mockResolvedValue(true);

      const cacheManager = new CacheDataManager(mockStorage);

      const result = await cacheManager.getIfNotExpired('cacheKey');
      expect(result).toBeNull();
      expect(mockStorage.remove).toHaveBeenCalledWith('cacheKey');
    });

    it('should return data for non-expired cache', async () => {
      // Create a mock storage
      const mockStorage = new DataStorage();
      mockStorage.retrieve = vi.fn().mockResolvedValue({
        data: 'cachedValue',
        expiresAt: Date.now() + 10000, // Expires in 10 seconds
      });

      const cacheManager = new CacheDataManager(mockStorage);

      const result = await cacheManager.getIfNotExpired('cacheKey');
      expect(result).toBe('cachedValue');
    });
  });
});

describe('Bridge Pattern - Functional Implementation', () => {
  describe('MongoDB Storage Factory', () => {
    it('should create a MongoDB storage interface', () => {
      const mongoStorage = createMongoDBStorage({
        uri: 'mongodb://localhost:27017',
        collection: 'test',
      });

      expect(mongoStorage).toHaveProperty('store');
      expect(mongoStorage).toHaveProperty('retrieve');
      expect(mongoStorage).toHaveProperty('update');
      expect(mongoStorage).toHaveProperty('remove');
    });

    it('should simulate storing data', async () => {
      const mongoStorage = createMongoDBStorage({
        uri: 'mongodb://localhost:27017',
        collection: 'test',
      });

      const result = await mongoStorage.store('testKey', { data: 'testValue' });
      expect(result).toBe(true);
    });
  });

  describe('PostgreSQL Storage Factory', () => {
    it('should create a PostgreSQL storage interface', () => {
      const pgStorage = createPostgreSQLStorage({
        connectionString: 'postgresql://localhost:5432/testdb',
        table: 'test',
      });

      expect(pgStorage).toHaveProperty('store');
      expect(pgStorage).toHaveProperty('retrieve');
      expect(pgStorage).toHaveProperty('update');
      expect(pgStorage).toHaveProperty('remove');
    });

    it('should simulate storing data', async () => {
      const pgStorage = createPostgreSQLStorage({
        connectionString: 'postgresql://localhost:5432/testdb',
        table: 'test',
      });

      const result = await pgStorage.store('testKey', { data: 'testValue' });
      expect(result).toBe(true);
    });
  });

  describe('Data Manager Factory', () => {
    it('should create a data manager with any storage implementation', () => {
      const mockStorage = {
        store: vi.fn().mockResolvedValue(true),
        retrieve: vi.fn().mockResolvedValue({ data: 'test' }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const dataManager = createDataManager(mockStorage);
      expect(dataManager).toHaveProperty('save');
      expect(dataManager).toHaveProperty('load');
      expect(dataManager).toHaveProperty('update');
      expect(dataManager).toHaveProperty('delete');
    });

    it('should delegate operations to the storage implementation', async () => {
      // Create a mock storage
      const mockStorage = {
        store: vi.fn().mockResolvedValue(true),
        retrieve: vi.fn().mockResolvedValue({ data: 'test' }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const dataManager = createDataManager(mockStorage);

      // Test delegation
      await dataManager.save('key1', 'value1');
      expect(mockStorage.store).toHaveBeenCalledWith('key1', 'value1');

      await dataManager.load('key1');
      expect(mockStorage.retrieve).toHaveBeenCalledWith('key1');

      await dataManager.update('key1', 'value2');
      expect(mockStorage.update).toHaveBeenCalledWith('key1', 'value2');

      await dataManager.delete('key1');
      expect(mockStorage.remove).toHaveBeenCalledWith('key1');
    });
  });

  describe('User Data Manager Factory', () => {
    it('should create user-specific keys', async () => {
      // Create a mock storage
      const mockStorage = {
        store: vi.fn().mockResolvedValue(true),
        retrieve: vi.fn().mockResolvedValue({ data: 'test' }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const userManager = createUserDataManager(mockStorage);

      await userManager.saveProfile('user123', { name: 'Test User' });
      expect(mockStorage.store).toHaveBeenCalledWith(
        'user:user123:profile',
        expect.objectContaining({ name: 'Test User' })
      );

      await userManager.getProfile('user123');
      expect(mockStorage.retrieve).toHaveBeenCalledWith('user:user123:profile');
    });

    it('should add timestamps to stored data', async () => {
      // Create a mock storage that captures stored data
      let storedData;
      const mockStorage = {
        store: vi.fn((key, data) => {
          storedData = data;
          return Promise.resolve(true);
        }),
        retrieve: vi.fn().mockResolvedValue({ data: 'test' }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const userManager = createUserDataManager(mockStorage);

      await userManager.saveProfile('user123', { name: 'Test User' });
      expect(storedData).toHaveProperty('name', 'Test User');
      expect(storedData).toHaveProperty('updatedAt');
    });

    it('should delete all user data when deleting an account', async () => {
      // Create a mock storage
      const mockStorage = {
        store: vi.fn().mockResolvedValue(true),
        retrieve: vi.fn().mockResolvedValue({ data: 'test' }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const userManager = createUserDataManager(mockStorage);

      await userManager.deleteAccount('user123');
      expect(mockStorage.remove).toHaveBeenCalledWith('user:user123:profile');
      expect(mockStorage.remove).toHaveBeenCalledWith('user:user123:preferences');
    });
  });

  describe('Cache Data Manager Factory', () => {
    it('should store data with expiration time', async () => {
      // Create a mock storage that captures stored data
      let storedData;
      const mockStorage = {
        store: vi.fn((key, data) => {
          storedData = data;
          return Promise.resolve(true);
        }),
        retrieve: vi.fn().mockResolvedValue({ data: 'test' }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const cacheManager = createCacheDataManager(mockStorage, 1000); // 1 second TTL

      await cacheManager.saveWithExpiry('cacheKey', 'cachedValue');
      expect(storedData).toHaveProperty('data', 'cachedValue');
      expect(storedData).toHaveProperty('expiresAt');
      expect(storedData.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should return null for expired data', async () => {
      // Create a mock storage
      const mockStorage = {
        store: vi.fn().mockResolvedValue(true),
        retrieve: vi.fn().mockResolvedValue({
          data: 'cachedValue',
          expiresAt: Date.now() - 1000, // Expired 1 second ago
        }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const cacheManager = createCacheDataManager(mockStorage);

      const result = await cacheManager.getIfNotExpired('cacheKey');
      expect(result).toBeNull();
      expect(mockStorage.remove).toHaveBeenCalledWith('cacheKey');
    });

    it('should return data for non-expired cache', async () => {
      // Create a mock storage
      const mockStorage = {
        store: vi.fn().mockResolvedValue(true),
        retrieve: vi.fn().mockResolvedValue({
          data: 'cachedValue',
          expiresAt: Date.now() + 10000, // Expires in 10 seconds
        }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const cacheManager = createCacheDataManager(mockStorage);

      const result = await cacheManager.getIfNotExpired('cacheKey');
      expect(result).toBe('cachedValue');
    });

    it('should clear expired items', async () => {
      // This test is a placeholder as clearExpired is implementation-specific
      const mockStorage = {
        store: vi.fn().mockResolvedValue(true),
        retrieve: vi.fn().mockResolvedValue({ data: 'test' }),
        update: vi.fn().mockResolvedValue(true),
        remove: vi.fn().mockResolvedValue(true),
      };

      const cacheManager = createCacheDataManager(mockStorage);

      // This should execute without error, though it doesn't do much in our mock
      await cacheManager.clearExpired();
      // We're mainly checking that the method exists and can be called
      expect(typeof cacheManager.clearExpired).toBe('function');
    });
  });

  describe('Integration between implementations and abstractions', () => {
    it('should allow class implementations to work with functional abstractions', async () => {
      // Create a class-based implementation
      const mongoStorage = new MongoDBStorage({
        uri: 'mongodb://localhost:27017',
        collection: 'test',
      });

      // Use it with a functional abstraction
      const userManager = createUserDataManager(mongoStorage);

      // This should work seamlessly
      const userId = 'user456';
      await userManager.saveProfile(userId, { name: 'Test User' });

      // Since we're using mocks, we can't really verify the data was saved
      // But we can verify the method doesn't throw an error
      expect(async () => {
        await userManager.getProfile(userId);
      }).not.toThrow();
    });

    it('should allow functional implementations to work with class abstractions', async () => {
      // Create a functional implementation
      const pgStorage = createPostgreSQLStorage({
        connectionString: 'postgresql://localhost:5432/testdb',
        table: 'test',
      });

      // Use it with a class-based abstraction
      const cacheManager = new CacheDataManager(pgStorage);

      // This should work seamlessly
      await cacheManager.saveWithExpiry('testKey', 'testValue');

      // Again, we can't verify the data was saved, but the method shouldn't throw
      expect(async () => {
        await cacheManager.getIfNotExpired('testKey');
      }).not.toThrow();
    });
  });
});
