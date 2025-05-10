# Memento Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Memento Pattern in JavaScript, demonstrating both class-based and functional approaches with a focus on enterprise-grade configuration management.

## Overview

The Memento Pattern captures and externalizes an object's internal state without violating encapsulation, allowing the object to be restored to this state later. This pattern is particularly valuable in scenarios requiring state history tracking, undo/redo functionality, and transactional operations. Our implementation focuses on configuration management systems, demonstrating how to maintain an audit trail of changes while preserving encapsulation and providing robust state restoration capabilities.

## Repository Structure

```
patterns/
└── behavioral/
    └── memento/
        ├── README.md
        ├── memento.example.js             # Configuration management examples
        ├── memento.implementation.js      # Class-based implementation
        ├── memento.functional.js          # Functional implementation
        └── memento.spec.js                # Test suite
```

## Features

- Two implementation approaches:
  - Class-based Memento using ES6 classes and OOP principles
  - Functional approach using closures and factory functions
- Configuration state management:
  - Deep state copying for true immutability
  - Comprehensive validation with customizable validators
  - State hash generation for integrity verification
  - Metadata tracking (timestamps, descriptions)
  - Event-based change notification system
- History management:
  - Configurable history size limits
  - Undo/redo functionality
  - Point-in-time state restoration
  - History pruning after branching changes
- Real-world examples:
  - Progressive configuration wizard
  - User preference management
  - System configuration with rollback capability
- Comprehensive test coverage

## Implementation Details

### Class-based Approach

```javascript
export class ConfigurationMemento {
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

  getState() {
    return this._deepCopy(this._state);
  }

  // Additional memento methods...
}

export class ConfigurationManager {
  constructor(initialConfig = {}) {
    this._config = {
      theme: 'light',
      language: 'en',
      // Default settings...
      ...initialConfig,
    };
    this._validators = {
      /* ... */
    };
    this._listeners = [];
  }

  // Originator methods for state management...

  save(description = '') {
    return new ConfigurationMemento(this._config, new Date(), description);
  }

  restore(memento) {
    if (!(memento instanceof ConfigurationMemento)) {
      throw new Error('Invalid memento object');
    }
    // Restore state and notify listeners...
  }
}

export class ConfigurationHistory {
  constructor(maxSize = 50) {
    this._mementos = [];
    this._currentIndex = -1;
    this._maxSize = maxSize;
  }

  // History management methods...
}
```

### Functional Approach

```javascript
export const createConfigurationMemento = (state, timestamp = new Date(), description = '') => {
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid state: state must be a non-null object');
  }

  // Create deep copy of state to ensure immutability
  const _state = JSON.parse(JSON.stringify(state));
  const _timestamp = timestamp;
  const _description = description;
  const _hash = /* Generate hash */;

  return {
    getState: () => JSON.parse(JSON.stringify(_state)),
    // Additional memento methods...
  };
};

export const createConfigurationManager = (initialConfig = {}) => {
  // Private state
  let _config = {
    theme: 'light',
    language: 'en',
    // Default values...
    ...initialConfig
  };
  const _validators = { /* ... */ };
  const _listeners = [];

  // Return the public API
  return {
    // Configuration management methods...

    save: (description = '') => {
      return createConfigurationMemento(_config, new Date(), description);
    },

    restore: (memento) => {
      if (!memento || typeof memento.getState !== 'function') {
        throw new Error('Invalid memento object');
      }
      // Restore state and notify listeners...
    }
  };
};

export const createConfigurationHistory = (maxSize = 50) => {
  // Private state
  let _mementos = [];
  let _currentIndex = -1;

  // Return the public API
  return {
    // History management methods...
  };
};
```

## Usage Examples

### Class-based Configuration Management Example

```javascript
// Initialize with default settings
const configManager = new ConfigurationManager({
  theme: 'light',
  language: 'en',
  notifications: true,
});

// Create a history manager
const history = new ConfigurationHistory(10);

// Add a change listener to log all configuration changes
configManager.addChangeListener(({ key, oldValue, newValue }) => {
  console.log(`Setting changed: ${key} from ${oldValue} to ${newValue}`);
});

// Save initial state
history.addMemento(configManager.save('Initial configuration'));

// Make changes and track state
configManager.updateSetting('theme', 'dark');
history.addMemento(configManager.save('User changed theme to dark'));

configManager.updateSettings({
  performanceMode: true,
  refreshRate: 30,
});
history.addMemento(configManager.save('System performance optimization'));

// Undo a change (restore previous state)
const previousState = history.undo();
configManager.restore(previousState);
console.log('Restored configuration:', configManager.getConfiguration());
```

### Functional Configuration Wizard Example

```javascript
// Initialize with default settings
const configManager = createConfigurationManager({
  theme: 'light',
  language: 'en',
  notifications: true,
});

// Create a history manager
const history = createConfigurationHistory(10);

// Add a change listener
configManager.addChangeListener(({ key, oldValue, newValue }) => {
  console.log(`Setting changed: ${key} from ${oldValue} to ${newValue}`);
});

// Save initial state
history.addMemento(configManager.save('Initial configuration'));

// Simulate a multi-step configuration wizard
console.log('Step 1: User preferences...');
configManager.updateSettings({
  theme: 'dark',
  language: 'fr',
});
history.addMemento(configManager.save('User preferences'));

console.log('Step 2: Performance settings...');
configManager.updateSettings({
  performanceMode: true,
  refreshRate: 30,
});
history.addMemento(configManager.save('Performance settings'));

// User cancels - revert to initial state
const initialState = history.getMementoAt(0);
configManager.restore(initialState);
console.log('Configuration reverted:', configManager.getConfiguration());
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
npx vitest run
```

Test suite covers:

- Memento state preservation and integrity
- Configuration validation and updates
- Event notification system
- Undo/redo operations
- History management
- Error handling and edge cases
- Both class-based and functional implementations

## Key Considerations

1. **State Immutability**

   - All state copies use deep cloning to prevent unintended modifications
   - State is only accessible through controlled interfaces
   - State changes trigger proper notifications to maintain system consistency

2. **History Management**

   - Configurable history size to control memory usage
   - Proper handling of branching changes (clearing future states after an undo)
   - Metadata for auditing and state identification

3. **Error Handling**

   - Comprehensive validation of inputs and states
   - Clear error messages for debugging
   - Graceful failure modes to prevent system corruption

4. **Encapsulation**
   - State is properly protected from direct external access
   - Changes are only possible through defined APIs
   - Implementation details are hidden from consumers

## Best Practices

1. **State Copy Techniques**

   - Use deep copy for all state objects to ensure true immutability
   - Be mindful of performance for large states (consider serialization)
   - Create custom copy logic for complex objects when needed

2. **History Optimization**

   - Limit history size based on application needs
   - Consider delta-based storage for large states
   - Implement compression for memory-intensive applications

3. **State Validation**

   - Validate states before saving and after restoration
   - Use hash verification to ensure state integrity
   - Implement type checking and boundary validation

4. **Change Notification**
   - Implement a robust event system for state changes
   - Allow components to subscribe to specific property changes
   - Ensure notifications include sufficient context (old and new values)

## When to Use

The Memento Pattern is particularly useful when:

- You need to implement undo/redo functionality
- Your application requires snapshots of state at different points
- You want to enable rollback to previous states
- You need an audit trail of changes
- You must preserve encapsulation while capturing object state
- You're implementing transactional behavior where operations might need to be rolled back

## Common Pitfalls to Avoid

1. **Memory Consumption**

   - Storing too many states without limits can cause memory issues
   - Consider implementing size limits or expiration policies
   - Use compressed or delta-based storage for large states

2. **Deep Copy Performance**

   - Deep copying large objects can impact performance
   - Balance between complete immutability and performance needs
   - Consider specialized copying strategies for large datasets

3. **Circular References**

   - JSON-based deep copying breaks with circular references
   - Implement custom serialization for complex object graphs
   - Consider libraries like structured-clone for advanced cases

4. **Inadequate State Capture**
   - Ensure all relevant state is captured in the memento
   - Don't forget about derived state or indirectly related objects
   - Test restoration thoroughly to verify completeness

## Use Cases

The Memento pattern is well-suited for:

- Configuration management systems
- Document editors with undo/redo
- Form wizards with the ability to go back to previous steps
- Financial transaction systems requiring rollback capability
- Version control mechanisms
- Game state saving
- Multi-step workflows with the ability to revert
- System configuration with recovery options

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for modern JavaScript/ES6+ environments
- Enhanced with enterprise-grade features and considerations
- Designed with real-world configuration management use cases in mind

---

If you find this implementation helpful, please consider giving it a star!
