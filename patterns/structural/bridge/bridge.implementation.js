/**
 * DataStorage Implementation Interface
 * This acts as the Implementation in the Bridge pattern
 */
class DataStorage {
  /**
   * Store data in the storage system
   */
  async store(key, data) {
    throw new Error('Method "store" must be implemented');
  }

  /**
   * Retrieve data from the storage system
   */
  async retrieve(key) {
    throw new Error('Method "retrieve" must be implemented');
  }

  /**
   * Update existing data in the storage system
   */
  async update(key, data) {
    throw new Error('Method "update" must be implemented');
  }

  /**
   * Remove data from the storage system
   */
  async remove(key) {
    throw new Error('Method "remove" must be implemented');
  }
}

/**
 * MongoDB Implementation
 */
class MongoDBStorage extends DataStorage {
  constructor(options) {
    super();
    this.options = options;
    this.isConnected = false;
    this.collection = null;
  }

  /**
   * Connect to MongoDB
   * @private
   */
  async _connect() {
    if (this.isConnected) return;

    try {
      // Simulate connection for example
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.isConnected = true;
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  }

  async store(key, data) {
    await this._connect();

    try {
      // Simulate storage
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      throw new Error(`MongoDB store operation failed: ${error.message}`);
    }
  }

  async retrieve(key) {
    await this._connect();

    try {
      // Simulate retrieval
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { id: key, timestamp: new Date(), sampleData: `Data for ${key}` };
    } catch (error) {
      throw new Error(`MongoDB retrieve operation failed: ${error.message}`);
    }
  }

  async update(key, data) {
    await this._connect();

    try {
      // Simulate update
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      throw new Error(`MongoDB update operation failed: ${error.message}`);
    }
  }

  async remove(key) {
    await this._connect();

    try {
      // Simulate removal
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      throw new Error(`MongoDB remove operation failed: ${error.message}`);
    }
  }
}

/**
 * PostgreSQL Implementation
 */
class PostgreSQLStorage extends DataStorage {
  constructor(options) {
    super();
    this.options = options;
    this.client = null;
  }

  /**
   * Connect to PostgreSQL
   * @private
   */
  async _connect() {
    if (this.client) return;

    try {
      // Simulate connection
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${error.message}`);
    }
  }

  async store(key, data) {
    await this._connect();

    try {
      // Simulate storage
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      throw new Error(`PostgreSQL store operation failed: ${error.message}`);
    }
  }

  async retrieve(key) {
    await this._connect();

    try {
      // Simulate retrieval
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { id: key, timestamp: new Date(), sampleData: `SQL data for ${key}` };
    } catch (error) {
      throw new Error(`PostgreSQL retrieve operation failed: ${error.message}`);
    }
  }

  async update(key, data) {
    await this._connect();

    try {
      // Simulate update
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      throw new Error(`PostgreSQL update operation failed: ${error.message}`);
    }
  }

  async remove(key) {
    await this._connect();

    try {
      // Simulate removal
      await new Promise((resolve) => setTimeout(resolve, 50));
      return true;
    } catch (error) {
      throw new Error(`PostgreSQL remove operation failed: ${error.message}`);
    }
  }
}

/**
 * Browser LocalStorage Implementation
 */
class LocalStorage extends DataStorage {
  constructor() {
    super();
    this._validateEnvironment();
  }

  /**
   * Validate that localStorage is available
   * @private
   */
  _validateEnvironment() {
    if (typeof localStorage === 'undefined') {
      throw new Error('LocalStorage is not available in this environment');
    }
  }

  async store(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      throw new Error(`LocalStorage store operation failed: ${error.message}`);
    }
  }

  async retrieve(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      throw new Error(`LocalStorage retrieve operation failed: ${error.message}`);
    }
  }

  async update(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      throw new Error(`LocalStorage update operation failed: ${error.message}`);
    }
  }

  async remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      throw new Error(`LocalStorage remove operation failed: ${error.message}`);
    }
  }
}

export { DataStorage, MongoDBStorage, PostgreSQLStorage, LocalStorage };
