# JavaScript Visitor Pattern

A comprehensive implementation of the Visitor Pattern in JavaScript for real-world enterprise applications.

## Overview

This repository contains both class-based and functional implementations of the Visitor Pattern, focusing on a practical data processing system with validation, transformation, and serialization capabilities. The implementations follow enterprise-grade best practices for scalable, maintainable JavaScript applications.

The code demonstrates:

- Separation of data structures from operations that act on them
- Class-based and functional programming approaches
- Entity validation with robust error reporting
- Data transformation for various business needs
- Multi-format serialization (JSON, XML, CSV)
- Comprehensive test suite using Vitest
- Real-world examples of the Visitor Pattern in action

## Files

- `visitor.implementation.js` - Class-based implementation
- `visitor.functional.js` - Functional implementation
- `visitor.example.js` - Usage examples
- `visitor.spec.js` - Comprehensive tests

## The Visitor Pattern in Action

This implementation showcases the Visitor Pattern applied to an enterprise data processing system with the following features:

1. **Entity Validation** - Apply business rules to different entity types
2. **Data Transformation** - Normalize, anonymize, or enrich entities
3. **Multi-format Serialization** - Convert entities to JSON, XML, or CSV
4. **Batch Processing** - Process multiple entities at once with the same operation
5. **Composition** - Chain multiple visitors for complex operations

## Class-Based Implementation

The class-based implementation uses ES6 classes to create a structured, object-oriented approach:

```javascript
// Create entities
const user = new User({
  id: 'user-123',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  role: 'user',
});

const order = new Order({
  id: 'order-456',
  userId: user.id,
  items: [new OrderItem({ productId: 'prod-789', quantity: 2, price: 99.99 })],
  status: 'pending',
});

// Create visitors
const validator = new ValidationVisitor();
const normalizer = new TransformationVisitor('normalize');
const jsonSerializer = new SerializationVisitor('json');

// Apply visitors
const isValid = user.accept(validator);
if (isValid) {
  const normalizedUser = user.accept(normalizer);
  const userJson = normalizedUser.accept(jsonSerializer);
}

// Check validation errors
if (!isValid) {
  console.error(validator.getErrors());
}
```

## Functional Implementation

The functional implementation uses factory functions for a more functional programming style:

```javascript
// Create entities
const user = createUser({
  id: 'user-123',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  role: 'user',
});

const order = createOrder({
  id: 'order-456',
  userId: user.id,
  items: [createOrderItem({ productId: 'prod-789', quantity: 2, price: 99.99 })],
  status: 'pending',
});

// Create visitors
const validator = createValidationVisitor();
const normalizer = createTransformationVisitor('normalize');
const jsonSerializer = createSerializationVisitor('json');

// Apply visitors
const isValid = user.accept(validator);
if (isValid) {
  const normalizedUser = user.accept(normalizer);
  const userJson = normalizedUser.accept(jsonSerializer);
}

// Check validation errors
if (!isValid) {
  console.error(validator.getErrors());
}
```

## Key Features

### Validation

The validation visitor ensures entities meet business rules:

- Required field validation
- Type checking
- Format validation (email, etc.)
- Business logic validation (inventory must be non-negative, etc.)
- Comprehensive error reporting

### Transformation

Transform entities for various business needs:

- **Normalize** - Clean and standardize data
- **Discount** - Apply price discounts to products
- **Anonymize** - Remove PII for privacy/GDPR compliance
- **Calculate Totals** - Compute derived values
- **Enrich** - Add additional information

### Serialization

Convert entities to different formats:

- JSON for API responses and data storage
- XML for legacy system integration
- CSV for reporting and data export

### Composite Pattern Integration

The `EntityCollection` class allows treating multiple entities as a single entity:

```javascript
// Create a collection of entities
const collection = new EntityCollection([user, product, order]);

// Apply the same visitor to all entities
const results = collection.accept(validator);

// Filter by entity type
const users = collection.getByType(User);
```

## Testing

Comprehensive test suite using Vitest, testing both implementations:

```bash
# Run all tests
pnpm test
```

## When to Use the Visitor Pattern

The Visitor Pattern is particularly useful when:

1. You have a stable set of entity types but frequently need to add new operations
2. You want to keep entity logic separate from processing logic
3. You need to perform multiple unrelated operations on objects without cluttering their classes
4. You want to apply consistent operations across a hierarchy of objects

## Best Practices

When implementing the Visitor Pattern:

1. Keep the entity classes focused on their core data and behavior
2. Design clear visitor interfaces that explicitly declare what entity types they can visit
3. Use the double-dispatch mechanism correctly to maintain type safety
4. Consider composition when multiple visitors need to be applied
5. Document the accept/visit contract clearly
6. Be mindful of visitor dependencies on entity internals

## Real-World Applications

The Visitor Pattern is used in many enterprise systems:

- Compilers and interpreters (processing abstract syntax trees)
- Document processing (conversion between formats)
- Data validation and transformation pipelines
- Report generation systems
- Cross-cutting concerns in enterprise applications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world enterprise requirements

---

If you find this implementation helpful, please consider giving it a star!
