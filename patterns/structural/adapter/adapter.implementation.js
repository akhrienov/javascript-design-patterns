/**
 * @fileoverview Implementation of the Adapter Pattern in JavaScript
 *
 * This file provides both class-based and functional implementations of the Adapter Pattern.
 * The pattern allows objects with incompatible interfaces to work together by wrapping an
 * instance of one class into an adapter that presents the interface expected by clients.
 *
 * @module AdapterPattern
 */

/**
 * Modern Weather Service that our application uses
 * This represents the interface our application expects to work with
 */
class ModernWeatherService {
  /**
   * Get the current temperature for a city
   * @param {string} city - The name of the city
   * @returns {Object} The temperature data in the expected format
   */
  getCurrentTemperature(city) {
    // Implementation details would go here in a real application
    return {
      celsius: 22,
      fahrenheit: 71.6,
      city,
    };
  }

  /**
   * Get the weather forecast for a city
   * @param {string} city - The name of the city
   * @returns {Array} Array of forecast data in the expected format
   */
  getWeatherForecast(city) {
    // Implementation details would go here in a real application
    return [
      { day: 'Monday', celsius: 22, conditions: 'Sunny' },
      { day: 'Tuesday', celsius: 19, conditions: 'Cloudy' },
    ];
  }
}

/**
 * Legacy Weather API that we need to integrate with
 * This represents the incompatible interface we need to adapt
 */
class LegacyWeatherAPI {
  /**
   * Fetch temperature data by zip code
   * @param {string} zipCode - The zip code to fetch data for
   * @returns {Object} The temperature data in the legacy format
   */
  fetchTemperature(zipCode) {
    // Implementation details would go here in a real application
    return {
      temp: 71.6,
      zip: zipCode,
    };
  }

  /**
   * Fetch forecast data by zip code
   * @param {string} zipCode - The zip code to fetch data for
   * @returns {Array} Array of forecast data in the legacy format
   */
  fetchForecastByZip(zipCode) {
    // Implementation details would go here in a real application
    return [
      { date: '2023-06-12', tempF: 71.6, sky: 'CLEAR' },
      { date: '2023-06-13', tempF: 66.2, sky: 'PARTIALLY_CLOUDY' },
    ];
  }
}

/**
 * Class-based implementation of the Weather Adapter
 * This adapter makes the LegacyWeatherAPI compatible with our application's expectations
 */
class LegacyWeatherAdapter {
  /**
   * Create a new adapter for the legacy weather API
   * @param {LegacyWeatherAPI} legacyAPI - The legacy API instance to adapt
   * @param {Object} zipCodeMap - A mapping of city names to zip codes
   */
  constructor(legacyAPI, zipCodeMap) {
    this.legacyAPI = legacyAPI;
    this.zipCodeMap = zipCodeMap;

    // Bind methods to ensure 'this' context
    this.getCurrentTemperature = this.getCurrentTemperature.bind(this);
    this.getWeatherForecast = this.getWeatherForecast.bind(this);
  }

  /**
   * Get the current temperature for a city
   * Adapts the legacy API's fetchTemperature method
   * @param {string} city - The name of the city
   * @returns {Object} The temperature data in the expected format
   * @throws {Error} If the city cannot be found in the zipCodeMap
   */
  getCurrentTemperature(city) {
    // Find the corresponding zip code
    const zipCode = this._getZipCode(city);

    try {
      // Call the legacy API
      const legacyData = this.legacyAPI.fetchTemperature(zipCode);

      // Convert Fahrenheit to Celsius
      const celsius = this._fahrenheitToCelsius(legacyData.temp);

      // Return data in the format expected by our application
      return {
        celsius,
        fahrenheit: legacyData.temp,
        city,
      };
    } catch (error) {
      throw new Error(`Failed to get temperature for ${city}: ${error.message}`);
    }
  }

  /**
   * Get the weather forecast for a city
   * Adapts the legacy API's fetchForecastByZip method
   * @param {string} city - The name of the city
   * @returns {Array} Array of forecast data in the expected format
   * @throws {Error} If the city cannot be found in the zipCodeMap or if there's an API error
   */
  getWeatherForecast(city) {
    // Find the corresponding zip code
    const zipCode = this._getZipCode(city);

    try {
      const legacyForecast = this.legacyAPI.fetchForecastByZip(zipCode);

      // Transform the data to match our expected format
      return legacyForecast.map((item) => {
        // Convert the date to day of week
        const day = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' });

        // Convert Fahrenheit to Celsius
        const celsius = this._fahrenheitToCelsius(item.tempF);

        // Map sky conditions to our format
        const conditions = this._mapSkyConditions(item.sky);

        return {
          day,
          celsius,
          conditions,
        };
      });
    } catch (error) {
      throw new Error(`Failed to get forecast for ${city}: ${error.message}`);
    }
  }

  /**
   * Helper method to get a zip code from a city name
   * @private
   * @param {string} city - The name of the city
   * @returns {string} The corresponding zip code
   * @throws {Error} If the city is not found in the zipCodeMap
   */
  _getZipCode(city) {
    const zipCode = this.zipCodeMap[city];
    if (!zipCode) {
      throw new Error(`Unknown city: ${city}`);
    }
    return zipCode;
  }

  /**
   * Helper method to convert Fahrenheit to Celsius
   * @private
   * @param {number} fahrenheit - Temperature in Fahrenheit
   * @returns {number} Temperature in Celsius, rounded to the nearest integer
   */
  _fahrenheitToCelsius(fahrenheit) {
    return Math.round(((fahrenheit - 32) * 5) / 9);
  }

  /**
   * Helper method to map sky conditions from legacy format to our format
   * @private
   * @param {string} skyCondition - Sky condition in legacy format
   * @returns {string} Sky condition in our application's format
   */
  _mapSkyConditions(skyCondition) {
    const conditionsMap = {
      CLEAR: 'Sunny',
      PARTIALLY_CLOUDY: 'Cloudy',
      OVERCAST: 'Cloudy',
      RAIN: 'Rainy',
      SNOW: 'Snowy',
    };

    return conditionsMap[skyCondition] || 'Unknown';
  }
}

/**
 * Functional implementation of the Weather Adapter
 * This creates an adapter for the LegacyWeatherAPI using a factory function approach
 *
 * @param {LegacyWeatherAPI} legacyAPI - The legacy API instance to adapt
 * @param {Object} zipCodeMap - A mapping of city names to zip codes
 * @returns {Object} An object with methods compatible with ModernWeatherService
 */
function createWeatherAdapter(legacyAPI, zipCodeMap) {
  /**
   * Helper function to convert Fahrenheit to Celsius
   * @param {number} fahrenheit - Temperature in Fahrenheit
   * @returns {number} Temperature in Celsius, rounded to the nearest integer
   */
  const fahrenheitToCelsius = (fahrenheit) => Math.round(((fahrenheit - 32) * 5) / 9);

  /**
   * Helper function to get a zip code from a city name
   * @param {string} city - The name of the city
   * @returns {string} The corresponding zip code
   * @throws {Error} If the city is not found in the zipCodeMap
   */
  const getZipCode = (city) => {
    const zipCode = zipCodeMap[city];
    if (!zipCode) {
      throw new Error(`Unknown city: ${city}`);
    }
    return zipCode;
  };

  /**
   * Map of sky conditions to our format
   */
  const conditionsMap = {
    CLEAR: 'Sunny',
    PARTIALLY_CLOUDY: 'Cloudy',
    OVERCAST: 'Cloudy',
    RAIN: 'Rainy',
    SNOW: 'Snowy',
  };

  return {
    /**
     * Get the current temperature for a city
     * @param {string} city - The name of the city
     * @returns {Object} The temperature data in the expected format
     */
    getCurrentTemperature: (city) => {
      try {
        const zipCode = getZipCode(city);
        const legacyData = legacyAPI.fetchTemperature(zipCode);

        return {
          celsius: fahrenheitToCelsius(legacyData.temp),
          fahrenheit: legacyData.temp,
          city,
        };
      } catch (error) {
        throw new Error(`Failed to get temperature for ${city}: ${error.message}`);
      }
    },

    /**
     * Get the weather forecast for a city
     * @param {string} city - The name of the city
     * @returns {Array} Array of forecast data in the expected format
     */
    getWeatherForecast: (city) => {
      try {
        const zipCode = getZipCode(city);
        const legacyForecast = legacyAPI.fetchForecastByZip(zipCode);

        return legacyForecast.map((item) => {
          const day = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' });

          return {
            day,
            celsius: fahrenheitToCelsius(item.tempF),
            conditions: conditionsMap[item.sky] || 'Unknown',
          };
        });
      } catch (error) {
        throw new Error(`Failed to get forecast for ${city}: ${error.message}`);
      }
    },
  };
}

export { ModernWeatherService, LegacyWeatherAPI, LegacyWeatherAdapter, createWeatherAdapter };
