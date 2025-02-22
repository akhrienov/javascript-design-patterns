import { describe, it, expect, beforeEach } from 'vitest';
import { ProductBuilder, createProductBuilder } from './builder.implementation.js';

describe('ProductBuilder', () => {
  describe('Class-based Builder', () => {
    let builder;

    beforeEach(() => {
      builder = new ProductBuilder();
    });

    it('should create an empty product with default values', () => {
      const product = builder.build();
      expect(product).toEqual({
        name: '',
        price: 0,
        description: '',
        category: '',
        features: [],
        metadata: {},
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should build a product with all properties set', () => {
      const product = builder
        .setName('Test Product')
        .setPrice(99.99)
        .setDescription('Test Description')
        .setCategory('Test Category')
        .addFeature('Feature 1')
        .addFeature('Feature 2')
        .setMetadata('key1', 'value1')
        .setMetadata('key2', 'value2')
        .build();

      expect(product).toEqual({
        name: 'Test Product',
        price: 99.99,
        description: 'Test Description',
        category: 'Test Category',
        features: ['Feature 1', 'Feature 2'],
        metadata: {
          key1: 'value1',
          key2: 'value2',
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error for invalid price', () => {
      expect(() => builder.setPrice(-100)).toThrow('Price must be a non-negative number');
    });

    it('should reset builder after build', () => {
      builder.setName('Test Product').setPrice(99.99).build();

      const newProduct = builder.build();
      expect(newProduct).toEqual({
        name: '',
        price: 0,
        description: '',
        category: '',
        features: [],
        metadata: {},
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('Functional Builder', () => {
    let builder;

    beforeEach(() => {
      builder = createProductBuilder();
    });

    it('should create an empty product with default values', () => {
      const product = builder.build();
      expect(product).toEqual({
        name: '',
        price: 0,
        description: '',
        category: '',
        features: [],
        metadata: {},
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should build a product with all properties set', () => {
      const product = builder
        .setName('Test Product')
        .setPrice(99.99)
        .setDescription('Test Description')
        .setCategory('Test Category')
        .addFeature('Feature 1')
        .addFeature('Feature 2')
        .setMetadata('key1', 'value1')
        .setMetadata('key2', 'value2')
        .build();

      expect(product).toEqual({
        name: 'Test Product',
        price: 99.99,
        description: 'Test Description',
        category: 'Test Category',
        features: ['Feature 1', 'Feature 2'],
        metadata: {
          key1: 'value1',
          key2: 'value2',
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error for invalid price', () => {
      expect(() => builder.setPrice(-100)).toThrow('Price must be a non-negative number');
    });

    it('should reset builder after build', () => {
      builder.setName('Test Product').setPrice(99.99).build();

      const newProduct = builder.build();
      expect(newProduct).toEqual({
        name: '',
        price: 0,
        description: '',
        category: '',
        features: [],
        metadata: {},
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should not share state between different builders', () => {
      const builder1 = createProductBuilder();
      const builder2 = createProductBuilder();

      builder1.setName('Product 1').setPrice(99.99);
      builder2.setName('Product 2').setPrice(199.99);

      const product1 = builder1.build();
      const product2 = builder2.build();

      expect(product1.name).toBe('Product 1');
      expect(product2.name).toBe('Product 2');
    });
  });

  describe('Builder Pattern Integration', () => {
    it('should work with async operations', async () => {
      const builder = createProductBuilder();
      const mockPrice = 1499.99;
      const mockFeatures = ['5G', 'Wi-Fi 6E'];

      const product = await Promise.resolve().then(() =>
        builder
          .setName('Async Product')
          .setPrice(mockPrice)
          .addFeature(mockFeatures[0])
          .addFeature(mockFeatures[1])
          .build()
      );

      expect(product).toEqual({
        name: 'Async Product',
        price: mockPrice,
        description: '',
        category: '',
        features: mockFeatures,
        metadata: {},
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should handle complex product construction', () => {
      const builder = new ProductBuilder();
      const complexProduct = builder
        .setName('Complex Product')
        .setPrice(999.99)
        .setDescription('A very complex product')
        .setCategory('Electronics')
        .addFeature('Feature 1')
        .addFeature('Feature 2')
        .setMetadata('weight', '1.5kg')
        .setMetadata('dimensions', '35x25x2cm')
        .setMetadata('color', 'space gray')
        .build();

      expect(complexProduct).toMatchObject({
        name: 'Complex Product',
        price: 999.99,
        features: ['Feature 1', 'Feature 2'],
        metadata: {
          weight: '1.5kg',
          dimensions: '35x25x2cm',
          color: 'space gray',
        },
      });
    });
  });
});
