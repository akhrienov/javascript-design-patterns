# Composite Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Composite Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Composite Pattern allows you to compose objects into tree structures to represent part-whole hierarchies. It lets clients treat individual objects and compositions of objects uniformly. This implementation focuses on a Content Management System and UI Component architecture, demonstrating practical applications in real-world scenarios.

## Repository Structure

```
patterns/
└── structural/
    └── composite/
        ├── README.md
        ├── composite.implementation.js  # Class-based implementation
        ├── composite.functional.js      # Functional implementation
        ├── composite.example.js         # Usage examples
        ├── composite.spec.js            # Test suite
        └── demo.js                      # Demo script
```

## Features

- Two implementation approaches:
  - Class-based Composite using inheritance
  - Functional approach using factory functions
- Content Management System:
  - Hierarchical document structure
  - Tree traversal capabilities
  - Filtering and searching
  - File size calculations
- UI Component Architecture:
  - Component hierarchy
  - HTML rendering
  - Event handling structure
  - Dynamic component composition
- Comprehensive test coverage

## Implementation Details

### Class-based Approach

```javascript
export class Component {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  // Operations that make sense for both leaf and composite nodes
  display(indent = 0) {
    console.log(' '.repeat(indent) + this.getName());
  }

  // Helper method to check if this is a composite
  isComposite() {
    return false;
  }

  // Common operation: count all descendants
  count() {
    return 1; // A single node counts as 1
  }
}

export class Leaf extends Component {
  constructor(name, metadata = {}) {
    super(name);
    this.metadata = metadata;
  }

  getMetadata() {
    return this.metadata;
  }
}

export class Composite extends Component {
  constructor(name, metadata = {}) {
    super(name);
    this.children = [];
    this.metadata = metadata;
  }

  add(component) {
    this.children.push(component);
    return this;
  }

  remove(component) {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
    return this;
  }

  isComposite() {
    return true;
  }

  count() {
    return 1 + this.children.reduce((sum, child) => sum + child.count(), 0);
  }
}
```

### Functional Approach

```javascript
export const createComponent = (name) => {
  return {
    name,
    getName: () => name,
    display: (indent = 0) => {
      console.log(' '.repeat(indent) + name);
    },
    isComposite: () => false,
    count: () => 1,
  };
};

export const createLeaf = (name, metadata = {}) => {
  const baseComponent = createComponent(name);

  return {
    ...baseComponent,
    metadata,
    getMetadata: () => metadata,
    display: (indent = 0) => {
      console.log(' '.repeat(indent) + `- ${name} ${JSON.stringify(metadata)}`);
    },
  };
};

export const createComposite = (name, metadata = {}) => {
  const baseComponent = createComponent(name);
  const children = [];

  const composite = {
    ...baseComponent,
    metadata,
    add: (component) => {
      children.push(component);
      return composite;
    },
    remove: (component) => {
      const index = children.indexOf(component);
      if (index !== -1) {
        children.splice(index, 1);
      }
      return composite;
    },
    getChildren: () => [...children],
    isComposite: () => true,
    count: () => {
      return 1 + children.reduce((sum, child) => sum + child.count(), 0);
    },
  };

  return composite;
};
```

## Usage Examples

### Content Management System

```javascript
// Create a hierarchical document structure
const projectRoot = new Folder('Project X');

// Add content folders
const docsFolder = new Folder('Documents');
const mediaFolder = new Folder('Media');

// Add documents to the docs folder
docsFolder.add(
  new Document('Requirements.doc', {
    author: 'John Doe',
    content: 'Project requirements and specifications...',
  })
);

// Add media files to the media folder
mediaFolder.add(
  new MediaFile('logo.png', {
    contentType: ContentType.IMAGE,
    size: 245760,
    dimensions: { width: 1200, height: 800 },
  })
);

// Compose the structure
projectRoot.add(docsFolder);
projectRoot.add(mediaFolder);

// Display the structure
projectRoot.display();

// Find all documents
const allDocuments = projectRoot.findAllDocuments();
console.log(`Total documents: ${allDocuments.length}`);

// Calculate total size
console.log(`Total size: ${projectRoot.getTotalSize()} bytes`);
```

### UI Component Tree

```javascript
// Create a UI component tree using the functional approach
const loginForm = createContainer('LoginForm', {
  id: 'login-form',
  className: 'form-container',
});

// Add a header
loginForm.add(
  createText('FormHeader', {
    content: 'User Login',
  })
);

// Add input fields
loginForm.add(
  createInput('UsernameInput', {
    id: 'username',
    placeholder: 'Enter username',
  })
);

loginForm.add(
  createButton('LoginButton', {
    id: 'login-btn',
    text: 'Login',
  })
);

// Display the component structure
loginForm.display();

// Generate HTML
const html = renderToHTML(loginForm);
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
pnpm test
```

Test suite covers:

- Component creation and manipulation
- Leaf and composite operations
- Tree traversal and iteration
- Real-world examples
- Edge cases and error handling

## Key Considerations

1. **Traversal Strategies**

   - Depth-first traversal
   - Iterators and generators
   - Visitor pattern integration

2. **Performance**

   - Efficient tree operations
   - Lazy evaluation options
   - Memory usage optimization

3. **Object Composition**
   - Tree structure management
   - Recursive operations
   - Common interface for all node types

## Practical Applications

The Composite Pattern is especially useful for:

- File system structures
- UI component hierarchies
- Organization charts
- Menu systems
- Document object models
- XML/HTML parsing
- Recursive data structures

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world web application requirements

---

If you find this implementation helpful, please consider giving it a star!
