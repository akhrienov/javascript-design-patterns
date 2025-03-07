# Adapter Pattern Implementation in JavaScript

This repository contains a comprehensive implementation and examples of the Adapter Pattern in JavaScript, demonstrating both class-based and functional approaches.

## Overview

The Adapter Pattern provides a way to make incompatible interfaces work together. It acts as a bridge between two interfaces by wrapping an instance of one class into an adapter class that presents the interface expected by clients. This implementation focuses on a Weather Service integration use case, demonstrating practical applications in real-world scenarios.

## Repository Structure

```
patterns/
└── structural/
    └── adapter/
        ├── README.md
        ├── adapter.example.js         # Usage examples
        ├── adapter.implementation.js  # Core implementation
        └── adapter.spec.js            # Test suite
```

## Features

- Two implementation approaches:
   - Class-based Adapter using object-oriented principles
   - Functional approach using closures and factory functions
- Weather Service integration functionality:
   - Interface transformation
   - Data format conversion
   - Unit conversion (Fahrenheit to Celsius)
   - Error handling and validation
- Comprehensive test coverage

## Implementation Details

### Class-based Approach

```javascript
class LegacyWeatherAdapter {
  constructor(legacyAPI, zipCodeMap) {
    this.legacyAPI = legacyAPI;
    this.zipCodeMap = zipCodeMap;
  }
  
  getCurrentTemperature(city) {
    // Find the corresponding zip code
    const zipCode = this._getZipCode(city);
    
    // Call the legacy API
    const legacyData = this.legacyAPI.fetchTemperature(zipCode);
    
    // Convert Fahrenheit to Celsius
    const celsius = this._fahrenheitToCelsius(legacyData.temp);
    
    // Return data in the format expected by our application
    return {
      celsius,
      fahrenheit: legacyData.temp,
      city
    };
  }
  
  getWeatherForecast(city) {
    // Implementation details...
  }
  
  // Helper methods
  _getZipCode(city) {
    const zipCode = this.zipCodeMap[city];
    if (!zipCode) {
      throw new Error(`Unknown city: ${city}`);
    }
    return zipCode;
  }
  
  _fahrenheitToCelsius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5 / 9);
  }
}
```

### Functional Approach

```javascript
function createWeatherAdapter(legacyAPI, zipCodeMap) {
  // Helper functions
  const fahrenheitToCelsius = fahrenheit => 
    Math.round((fahrenheit - 32) * 5 / 9);
  
  const getZipCode = city => {
    const zipCode = zipCodeMap[city];
    if (!zipCode) {
      throw new Error(`Unknown city: ${city}`);
    }
    return zipCode;
  };
  
  // Map for condition conversion
  const conditionsMap = {
    'CLEAR': 'Sunny',
    'PARTIALLY_CLOUDY': 'Cloudy',
    // Other conditions...
  };
  
  return {
    getCurrentTemperature: city => {
      const zipCode = getZipCode(city);
      const legacyData = legacyAPI.fetchTemperature(zipCode);
      
      return {
        celsius: fahrenheitToCelsius(legacyData.temp),
        fahrenheit: legacyData.temp,
        city
      };
    },
    
    getWeatherForecast: city => {
      // Implementation details...
    }
  };
}
```

## Usage Examples

### Basic Usage

```javascript
// Class-based approach
const legacyAPI = new LegacyWeatherAPI();
const zipCodeMap = {
  'New York': '10001',
  'Los Angeles': '90001',
  'Chicago': '60601'
};
const weatherAdapter = new LegacyWeatherAdapter(legacyAPI, zipCodeMap);

// Get weather data using the adapter
const temperature = weatherAdapter.getCurrentTemperature('New York');
console.log(temperature); 
// Output: { celsius: 22, fahrenheit: 71.6, city: 'New York' }

// Functional approach
const functionalAdapter = createWeatherAdapter(legacyAPI, zipCodeMap);
const forecast = functionalAdapter.getWeatherForecast('Chicago');
console.log(forecast);
// Output: [
//   { day: 'Monday', celsius: 22, conditions: 'Sunny' },
//   { day: 'Tuesday', celsius: 19, conditions: 'Cloudy' }
// ]
```

### Factory Pattern Integration

```javascript
function createWeatherServiceFactory(config) {
  if (config.useLegacyAPI) {
    const legacyAPI = new LegacyWeatherAPI();
    
    // Choose adapter implementation based on config
    if (config.useClassBasedAdapter) {
      return new LegacyWeatherAdapter(legacyAPI, config.zipCodeMap);
    } else {
      return createWeatherAdapter(legacyAPI, config.zipCodeMap);
    }
  } else {
    return new ModernWeatherService();
  }
}

// Configuration-based service creation
const config = {
  useLegacyAPI: true,
  useClassBasedAdapter: false,
  zipCodeMap: { 'New York': '10001' }
};

const weatherService = createWeatherServiceFactory(config);
```

## Testing

The implementation includes comprehensive test coverage using Vitest:

```bash
  pnpm test
```

Test suite covers:
- Adapter initialization and configuration
- Interface transformation
- Data format conversion
- Unit conversion accuracy
- Error handling and validation
- Edge cases with invalid or missing data
- API error propagation
- Complex data transformation scenarios
- Comparison between class-based and functional implementations

## Key Considerations

1. **Interface Compatibility**
   - Clear interface definition
   - Consistent method signatures
   - Complete functionality mapping

2. **Data Transformation**
   - Accurate unit conversion
   - Format standardization
   - Proper error handling

3. **Error Handling**
   - Meaningful error messages
   - Appropriate error propagation
   - Graceful degradation

4. **Dependency Management**
   - Loose coupling with adapted systems
   - Injection of required dependencies
   - Configuration flexibility

## Best Practices

1. **Single Responsibility**
   - Keep adapters focused on interface transformation
   - Separate business logic from adaptation logic
   - Use helper methods for common transformations

2. **Encapsulation**
   - Hide implementation details of the adapted system
   - Expose only the expected interface
   - Abstract away complexity

3. **Error Handling**
   - Validate inputs before calling the adapted system
   - Transform errors to match expected formats
   - Provide context in error messages

4. **Testing**
   - Test both the adapter and the integration
   - Mock the adapted system for isolated testing
   - Verify transformation accuracy

## When to Use

The Adapter Pattern is particularly useful when:
- Working with legacy systems that can't be modified
- Integrating third-party libraries with incompatible interfaces
- Making two independent systems work together
- Introducing new systems without disrupting existing code
- Creating reusable code that works with classes that don't share a common interface

## Common Pitfalls to Avoid

1. **Over-adaptation**
   - Don't adapt more than necessary
   - Focus on the interface, not additional functionality
   - Consider a Facade pattern for simplifying complex systems

2. **Performance Impact**
   - Be aware of the overhead from additional method calls
   - Minimize unnecessary data transformations
   - Cache results where appropriate

3. **Error Masking**
   - Don't silently swallow errors from the adapted system
   - Transform errors appropriately
   - Maintain debugging context

4. **Tight Coupling**
   - Avoid hardcoding dependencies
   - Use dependency injection
   - Keep the adapter independent of concrete implementations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Gang of Four Design Patterns
- Modernized for current JavaScript ecosystem
- Enhanced with real-world weather service integration requirements

---

If you find this implementation helpful, please consider giving it a star!