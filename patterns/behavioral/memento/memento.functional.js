/**
 * This implementation uses a functional approach with closures to achieve the same
 * functionality as the class-based version while maintaining immutability.
 */

/**
 * Creates a configuration memento
 * @param {Object} state - Configuration state to store
 * @param {Date} timestamp - When the state was captured
 * @param {string} description - Optional description of the state
 * @returns {Object} A memento object with methods to access the state
 */
const createConfigurationMemento = (state, timestamp = new Date(), description = '') => {
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid state: state must be a non-null object');
  }

  // Create deep copy of state to ensure immutability
  const _state = JSON.parse(JSON.stringify(state));
  const _timestamp = timestamp;
  const _description = description;

  // Generate a hash for state validation
  const _hash = (() => {
    const stateStr = JSON.stringify(state);
    return stateStr
      .split('')
      .reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
      }, 0)
      .toString(36);
  })();

  // Return the memento object with a limited interface
  return {
    // Gets the stored state (only accessible to Originator)
    getState: () => JSON.parse(JSON.stringify(_state)),

    // Gets metadata about this memento without exposing state
    getMetadata: () => ({
      timestamp: new Date(_timestamp),
      description: _description,
      hash: _hash,
    }),

    // Validates if a given state matches the stored state
    validateState: (currentState) => {
      const currentStateStr = JSON.stringify(currentState);
      const currentHash = currentStateStr
        .split('')
        .reduce((hash, char) => {
          return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
        }, 0)
        .toString(36);

      return currentHash === _hash;
    },
  };
};

/**
 * Creates a configuration manager (Originator)
 * @param {Object} initialConfig - Initial configuration object
 * @returns {Object} A configuration manager object
 */
const createConfigurationManager = (initialConfig = {}) => {
  // Private state
  let _config = {
    theme: 'light',
    language: 'en',
    notifications: true,
    performanceMode: false,
    ...initialConfig,
  };

  const _validators = {
    theme: (value) => ['light', 'dark', 'system'].includes(value),
    language: (value) => typeof value === 'string' && value.length === 2,
    notifications: (value) => typeof value === 'boolean',
    performanceMode: (value) => typeof value === 'boolean',
  };

  const _listeners = [];

  // Private function to notify listeners
  const _notifyListeners = (changeInfo) => {
    _listeners.forEach((listener) => {
      try {
        listener(changeInfo);
      } catch (error) {
        console.error('Error in configuration change listener:', error);
      }
    });
  };

  // Return the public API
  return {
    // Updates a single configuration setting
    updateSetting: (key, value) => {
      if (!_config.hasOwnProperty(key)) {
        throw new Error(`Invalid configuration key: ${key}`);
      }

      if (_validators[key] && !_validators[key](value)) {
        throw new Error(`Invalid value for ${key}: ${value}`);
      }

      const oldValue = _config[key];
      _config[key] = value;

      // Notify listeners
      _notifyListeners({ key, oldValue, newValue: value });

      return this;
    },

    // Updates multiple configuration settings at once
    updateSettings: (settings) => {
      if (!settings || typeof settings !== 'object') {
        throw new Error('Settings must be a non-null object');
      }

      // Validate all settings before applying any changes
      for (const [key, value] of Object.entries(settings)) {
        if (!_config.hasOwnProperty(key)) {
          throw new Error(`Invalid configuration key: ${key}`);
        }

        if (_validators[key] && !_validators[key](value)) {
          throw new Error(`Invalid value for ${key}: ${value}`);
        }
      }

      // Apply all changes
      const manager = {};
      for (const [key, value] of Object.entries(settings)) {
        const oldValue = _config[key];
        _config[key] = value;

        _notifyListeners({ key, oldValue, newValue: value });
      }

      return manager;
    },

    // Registers a custom validator for a configuration key
    registerValidator: (key, validator) => {
      if (typeof validator !== 'function') {
        throw new Error('Validator must be a function');
      }
      _validators[key] = validator;
      return this;
    },

    // Gets the current configuration
    getConfiguration: () => ({ ..._config }),

    // Creates a memento containing the current state
    save: (description = '') => {
      return createConfigurationMemento(_config, new Date(), description);
    },

    // Restores state from a memento
    restore: (memento) => {
      if (!memento || typeof memento.getState !== 'function') {
        throw new Error('Invalid memento object');
      }

      const newState = memento.getState();
      const oldState = { ..._config };

      // Find all changed keys
      const changedKeys = Object.keys(newState).filter(
        (key) => JSON.stringify(newState[key]) !== JSON.stringify(oldState[key])
      );

      // Update the configuration
      _config = newState;

      // Notify about each changed setting
      changedKeys.forEach((key) => {
        _notifyListeners({
          key,
          oldValue: oldState[key],
          newValue: newState[key],
          source: 'restore',
        });
      });

      return this;
    },

    // Adds an event listener for configuration changes
    addChangeListener: (listener) => {
      if (typeof listener !== 'function') {
        throw new Error('Listener must be a function');
      }
      _listeners.push(listener);

      // Return function to remove this listener
      return () => {
        const index = _listeners.indexOf(listener);
        if (index !== -1) {
          _listeners.splice(index, 1);
        }
      };
    },
  };
};

/**
 * Creates a configuration history manager (Caretaker)
 * @param {number} maxSize - Maximum number of states to store
 * @returns {Object} A history manager object
 */
const createConfigurationHistory = (maxSize = 50) => {
  // Private state
  let _mementos = [];
  let _currentIndex = -1;

  // Return the public API
  return {
    // Adds a memento to the history
    addMemento: (memento) => {
      if (!memento || typeof memento.getState !== 'function') {
        throw new Error('Invalid memento object');
      }

      // Remove any states after the current position (for redo operations)
      if (_currentIndex < _mementos.length - 1) {
        _mementos = _mementos.slice(0, _currentIndex + 1);
      }

      // Add the new memento
      _mementos.push(memento);
      _currentIndex = _mementos.length - 1;

      // Enforce size limit
      if (_mementos.length > maxSize) {
        _mementos.shift();
        _currentIndex--;
      }

      return _mementos.length;
    },

    // Gets the previous memento (for undo)
    undo: () => {
      if (_currentIndex > 0) {
        _currentIndex--;
        return _mementos[_currentIndex];
      }
      return null;
    },

    // Gets the next memento (for redo)
    redo: () => {
      if (_currentIndex < _mementos.length - 1) {
        _currentIndex++;
        return _mementos[_currentIndex];
      }
      return null;
    },

    // Checks if undo is available
    canUndo: () => _currentIndex > 0,

    // Checks if redo is available
    canRedo: () => _currentIndex < _mementos.length - 1,

    // Gets all stored mementos with their metadata
    getHistory: () =>
      _mementos.map((memento, index) => ({
        ...memento.getMetadata(),
        isCurrent: index === _currentIndex,
      })),

    // Gets the memento at a specific index
    getMementoAt: (index) => {
      if (index >= 0 && index < _mementos.length) {
        _currentIndex = index;
        return _mementos[index];
      }
      return null;
    },

    // Clears the history
    clear: () => {
      _mementos = [];
      _currentIndex = -1;
    },
  };
};

export { createConfigurationMemento, createConfigurationManager, createConfigurationHistory };
