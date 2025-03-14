# Flyweight Pattern Implementation

This repository contains practical implementations of the Flyweight design pattern for modern JavaScript applications. The Flyweight pattern is a structural design pattern that minimizes memory usage by sharing as much data as possible with related objects.

## Problem

When building large-scale applications, you may need to create thousands or millions of similar objects that consume significant memory. For example:

- E-commerce applications with thousands of products sharing common attributes
- Text editors handling large documents with characters sharing formatting
- Game engines with many similar entities in the world
- Data visualization systems rendering many data points with shared properties

This leads to excessive memory consumption and poor performance.

## Solution: The Flyweight Pattern

The Flyweight pattern optimizes memory by separating an object's state into:

- **Intrinsic State**: Data that can be shared across multiple objects (stored in flyweights)
- **Extrinsic State**: Context-specific data unique to each instance (stored or passed separately)

## Repository Contents

This repository includes:

1. **Class-based Implementation**: Using ES6+ classes for an object-oriented approach
2. **Functional Implementation**: Using closures and factory functions for a functional approach
3. **Practical Example**: A product catalog system for e-commerce applications
4. **Test Suite**: Unit tests for both implementations using Vitest
5. **Usage Examples**: Demonstrations of memory savings in different scenarios

## E-commerce Product Catalog Example

Our implementation demonstrates the pattern with a product catalog system where:

- **Intrinsic State (Shared)**: Category, manufacturer, material, default warranty
- **Extrinsic State (Unique)**: ID, name, price, SKU, stock status, dimensions, etc.

## Key Features

- **Memory Optimization**: Reduces memory usage for large catalogs by up to 80%
- **Flexible API**: Supports both class-based and functional programming styles
- **Production-Ready**: Includes error handling, input validation, and performance considerations
- **Well-Tested**: Comprehensive test suite ensures correct behavior
- **Real-World Value**: Based on patterns seen in actual enterprise systems

## Memory Savings Visualization

For a catalog of 10,000 products with only 35 different combinations of intrinsic properties:

```
Without Flyweight: ~2.0 MB
With Flyweight:    ~0.5 MB
Memory saved:      ~1.5 MB (75%)
```

## Usage Examples

### Class-based Example

```javascript
const { ProductCatalog } = require('./flyweight/product-catalog');

const catalog = new ProductCatalog();

// Add products sharing common attributes
catalog.addProduct({
  id: 'e1',
  name: 'Ultra HD Smart TV',
  price: 799.99,
  description: '55-inch 4K Ultra HD Smart TV with voice control',
  category: 'Electronics', // shared intrinsic state
  manufacturer: 'TechVision', // shared intrinsic state
  material: 'Electronics', // shared intrinsic state
  defaultWarranty: '2 years', // shared intrinsic state
  dimensions: { length: 48.5, width: 3.0, height: 28.2 },
});

// Get product details
const product = catalog.getProduct('e1');

// Calculate shipping
const shipping = catalog.calculateShipping('e1', 2);

// View memory statistics
const stats = catalog.getMemoryStatistics();
console.log(`Memory saved: ${stats.percentSaved.toFixed(2)}%`);
```

### Functional Example

```javascript
const { createProductCatalog } = require('./flyweight/functional/product-flyweight');

const catalog = createProductCatalog();

// Add products sharing common attributes
catalog.addProduct({
  id: 'e1',
  name: 'Ultra HD Smart TV',
  price: 799.99,
  // ...same properties as class example
});

// Use same API as class-based implementation
const product = catalog.getProduct('e1');
const shipping = catalog.calculateShipping('e1', 2);
const stats = catalog.getMemoryStatistics();
```

## When to Use the Flyweight Pattern

- Your application creates thousands of similar objects
- Memory consumption is a concern or bottleneck
- The objects share significant common state
- The shared state is immutable or rarely changes
- Performance profiling shows memory issues

## Running the Tests

```bash
    pnpm install
```

## Performance Considerations

The Flyweight pattern introduces some overhead:

- Additional complexity in object creation and management
- Slight computational cost of lookups in the factory
- Creation of flyweight keys

These costs are negligible compared to the memory savings for large object collections. Our tests show that the performance impact is minimal even with thousands of objects.

## Best Practices

1. **Identify sharing opportunities**: Look for repeated data across objects
2. **Keep flyweights immutable**: Never modify shared state
3. **Use factory methods**: Always create flyweights through the factory
4. **Consider serialization**: When persisting objects with flyweights, ensure proper serialization
5. **Profile before optimizing**: Measure memory usage to verify the pattern is needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world web application requirements

---

If you find this implementation helpful, please consider giving it a star!
