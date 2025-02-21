# Singleton Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Singleton pattern in JavaScript, demonstrating both class-based and functional approaches.

## 🌟 Overview

The Singleton pattern ensures a class has only one instance and provides a global point of access to it. This implementation focuses on a Configuration Manager use case, demonstrating practical applications in real-world scenarios.

## 📁 Repository Structure

```
patterns/
└── creational/
    └── singleton/
        ├── README.md
        ├── singleton.example.js        # Usage examples
        ├── singleton.implementation.js # Core implementation
        └── singleton.spec.js           # Test suite
```

## 🚀 Features

- Two implementation approaches:
    - Class-based Singleton using modern JavaScript features
    - Functional approach using closures
- Configuration management functionality:
    - Environment variables loading
    - Dynamic configuration updates
    - Observer pattern for change notifications
    - Configuration reset capabilities
- Comprehensive test coverage

## 💻 Implementation Details

### Class-based Approach

```javascript
export class ConfigManager {
  static #instance = null;
  
  static getInstance() {
    if (!ConfigManager.#instance) {
      ConfigManager.#instance = new ConfigManager();
    }

    return ConfigManager.#instance;
  }
  // ... additional implementation
}
```

### Functional Approach

```javascript
export const createConfigManager = () => {
  let instance = null;
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    }
  };
};
```

## 📝 Usage Examples

### Basic Usage

```javascript
// Class-based approach
const config = ConfigManager.getInstance();
config.set('APP_API_URL', 'https://api.example.com');
const apiUrl = config.get('APP_API_URL');

// Functional approach
const configManager = createConfigManager().getInstance();
configManager.set('APP_DEBUG', 'true');
const debug = configManager.get('APP_DEBUG');
```

### Configuration Changes Subscription

```javascript
const unsubscribe = config.subscribe(({ key, newValue, oldValue }) => {
  console.log(`Config changed: ${key}`, { old: oldValue, new: newValue });
});

// Later: cleanup subscription
unsubscribe();
```

## 🧪 Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
pnpm test
```

Test suite covers:
- Singleton instance management
- Configuration operations
- Subscription system
- Edge cases and error handling
- Concurrent operations
- Integration scenarios

## 🔍 Key Considerations

1. **Thread Safety**
    - Ensures single instance creation in concurrent environments
    - Safe handling of configuration updates

2. **Memory Management**
    - Proper cleanup of subscriptions
    - Efficient storage of configuration values

3. **Performance**
    - Optimized for frequent configuration access
    - Minimal overhead for updates and notifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world configuration management requirements

---

⭐️ If you find this implementation helpful, please consider giving it a star!