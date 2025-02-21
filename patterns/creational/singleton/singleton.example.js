import { ConfigManager, createConfigManager } from './singleton.implementation.js';

// Example 1: Basic Usage with Class-based Approach
const classBasedExample = async () => {
  try {
    // Get the singleton instance
    const configManager = ConfigManager.getInstance();

    // Set some configuration values
    configManager.set('APP_API_URL', 'https://jsonplaceholder.typicode.com');
    configManager.set('APP_MAX_RETRIES', '3');

    // Read configuration values
    const apiUrl = configManager.get('APP_API_URL');
    console.log('API URL:', apiUrl);

    // Subscribe to configuration changes
    const unsubscribe = configManager.subscribe(({ key, newValue, oldValue }) => {
      console.log(`Config changed: ${key}`, {
        old: oldValue,
        new: newValue,
      });
    });

    // Example of updating a value (will trigger the subscriber)
    configManager.set('APP_MAX_RETRIES', '5');

    // Get all configuration
    const allConfig = configManager.getAll();
    console.log('All config:', allConfig);

    // Cleanup subscription when done
    unsubscribe();
  } catch (error) {
    console.error('Error in config management:', error);
  }
};

// Example 2: Advanced Usage with Class-based Approach
const advancedClassBasedExample = async () => {
  const configManager = ConfigManager.getInstance();

  // Example: Using config in an API client
  class ApiClient {
    constructor() {
      this.baseUrl = configManager.get('APP_API_URL');
      this.maxRetries = parseInt(configManager.get('APP_MAX_RETRIES'), 10);

      // Subscribe to config changes to update client settings
      this.unsubscribe = configManager.subscribe(({ key, newValue }) => {
        if (key === 'APP_API_URL') this.baseUrl = newValue;
        if (key === 'APP_MAX_RETRIES') this.maxRetries = parseInt(newValue, 10);
      });
    }

    async makeRequest(endpoint) {
      let attempts = 0;

      while (attempts < this.maxRetries) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`);
          return await response.json();
        } catch (error) {
          attempts++;
          if (attempts === this.maxRetries) throw error;
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }
    }

    cleanup() {
      this.unsubscribe();
    }
  }

  // Usage of ApiClient with ConfigManager
  const apiClient = new ApiClient();

  try {
    const data = await apiClient.makeRequest('/todos/1');
    console.log('API Response:', data);
  } catch (error) {
    console.error('API Error:', error);
  } finally {
    apiClient.cleanup();
  }
};

// Example 3: Basic Usage with Functional Approach
const functionalExample = async () => {
  try {
    // Get the singleton instance
    const { getInstance } = createConfigManager();
    const configManager = getInstance();

    // Set some configuration values
    configManager.set('APP_CACHE_TTL', '3600');
    configManager.set('APP_DEBUG_MODE', 'true');

    // Read configuration values
    const cacheTtl = configManager.get('APP_CACHE_TTL');
    console.log('Cache TTL:', cacheTtl);

    // Subscribe to configuration changes
    const unsubscribe = configManager.subscribe(({ key, newValue, oldValue }) => {
      console.log(`Config updated: ${key}`, {
        previous: oldValue,
        current: newValue,
      });
    });

    // Example of updating a value (will trigger the subscriber)
    configManager.set('APP_DEBUG_MODE', 'false');

    // Cleanup subscription
    unsubscribe();
  } catch (error) {
    console.error('Error in functional config management:', error);
  }
};

// Example 4: Advanced Usage with Functional Approach
const advancedFunctionalExample = async () => {
  const { getInstance } = createConfigManager();
  const configManager = getInstance();

  // Example: Creating a caching service with config
  const createCacheService = () => {
    const cache = new Map();
    let debugMode = configManager.get('APP_DEBUG_MODE') === 'true';
    let ttl = parseInt(configManager.get('APP_CACHE_TTL'), 10);

    // Subscribe to relevant config changes
    const unsubscribe = configManager.subscribe(({ key, newValue }) => {
      if (key === 'APP_DEBUG_MODE') {
        debugMode = newValue === 'true';
        if (debugMode) {
          console.log('Cache service debug mode enabled');
        }
      } else if (key === 'APP_CACHE_TTL') {
        ttl = parseInt(newValue, 10);
        console.log('Cache TTL updated:', ttl);
      }
    });

    return {
      async set(key, value) {
        if (debugMode) {
          console.log(`Setting cache key: ${key}`, value);
        }

        cache.set(key, {
          value,
          timestamp: Date.now(),
        });
      },

      async get(key) {
        const item = cache.get(key);

        if (!item) return null;

        const age = Date.now() - item.timestamp;
        if (age > ttl * 1000) {
          if (debugMode) {
            console.log(`Cache item expired: ${key}`);
          }
          cache.delete(key);
          return null;
        }

        if (debugMode) {
          console.log(`Cache hit: ${key}`, item.value);
        }

        return item.value;
      },

      cleanup() {
        unsubscribe();
        cache.clear();
      },
    };
  };

  // Usage of CacheService with ConfigManager
  const cacheService = createCacheService();

  try {
    await cacheService.set('user:123', { id: 123, name: 'John' });
    const user = await cacheService.get('user:123');
    console.log('Cached user:', user);

    // Update config to see the effects
    configManager.set('APP_DEBUG_MODE', 'true');
    configManager.set('APP_CACHE_TTL', '1800');

    // Try cache again with new settings
    const updatedUser = await cacheService.get('user:123');
    console.log('Updated cached user:', updatedUser);
  } catch (error) {
    console.error('Cache service error:', error);
  } finally {
    cacheService.cleanup();
  }
};

// Running all examples
const runExamples = async () => {
  console.log('=== Class-based Basic Example ===');
  await classBasedExample();

  console.log('\n=== Class-based Advanced Example ===');
  await advancedClassBasedExample();

  console.log('\n=== Functional Basic Example ===');
  await functionalExample();

  console.log('\n=== Functional Advanced Example ===');
  await advancedFunctionalExample();
};

// Execute examples
runExamples().catch(console.error);
