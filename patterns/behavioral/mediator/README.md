# Mediator Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Mediator Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Mediator Pattern defines an object that encapsulates how a set of objects interact. This pattern promotes loose coupling by keeping objects from referring to each other explicitly, allowing you to vary their interaction independently. This implementation focuses on communication systems like chat rooms and notification systems, demonstrating practical applications in real-world scenarios.

## Repository Structure
```
patterns/
└── behavioral/
    └── mediator/
        ├── README.md
        ├── mediator.example.js             # Chat room example
        ├── mediator-functional.example.js  # Notification system example
        ├── mediator.implementation.js      # Class-based implementation
        ├── mediator.functional.js          # Functional implementation
        └── mediator.spec.js                # Test suite
```

## Features
- Two implementation approaches:
    - Class-based Mediator using object-oriented principles
    - Functional approach using closures and higher-order functions
- Communication functionality:
    - Component registration and discovery
    - Event publishing and subscription
    - Direct messaging between components
    - Error handling and recovery
- Real-world examples:
    - Chat room application
    - Form validation and notification system
- Comprehensive test coverage

## Implementation Details

### Class-based Approach
```javascript
export class Mediator {
  constructor() {
    this.components = new Map();
    this.events = new Map();
  }

  register(component) {
    this.components.set(component.name, component);
    if (typeof component.setMediator === 'function') component.setMediator(this);
    return this;
  }

  // Additional mediator methods for communication...
}

export class Component {
  constructor(name) {
    this.name = name;
    this.mediator = null;
  }

  // Component communication methods...
}
```

### Functional Approach
```javascript
export function createMediator() {
  const components = new Map();
  const events = new Map();

  return {
    register(name, component) {
      components.set(name, component);
      component.mediator = this;
      return this;
    },

    // Additional mediator methods for communication...
  };
}

export function createComponent(name) {
  return {
    name,
    mediator: null,

    // Component communication methods...
  };
}
```

## Usage Examples

### Chat Room Example
```javascript
// Create a mediator and components
const chatMediator = new Mediator();
const alice = new User('Alice');
const bob = new User('Bob');
const chatBot = new ChatBot('ChatBot');
const logger = new Logger();

// Register components with the mediator
chatMediator.register(alice).register(bob).register(chatBot).register(logger);

// Direct communication between components
alice.sendMessage('Hello everyone!');
bob.sendDirectMessage('Alice', "How's your project going?");

// ChatBot interactions
alice.sendDirectMessage('ChatBot', 'help');
```

### Notification System Example
```javascript
// Create a mediator and components
const notificationMediator = createMediator();
const contactForm = createFormComponent('contactForm');
const validator = createValidationComponent('validator');
const notifier = createNotificationComponent('notifier');

// Register components
notificationMediator
  .register('contactForm', contactForm)
  .register('validator', validator)
  .register('notifier', notifier);

// Set up event handlers
notificationMediator.on('form.submitted', (data) => {
  validator.validateForm(data.form, data.data);
});

// Component interactions
contactForm.submitForm({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello, I have a question about your services.',
});
```

## Testing

The implementation includes comprehensive test coverage using Vitest:
```bash
  pnpm test
```

Test suite covers:
- Component registration and communication
- Event subscription and publication
- Message passing between components
- Error handling in event handlers
- Unsubscribe functionality
- Both class-based and functional implementations

## Key Considerations

1. **Decoupling Components**
    - Components don't reference each other directly
    - All communication happens through the mediator
    - Components can be added or removed without affecting others

2. **Event System**
    - Publish-subscribe pattern for broadcasting events
    - Support for targeted messaging between specific components
    - Unsubscribe capability for cleanup

3. **Error Handling**
    - Graceful error handling in event callbacks
    - Components remain operational even when others fail
    - Robust message delivery guarantees

4. **Extensibility**
    - Easy addition of new component types
    - Support for different communication patterns
    - Flexible event naming and data passing

## Best Practices

1. **Clear Communication Contracts**
    - Define clear event names and message formats
    - Document the expected payload structure
    - Keep communication protocols consistent

2. **Component Independence**
    - Design components to function independently
    - Avoid assumptions about other components' existence
    - Implement proper error checking for missing components

3. **Performance Considerations**
    - Be mindful of event handler efficiency
    - Consider using weak references for long-lived applications
    - Implement cleanup for unused event subscriptions

4. **Mediator Complexity Management**
    - Avoid turning the mediator into a "god object"
    - Split large mediators into domain-specific ones
    - Keep component logic in components, not in the mediator

## When to Use

The Mediator Pattern is particularly useful when:
- A set of objects communicate in well-defined but complex ways
- Reusing objects is difficult because they refer to many other objects
- You want to customize behavior between objects without subclassing
- Dependencies between objects should be reduced (loose coupling)
- Communication patterns change frequently

## Common Pitfalls to Avoid

1. **Mediator Bloat**
    - Don't put too much logic in the mediator itself
    - Avoid creating a "god object" that knows everything
    - Keep mediator focused on communication, not business logic

2. **Overuse**
    - Don't use mediator for simple interactions between few objects
    - Consider direct communication for performance-critical code
    - Evaluate if the indirection provides actual benefits

3. **Debugging Complexity**
    - Mediator can make debugging more challenging
    - Include proper logging for message flow
    - Implement clear error messages for troubleshooting

## Use Cases

The Mediator pattern is well-suited for:
- Chat applications
- Form validation and notification systems
- UI components that need to interact
- Air traffic control systems
- Event management systems
- Message brokers and middleware
- Multi-step workflows

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for the current JavaScript ecosystem
- Enhanced with real-world communication requirements

---

If you find this implementation helpful, please consider giving it a star!