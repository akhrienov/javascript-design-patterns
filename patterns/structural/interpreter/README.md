# Interpreter Pattern Implementation

This repository contains practical implementations of the Interpreter design pattern for modern JavaScript applications. The Interpreter pattern is a behavioral design pattern that defines a grammar for a language and provides an interpreter to evaluate expressions in that language.

## Problem

When building applications that need to process specialized languages or input formats, you often face challenges like:

- Creating domain-specific languages (DSLs) for configuration or user input
- Parsing and evaluating expressions in custom formats
- Building template engines that mix static content with dynamic expressions
- Implementing query languages for data filtering or search
- Supporting formula evaluation in spreadsheet-like applications

These scenarios require complex parsing and evaluation logic that can be hard to maintain and extend.

## Solution: The Interpreter Pattern

The Interpreter pattern addresses these challenges by:

1. Defining a grammar as a class hierarchy where each rule is represented by a class
2. Representing sentences in the language as abstract syntax trees (ASTs)
3. Interpreting these ASTs to evaluate expressions in the context of specific data

## Repository Contents

This repository includes:

1. **Class-based Implementation**: Using ES6+ classes for an object-oriented approach
2. **Functional Implementation**: Using factory functions for a functional programming approach
3. **Practical Example**: A template language interpreter for web applications
4. **Test Suite**: Unit tests for both implementations using Vitest
5. **Usage Examples**: Demonstrations of the pattern in different scenarios

## Template Language Example

Our implementation demonstrates the pattern with a template language system where:

- **Grammar Elements**:
  - Text blocks (static content)
  - Variable substitution (`{{ variable }}`)
  - Conditional blocks (`{% if condition %}...{% else %}...{% endif %}`)
  - Loop blocks (`{% for item in items %}...{% endfor %}`)

## Key Features

- **Flexible Grammar**: Support for variables, conditionals, and loops with proper nesting
- **Robust Parsing**: Handles nested blocks, proper scope management, and error recovery
- **Dual Implementation**: Choose between class-based or functional programming styles
- **Well-Tested**: Comprehensive test suite ensures correct behavior
- **Production-Ready**: Includes error handling, nested property access, and performance optimization
- **Real-World Value**: Based on template engines used in actual web applications

## Usage Examples

### Class-based Example

```javascript
const { TemplateEngine } = require('./interpreter.implementation');

// Create a template engine instance
const engine = new TemplateEngine();

// Define a template with variables, conditionals, and loops
const template = `
<h1>Welcome, {{ user.name }}!</h1>

{% if user.isAdmin %}
  <div class="admin-panel">
    <h2>Admin Panel</h2>
    <p>You have access to all features.</p>
  </div>
{% endif %}

<h2>Your Products</h2>
<ul>
  {% for product in products %}
    {% if product.inStock %}
      <li>{{ product.name }} - ${{ product.price }}</li>
    {% endif %}
  {% endfor %}
</ul>
`;

// Define data to render
const data = {
  user: {
    name: 'John Doe',
    isAdmin: true
  },
  products: [
    { name: 'Laptop', price: 999, inStock: true },
    { name: 'Phone', price: 699, inStock: true },
    { name: 'Tablet', price: 399, inStock: false }
  ]
};

// Render the template with data
const result = engine.render(template, data);
console.log(result);
```

### Functional Example

```javascript
const { createTemplateEngine } = require('./interpreter.functional');

// Create a template engine instance
const engine = createTemplateEngine();

// Use same API as class-based implementation
const template = `...`; // Same template as class example
const data = {...};     // Same data as class example

// Render the template with data
const result = engine.render(template, data);
console.log(result);
```

## When to Use the Interpreter Pattern

Consider using the Interpreter pattern when:

- You need to create a domain-specific language
- You have recurring grammar patterns that need evaluation
- The grammar is relatively simple and well-defined
- You need to process hierarchical expressions
- You're building a template engine, query language, or formula evaluator

## Implementation Details

### Class-based Architecture

The class-based implementation uses a hierarchy of expression classes:

- `Expression`: Abstract base class defining the interpret method
- `TextExpression`: Terminal expression for static text
- `VariableExpression`: Terminal expression for variable substitution
- `ConditionalExpression`: Non-terminal expression for if/else blocks
- `LoopExpression`: Non-terminal expression for iteration
- `CompositeExpression`: Non-terminal expression combining multiple expressions

The `TemplateParser` converts template strings into an abstract syntax tree of these expressions, and the `TemplateEngine` manages parsing and evaluation.

### Functional Architecture

The functional implementation uses factory functions to create expression objects:

- `createTextExpression`: Creates text expression objects
- `createVariableExpression`: Creates variable expression objects
- `createConditionalExpression`: Creates conditional expression objects
- `createLoopExpression`: Creates loop expression objects
- `createCompositeExpression`: Creates composite expression objects

Each expression is a plain object with an `interpret` method. The `createTemplateParser` and `createTemplateEngine` functions create the parser and engine objects.

## Performance Considerations

The Interpreter pattern introduces some overhead:

- Parsing templates into ASTs takes time
- Complex expressions create deep object hierarchies
- Evaluating nested expressions requires multiple function calls

To mitigate these costs:

1. **Template Caching**: Parse templates once and cache the resulting AST
2. **Optimized Parsing**: Use efficient algorithms for tokenization and parsing
3. **Minimal Object Creation**: Create only necessary expression objects
4. **Context Management**: Efficiently manage context during interpretation

## Best Practices

1. **Define clear grammar rules**: Make sure your language grammar is well-defined
2. **Keep expressions simple**: Each expression should have a single responsibility
3. **Use composition over inheritance**: Build complex expressions by composing simpler ones
4. **Handle errors gracefully**: Provide clear error messages for invalid syntax
5. **Document your grammar**: Make it easy for users to understand the language
6. **Consider alternatives for complex grammars**: Use parser generators (like PEG.js or Jison) for very complex languages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Influenced by real-world template engines like Handlebars and Liquid

---

If you find this implementation helpful, please consider giving it a star!
