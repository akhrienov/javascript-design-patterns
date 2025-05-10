/**
 * Tests for the Visitor Pattern implementations
 *
 * This file contains tests for both the class-based and functional implementations.
 * Each implementation should behave identically.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  User,
  Product,
  Order,
  OrderItem,
  EntityCollection,
  ValidationVisitor,
  SerializationVisitor,
  TransformationVisitor,
} from './visitor.implementation.js';
import {
  createUser,
  createProduct,
  createOrder,
  createOrderItem,
  createEntityCollection,
  createValidationVisitor,
  createSerializationVisitor,
  createTransformationVisitor,
} from './visitor.functional.js';

// Test both implementations
describe('Visitor Pattern Implementations', () => {
  // Test class-based implementation
  describe('Class-based Implementation', () => {
    testImplementation('class');
  });

  // Test functional implementation
  describe('Functional Implementation', () => {
    testImplementation('functional');
  });
});

/**
 * Test suite for both implementations
 * @param {string} type - Implementation type ('class' or 'functional')
 */
function testImplementation(type) {
  let user, product, orderItem, order, collection;
  let validationVisitor, serializationVisitor, transformationVisitor;

  // Setup test entities before each test
  beforeEach(() => {
    if (type === 'class') {
      // Create entities using class-based implementation
      user = new User({
        id: 'user-123',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
      });

      product = new Product({
        id: 'prod-456',
        name: 'Smartphone',
        description: 'Latest model smartphone with advanced features',
        price: 999.99,
        categories: ['electronics', 'phones'],
        inventory: 100,
      });

      orderItem = new OrderItem({
        productId: 'prod-456',
        quantity: 2,
        price: 999.99,
      });

      order = new Order({
        id: 'order-789',
        userId: 'user-123',
        items: [orderItem],
        status: 'pending',
        createdAt: new Date('2023-01-15'),
      });

      collection = new EntityCollection([user, product, order]);

      // Create visitors
      validationVisitor = new ValidationVisitor();
      serializationVisitor = new SerializationVisitor('json');
      transformationVisitor = new TransformationVisitor('normalize');
    } else {
      // Create entities using functional implementation
      user = createUser({
        id: 'user-123',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
      });

      product = createProduct({
        id: 'prod-456',
        name: 'Smartphone',
        description: 'Latest model smartphone with advanced features',
        price: 999.99,
        categories: ['electronics', 'phones'],
        inventory: 100,
      });

      orderItem = createOrderItem({
        productId: 'prod-456',
        quantity: 2,
        price: 999.99,
      });

      order = createOrder({
        id: 'order-789',
        userId: 'user-123',
        items: [orderItem],
        status: 'pending',
        createdAt: new Date('2023-01-15'),
      });

      collection = createEntityCollection([user, product, order]);

      // Create visitors
      validationVisitor = createValidationVisitor();
      serializationVisitor = createSerializationVisitor('json');
      transformationVisitor = createTransformationVisitor('normalize');
    }
  });

  // Test entity creation and basic properties
  describe('Entity Creation', () => {
    it('should create a user with correct properties', () => {
      expect(user.id).toBe('user-123');
      expect(user.name).toBe('Jane Smith');
      expect(user.email).toBe('jane.smith@example.com');
      expect(user.role).toBe('user');
    });

    it('should create a product with correct properties', () => {
      expect(product.id).toBe('prod-456');
      expect(product.name).toBe('Smartphone');
      expect(product.price).toBe(999.99);
      expect(product.inventory).toBe(100);
      expect(product.categories).toHaveLength(2);
      expect(product.categories).toContain('electronics');
    });

    it('should create an order with correct properties', () => {
      expect(order.id).toBe('order-789');
      expect(order.userId).toBe('user-123');
      expect(order.status).toBe('pending');
      expect(order.items).toHaveLength(1);
    });

    it('should create an entity collection with all entities', () => {
      if (type === 'class') {
        expect(collection.entities).toHaveLength(3);
      } else {
        expect(collection.getEntities()).toHaveLength(3);
      }
    });
  });

  // Test validation visitor
  describe('Validation Visitor', () => {
    it('should validate a valid user', () => {
      const result = user.accept(validationVisitor);
      expect(result).toBe(true);

      if (type === 'class') {
        expect(validationVisitor.errors).toHaveLength(0);
      } else {
        expect(validationVisitor.getErrors()).toHaveLength(0);
      }
    });

    it('should validate a valid product', () => {
      const result = product.accept(validationVisitor);
      expect(result).toBe(true);
    });
  });

  // Test serialization visitor
  describe('Serialization Visitor', () => {
    it('should serialize a user to JSON', () => {
      // Use JSON serializer
      if (type === 'class') {
        serializationVisitor = new SerializationVisitor('json');
      } else {
        serializationVisitor = createSerializationVisitor('json');
      }

      const result = user.accept(serializationVisitor);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      const parsed = JSON.parse(result);
      expect(parsed.id).toBe('user-123');
      expect(parsed.name).toBe('Jane Smith');
    });

    it('should serialize a product to XML', () => {
      // Use XML serializer
      if (type === 'class') {
        serializationVisitor = new SerializationVisitor('xml');
      } else {
        serializationVisitor = createSerializationVisitor('xml');
      }

      const result = product.accept(serializationVisitor);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<product>');
      expect(result).toContain('<name>Smartphone</name>');
    });
  });

  // Test transformation visitor
  describe('Transformation Visitor', () => {
    it('should normalize a user', () => {
      // Create a user with whitespace and uppercase email
      if (type === 'class') {
        user = new User({
          id: 'user-123',
          name: '  Jane Smith  ',
          email: 'JANE.SMITH@EXAMPLE.COM',
          role: 'USER',
        });
        transformationVisitor = new TransformationVisitor('normalize');
      } else {
        user = createUser({
          id: 'user-123',
          name: '  Jane Smith  ',
          email: 'JANE.SMITH@EXAMPLE.COM',
          role: 'USER',
        });
        transformationVisitor = createTransformationVisitor('normalize');
      }

      const normalizedUser = user.accept(transformationVisitor);
      expect(normalizedUser.name).toBe('Jane Smith');
      expect(normalizedUser.email).toBe('jane.smith@example.com');
      expect(normalizedUser.role).toBe('user');
    });

    it('should anonymize a user', () => {
      if (type === 'class') {
        transformationVisitor = new TransformationVisitor('anonymize');
      } else {
        transformationVisitor = createTransformationVisitor('anonymize');
      }

      const anonymizedUser = user.accept(transformationVisitor);
      expect(anonymizedUser.name).toContain('User');
      expect(anonymizedUser.email).toContain('@example.com');
      expect(anonymizedUser.id).toBe('user-123'); // ID should be preserved
    });

    it('should apply discount to a product', () => {
      if (type === 'class') {
        transformationVisitor = new TransformationVisitor('discount', { discountPercent: 20 });
      } else {
        transformationVisitor = createTransformationVisitor('discount', { discountPercent: 20 });
      }

      const discountedProduct = product.accept(transformationVisitor);
      expect(discountedProduct.price).toBe(799.99); // 20% off 999.99

      if (type === 'class') {
        expect(discountedProduct.categories).toContain('discounted');
      } else {
        expect(discountedProduct.categories).toContain('discounted');
      }
    });

    it('should calculate order totals', () => {
      if (type === 'class') {
        transformationVisitor = new TransformationVisitor('calculateTotals', {
          taxRate: 0.1,
          shippingCost: 15,
        });
      } else {
        transformationVisitor = createTransformationVisitor('calculateTotals', {
          taxRate: 0.1,
          shippingCost: 15,
        });
      }

      const calculatedOrder = order.accept(transformationVisitor);
      expect(calculatedOrder.subtotal).toBe(1999.98); // 2 * 999.99
      expect(calculatedOrder.tax).toBe(200.0); // 10% of subtotal, rounded
      expect(calculatedOrder.shipping).toBe(15);
      expect(calculatedOrder.total).toBe(2214.98); // subtotal + tax + shipping
    });

    it('should enrich a product with additional information', () => {
      if (type === 'class') {
        transformationVisitor = new TransformationVisitor('enrich', {
          tags: ['featured', 'new-arrival'],
          averageRating: 4.7,
        });
      } else {
        transformationVisitor = createTransformationVisitor('enrich', {
          tags: ['featured', 'new-arrival'],
          averageRating: 4.7,
        });
      }

      const enrichedProduct = product.accept(transformationVisitor);
      expect(enrichedProduct.isInStock).toBe(true);
      expect(enrichedProduct.tags).toContain('featured');
      expect(enrichedProduct.averageRating).toBe(4.7);
    });
  });

  // Test complex scenarios
  describe('Complex Scenarios', () => {
    it('should validate then transform an entity', () => {
      // First validate
      const isValid = product.accept(validationVisitor);
      expect(isValid).toBe(true);

      // Then apply transformation
      if (type === 'class') {
        transformationVisitor = new TransformationVisitor('discount', { discountPercent: 10 });
      } else {
        transformationVisitor = createTransformationVisitor('discount', { discountPercent: 10 });
      }

      const transformedProduct = product.accept(transformationVisitor);
      expect(transformedProduct.price).toBe(899.99); // 10% off 999.99
    });

    it('should handle a chain of visitors', () => {
      // Create visitors
      if (type === 'class') {
        const normalizer = new TransformationVisitor('normalize');
        const discounter = new TransformationVisitor('discount', { discountPercent: 15 });
        const jsonSerializer = new SerializationVisitor('json');

        // Apply visitors in sequence
        const normalizedProduct = product.accept(normalizer);
        const discountedProduct = normalizedProduct.accept(discounter);
        const serializedProduct = discountedProduct.accept(jsonSerializer);

        // Verify result
        expect(typeof serializedProduct).toBe('string');
        const parsed = JSON.parse(serializedProduct);
        expect(parsed.price).toBe(849.99); // 15% off 999.99
        expect(parsed.categories).toContain('discounted');
      } else {
        const normalizer = createTransformationVisitor('normalize');
        const discounter = createTransformationVisitor('discount', { discountPercent: 15 });
        const jsonSerializer = createSerializationVisitor('json');

        // Apply visitors in sequence
        const normalizedProduct = product.accept(normalizer);
        const discountedProduct = normalizedProduct.accept(discounter);
        const serializedProduct = discountedProduct.accept(jsonSerializer);

        // Verify result
        expect(typeof serializedProduct).toBe('string');
        const parsed = JSON.parse(serializedProduct);
        expect(parsed.price).toBe(849.99); // 15% off 999.99
        expect(parsed.categories).toContain('discounted');
      }
    });
  });

  // Test error handling
  describe('Error Handling', () => {
    it('should handle missing required fields in validation', () => {
      // Create an invalid product without required fields
      let invalidProduct;

      if (type === 'class') {
        invalidProduct = new Product({
          description: 'A product without ID or name',
          price: -10, // Invalid price
          categories: 'not-an-array', // Invalid categories
        });
      } else {
        invalidProduct = createProduct({
          description: 'A product without ID or name',
          price: -10, // Invalid price
          categories: 'not-an-array', // Invalid categories
        });
      }

      const result = invalidProduct.accept(validationVisitor);
      expect(result).toBe(false);

      if (type === 'class') {
        expect(validationVisitor.errors.length).toBeGreaterThanOrEqual(3); // At least 3 errors
      } else {
        expect(validationVisitor.getErrors().length).toBeGreaterThanOrEqual(3); // At least 3 errors
      }
    });
  });
}
