# MultiService Communication Facade

This repository contains a comprehensive implementation of the Facade Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Facade Pattern provides a simplified interface to a complex subsystem. This implementation focuses on a multi-service communication system that orchestrates interactions between notification services, user management, logging, and external APIs.

## Repository Structure

```
patterns/
└── structural/
    └── facade/
        ├── README.md
        ├── facade.implementation.js  # Class-based implementation
        ├── facade.functional.js      # Functional implementation
        ├── facade.example.js         # Usage examples
        ├── facade.spec.js            # Test suite
```

## Features

- Two implementation approaches:
    - Class-based Facade using ES6 classes
    - Functional approach using closures and function composition
- Multi-service orchestration:
    - Notification services (email, SMS, push)
    - User management and permissions
    - Logging and audit trails
    - External API integration
- Sophisticated error handling:
    - Error mapping and categorization
    - Consistent error response format
    - Retryable error detection
- Dependency injection support
- Comprehensive test coverage

## Implementation Details

### Class-based Approach

```javascript
class CommunicationFacade {
  constructor() {
    this.notificationService = new NotificationService();
    this.loggingService = new LoggingService();
    this.userService = new UserManagementService();
    this.apiService = new ExternalAPIService();
    
    // Error type mapping
    this.errorTypes = {
      NOTIFICATION_ERROR: 'notification_error',
      PERMISSION_ERROR: 'permission_error',
      API_ERROR: 'api_error',
      SYSTEM_ERROR: 'system_error',
      VALIDATION_ERROR: 'validation_error'
    };
  }
  
  async notifyUser(userId, notification, channels = null) {
    try {
      // 1. Get user profile with preferences
      // 2. Check permission to notify user
      // 3. Determine notification channels
      // 4. Send notifications on all required channels
      // 5. Log the notification activity
      // 6. Return simplified results
    } catch (error) {
      // Handle and map errors
    }
  }
  
  // Additional facade methods...
}
```

### Functional Approach

```javascript
const createCommunicationFacade = (options = {}) => {
  // Initialize services with dependency injection
  const notificationService = options.notificationService || createNotificationService();
  const loggingService = options.loggingService || createLoggingService();
  const userService = options.userService || createUserManagementService();
  const apiService = options.apiService || createExternalAPIService();
  
  // Error type mapping
  const errorTypes = {
    NOTIFICATION_ERROR: 'notification_error',
    PERMISSION_ERROR: 'permission_error',
    API_ERROR: 'api_error',
    SYSTEM_ERROR: 'system_error',
    VALIDATION_ERROR: 'validation_error'
  };
  
  // Helper functions
  const mapError = (error, context = {}) => {
    // Map technical errors to user-friendly ones
  };
  
  // Return the facade's public API
  return {
    notifyUser: async (userId, notification, channels = null) => {
      // Implementation
    },
    // Additional methods...
  };
};
```

## Usage Examples

### Class-based Implementation

```javascript
const communicationService = new CommunicationFacade();

// Notify a user about a new message
const result = await communicationService.notifyUser(
  'user123',
  {
    title: 'New message received',
    body: 'You have a new message from John regarding your recent order.'
  }
);

console.log(result);
// Output: { success: true, userId: 'user123', notifiedOn: ['email', 'push'], timestamp: ... }
```

### Functional Implementation with Dependency Injection

```javascript
// Create a custom notification service
const customNotificationService = {
  sendEmail: (recipient, subject, body) => {
    // Custom implementation
    return { messageId: 'custom-id', status: 'sent' };
  },
  // Other required methods...
};

// Create a facade with the custom service
const customFacade = createCommunicationFacade({
  notificationService: customNotificationService
});

// Use the customized facade
const result = await customFacade.notifyUser('user123', { 
  title: 'Custom Notification',
  body: 'This is a custom notification.'
});
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:

- Service orchestration
- Error handling and mapping
- Dependency injection
- Mocking of subsystems
- Edge cases and validation

## Key Considerations

1. **Error Handling Strategies**
    - Technical error mapping to user-friendly messages
    - Consistent error response formats
    - Categorization of errors by type
    - Recovery and retry mechanisms

2. **Decoupling**
    - Isolation of client code from subsystem complexity
    - Clean interfaces for each subsystem
    - Dependency injection for testing and customization

3. **Orchestration**
    - Coordinating multi-step processes
    - Permission checks and validation
    - Logging and auditing
    - Response formatting

## Practical Applications

The Facade Pattern is especially useful for:

- API Integration layers
- Third-party service wrappers
- Multi-step business processes
- Cross-cutting concerns implementation
- Legacy system modernization
- Simplified interfaces for complex operations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world web application requirements

---

If you find this implementation helpful, please consider giving it a star!