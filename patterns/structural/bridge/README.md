# Bridge Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Bridge Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Bridge Pattern separates an abstraction from its implementation so that both can vary independently. This implementation focuses on a Data Persistence Layer that works across different storage mechanisms, demonstrating practical applications in real-world enterprise scenarios.

## Repository Structure

```
patterns/
└── structural/
    └── bridge/
        ├── README.md
        ├── bridge.implementation.js     # Class-based implementation interfaces
        ├── bridge.abstraction.js        # Class-based abstraction interfaces
        ├── bridge.functional.js         # Functional implementation
        ├── bridge.example.js            # Class-based examples
        ├── bridge.spec.js               # Test suite
        └── demo.js                      # Demo script
```

## Features

- Two implementation approaches:
    - Class-based Bridge using inheritance
    - Functional approach using factory functions
- Data Persistence Layer:
    - Support for multiple storage backends
    - MongoDB integration
    - PostgreSQL integration
    - Browser localStorage support
- Data Management Abstractions:
    - Base data management operations
    - User data management
    - Cache management with TTL
- Comprehensive test coverage

## Implementation Details

### Class-based Approach

```javascript
// Implementation interface
class DataStorage {
  async store(key, data) {
    throw new Error('Method "store" must be implemented');
  }

  async retrieve(key) {
    throw new Error('Method "retrieve" must be implemented');
  }

  async update(key, data) {
    throw new Error('Method "update" must be implemented');
  }

  async remove(key) {
    throw new Error('Method "remove" must be implemented');
  }
}

// Concrete implementations
class MongoDBStorage extends DataStorage {
  constructor(options) {
    super();
    this.options = options;
    this.isConnected = false;
  }

  async _connect() {
    // MongoDB connection logic
  }

  async store(key, data) {
    await this._connect();
    // Implementation for MongoDB
  }

  // Other methods implemented
}

// Abstraction
class DataManager {
  constructor(storage) {
    this.storage = storage;
  }

  async save(key, data) {
    return await this.storage.store(key, data);
  }

  // Other methods
}

// Refined abstraction
class UserDataManager extends DataManager {
  constructor(storage) {
    super(storage);
  }

  _generateUserKey(userId, dataType) {
    return `user:${userId}:${dataType}`;
  }

  async saveProfile(userId, profileData) {
    const key = this._generateUserKey(userId, 'profile');
    const dataToStore = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    return await this.save(key, dataToStore);
  }

  // Other user-specific methods
}
```

### Functional Approach

```javascript
// Implementation factory
const createMongoDBStorage = (options) => {
  let isConnected = false;
  
  const connect = async () => {
    // MongoDB connection logic
  };
  
  return {
    store: async (key, data) => {
      await connect();
      // Implementation for MongoDB
    },
    
    // Other methods
  };
};

// Abstraction factory
const createDataManager = (storage) => {
  return {
    save: async (key, data) => {
      return await storage.store(key, data);
    },
    
    // Other methods
  };
};

// Refined abstraction factory
const createUserDataManager = (storage) => {
  const dataManager = createDataManager(storage);
  
  const generateUserKey = (userId, dataType) => {
    return `user:${userId}:${dataType}`;
  };
  
  return {
    saveProfile: async (userId, profileData) => {
      const key = generateUserKey(userId, 'profile');
      const dataToStore = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      return await dataManager.save(key, dataToStore);
    },
    
    // Other user-specific methods
  };
};
```

## Usage Examples

### Class-based Approach

```javascript
// Create implementations
const mongoStorage = new MongoDBStorage({
  uri: 'mongodb://localhost:27017',
  collection: 'users'
});

const postgresStorage = new PostgreSQLStorage({
  connectionString: 'postgresql://username:password@localhost:5432/mydb',
  table: 'users'
});

// Create abstractions with different implementations
const mongoUserManager = new UserDataManager(mongoStorage);
const postgresUserManager = new UserDataManager(postgresStorage);

const userId = 'user123';
const userProfile = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

// Save user profile to MongoDB
await mongoUserManager.saveProfile(userId, userProfile);

// Save the same profile to PostgreSQL
await postgresUserManager.saveProfile(userId, userProfile);

// Retrieve user profile from MongoDB
const mongoProfile = await mongoUserManager.getProfile(userId);
```

### Functional Approach

```javascript
// Create implementations
const mongoStorage = createMongoDBStorage({
  uri: 'mongodb://localhost:27017',
  collection: 'users'
});

// Create abstraction with implementation
const cacheManager = createCacheDataManager(mongoStorage, 3600000); // 1 hour TTL

// Use the cache manager
await cacheManager.saveWithExpiry('api-response', responseData);

// Later retrieve the data if not expired
const cachedData = await cacheManager.getIfNotExpired('api-response');
if (cachedData) {
  console.log('Using cached data');
} else {
  console.log('Cache expired, fetching fresh data');
}
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- Interface compliance
- Implementation functionality
- Abstraction delegation
- Refined abstraction behavior
- Cross-compatibility between class and functional approaches
- Error handling and edge cases

## Key Considerations

1. **Separation of Concerns**

    - Clear division between abstractions and implementations
    - Independent evolution of both hierarchies
    - Pluggable implementations

2. **Async Operations**

    - Promise-based interfaces
    - Proper error handling
    - Connection management

3. **Extensibility**
    - Easy to add new storage implementations
    - Easy to add new data management abstractions
    - Cross-compatibility between approaches

## Practical Applications

The Bridge Pattern is especially useful for:

- Database abstraction layers
- Cross-platform UI frameworks
- Device drivers
- Multiple API implementations
- Rendering engines
- Plugin architectures
- Cross-service communication

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world enterprise application requirements

---

If you find this implementation helpful, please consider giving it a star!