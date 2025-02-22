import {
  PaymentProcessorFactory,
  createPaymentProcessor,
} from './factory-method.implementation.js';

// Class-based usage example
const processPaymentWithClass = async (type, amount, config) => {
  try {
    // Create a payment processor using the factory
    const processor = PaymentProcessorFactory.createProcessor(type, config);

    // Process the payment
    const paymentResult = processor.process(amount);
    console.log('Payment processed:', paymentResult);

    // Simulate some business logic
    if (amount > 1000) {
      // Process refund for large amounts
      const refundResult = processor.refund(paymentResult.transactionId);
      console.log('Refund processed:', refundResult);
    }

    return paymentResult;
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
};

// Functional usage example
const processPaymentWithFunction = async (type, amount, config) => {
  try {
    // Create a payment processor using the functional factory
    const processor = createPaymentProcessor(type, config);

    // Process the payment
    const paymentResult = processor.process(amount);
    console.log('Payment processed:', paymentResult);

    // Simulate some business logic
    if (amount > 1000) {
      // Process refund for large amounts
      const refundResult = processor.refund(paymentResult.transactionId);
      console.log('Refund processed:', refundResult);
    }

    return paymentResult;
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
};

// Example usage
const runExamples = async () => {
  // Configuration for different payment processors
  const stripeConfig = { apiKey: 'stripe_test_key' };
  const paypalConfig = { clientId: 'paypal_client_id', secretKey: 'paypal_secret' };

  // Class-based examples
  console.log('\nClass-based examples:');
  await processPaymentWithClass('stripe', 500, stripeConfig);
  await processPaymentWithClass('paypal', 1500, paypalConfig);

  // Functional examples
  console.log('\nFunctional examples:');
  await processPaymentWithFunction('stripe', 500, stripeConfig);
  await processPaymentWithFunction('paypal', 1500, paypalConfig);
};

// Execute examples
runExamples().catch(console.error);
