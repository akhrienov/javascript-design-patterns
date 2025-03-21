// src/bridge/abstraction.js

/**
 * DataManager Abstraction
 * This acts as the Abstraction in the Bridge pattern
 */
class DataManager {
  /**
   * @param {import('./implementation').DataStorage} storage - Storage implementation
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Save data to storage
   * @param {string} key - The key to store data under
   * @param {any} data - The data to store
   * @returns {Promise<boolean>}
   */
  async save(key, data) {
    return await this.storage.store(key, data);
  }

  /**
   * Load data from storage
   * @param {string} key - The key to retrieve data for
   * @returns {Promise<any>}
   */
  async load(key) {
    return await this.storage.retrieve(key);
  }

  /**
   * Update data in storage
   * @param {string} key - The key for the data to update
   * @param {any} data - The new data
   * @returns {Promise<boolean>}
   */
  async update(key, data) {
    return await this.storage.update(key, data);
  }

  /**
   * Delete data from storage
   * @param {string} key - The key for the data to remove
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    return await this.storage.remove(key);
  }
}

/**
 * UserDataManager Refined Abstraction
 * Specializes in managing user data
 */
class UserDataManager extends DataManager {
  /**
   * @param {import('./implementation').DataStorage} storage - Storage implementation
   */
  constructor(storage) {
    super(storage);
  }

  /**
   * Generate a user-specific key
   * @param {string} userId - The user ID
   * @param {string} dataType - The type of data
   * @returns {string} - The generated key
   * @private
   */
  _generateUserKey(userId, dataType) {
    return `user:${userId}:${dataType}`;
  }

  /**
   * Save user profile data
   * @param {string} userId - The user ID
   * @param {Object} profileData - The user profile data
   * @returns {Promise<boolean>}
   */
  async saveProfile(userId, profileData) {
    const key = this._generateUserKey(userId, 'profile');
    const dataToStore = {
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    return await this.save(key, dataToStore);
  }

  /**
   * Get user profile data
   * @param {string} userId - The user ID
   * @returns {Promise<Object|null>}
   */
  async getProfile(userId) {
    const key = this._generateUserKey(userId, 'profile');
    return await this.load(key);
  }

  /**
   * Save user preferences
   * @param {string} userId - The user ID
   * @param {Object} preferences - The user preferences
   * @returns {Promise<boolean>}
   */
  async savePreferences(userId, preferences) {
    const key = this._generateUserKey(userId, 'preferences');
    const dataToStore = {
      ...preferences,
      updatedAt: new Date().toISOString(),
    };

    return await this.save(key, dataToStore);
  }

  /**
   * Get user preferences
   * @param {string} userId - The user ID
   * @returns {Promise<Object|null>}
   */
  async getPreferences(userId) {
    const key = this._generateUserKey(userId, 'preferences');
    return await this.load(key);
  }

  /**
   * Delete user account and all associated data
   * @param {string} userId - The user ID
   * @returns {Promise<boolean>}
   */
  async deleteAccount(userId) {
    const profileKey = this._generateUserKey(userId, 'profile');
    const preferencesKey = this._generateUserKey(userId, 'preferences');

    try {
      await this.delete(profileKey);
      await this.delete(preferencesKey);
      return true;
    } catch (error) {
      console.error(`Failed to delete user account ${userId}:`, error);
      throw new Error(`User account deletion failed: ${error.message}`);
    }
  }
}

/**
 * CacheDataManager Refined Abstraction
 * Specializes in time-sensitive cached data
 */
class CacheDataManager extends DataManager {
  /**
   * @param {import('./implementation').DataStorage} storage - Storage implementation
   * @param {number} defaultTTL - Default time-to-live in milliseconds
   */
  constructor(storage, defaultTTL = 3600000) {
    // Default 1 hour
    super(storage);
    this.defaultTTL = defaultTTL;
  }

  /**
   * Save data with expiration time
   * @param {string} key - The cache key
   * @param {any} data - The data to cache
   * @param {number} [ttl] - Time-to-live in milliseconds (optional)
   * @returns {Promise<boolean>}
   */
  async saveWithExpiry(key, data, ttl = this.defaultTTL) {
    const expiryTime = Date.now() + ttl;
    const dataWithExpiry = {
      data,
      expiresAt: expiryTime,
    };

    return await this.save(key, dataWithExpiry);
  }

  /**
   * Get cached data if not expired
   * @param {string} key - The cache key
   * @returns {Promise<any|null>} - The cached data or null if expired/not found
   */
  async getIfNotExpired(key) {
    const cachedItem = await this.load(key);

    if (!cachedItem) {
      return null;
    }

    // Check if the cached item has expired
    if (cachedItem.expiresAt && Date.now() > cachedItem.expiresAt) {
      // Expired, delete it and return null
      await this.delete(key);
      return null;
    }

    return cachedItem.data;
  }

  /**
   * Clear all expired cache items
   * @returns {Promise<void>}
   */
  async clearExpired() {
    // This would need to be implemented differently based on the storage mechanism
    // For now, we'll leave it as a placeholder
    console.log('Clearing expired cache items is not implemented for this storage');
  }
}

export { DataManager, UserDataManager, CacheDataManager };
