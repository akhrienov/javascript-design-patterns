import { UserApiHandler, ProductApiHandler } from './template-method.implementation.js';
import { createUserApiHandler, createProductApiHandler } from './template-method.functional.js';

// Mock API client for demonstration purposes
const mockApiClient = {
  request: async (config) => {
    console.log(`MockApiClient making ${config.method} request to ${config.url}`);
    // Simulation logic would go here
    return { status: 200, data: { success: true } };
  },
};

// Simple cache implementation for demonstration
class SimpleCache {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    return this.store.get(key);
  }

  async set(key, value) {
    this.store.set(key, value);
  }

  has(key) {
    return this.store.has(key);
  }
}

/**
 * Example 1: REST API Gateway using Template Method
 *
 * A common use case is implementing a unified API gateway that handles
 * requests to different backend services with consistent error handling,
 * logging, and request processing.
 */
class ApiGateway {
  constructor() {
    this.apiClient = mockApiClient;
    this.cache = new SimpleCache();

    // Initialize handlers using the class-based implementation
    this.userHandler = new UserApiHandler(this.apiClient, this.cache);
    this.productHandler = new ProductApiHandler(this.apiClient, {
      enableMetrics: true,
      retryCount: 3,
    });

    // Initialize handlers using the functional implementation
    this.userHandlerFn = createUserApiHandler(this.apiClient, this.cache);
    this.productHandlerFn = createProductApiHandler(this.apiClient, {
      enableMetrics: true,
      retryCount: 3,
    });
  }

  /**
   * Handle an API request using the appropriate handler
   * @param {string} service - The service to route to (user, product, etc.)
   * @param {Object} requestData - The request data
   * @returns {Promise<Object>} - The response
   */
  async handleRequest(service, requestData) {
    console.log(`ApiGateway routing request to ${service} service`);

    try {
      switch (service) {
        case 'user':
          // Use class-based implementation
          return await this.userHandler.handleRequest(requestData);

        case 'product':
          // Use class-based implementation
          return await this.productHandler.handleRequest(requestData);

        case 'user-fn':
          // Use functional implementation
          return await this.userHandlerFn(requestData);

        case 'product-fn':
          // Use functional implementation
          return await this.productHandlerFn(requestData);

        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (error) {
      console.error(`ApiGateway error handling ${service} request:`, error);
      throw error;
    }
  }
}

/**
 * Example 2: Real-world example of Template Method in e-commerce checkout flow
 *
 * This example shows how to implement a checkout flow where the overall process
 * is the same, but specific steps like payment processing or inventory checking
 * vary based on the payment method or product type.
 */

// Class-based implementation
class BaseCheckoutProcessor {
  constructor(apiClient, options = {}) {
    this.apiClient = apiClient;
    this.options = options;
  }

  // Define our own template method for checkout flow
  async handleRequest(requestData) {
    try {
      // Step 1: Validate the checkout data
      if (typeof this.validateRequest === 'function') this.validateRequest(requestData);

      // Step 2: Check inventory
      await this.checkInventory(requestData);

      // Step 3: Calculate total (including taxes, shipping, etc.)
      const orderWithTotal = this.calculateTotal(requestData);

      // Step 4: Process payment
      const paymentResult = await this.processPayment(orderWithTotal);

      // Step 5: Create order in the system
      const order = await this.createOrder({
        ...orderWithTotal,
        paymentResult,
      });

      // Step 6: Handle post-order processing (like sending emails)
      await this.handlePostOrderProcessing(order);

      return order;
    } catch (error) {
      this.handleError(error, requestData);
      throw error;
    }
  }

  // Abstract methods
  validateRequest(requestData) {
    throw new Error('validateRequest() must be implemented by subclasses');
  }

  async checkInventory(requestData) {
    throw new Error('checkInventory() must be implemented by subclasses');
  }

  calculateTotal(requestData) {
    throw new Error('calculateTotal() must be implemented by subclasses');
  }

  async processPayment(orderData) {
    throw new Error('processPayment() must be implemented by subclasses');
  }

  async createOrder(orderData) {
    throw new Error('createOrder() must be implemented by subclasses');
  }

  // Hook methods
  async handlePostOrderProcessing(order) {
    console.log(`Base post-order processing for order ${order.id}`);
    // Default implementation does nothing
  }

  handleError(error, requestData) {
    console.error('Error processing checkout:', error);
  }
}

class StandardCheckoutProcessor extends BaseCheckoutProcessor {
  validateRequest(requestData) {
    if (!requestData.items || !Array.isArray(requestData.items) || requestData.items.length === 0) {
      throw new Error('Checkout requires at least one item');
    }

    if (!requestData.customer || !requestData.customer.id) {
      throw new Error('Customer information is required for checkout');
    }

    if (!requestData.shippingAddress) {
      throw new Error('Shipping address is required for standard checkout');
    }
  }

  async checkInventory(requestData) {
    console.log('Checking inventory for standard checkout...');
    // In a real implementation, this would check inventory in a database
    return true;
  }

  calculateTotal(requestData) {
    console.log('Calculating total for standard checkout...');

    // Basic calculation: sum of items + tax + shipping
    const subtotal = requestData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100

    return {
      ...requestData,
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
    };
  }

  async processPayment(orderData) {
    console.log(`Processing payment for $${orderData.total.toFixed(2)}...`);
    // In a real implementation, this would call a payment gateway
    return {
      status: 'success',
      transactionId: `txn-${Date.now()}`,
      amount: orderData.total,
    };
  }

  async createOrder(orderData) {
    console.log('Creating order in system...');
    // In a real implementation, this would save to a database
    return {
      id: `order-${Date.now()}`,
      ...orderData,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
  }

  // Override hook method
  async handlePostOrderProcessing(order) {
    console.log(`Sending confirmation email for order ${order.id}...`);
    // In a real implementation, this would send an email
  }
}

class SubscriptionCheckoutProcessor extends BaseCheckoutProcessor {
  // Validate the subscription checkout data
  validateRequest(requestData) {
    if (!requestData.plan) {
      throw new Error('Subscription plan is required');
    }

    if (!['basic', 'premium', 'enterprise'].includes(requestData.plan)) {
      throw new Error('Invalid subscription plan. Must be basic, premium, or enterprise');
    }

    if (!requestData.duration) {
      throw new Error('Subscription duration is required');
    }

    if (!['monthly', 'annual'].includes(requestData.duration)) {
      throw new Error('Invalid duration. Must be monthly or annual');
    }

    if (!requestData.customer || !requestData.customer.email) {
      throw new Error('Customer email is required for subscription');
    }
  }

  async checkInventory(requestData) {
    console.log('Checking subscription availability...');
    // Subscriptions don't require inventory check in the same way
    return true;
  }

  calculateTotal(requestData) {
    console.log('Calculating total for subscription checkout...');

    // Calculate based on subscription plan
    const { plan, duration } = requestData;

    let basePrice;
    switch (plan) {
      case 'basic':
        basePrice = 9.99;
        break;
      case 'premium':
        basePrice = 19.99;
        break;
      case 'enterprise':
        basePrice = 49.99;
        break;
      default:
        throw new Error(`Unknown subscription plan: ${plan}`);
    }

    // Apply duration discounts
    let discount = 0;
    if (duration === 'annual') {
      discount = 0.2; // 20% off for annual subscriptions
    }

    const subtotal = basePrice * (1 - discount);
    const tax = subtotal * 0.08; // 8% tax

    return {
      ...requestData,
      basePrice,
      discount,
      subtotal,
      tax,
      total: subtotal + tax,
      billingCycle: duration,
    };
  }

  async processPayment(orderData) {
    console.log(
      `Setting up recurring payment for $${orderData.total.toFixed(2)}/${orderData.billingCycle}...`
    );
    // In a real implementation, this would set up a subscription
    return {
      status: 'success',
      subscriptionId: `sub-${Date.now()}`,
      amount: orderData.total,
      billingCycle: orderData.billingCycle,
    };
  }

  async createOrder(orderData) {
    console.log('Creating subscription order...');
    // In a real implementation, this would save to a database
    return {
      id: `sub-order-${Date.now()}`,
      ...orderData,
      status: 'active',
      nextBillingDate: this.calculateNextBillingDate(orderData.billingCycle),
      createdAt: new Date().toISOString(),
    };
  }

  calculateNextBillingDate(billingCycle) {
    const now = new Date();
    if (billingCycle === 'annual') {
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    } else {
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    }
  }

  // Override hook method
  async handlePostOrderProcessing(order) {
    console.log(`Sending welcome email for subscription ${order.id}...`);
    console.log(`Setting up account for subscription...`);
    // In a real implementation, this would send emails and provision resources
  }
}

// Functional implementation of the checkout processor

function createCheckoutProcessor({
  checkInventory,
  calculateTotal,
  processPayment,
  createOrder,
  handlePostOrderProcessing = defaultHandlePostOrderProcessing,
}) {
  // Ensure required operations are provided
  if (!checkInventory || !calculateTotal || !processPayment || !createOrder) {
    throw new Error('Required checkout operations missing');
  }

  return async function handleCheckout(requestData) {
    try {
      // Step 1: Check inventory
      await checkInventory(requestData);

      // Step 2: Calculate total (including taxes, shipping, etc.)
      const orderWithTotal = calculateTotal(requestData);

      // Step 3: Process payment
      const paymentResult = await processPayment(orderWithTotal);

      // Step 4: Create order in the system
      const order = await createOrder({
        ...orderWithTotal,
        paymentResult,
      });

      // Step 5: Handle post-order processing (like sending emails)
      await handlePostOrderProcessing(order);

      return order;
    } catch (error) {
      console.error('Error processing checkout:', error);
      throw error;
    }
  };
}

function defaultHandlePostOrderProcessing(order) {
  console.log(`Default post-order processing for order ${order.id}`);
  // Default implementation does nothing
  return Promise.resolve();
}

// Create a standard checkout processor using the functional approach
function createStandardCheckoutProcessor() {
  return createCheckoutProcessor({
    checkInventory: async (requestData) => {
      console.log('Checking inventory for standard checkout...');
      // In a real implementation, this would check inventory in a database
      return true;
    },

    calculateTotal: (requestData) => {
      console.log('Calculating total for standard checkout...');

      // Basic calculation: sum of items + tax + shipping
      const subtotal = requestData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100

      return {
        ...requestData,
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping,
      };
    },

    processPayment: async (orderData) => {
      console.log(`Processing payment for $${orderData.total.toFixed(2)}...`);
      // In a real implementation, this would call a payment gateway
      return {
        status: 'success',
        transactionId: `txn-${Date.now()}`,
        amount: orderData.total,
      };
    },

    createOrder: async (orderData) => {
      console.log('Creating order in system...');
      // In a real implementation, this would save to a database
      return {
        id: `order-${Date.now()}`,
        ...orderData,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
    },

    handlePostOrderProcessing: async (order) => {
      console.log(`Sending confirmation email for order ${order.id}...`);
      // In a real implementation, this would send an email
    },
  });
}

// Example usage
async function runExamples() {
  console.log('======= API Gateway Example =======');
  const gateway = new ApiGateway();

  try {
    // Class-based user API request
    console.log('\n--- Class-based User API Request ---');
    const userResult = await gateway.handleRequest('user', {
      endpoint: 'getUserProfile',
      userId: '123',
    });
    console.log('User result:', userResult);

    // Functional product API request
    console.log('\n--- Functional Product API Request ---');
    const productResult = await gateway.handleRequest('product-fn', {
      endpoint: 'searchProducts',
      query: 'smartphone',
      limit: 10,
    });
    console.log('Product search result:', productResult);
  } catch (error) {
    console.error('Gateway example error:', error);
  }

  console.log('\n======= Checkout Process Example =======');

  // Class-based checkout
  try {
    console.log('\n--- Class-based Standard Checkout ---');
    const standardCheckout = new StandardCheckoutProcessor(mockApiClient);
    const standardOrder = await standardCheckout.handleRequest({
      items: [
        { id: 'prod1', name: 'Product 1', price: 49.99, quantity: 1 },
        { id: 'prod2', name: 'Product 2', price: 29.99, quantity: 2 },
      ],
      customer: {
        id: 'cust123',
        email: 'customer@example.com',
      },
      shippingAddress: {
        line1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
      },
    });

    console.log('Standard order complete:', standardOrder);

    console.log('\n--- Class-based Subscription Checkout ---');
    const subscriptionCheckout = new SubscriptionCheckoutProcessor(mockApiClient);
    const subscriptionOrder = await subscriptionCheckout.handleRequest({
      plan: 'premium',
      duration: 'annual',
      customer: {
        id: 'cust456',
        email: 'subscriber@example.com',
      },
    });

    console.log('Subscription order complete:', subscriptionOrder);

    // Functional checkout
    console.log('\n--- Functional Checkout ---');
    const processStandardCheckout = createStandardCheckoutProcessor();
    const functionalOrder = await processStandardCheckout({
      items: [{ id: 'prod3', name: 'Product 3', price: 99.99, quantity: 1 }],
      customer: {
        id: 'cust789',
        email: 'functional@example.com',
      },
      shippingAddress: {
        line1: '456 Oak St',
        city: 'Othertown',
        state: 'NY',
        zip: '67890',
      },
    });

    console.log('Functional order complete:', functionalOrder);
  } catch (error) {
    console.error('Checkout example error:', error);
  }
}

runExamples().catch(console.error);
