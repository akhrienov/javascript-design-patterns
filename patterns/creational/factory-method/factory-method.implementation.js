/**
 * Class-based approach to Factory Method Pattern
 */
export class PaymentProcessor {
  /**
   * Process payment for the given amount
   * @param amount
   */
  process(amount) {
    throw new Error('process method must be implemented');
  }

  /**
   * Refund payment for the given transaction ID
   * @param transactionId
   */
  refund(transactionId) {
    throw new Error('refund method must be implemented');
  }
}

/**
 * Stripe payment processor
 */
export class StripeProcessor extends PaymentProcessor {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  /**
   * Process payment using Stripe API
   * @param amount
   * @returns {{amount, provider: string, transactionId: string, timestamp: Date}}
   */
  process(amount) {
    // Simulate Stripe payment processing
    return {
      provider: 'stripe',
      transactionId: `stripe_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      timestamp: new Date(),
    };
  }

  /**
   * Refund payment using Stripe API
   * @param transactionId
   * @returns {{provider: string, refundId: string, transactionId, timestamp: Date}}
   */
  refund(transactionId) {
    return {
      provider: 'stripe',
      refundId: `refund_${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      timestamp: new Date(),
    };
  }
}

/**
 * PayPal payment processor
 */
export class PayPalProcessor extends PaymentProcessor {
  constructor(clientId, secretKey) {
    super();
    this.clientId = clientId;
    this.secretKey = secretKey;
  }

  /**
   * Process payment using PayPal API
   * @param amount
   * @returns {{amount, provider: string, transactionId: string, timestamp: Date}}
   */
  process(amount) {
    // Simulate PayPal payment processing
    return {
      provider: 'paypal',
      transactionId: `paypal_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      timestamp: new Date(),
    };
  }

  /**
   * Refund payment using PayPal API
   * @param transactionId
   * @returns {{provider: string, refundId: string, transactionId, timestamp: Date}}
   */
  refund(transactionId) {
    return {
      provider: 'paypal',
      refundId: `refund_${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      timestamp: new Date(),
    };
  }
}

/**
 * Factory class to create payment processors
 */
export class PaymentProcessorFactory {
  /**
   * Create a payment processor based on the type
   * @param type
   * @param config
   * @returns {PaymentProcessor}
   */
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

/**
 * Functional approach to Factory Method Pattern
 */
export const createPaymentProcessor = (type, config = {}) => {
  const processors = {
    stripe: (config) => ({
      process: (amount) => ({
        provider: 'stripe',
        transactionId: `stripe_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        timestamp: new Date(),
      }),
      refund: (transactionId) => ({
        provider: 'stripe',
        refundId: `refund_${Math.random().toString(36).substr(2, 9)}`,
        transactionId,
        timestamp: new Date(),
      }),
    }),

    paypal: (config) => ({
      process: (amount) => ({
        provider: 'paypal',
        transactionId: `paypal_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        timestamp: new Date(),
      }),
      refund: (transactionId) => ({
        provider: 'paypal',
        refundId: `refund_${Math.random().toString(36).substr(2, 9)}`,
        transactionId,
        timestamp: new Date(),
      }),
    }),
  };

  const processorCreator = processors[type.toLowerCase()];

  if (!processorCreator) {
    throw new Error(`Unsupported payment processor type: ${type}`);
  }

  return processorCreator(config);
};
