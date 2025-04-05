# Observer Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Observer Pattern in JavaScript, demonstrating both class-based and functional approaches. The implementation focuses on real-time monitoring and event handling systems, showcasing practical applications in enterprise scenarios.

## Overview

The Observer Pattern establishes a one-to-many dependency relationship between objects, where when one object (the subject) changes state, all its dependents (observers) are notified and updated automatically. This pattern is fundamental to event-driven programming and forms the backbone of reactive systems. Our implementation demonstrates how this pattern enables loosely coupled designs where subjects and observers can vary independently.

## Repository Structure

```
patterns/
└── behavioral/
    └── observer/
        ├── README.md
        ├── observer.implementation.js     # Class-based core implementation
        ├── observer.functional.js         # Functional core implementation
        ├── observer.example.js            # Class-based real-world example
        └── observer.spec.js               # Test suite
```

## Features

- Two implementation approaches:
  - Class-based Observer using ES6 classes with clear inheritance
  - Functional approach using factory functions and closures for flexibility
- Server Monitoring System:
  - Real-time metric tracking and threshold monitoring
  - Multiple specialized observer types
  - Automated alerting and notification workflows
  - Customizable thresholds and actions
- Comprehensive test coverage with Vitest:
  - Core implementation testing
  - Integration testing with real-world scenarios
  - Testing both implementation approaches

## Implementation Details

### Class-based Approach

```javascript
// Subject (Observable) class
class Subject {
  constructor() {
    this.observers = [];
    this.state = null;
  }

  // Method to register a new observer
  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
    return this; // Enable method chaining
  }

  // Method to remove an observer
  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
    return this; // Enable method chaining
  }

  // Method to notify all observers of state change
  notify(data) {
    if (this.observers.length === 0) return;

    this.observers.forEach((observer) => {
      observer.update(data);
    });
  }

  // Method to change state and notify observers
  setState(state) {
    this.state = state;
    this.notify(this.state);
  }

  // Method to get current state
  getState() {
    return this.state;
  }
}

// Observer interface
class Observer {
  constructor(name) {
    this.name = name;
  }

  // Update method called by the subject
  update(data) {
    console.log(`${this.name} received update with data:`, data);
  }
}

// Concrete Observer implementation
class ConcreteObserver extends Observer {
  constructor(name, customAction) {
    super(name);
    this.customAction = customAction;
  }

  update(data) {
    console.log(`${this.name} received:`, data);
    if (this.customAction) {
      this.customAction(data);
    }
  }
}
```

### Functional Approach

```javascript
// Create a subject/observable factory function
function createSubject() {
  // Private array of observers - using Set for automatic deduplication
  const observers = new Set();
  let state = null;

  // Return an object with public methods
  return {
    // Method to subscribe an observer
    subscribe: function (observer) {
      observers.add(observer);

      // Return an unsubscribe function
      return {
        unsubscribe: () => {
          observers.delete(observer);
        },
      };
    },

    // Method to notify all observers
    notify: function (data) {
      observers.forEach((observer) => {
        observer(data);
      });
    },

    // Method to change state and notify observers
    setState: function (newState) {
      state = newState;
      this.notify(state);
    },

    // Method to get current state
    getState: function () {
      return state;
    },

    // Method to get the count of observers
    observerCount: function () {
      return observers.size;
    },
  };
}

// Create an observer factory function
function createObserver(name, handler) {
  // Return the observer function
  return function (data) {
    console.log(`${name} received update with data:`, data);
    if (handler) {
      handler(data);
    }
  };
}
```

## Real-World Example: Server Monitoring System

Our implementation includes a robust server monitoring system that demonstrates the Observer pattern in action. This system:

1. Monitors server metrics (CPU, memory, disk usage, etc.)
2. Compares metrics against defined thresholds
3. Notifies different types of observers when thresholds are exceeded
4. Allows custom responses to different alert conditions

### Server Monitor (Subject)

```javascript
class ServerMonitor extends Subject {
  constructor(serverName) {
    super();
    this.serverName = serverName;
    this.metrics = {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      responseTime: 0,
      errorRate: 0,
      requestCount: 0,
    };
    this.thresholds = {
      cpu: 80,
      memory: 85,
      disk: 90,
      network: 800,
      responseTime: 500,
      errorRate: 5,
    };
    this.alerts = [];
  }

  updateMetrics(newMetrics) {
    // Update metrics with new values
    Object.assign(this.metrics, newMetrics);

    // Check for threshold violations
    const alerts = this.checkThresholds();

    // If we have alerts, update state and notify observers
    if (alerts.length > 0) {
      this.alerts = alerts;
      this.setState({
        serverName: this.serverName,
        timestamp: new Date(),
        metrics: { ...this.metrics },
        alerts: this.alerts,
      });
    }
  }

  // Additional methods for threshold management and metric simulation...
}
```

### Observer Types

```javascript
// DevOps team notification observer
class DevOpsNotifier extends ConcreteObserver {
  constructor(name, notificationMethod) {
    super(name, (data) => {
      this.sendAlert(data);
    });
    this.notificationMethod = notificationMethod || 'slack';
  }

  sendAlert(data) {
    const { serverName, alerts } = data;

    alerts.forEach((alert) => {
      console.log(`[${this.notificationMethod.toUpperCase()}] DevOps Alert: ${alert.message}`);
      // Additional notification logic...
    });
  }
}

// Metrics logger observer
class MetricsLogger extends ConcreteObserver {
  constructor(name, logFormat = 'json') {
    super(name, (data) => {
      this.logMetrics(data);
    });
    this.logFormat = logFormat;
    this.logs = [];
  }

  logMetrics(data) {
    // Create a log entry
    const logEntry = {
      timestamp: data.timestamp,
      server: data.serverName,
      metrics: data.metrics,
      alerts: data.alerts.map((a) => a.message),
    };

    this.logs.push(logEntry);

    // Additional logging logic...
  }
}

// Auto-scaling observer that can take automated actions
class AutoScaler extends ConcreteObserver {
  constructor(name) {
    super(name, (data) => {
      this.evaluateScaling(data);
    });
    this.scalingActions = [];
  }

  evaluateScaling(data) {
    const { metrics, serverName } = data;

    // Check CPU and memory thresholds for scaling
    if (metrics.cpu > 90 || metrics.memory > 95) {
      // Initiate scaling action...
    }
  }
}
```

## Usage Examples

### Class-based Approach

```javascript
// Create a server monitor
const webServer = new ServerMonitor('web-server-prod-01');

// Create different types of observers
const devOpsTeam = new DevOpsNotifier('DevOps Team');
const logger = new MetricsLogger('Metrics Logger');
const scaler = new AutoScaler('Auto Scaler');

// Subscribe observers
webServer.subscribe(devOpsTeam).subscribe(logger).subscribe(scaler);

// Set custom thresholds
webServer.setThreshold('cpu', 75);
webServer.setThreshold('responseTime', 300);

// Update metrics - will trigger notifications if thresholds are exceeded
webServer.updateMetrics({
  cpu: 95,
  memory: 85,
  responseTime: 600,
});
```

### Functional Approach

```javascript
// Create a server monitor
const webServer = createServerMonitor('web-server-prod-02');

// Create observers
const devOpsTeam = createDevOpsNotifier('DevOps Team');
const loggerSystem = createMetricsLogger('Metrics Logger');
const autoScaler = createAutoScaler('Auto Scaler');

// Subscribe observers
const devOpsSubscription = webServer.subscribe(devOpsTeam);
const loggerSubscription = webServer.subscribe(loggerSystem.observer);
const scalerSubscription = webServer.subscribe(autoScaler.observer);

// Set custom thresholds
webServer.setThreshold('cpu', 75);
webServer.setThreshold('responseTime', 300);

// Update metrics
webServer.updateMetrics({
  cpu: 95,
  memory: 85,
  responseTime: 600,
});

// Later, clean up subscriptions
devOpsSubscription.unsubscribe();
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- Subject-observer relationship
- Subscription and unsubscription handling
- Notification propagation
- State management
- Server monitoring thresholds
- Observer-specific logic
- Functional implementation correctness
- Integration testing with multiple observer types

## Key Considerations

1. **Subject-Observer Relationship**

   - One-to-many dependency management
   - Proper subscription handling
   - Clear notification protocols
   - State encapsulation

2. **Subscription Management**

   - Clean subscription registration
   - Safe unsubscription
   - Memory leak prevention
   - Method chaining for fluent API

3. **Notification Mechanisms**

   - Consistent notification pattern
   - Data passing through notifications
   - Conditional notifications based on state changes
   - Support for different observer types

4. **Implementation Approaches**
   - Class-based for inheritance hierarchies
   - Functional for flexibility and composition
   - Hybrid approaches for complex systems

## Practical Applications

The Observer Pattern is especially useful for:

- Real-time monitoring systems
- Event handling in user interfaces
- Message brokers and publish-subscribe systems
- State management in frontend frameworks
- Reactive programming
- Analytics and logging systems
- Real-time data processing
- IoT device communication
- Distributed system communication

## When to Use Observer Pattern

The Observer Pattern is most beneficial when:

- You need a one-to-many dependency between objects
- Changes to one object require changing many others
- An object should notify other objects without knowing who they are
- You want to achieve loose coupling between objects
- The set of observers needs to change dynamically
- You need to broadcast events to multiple interested parties

## When Not to Use Observer Pattern

Avoid using the Observer Pattern when:

- Simple procedural code would suffice
- The chain of notifications might create circular dependencies
- Memory management is critical (observers might cause memory leaks if not properly managed)
- Performance is a major concern (notification systems can add overhead)
- Debugging complicated notification flows would be difficult

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Observer Pattern as described in the Gang of Four's Design Patterns book
- Modernized for modern JavaScript using ES6+ features
- Enhanced with practical examples drawn from real-world enterprise applications
- Built with clean architecture principles for maintainable, testable code

---

If you find this implementation helpful for understanding the Observer Pattern, please consider giving it a star!
