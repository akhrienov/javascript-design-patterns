import { describe, it, expect } from 'vitest';
import {
  PaymentProcessorFactory,
  StripeProcessor,
  PayPalProcessor,
  createPaymentProcessor,
} from './factory-method.implementation.js';

describe('Factory Method Pattern - Class Based Implementation', () => {
  const stripeConfig = { apiKey: 'test_stripe_key' };
  const paypalConfig = { clientId: 'test_client_id', secretKey: 'test_secret' };

  describe('PaymentProcessorFactory', () => {
    it('should create a Stripe processor', () => {
      const processor = PaymentProcessorFactory.createProcessor('stripe', stripeConfig);
      expect(processor).toBeInstanceOf(StripeProcessor);
      expect(processor.apiKey).toBe(stripeConfig.apiKey);
    });

    it('should create a PayPal processor', () => {
      const processor = PaymentProcessorFactory.createProcessor('paypal', paypalConfig);
      expect(processor).toBeInstanceOf(PayPalProcessor);
      expect(processor.clientId).toBe(paypalConfig.clientId);
      expect(processor.secretKey).toBe(paypalConfig.secretKey);
    });

    it('should throw error for unsupported processor type', () => {
      expect(() => {
        PaymentProcessorFactory.createProcessor('unsupported');
      }).toThrow('Unsupported payment processor type: unsupported');
    });
  });

  describe('StripeProcessor', () => {
    const processor = new StripeProcessor(stripeConfig.apiKey);

    it('should process payment', () => {
      const result = processor.process(100);
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'stripe',
          amount: 100,
          transactionId: expect.stringMatching(/^stripe_/),
          timestamp: expect.any(Date),
        })
      );
    });

    it('should process refund', () => {
      const result = processor.refund('test_transaction');
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'stripe',
          refundId: expect.stringMatching(/^refund_/),
          transactionId: 'test_transaction',
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('PayPalProcessor', () => {
    const processor = new PayPalProcessor(paypalConfig.clientId, paypalConfig.secretKey);

    it('should process payment', () => {
      const result = processor.process(100);
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'paypal',
          amount: 100,
          transactionId: expect.stringMatching(/^paypal_/),
          timestamp: expect.any(Date),
        })
      );
    });

    it('should process refund', () => {
      const result = processor.refund('test_transaction');
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'paypal',
          refundId: expect.stringMatching(/^refund_/),
          transactionId: 'test_transaction',
          timestamp: expect.any(Date),
        })
      );
    });
  });
});

describe('Factory Method Pattern - Functional Implementation', () => {
  const stripeConfig = { apiKey: 'test_stripe_key' };
  const paypalConfig = { clientId: 'test_client_id', secretKey: 'test_secret' };

  describe('createPaymentProcessor', () => {
    it('should create a Stripe processor', () => {
      const processor = createPaymentProcessor('stripe', stripeConfig);
      expect(processor).toHaveProperty('process');
      expect(processor).toHaveProperty('refund');
    });

    it('should create a PayPal processor', () => {
      const processor = createPaymentProcessor('paypal', paypalConfig);
      expect(processor).toHaveProperty('process');
      expect(processor).toHaveProperty('refund');
    });

    it('should throw error for unsupported processor type', () => {
      expect(() => {
        createPaymentProcessor('unsupported');
      }).toThrow('Unsupported payment processor type: unsupported');
    });
  });

  describe('Stripe Processor (Functional)', () => {
    const processor = createPaymentProcessor('stripe', stripeConfig);

    it('should process payment', () => {
      const result = processor.process(100);
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'stripe',
          amount: 100,
          transactionId: expect.stringMatching(/^stripe_/),
          timestamp: expect.any(Date),
        })
      );
    });

    it('should process refund', () => {
      const result = processor.refund('test_transaction');
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'stripe',
          refundId: expect.stringMatching(/^refund_/),
          transactionId: 'test_transaction',
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('PayPal Processor (Functional)', () => {
    const processor = createPaymentProcessor('paypal', paypalConfig);

    it('should process payment', () => {
      const result = processor.process(100);
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'paypal',
          amount: 100,
          transactionId: expect.stringMatching(/^paypal_/),
          timestamp: expect.any(Date),
        })
      );
    });

    it('should process refund', () => {
      const result = processor.refund('test_transaction');
      expect(result).toEqual(
        expect.objectContaining({
          provider: 'paypal',
          refundId: expect.stringMatching(/^refund_/),
          transactionId: 'test_transaction',
          timestamp: expect.any(Date),
        })
      );
    });
  });
});
