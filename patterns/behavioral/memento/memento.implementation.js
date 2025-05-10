/**
 * This implementation demonstrates a approach to state management
 * with comprehensive error handling, validation, and security considerations.
 */

/**
 * Class representing a Memento that stores application configuration state
 * @class
 */
class ConfigurationMemento {
  /**
   * Creates a new ConfigurationMemento
   * @param {Object} state - The configuration state to store
   * @param {Date} timestamp - When the state was captured
   * @param {string} description - Optional description of the state
   */
  constructor(state, timestamp = new Date(), description = '') {
    if (!state || typeof state !== 'object') {
      throw new Error('Invalid state: state must be a non-null object');
    }

    // Use deep copy to ensure immutability of stored state
    this._state = this._deepCopy(state);
    this._timestamp = timestamp;
    this._description = description;
    this._hash = this._generateStateHash(state);
  }

  /**
   * Gets the stored state (only accessible to Originator)
   * @returns {Object} Deep copy of the stored state
   */
  getState() {
    return this._deepCopy(this._state);
  }

  /**
   * Gets metadata about this memento without exposing state
   * @returns {Object} Metadata including timestamp, description and hash
   */
  getMetadata() {
    return {
      timestamp: new Date(this._timestamp),
      description: this._description,
      hash: this._hash,
    };
  }

  /**
   * Validates if the current state matches the stored state
   * @param {Object} currentState - The state to validate against stored state
   * @returns {boolean} True if states match based on hash comparison
   */
  validateState(currentState) {
    return this._generateStateHash(currentState) === this._hash;
  }

  /**
   * Creates a deep copy of an object to ensure immutability
   * @private
   * @param {Object} obj - Object to deep copy
   * @returns {Object} Deep copied object
   */
  _deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Generates a simple hash of the state for validation
   * @private
   * @param {Object} state - State to hash
   * @returns {string} Hash representation of state
   */
  _generateStateHash(state) {
    // In a production environment, use a proper hashing algorithm
    const stateStr = JSON.stringify(state);
    return stateStr
      .split('')
      .reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
      }, 0)
      .toString(36);
  }
}

/**
 * ConfigurationManager class - Originator in the Memento pattern
 * @class
 */
class ConfigurationManager {
  /**
   * Creates a new ConfigurationManager
   * @param {Object} initialConfig - Initial configuration object
   */
  constructor(initialConfig = {}) {
    this._config = {
      theme: 'light',
      language: 'en',
      notifications: true,
      performanceMode: false,
      ...initialConfig,
    };

    this._validators = {
      theme: (value) => ['light', 'dark', 'system'].includes(value),
      language: (value) => typeof value === 'string' && value.length === 2,
      notifications: (value) => typeof value === 'boolean',
      performanceMode: (value) => typeof value === 'boolean',
    };

    // Add event listeners for configuration changes
    this._listeners = [];
  }

  /**
   * Updates a configuration setting
   * @param {string} key - Configuration key to update
   * @param {any} value - New value
   * @returns {ConfigurationManager} This instance for chaining
   * @throws {Error} If validation fails
   */
  updateSetting(key, value) {
    if (!this._config.hasOwnProperty(key)) {
      throw new Error(`Invalid configuration key: ${key}`);
    }

    if (this._validators[key] && !this._validators[key](value)) {
      throw new Error(`Invalid value for ${key}: ${value}`);
    }

    const oldValue = this._config[key];
    this._config[key] = value;

    // Notify listeners
    this._notifyListeners({ key, oldValue, newValue: value });

    return this;
  }

  /**
   * Updates multiple configuration settings at once
   * @param {Object} settings - Object containing key-value pairs to update
   * @returns {ConfigurationManager} This instance for chaining
   */
  updateSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      throw new Error('Settings must be a non-null object');
    }

    // Validate all settings before applying any changes
    for (const [key, value] of Object.entries(settings)) {
      if (!this._config.hasOwnProperty(key)) {
        throw new Error(`Invalid configuration key: ${key}`);
      }

      if (this._validators[key] && !this._validators[key](value)) {
        throw new Error(`Invalid value for ${key}: ${value}`);
      }
    }

    // Apply all changes
    for (const [key, value] of Object.entries(settings)) {
      const oldValue = this._config[key];
      this._config[key] = value;

      this._notifyListeners({ key, oldValue, newValue: value });
    }

    return this;
  }

  /**
   * Registers a custom validator for a configuration key
   * @param {string} key - Configuration key
   * @param {Function} validator - Validation function that returns boolean
   * @returns {ConfigurationManager} This instance for chaining
   */
  registerValidator(key, validator) {
    if (typeof validator !== 'function') {
      throw new Error('Validator must be a function');
    }
    this._validators[key] = validator;
    return this;
  }

  /**
   * Gets the current configuration
   * @returns {Object} Current configuration (copy to prevent direct mutation)
   */
  getConfiguration() {
    return { ...this._config };
  }

  /**
   * Creates a memento containing the current state
   * @param {string} description - Optional description of this state
   * @returns {ConfigurationMemento} A memento object containing the current state
   */
  save(description = '') {
    return new ConfigurationMemento(this._config, new Date(), description);
  }

  /**
   * Restores state from a memento
   * @param {ConfigurationMemento} memento - The memento to restore from
   * @returns {ConfigurationManager} This instance for chaining
   * @throws {Error} If the memento is invalid
   */
  restore(memento) {
    if (!(memento instanceof ConfigurationMemento)) {
      throw new Error('Invalid memento object');
    }

    const newState = memento.getState();
    const oldState = { ...this._config };

    // Find all changed keys
    const changedKeys = Object.keys(newState).filter(
      (key) => JSON.stringify(newState[key]) !== JSON.stringify(oldState[key])
    );

    // Update the configuration
    this._config = newState;

    // Notify about each changed setting
    changedKeys.forEach((key) => {
      this._notifyListeners({
        key,
        oldValue: oldState[key],
        newValue: newState[key],
        source: 'restore',
      });
    });

    return this;
  }

  /**
   * Adds an event listener for configuration changes
   * @param {Function} listener - Callback function
   * @returns {Function} Function to remove the listener
   */
  addChangeListener(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    this._listeners.push(listener);

    // Return function to remove this listener
    return () => {
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifies all listeners about configuration changes
   * @private
   * @param {Object} changeInfo - Information about the change
   */
  _notifyListeners(changeInfo) {
    this._listeners.forEach((listener) => {
      try {
        listener(changeInfo);
      } catch (error) {
        console.error('Error in configuration change listener:', error);
      }
    });
  }
}

/**
 * ConfigurationHistory class - Caretaker in the Memento pattern
 * @class
 */
class ConfigurationHistory {
  /**
   * Creates a new ConfigurationHistory
   * @param {number} maxSize - Maximum number of states to store
   */
  constructor(maxSize = 50) {
    this._mementos = [];
    this._currentIndex = -1;
    this._maxSize = maxSize;
  }

  /**
   * Adds a memento to the history
   * @param {ConfigurationMemento} memento - The memento to add
   * @returns {number} The new history size
   */
  addMemento(memento) {
    if (!(memento instanceof ConfigurationMemento)) {
      throw new Error('Invalid memento object');
    }

    // Remove any states after the current position (for redo operations)
    if (this._currentIndex < this._mementos.length - 1) {
      this._mementos = this._mementos.slice(0, this._currentIndex + 1);
    }

    // Add the new memento
    this._mementos.push(memento);
    this._currentIndex = this._mementos.length - 1;

    // Enforce size limit
    if (this._mementos.length > this._maxSize) {
      this._mementos.shift();
      this._currentIndex--;
    }

    return this._mementos.length;
  }

  /**
   * Gets the previous memento (for undo)
   * @returns {ConfigurationMemento|null} The previous memento or null if at the beginning
   */
  undo() {
    if (this._currentIndex > 0) {
      this._currentIndex--;
      return this._mementos[this._currentIndex];
    }
    return null;
  }

  /**
   * Gets the next memento (for redo)
   * @returns {ConfigurationMemento|null} The next memento or null if at the end
   */
  redo() {
    if (this._currentIndex < this._mementos.length - 1) {
      this._currentIndex++;
      return this._mementos[this._currentIndex];
    }
    return null;
  }

  /**
   * Checks if undo is available
   * @returns {boolean} True if undo is available
   */
  canUndo() {
    return this._currentIndex > 0;
  }

  /**
   * Checks if redo is available
   * @returns {boolean} True if redo is available
   */
  canRedo() {
    return this._currentIndex < this._mementos.length - 1;
  }

  /**
   * Gets all stored mementos with their metadata
   * @returns {Array} Array of memento metadata objects
   */
  getHistory() {
    return this._mementos.map((memento, index) => ({
      ...memento.getMetadata(),
      isCurrent: index === this._currentIndex,
    }));
  }

  /**
   * Gets the memento at a specific index
   * @param {number} index - Index of the memento to get
   * @returns {ConfigurationMemento|null} The memento at the index or null if invalid
   */
  getMementoAt(index) {
    if (index >= 0 && index < this._mementos.length) {
      this._currentIndex = index;
      return this._mementos[index];
    }
    return null;
  }

  /**
   * Clears the history
   * @returns {void}
   */
  clear() {
    this._mementos = [];
    this._currentIndex = -1;
  }
}

export { ConfigurationMemento, ConfigurationManager, ConfigurationHistory };
