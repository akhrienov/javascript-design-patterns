/**
 * Class-based approach to Singleton pattern
 * Creates a configuration manager singleton
 */
export class ConfigManager {
  static #instance = null;

  #config = new Map();
  #listeners = new Set();

  constructor() {
    if (ConfigManager.#instance) {
      throw new Error('Use ConfigManager.getInstance() to get the singleton instance.');
    }

    this.#loadInitialConfig();
  }

  /**
   * Get the singleton instance
   * @returns {ConfigManager} Configuration manager instance
   */
  static getInstance() {
    if (!ConfigManager.#instance) {
      ConfigManager.#instance = new ConfigManager();
    }

    return ConfigManager.#instance;
  }

  /**
   * Load initial configuration from environment variables
   * @private
   */
  #loadInitialConfig() {
    // Clear existing config before loading new values
    this.#config.clear();

    Object.entries(process.env)
      .filter(([key]) => key.startsWith('APP_'))
      .forEach(([key, value]) => {
        this.#config.set(key, value);
      });
  }

  /**
   * Notify all listeners of config changes
   * @param {string} key - Configuration key
   * @param {any} value - New configuration value
   * @param {any} oldValue - Old configuration value
   * @private
   */
  #notifyListeners(key, value, oldValue) {
    this.#listeners.forEach((listener) => listener({ key, newValue: value, oldValue }));
  }

  /**
   * Get configuration value by key
   * @param {string} key - Configuration key
   * @returns {any}
   */
  get(key) {
    return this.#config.get(key);
  }

  /**
   * Set configuration value by key
   * @param {string} key - Configuration key
   * @param {any} value - Configuration value
   */
  set(key, value) {
    const oldValue = this.#config.get(key);
    this.#config.set(key, value);
    this.#notifyListeners(key, value, oldValue);
  }

  /**
   * Subscribe to configuration changes
   * @param {function({key: string, newValue: any, oldValue: any}): void} listener - Callback function
   * @returns {function(): boolean}
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /**
   * Get all configuration key-value pairs
   * @returns {{[p: string]: any}}
   */
  getAll() {
    return Object.fromEntries(this.#config);
  }

  /**
   * Reset configuration to initial state
   */
  reset() {
    this.#config.clear();
    this.#loadInitialConfig();
  }
}

/**
 * Functional approach to Singleton pattern
 * Creates a configuration manager singleton
 */
export const createConfigManager = () => {
  // Private variable to hold the singleton instance
  let instance = null;

  /**
   * Actual configuration manager implementation
   * @returns {Object} Configuration manager methods
   */
  const createInstance = () => {
    const config = new Map();
    const listeners = new Set();

    /**
     * Load initial configuration from environment variables
     */
    const loadInitialConfig = () => {
      Object.entries(process.env)
        .filter(([key]) => key.startsWith('APP_'))
        .forEach(([key, value]) => {
          config.set(key, value);
        });
    };

    loadInitialConfig();

    /**
     * Notify all listeners of config changes
     * @param {string} key - Configuration key
     * @param {any} value - New configuration value
     * @param {any} oldValue - Old configuration value
     */
    const notifyListeners = (key, value, oldValue) => {
      listeners.forEach((listener) => listener({ key, newValue: value, oldValue }));
    };

    return {
      /**
       * Get configuration value
       * @param {string} key - Configuration key
       * @returns {any} Configuration value
       */
      get(key) {
        return config.get(key);
      },

      /**
       * Set configuration value
       * @param {string} key - Configuration key
       * @param {any} value - Configuration value
       */
      set(key, value) {
        const oldValue = config.get(key);
        config.set(key, value);
        notifyListeners(key, value, oldValue);
      },

      /**
       * Subscribe to configuration changes
       * @param {Function} listener - Callback function
       * @returns {Function} Unsubscribe function
       */
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },

      /**
       * Get all configuration
       * @returns {Object} All configuration key-value pairs
       */
      getAll() {
        return Object.fromEntries(config);
      },

      /**
       * Reset configuration to initial state
       */
      reset() {
        config.clear();
        loadInitialConfig();
      },
    };
  };

  return {
    /**
     * Get configuration manager instance
     * @returns {Object} Configuration manager instance
     */
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    },
  };
};
