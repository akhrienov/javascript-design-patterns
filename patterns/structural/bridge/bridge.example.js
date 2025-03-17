// src/bridge/example.js

import { MongoDBStorage, PostgreSQLStorage, LocalStorage } from './bridge.implementation.js';
import { UserDataManager, CacheDataManager } from './bridge.abstraction.js';

/**
 * Example using different storage backends with the UserDataManager
 */
async function userDataExample() {
  // Create implementations
  const mongoStorage = new MongoDBStorage({
    uri: 'mongodb://localhost:27017',
    collection: 'users',
  });

  const postgresStorage = new PostgreSQLStorage({
    connectionString: 'postgresql://username:password@localhost:5432/mydb',
    table: 'users',
  });

  // Create abstractions with different implementations
  const mongoUserManager = new UserDataManager(mongoStorage);
  const postgresUserManager = new UserDataManager(postgresStorage);

  const userId = 'user123';
  const userProfile = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
  };

  // Save user profile to MongoDB
  console.log('\n--- Saving user profile to MongoDB ---');
  await mongoUserManager.saveProfile(userId, userProfile);

  // Save the same profile to PostgreSQL
  console.log('\n--- Saving user profile to PostgreSQL ---');
  await postgresUserManager.saveProfile(userId, userProfile);

  // Retrieve user profile from MongoDB
  console.log('\n--- Retrieving user profile from MongoDB ---');
  const mongoProfile = await mongoUserManager.getProfile(userId);
  console.log('MongoDB profile:', mongoProfile);

  // Retrieve user profile from PostgreSQL
  console.log('\n--- Retrieving user profile from PostgreSQL ---');
  const postgresProfile = await postgresUserManager.getProfile(userId);
  console.log('PostgreSQL profile:', postgresProfile);
}

/**
 * Example using CacheDataManager with LocalStorage
 */
async function cacheExample() {
  try {
    // In a browser environment
    const localStorage = new LocalStorage();
    const cacheManager = new CacheDataManager(localStorage, 5000); // 5 seconds TTL

    const cacheKey = 'latest-news';
    const newsData = {
      headlines: [
        'New JavaScript Framework Released',
        'TypeScript 5.0 Announced',
        'Design Patterns Making a Comeback',
      ],
      timestamp: new Date().toISOString(),
    };

    console.log('\n--- Saving data to cache ---');
    await cacheManager.saveWithExpiry(cacheKey, newsData);

    console.log('\n--- Retrieving data from cache (should be available) ---');
    const cachedNews1 = await cacheManager.getIfNotExpired(cacheKey);
    console.log('Cached news:', cachedNews1);

    console.log('\n--- Waiting for cache to expire ---');
    await new Promise((resolve) => setTimeout(resolve, 6000));

    console.log('\n--- Retrieving data from cache (should be expired) ---');
    const cachedNews2 = await cacheManager.getIfNotExpired(cacheKey);
    console.log('Cached news after expiry:', cachedNews2);
  } catch (error) {
    console.error('LocalStorage not available - skipping cache example');
  }
}

/**
 * Run the examples
 */
async function runExamples() {
  try {
    console.log('=== USER DATA EXAMPLE ===');
    await userDataExample();

    console.log('\n=== CACHE EXAMPLE ===');
    await cacheExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

runExamples().catch(console.error);
