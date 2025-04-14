# Strategy Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Strategy Pattern in JavaScript, demonstrating both class-based and functional approaches. The implementation focuses on real-world content formatting and data export systems, showcasing practical applications in enterprise scenarios.

## Overview

The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime. It lets the algorithm vary independently from clients that use it. Our implementation demonstrates how this pattern enables flexible, adaptable systems where behavior can be changed dynamically without modifying the core logic.

## Repository Structure

```
patterns/
└── behavioral/
    └── strategy/
        ├── README.md
        ├── strategy.example.js           # Class-based content formatting implementation
        ├── strategy.functional.js        # Functional content formatting implementation
        ├── strategy.implementation.js    # Real-world data export implementation
        └── strategy.spec.js              # Test suite
```

## Features

- Two implementation approaches:
    - Class-based Strategy using ES6 classes with inheritance
    - Functional approach using higher-order functions and closures
- Content Formatting System:
    - Multiple formatting strategies (plain text, HTML, Markdown, SEO)
    - Strategy swapping at runtime
    - Extensible design for adding new formatting strategies
- Data Export System:
    - Multiple export formats (CSV, JSON, XML, SQL)
    - Customizable export options
    - Strategy factory for simplified creation
    - Dynamic strategy selection
- Comprehensive test coverage with Vitest:
    - Core implementation testing
    - Integration testing with real-world scenarios
    - Testing both implementation approaches

## Implementation Details

### Class-based Approach

```javascript
// Strategy interface
class ContentFormatter {
  format(content) {
    throw new Error('format() method must be implemented by concrete strategies');
  }
}

// Concrete strategy: Plain Text Formatter
class PlainTextFormatter extends ContentFormatter {
  format(content) {
    // Strip all HTML tags and markdown syntax
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/[*_~`#]/g, '')
      .replace(/\n{3,}/g, '\n\n');
  }
}

// Concrete strategy: HTML Formatter
class HTMLFormatter extends ContentFormatter {
  format(content) {
    // Convert markdown-like syntax to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^(.+)$/gm, function(match) {
        return match.startsWith('<') ? match : `<p>${match}</p>`;
      });
  }
}

// Context class
class ContentPublisher {
  constructor(formatter) {
    this.formatter = formatter;
    this.content = '';
  }
  
  setContent(content) {
    this.content = content;
  }
  
  setFormatter(formatter) {
    this.formatter = formatter;
  }
  
  publish() {
    if (!this.formatter) {
      throw new Error('Formatter strategy not set');
    }
    
    return this.formatter.format(this.content);
  }
}
```

### Functional Approach

```javascript
// Strategy functions
const plainTextFormatter = () => {
  return content => {
    // Strip all HTML tags and markdown syntax
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/[*_~`#]/g, '')
      .replace(/\n{3,}/g, '\n\n');
  };
};

const htmlFormatter = () => {
  return content => {
    // Convert markdown-like syntax to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^(.+)$/gm, function(match) {
        return match.startsWith('<') ? match : `<p>${match}</p>`;
      });
  };
};

// Context function
const createContentPublisher = (initialFormatter) => {
  let formatter = initialFormatter;
  let content = '';
  
  return {
    setContent: (newContent) => {
      content = newContent;
    },
    
    setFormatter: (newFormatter) => {
      formatter = newFormatter;
    },
    
    publish: () => {
      if (!formatter) {
        throw new Error('Formatter strategy not set');
      }
      
      return formatter(content);
    }
  };
};

// Strategy composition
const compositeFormatter = (...formatters) => {
  return content => {
    // Apply each formatter in sequence
    return formatters.reduce((formattedContent, formatter) => {
      return formatter(formattedContent);
    }, content);
  };
};
```

## Real-World Example: Data Export System

Our implementation includes a robust data export system that demonstrates the Strategy pattern in action. This system:

1. Exports data in multiple formats (CSV, JSON, XML, SQL)
2. Provides customizable export options for each format
3. Uses a strategy factory to simplify strategy creation
4. Demonstrates how to select strategies dynamically

### Export Strategies

```javascript
// Base strategy interface
class DataExportStrategy {
  export(data, options = {}) {
    throw new Error('export() method must be implemented by concrete strategies');
  }
}

// CSV Export Strategy
class CSVExportStrategy extends DataExportStrategy {
  export(data, options = {}) {
    const { delimiter = ',', includeHeaders = true } = options;
    
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }
    
    const headers = Object.keys(data[0]);
    let csv = '';
    
    // Add headers
    if (includeHeaders) {
      csv += headers.join(delimiter) + '\n';
    }
    
    // Add rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        
        // Handle special cases (delimiters, quotes, etc.)
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string' && (
          value.includes(delimiter) || 
          value.includes('"') || 
          value.includes('\n')
        )) {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return String(value);
        }
      });
      
      csv += values.join(delimiter) + '\n';
    });
    
    return csv;
  }
}

// JSON Export Strategy
class JSONExportStrategy extends DataExportStrategy {
  export(data, options = {}) {
    const { pretty = false, replacer = null } = options;
    
    if (pretty) {
      return JSON.stringify(data, replacer, 2);
    } else {
      return JSON.stringify(data, replacer);
    }
  }
}

// Context class for data export
class DataExporter {
  constructor(strategy) {
    this.strategy = strategy;
    this.data = [];
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  setData(data) {
    this.data = data;
  }
  
  export(options = {}) {
    if (!this.strategy) {
      throw new Error('Export strategy not set');
    }
    
    return this.strategy.export(this.data, options);
  }
}

// Factory to create export strategies
class ExportStrategyFactory {
  static createStrategy(format, options = {}) {
    switch (format.toLowerCase()) {
      case 'csv':
        return new CSVExportStrategy();
      case 'json':
        return new JSONExportStrategy();
      case 'xml':
        return new XMLExportStrategy();
      case 'sql':
        return new SQLExportStrategy();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}
```

## Usage Examples

### Class-based Approach

```javascript
// Create a content publisher with initial strategy
const publisher = new ContentPublisher(new PlainTextFormatter());

// Set content
publisher.setContent(`
Welcome to our **Strategy Pattern** tutorial.

This is a *design pattern* that allows you to define a family of algorithms,
encapsulate each one, and make them interchangeable at runtime.
`);

// Publish with current (plain text) strategy
console.log(publisher.publish());
// Output: Plain text with no formatting markers

// Change strategy to HTML and publish again
publisher.setFormatter(new HTMLFormatter());
console.log(publisher.publish());
// Output: HTML with proper tags (<strong>, <em>, <p>)

// Change strategy to SEO-enhanced and publish again
publisher.setFormatter(new SEOFormatter(['Strategy Pattern'], 
  'Learn about the Strategy Pattern for flexible algorithm selection'));
console.log(publisher.publish());
// Output: HTML with SEO enhancements
```

### Functional Approach

```javascript
// Create a content publisher with initial strategy
const publisher = createContentPublisher(plainTextFormatter());

// Set content
publisher.setContent(`
Welcome to our **Strategy Pattern** tutorial.

This is a *design pattern* that allows you to define a family of algorithms,
encapsulate each one, and make them interchangeable at runtime.
`);

// Publish with current (plain text) strategy
console.log(publisher.publish());
// Output: Plain text with no formatting markers

// Change strategy to HTML and publish again
publisher.setFormatter(htmlFormatter());
console.log(publisher.publish());
// Output: HTML with proper tags (<strong>, <em>, <p>)

// Use composite formatter (combine multiple strategies)
const enhancedFormatter = compositeFormatter(
  htmlFormatter(),
  seoFormatter(['Strategy Pattern'], 'Enhanced with SEO features')
);
  
publisher.setFormatter(enhancedFormatter);
console.log(publisher.publish());
// Output: HTML with SEO enhancements
```

### Data Export Example

```javascript
// Sample analytics data
const analyticsData = [
  { 
    date: '2023-01-01', 
    pageViews: 1250, 
    uniqueVisitors: 864 
  },
  { 
    date: '2023-01-02', 
    pageViews: 1315, 
    uniqueVisitors: 954 
  }
];

// Create exporter with initial strategy
const exporter = new DataExporter(
  ExportStrategyFactory.createStrategy('csv')
);

// Set data
exporter.setData(analyticsData);

// Export as CSV
console.log(exporter.export({ delimiter: ',' }));
// Output: CSV formatted data

// Change strategy to JSON and export
exporter.setStrategy(ExportStrategyFactory.createStrategy('json'));
console.log(exporter.export({ pretty: true }));
// Output: Formatted JSON data

// Change to XML strategy and export
exporter.setStrategy(ExportStrategyFactory.createStrategy('xml'));
console.log(exporter.export({ rootElement: 'analytics', itemElement: 'day' }));
// Output: XML formatted data
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:
- Strategy selection and execution
- Context behavior with different strategies
- Strategy swapping at runtime
- Error handling for invalid states
- Export options customization
- Strategy composition (functional approach)
- Factory pattern integration
- Edge cases like empty data sets

## Key Considerations

1. **Strategy Encapsulation**
    - Each algorithm is fully encapsulated
    - Common interface for all strategies
    - Strategy independence from context
    - Clear responsibility separation

2. **Context Management**
    - Strategy storage and execution
    - Runtime strategy switching
    - Proper error handling
    - Data and strategy coordination

3. **Implementation Approaches**
    - Class-based for inheritance hierarchies
    - Functional for flexibility and composition
    - Hybrid approaches for complex systems
    - Strategy composition for advanced use cases

4. **Factory Integration**
    - Simplified strategy creation
    - Consistent strategy instantiation
    - Strategy selection logic separation
    - Dynamic strategy resolution

## Practical Applications

The Strategy Pattern is especially useful for:

- Content formatting and rendering systems
- Data processing and export frameworks
- Payment processing systems
- Authentication mechanisms
- Validation frameworks
- Sorting and filtering operations
- Compression and encryption utilities
- Tax calculation systems
- Route finding algorithms
- Game AI behavior systems

## When to Use Strategy Pattern

The Strategy Pattern is most beneficial when:

- Multiple algorithms or behaviors exist for a specific operation
- You need to select algorithms at runtime
- You want to avoid conditional statements for selecting behavior
- Related algorithms contain variations of the same behavior
- An algorithm uses data the client shouldn't know about
- A class defines many behaviors through conditional statements

## When Not to Use Strategy Pattern

Avoid using the Strategy Pattern when:

- There are only a few algorithms with minimal variation
- Algorithms rarely change once selected
- The overhead of multiple strategy classes is not justified
- The strategies and context are tightly coupled
- The application is simple enough that basic conditionals would suffice

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Strategy Pattern as described in the Gang of Four's Design Patterns book
- Modernized for modern JavaScript using ES6+ features
- Enhanced with practical examples drawn from real-world enterprise applications
- Built with clean architecture principles for maintainable, testable code

---

If you find this implementation helpful for understanding the Strategy Pattern, please consider giving it a star!