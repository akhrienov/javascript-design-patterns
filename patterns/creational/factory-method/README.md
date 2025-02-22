# Factory Method Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Factory Method pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Factory Method pattern provides an interface for creating objects but allows subclasses to alter the type of objects that will be created. This implementation focuses on a Payment Processing system use case, demonstrating practical applications in real-world scenarios.

## Repository Structure
```
patterns/
└── creational/
    └── factory-method/
        ├── README.md
        ├── factory-method.example.js        # Usage examples
        ├── factory-method.implementation.js # Core implementation
        └── factory-method.spec.js           # Test suite
```

## Features
- Two implementation approaches:
    - Class-based Factory Method using inheritance
    - Functional approach using closures
- Payment Processing functionality:
    - Multiple payment provider support (Stripe, PayPal)
    - Transaction processing
    - Refund handling
    - Dynamic processor registration
- Comprehensive test coverage

## Implementation Details

### Class-based Approach
```javascript
export class PaymentProcessor {
  process(amount) {
    throw new Error('process method must be implemented');
  }
}

export class PaymentProcessorFactory {
  static createProcessor(type, config = {}) {
    switch (type.toLowerCase()) {
      case 'stripe':
        return new StripeProcessor(config.apiKey);
      case 'paypal':
        return new PayPalProcessor(config.clientId, config.secretKey);
      default:
        throw new Error(`Unsupported payment processor type: ${type}`);
    }
  }
}
```

### Functional Approach
```javascript
export const createPaymentProcessor = (type, config = {}) => {
  const processors = {
    stripe: (config) => ({
      process: (amount) => ({
        provider: 'stripe',
        transactionId: `stripe_${Math.random().toString(36).substr(2, 9)}`,
        amount
      })
    }),
    paypal: (config) => ({
      process: (amount) => ({
        provider: 'paypal',
        transactionId: `paypal_${Math.random().toString(36).substr(2, 9)}`,
        amount
      })
    })
  };

  return processors[type.toLowerCase()](config);
};
```

## Usage Examples

### Basic Usage
```javascript
// Class-based approach
const stripeProcessor = PaymentProcessorFactory.createProcessor('stripe', {
  apiKey: 'stripe_key'
});
const result = await stripeProcessor.process(100);

// Functional approach
const paypalProcessor = createPaymentProcessor('paypal', {
  clientId: 'client_id',
  secretKey: 'secret_key'
});
const result = await paypalProcessor.process(100);
```

### Processing with Error Handling
```javascript
const processPayment = async (type, amount, config) => {
  try {
    const processor = PaymentProcessorFactory.createProcessor(type, config);
    const result = await processor.process(amount);
    
    if (amount > 1000) {
      const refund = await processor.refund(result.transactionId);
      return { payment: result, refund };
    }
    
    return { payment: result };
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
};
```

## Testing

The implementation includes comprehensive test coverage using Vitest:
```bash
pnpm test
```

Test suite covers:
- Factory method creation
- Payment processing operations
- Refund handling
- Edge cases and error handling
- Different processor types
- Integration scenarios

## Key Considerations

1. **Extensibility**
    - Easy addition of new payment processors
    - Consistent interface across implementations
    - Support for processor-specific configurations

2. **Error Handling**
    - Robust error management
    - Transaction validation
    - Proper error propagation

3. **Security**
    - Safe handling of API keys and credentials
    - Secure transaction processing
    - Protected refund operations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world payment processing requirements

---

If you find this implementation helpful, please consider giving it a star!