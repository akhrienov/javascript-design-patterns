# Abstract Factory Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Abstract Factory pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Abstract Factory pattern provides an interface for creating families of related or dependent objects without specifying their concrete classes. This implementation focuses on a UI Component System use case, demonstrating practical applications in real-world scenarios.

## Repository Structure
```
patterns/
└── creational/
    └── abstract-factory/
        ├── README.md
        ├── abstract-factory.example.js        # Usage examples
        ├── abstract-factory.implementation.js # Core implementation
        └── abstract-factory.spec.js           # Test suite
```

## Features
- Two implementation approaches:
    - Class-based Abstract Factory using inheritance
    - Functional approach using factory functions
- UI Component System functionality:
    - Multiple theme support (Material Design, iOS)
    - Component rendering
    - Event handling
    - Dynamic theme switching
- Comprehensive test coverage

## Implementation Details

### Class-based Approach
```javascript
export class UIFactory {
  createButton(label) {
    throw new Error("UIFactory must implement createButton method");
  }

  createInput(placeholder) {
    throw new Error("UIFactory must implement createInput method");
  }
}

export class MaterialUIFactory extends UIFactory {
  createButton(label) {
    return new MaterialButton(label);
  }

  createInput(placeholder) {
    return new MaterialInput(placeholder);
  }
}
```

### Functional Approach
```javascript
export const createUIFactory = (style) => ({
  createButton: (label) => createButton(style, label),
  createInput: (placeholder) => createInput(style, placeholder)
});

export const createButton = (style, label = "Click me") => ({
  render: () => ({
    type: `${style}-button`,
    props: {
      label,
      styles: styles[style]
    }
  }),
  onClick: (callback) => ({
    type: "click",
    handler: callback
  })
});
```

## Usage Examples

### Basic Usage
```javascript
// Class-based approach
const materialFactory = new MaterialUIFactory();
const materialButton = materialFactory.createButton("Submit");
const materialInput = materialFactory.createInput("Enter name");

// Functional approach
const iosFactory = createUIFactory('ios');
const iosButton = iosFactory.createButton("Submit");
const iosInput = iosFactory.createInput("Enter name");
```

### Creating Complete UI with Theme Support
```javascript
const createUI = (theme, config) => {
  const factory = theme === 'material' 
    ? new MaterialUIFactory()
    : new IOSUIFactory();

  return {
    button: factory.createButton(config.buttonLabel).render(),
    input: factory.createInput(config.inputPlaceholder).render()
  };
};
```

## Testing

The implementation includes comprehensive test coverage using Vitest:
```bash
pnpm test
```

Test suite covers:
- Factory creation
- Component rendering
- Event handling
- Theme switching
- Edge cases and error handling

## Key Considerations

1. **Extensibility**
    - Easy addition of new themes
    - Consistent interface across implementations
    - Support for theme-specific configurations

2. **Component Consistency**
    - Uniform component interfaces
    - Consistent styling within themes
    - Standardized event handling

3. **Performance**
    - Efficient component creation
    - Optimized rendering
    - Minimal memory footprint

## Modern Framework Integration

The pattern can be seamlessly integrated with modern frameworks:

### React Integration
```javascript
const ThemeContext = React.createContext('material');

export const ThemeProvider = ({ theme, children }) => {
  const factory = theme === 'material' 
    ? new MaterialUIFactory()
    : new IOSUIFactory();
    
  return (
    <ThemeContext.Provider value={factory}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Vue Integration
```javascript
const UIPlugin = {
  install(Vue, options = {}) {
    const factory = options.theme === 'material'
      ? new MaterialUIFactory()
      : new IOSUIFactory();
      
    Vue.prototype.$ui = factory;
  }
};
```

## Best Practices

1. **Theme Consistency**
    - Maintain consistent component APIs across themes
    - Use theme-specific styling conventions
    - Implement complete component families

2. **Error Handling**
    - Validate factory creation parameters
    - Handle missing implementations gracefully
    - Provide meaningful error messages

3. **Testing Strategy**
    - Test each factory implementation separately
    - Verify component consistency across themes
    - Test integration with frameworks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world UI component requirements

---

If you find this implementation helpful, please consider giving it a star!