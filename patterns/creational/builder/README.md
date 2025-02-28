# Builder Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Builder Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Builder Pattern provides a way to construct complex objects step by step, allowing the same construction process to create different representations. This implementation focuses on a Product Configuration system use case, demonstrating practical applications in real-world scenarios.

## Repository Structure
```
patterns/
└── creational/
    └── builder/
        ├── README.md
        ├── builder.example.js         # Usage examples
        ├── builder.implementation.js  # Core implementation
        └── builder.spec.js            # Test suite
```

## Features
- Two implementation approaches:
    - Class-based Builder using method chaining
    - Functional approach using closures
- Product Configuration functionality:
    - Step-by-step object construction
    - Fluent interface implementation
    - Metadata management
    - Feature collection handling
    - Validation rules
- Comprehensive test coverage

## Implementation Details

### Class-based Approach
```javascript
export class ProductBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.product = {
      name: '',
      price: 0,
      description: '',
      category: '',
      features: [],
      metadata: {}
    };
    return this;
  }

  setName(name) {
    this.product.name = name;
    return this;
  }

  // Additional builder methods...

  build() {
    const result = this.product;
    this.reset();
    return result;
  }
}
```

### Functional Approach
```javascript
export const createProductBuilder = () => {
  let product = {
    name: '',
    price: 0,
    description: '',
    category: '',
    features: [],
    metadata: {}
  };

  return {
    setName: (name) => {
      product.name = name;
      return builder;
    },

    // Additional builder methods...

    build: () => {
      const result = { ...product };
      builder.reset();
      return result;
    }
  };
};
```

## Usage Examples

### Basic Usage
```javascript
// Class-based approach
const builder = new ProductBuilder();
const laptop = builder
  .setName('MacBook Pro')
  .setPrice(1299.99)
  .setDescription('Powerful laptop for professionals')
  .setCategory('Electronics')
  .addFeature('M2 Chip')
  .setMetadata('manufacturer', 'Apple')
  .build();

// Functional approach
const functionalBuilder = createProductBuilder();
const smartphone = functionalBuilder
  .setName('iPhone 15 Pro')
  .setPrice(999.99)
  .addFeature('A17 Pro chip')
  .build();
```

### Async Construction Example
```javascript
async function createProductWithAsync() {
  const fetchPrice = async () => 1499.99;
  const fetchFeatures = async () => ['5G', 'Wi-Fi 6E'];

  const price = await fetchPrice();
  const features = await fetchFeatures();

  return new ProductBuilder()
    .setName('Galaxy S24 Ultra')
    .setPrice(price)
    .addFeature(...features)
    .build();
}
```

## Testing

The implementation includes comprehensive test coverage using Vitest:
```bash
pnpm test
```

Test suite covers:
- Builder initialization and reset
- Step-by-step construction
- Validation rules
- Feature collection handling
- Metadata management
- Async operations
- Edge cases and error handling
- State isolation between builders
- Complex product configurations

## Key Considerations

1. **Fluent Interface**
    - Method chaining implementation
    - Clear and intuitive API
    - Consistent return types

2. **Validation**
    - Input validation for critical fields
    - Type checking
    - Business rule enforcement

3. **State Management**
    - Proper state reset after build
    - Immutable operations where needed
    - Independent builder instances

4. **Extensibility**
    - Easy addition of new product properties
    - Support for custom validation rules
    - Flexible metadata handling

## Best Practices

1. **Clear Method Names**
    - Use descriptive names that indicate what each method does
    - Follow consistent naming conventions
    - Make the API self-documenting

2. **Validation**
    - Implement validation in builder methods
    - Throw meaningful errors
    - Provide helpful error messages

3. **State Handling**
    - Reset state after build
    - Avoid sharing state between builders
    - Consider immutable approaches for concurrent operations

4. **Default Values**
    - Set sensible defaults
    - Document default behaviors
    - Make defaults configurable where appropriate

## When to Use

The Builder Pattern is particularly useful when:
- Objects require step-by-step construction
- Object construction should be independent of its representation
- Complex objects need to be constructed with varying configurations
- The order of object construction matters
- Default and optional parameters need to be handled flexibly

## Common Pitfalls to Avoid

1. **Over-engineering**
    - Don't use the Builder Pattern for simple objects
    - Avoid unnecessary complexity in the build process
    - Keep the API focused and purposeful

2. **Mutable State**
    - Be careful with shared state in async operations
    - Consider immutable approaches where appropriate
    - Properly reset state after building

3. **Missing Validation**
    - Don't assume all inputs will be valid
    - Implement comprehensive validation rules
    - Provide clear error messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world product configuration requirements

---

If you find this implementation helpful, please consider giving it a star!