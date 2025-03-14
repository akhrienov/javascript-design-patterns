import { describe, it, expect, beforeEach } from 'vitest';

import { ProductCatalog } from './flyweight.implementation.js';
import { createProductCatalog } from './flyweight.functional.js';

// Test data
const testProducts = [
  {
    id: 'test1',
    name: 'Test Product 1',
    price: 99.99,
    description: 'Test description 1',
    sku: 'TEST-001',
    inStock: true,
    imageUrl: '/test1.jpg',
    category: 'TestCategory',
    manufacturer: 'TestManufacturer',
    material: 'TestMaterial',
    defaultWarranty: '1 year',
    dimensions: { length: 10, width: 10, height: 10 },
  },
  {
    id: 'test2',
    name: 'Test Product 2',
    price: 199.99,
    description: 'Test description 2',
    sku: 'TEST-002',
    inStock: false,
    imageUrl: '/test2.jpg',
    category: 'TestCategory',
    manufacturer: 'TestManufacturer',
    material: 'TestMaterial',
    defaultWarranty: '1 year',
    dimensions: { length: 20, width: 20, height: 5 },
  },
  {
    id: 'test3',
    name: 'Test Product 3',
    price: 299.99,
    description: 'Test description 3',
    sku: 'TEST-003',
    inStock: true,
    imageUrl: '/test3.jpg',
    category: 'DifferentCategory',
    manufacturer: 'OtherManufacturer',
    material: 'OtherMaterial',
    defaultWarranty: '2 years',
    dimensions: { length: 15, width: 15, height: 15 },
  },
];

describe('Flyweight Pattern - Class Based Implementation', () => {
  let catalog;

  beforeEach(() => {
    catalog = new ProductCatalog();
    testProducts.forEach((product) => catalog.addProduct(product));
  });

  it('should add products correctly', () => {
    const product = catalog.getProduct('test1');

    expect(product).not.toBeNull();
    expect(product.name).toBe('Test Product 1');
    expect(product.category).toBe('TestCategory');
  });

  it('should reuse flyweights for products with same intrinsic state', () => {
    const stats = catalog.getMemoryStatistics();

    expect(stats.totalFlyweights).toBe(2);
    expect(stats.totalProducts).toBe(3);
  });

  it('should return null for non-existent products', () => {
    const product = catalog.getProduct('nonexistent');

    expect(product).toBeNull();
  });

  it('should filter products by category', () => {
    const categoryProducts = catalog.getProductsByCategory('TestCategory');

    expect(categoryProducts.length).toBe(2);
    expect(categoryProducts[0].id).toBe('test1');
    expect(categoryProducts[1].id).toBe('test2');
  });

  it('should calculate shipping properties correctly', () => {
    const shipping = catalog.calculateShipping('test1');

    expect(shipping).toHaveProperty('weight');
    expect(shipping).toHaveProperty('estimatedShippingCost');
    expect(shipping.material).toBe('TestMaterial');
  });

  it('should throw error when calculating shipping for non-existent product', () => {
    expect(() => catalog.calculateShipping('nonexistent')).toThrow();
  });

  it('should combine intrinsic and extrinsic state correctly', () => {
    const product = catalog.getProduct('test1');

    // Check extrinsic properties
    expect(product.id).toBe('test1');
    expect(product.name).toBe('Test Product 1');
    expect(product.price).toBe(99.99);

    // Check intrinsic properties
    expect(product.category).toBe('TestCategory');
    expect(product.manufacturer).toBe('TestManufacturer');
    expect(product.material).toBe('TestMaterial');
    expect(product.warranty).toBe('1 year');
  });

  it('should report memory savings', () => {
    const stats = catalog.getMemoryStatistics();

    expect(stats.estimatedMemorySaved).toBeGreaterThan(0);
    expect(stats.percentSaved).toBeGreaterThan(0);
  });
});

describe('Flyweight Pattern - Functional Implementation', () => {
  let catalog;

  beforeEach(() => {
    catalog = createProductCatalog();
    testProducts.forEach((product) => catalog.addProduct(product));
  });

  it('should add products correctly', () => {
    const product = catalog.getProduct('test1');

    expect(product).not.toBeNull();
    expect(product.name).toBe('Test Product 1');
    expect(product.category).toBe('TestCategory');
  });

  it('should reuse flyweights for products with same intrinsic state', () => {
    const stats = catalog.getMemoryStatistics();

    expect(stats.totalFlyweights).toBe(2);
    expect(stats.totalProducts).toBe(3);
  });

  it('should filter products by category correctly', () => {
    const categoryProducts = catalog.getProductsByCategory('TestCategory');

    expect(categoryProducts.length).toBe(2);
    expect(categoryProducts[0].id).toBe('test1');
    expect(categoryProducts[1].id).toBe('test2');
  });

  it('should calculate shipping properties correctly', () => {
    const shipping = catalog.calculateShipping('test1');

    expect(shipping).toHaveProperty('weight');
    expect(shipping).toHaveProperty('estimatedShippingCost');
    expect(shipping.material).toBe('TestMaterial');
  });

  it('should have the same behavior as the class-based implementation', () => {
    const functionalProduct = catalog.getProduct('test2');
    const classCatalog = new ProductCatalog();

    testProducts.forEach((product) => classCatalog.addProduct(product));

    const classProduct = classCatalog.getProduct('test2');

    // Products should have the same properties
    expect(functionalProduct.name).toBe(classProduct.name);
    expect(functionalProduct.price).toBe(classProduct.price);
    expect(functionalProduct.category).toBe(classProduct.category);
    expect(functionalProduct.manufacturer).toBe(classProduct.manufacturer);
    expect(functionalProduct.material).toBe(classProduct.material);
  });

  it('should handle adding many products efficiently', () => {
    const largeCatalog = createProductCatalog();
    const startTime = performance.now();

    // Add 1000 products with only 5 different combinations of intrinsic state
    for (let i = 0; i < 1000; i++) {
      const categoryIndex = i % 5;
      largeCatalog.addProduct({
        id: `perf-${i}`,
        name: `Performance Test ${i}`,
        price: 99.99,
        description: `Description ${i}`,
        sku: `PERF-${i}`,
        inStock: true,
        imageUrl: `/test${i}.jpg`,
        category: `Category-${categoryIndex}`,
        manufacturer: `Manufacturer-${categoryIndex}`,
        material: `Material-${categoryIndex}`,
        defaultWarranty: '1 year',
        dimensions: { length: 10, width: 10, height: 10 },
      });
    }

    const endTime = performance.now();
    const stats = largeCatalog.getMemoryStatistics();

    // Should only create 5 flyweights for 1000 products
    expect(stats.totalFlyweights).toBe(5);
    expect(stats.totalProducts).toBe(1000);
    expect(endTime - startTime).toBeLessThan(1000); // Should take less than 1 second
  });
});

// Test both implementations with the same scenarios to ensure parity
describe('Comparing Class-based vs Functional Implementations', () => {
  let classCatalog;
  let functionalCatalog;

  beforeEach(() => {
    classCatalog = new ProductCatalog();
    functionalCatalog = createProductCatalog();

    // Add the same test products to both catalogs
    testProducts.forEach((product) => {
      classCatalog.addProduct(product);
      functionalCatalog.addProduct(product);
    });
  });

  it('should have the same memory statistics', () => {
    const classStats = classCatalog.getMemoryStatistics();
    const functionalStats = functionalCatalog.getMemoryStatistics();

    expect(classStats.totalFlyweights).toBe(functionalStats.totalFlyweights);
    expect(classStats.totalProducts).toBe(functionalStats.totalProducts);
    expect(classStats.percentSaved).toBeCloseTo(functionalStats.percentSaved, 1);
  });

  it('should produce identical product details', () => {
    const classProduct = classCatalog.getProduct('test1');
    const functionalProduct = functionalCatalog.getProduct('test1');

    expect(classProduct).toEqual(functionalProduct);
  });
});
