/**
 * @fileoverview Tests for the Adapter Pattern Implementation
 *
 * This file contains tests for both class-based and functional implementations
 * of the Adapter Pattern from adapter.implementation.js.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ModernWeatherService,
  LegacyWeatherAPI,
  LegacyWeatherAdapter,
  createWeatherAdapter,
} from './adapter.implementation.js';

describe('Adapter Pattern Implementation', () => {
  // Setup test data
  const testZipCodeMap = {
    'New York': '10001',
    'Los Angeles': '90001',
    Chicago: '60601',
  };

  // Mock legacy data responses
  const mockTempResponse = { temp: 75.2, zip: '10001' };
  const mockForecastResponse = [
    { date: '2023-06-12', tempF: 75.2, sky: 'CLEAR' },
    { date: '2023-06-13', tempF: 68.0, sky: 'PARTIALLY_CLOUDY' },
  ];

  describe('ModernWeatherService', () => {
    it('should get current temperature for a city', () => {
      const service = new ModernWeatherService();
      const result = service.getCurrentTemperature('New York');

      expect(result).toHaveProperty('celsius');
      expect(result).toHaveProperty('fahrenheit');
      expect(result).toHaveProperty('city', 'New York');
    });

    it('should get weather forecast for a city', () => {
      const service = new ModernWeatherService();
      const result = service.getWeatherForecast('New York');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('celsius');
      expect(result[0]).toHaveProperty('conditions');
    });
  });

  describe('LegacyWeatherAdapter (Class-based)', () => {
    let legacyAPI;
    let adapter;

    beforeEach(() => {
      // Create a mock legacy API with spy methods
      legacyAPI = new LegacyWeatherAPI();
      vi.spyOn(legacyAPI, 'fetchTemperature').mockReturnValue(mockTempResponse);
      vi.spyOn(legacyAPI, 'fetchForecastByZip').mockReturnValue(mockForecastResponse);

      // Create the adapter with the mock API
      adapter = new LegacyWeatherAdapter(legacyAPI, testZipCodeMap);
    });

    it('should adapt fetchTemperature to getCurrentTemperature', () => {
      const result = adapter.getCurrentTemperature('New York');

      // Verify the legacy API was called with the correct zip code
      expect(legacyAPI.fetchTemperature).toHaveBeenCalledWith('10001');

      // Verify the result has the expected structure
      expect(result).toEqual({
        celsius: 24, // 75.2°F converted to Celsius and rounded
        fahrenheit: 75.2,
        city: 'New York',
      });
    });

    it('should adapt fetchForecastByZip to getWeatherForecast', () => {
      const result = adapter.getWeatherForecast('Chicago');

      // Verify the legacy API was called with the correct zip code
      expect(legacyAPI.fetchForecastByZip).toHaveBeenCalledWith('60601');

      // Verify the result has the expected structure and transformations
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      // Verify first forecast item
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('celsius', 24); // 75.2°F converted
      expect(result[0]).toHaveProperty('conditions', 'Sunny'); // CLEAR mapped to Sunny

      // Verify second forecast item
      expect(result[1]).toHaveProperty('day');
      expect(result[1]).toHaveProperty('celsius', 20); // 68.0°F converted
      expect(result[1]).toHaveProperty('conditions', 'Cloudy'); // PARTIALLY_CLOUDY mapped
    });

    it('should throw an error for unknown cities', () => {
      expect(() => {
        adapter.getCurrentTemperature('Unknown City');
      }).toThrow('Unknown city: Unknown City');

      expect(() => {
        adapter.getWeatherForecast('Unknown City');
      }).toThrow('Unknown city: Unknown City');
    });

    it('should handle API errors gracefully', () => {
      // Force the legacy API to throw an error
      legacyAPI.fetchTemperature.mockImplementation(() => {
        throw new Error('API connection failed');
      });

      expect(() => {
        adapter.getCurrentTemperature('New York');
      }).toThrow('Failed to get temperature for New York: API connection failed');
    });
  });

  describe('createWeatherAdapter (Functional)', () => {
    let legacyAPI;
    let adapter;

    beforeEach(() => {
      // Create a mock legacy API with spy methods
      legacyAPI = new LegacyWeatherAPI();
      vi.spyOn(legacyAPI, 'fetchTemperature').mockReturnValue(mockTempResponse);
      vi.spyOn(legacyAPI, 'fetchForecastByZip').mockReturnValue(mockForecastResponse);

      // Create the adapter with the mock API
      adapter = createWeatherAdapter(legacyAPI, testZipCodeMap);
    });

    it('should adapt fetchTemperature to getCurrentTemperature', () => {
      const result = adapter.getCurrentTemperature('New York');

      // Verify the legacy API was called with the correct zip code
      expect(legacyAPI.fetchTemperature).toHaveBeenCalledWith('10001');

      // Verify the result has the expected structure
      expect(result).toEqual({
        celsius: 24, // 75.2°F converted to Celsius and rounded
        fahrenheit: 75.2,
        city: 'New York',
      });
    });

    it('should adapt fetchForecastByZip to getWeatherForecast', () => {
      const result = adapter.getWeatherForecast('Los Angeles');

      // Verify the legacy API was called with the correct zip code
      expect(legacyAPI.fetchForecastByZip).toHaveBeenCalledWith('90001');

      // Verify the result has the expected structure and transformations
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      // Verify first forecast item
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('celsius', 24); // 75.2°F converted
      expect(result[0]).toHaveProperty('conditions', 'Sunny'); // CLEAR mapped to Sunny
    });

    it('should throw an error for unknown cities', () => {
      expect(() => {
        adapter.getCurrentTemperature('Unknown City');
      }).toThrow('Failed to get temperature for Unknown City: Unknown city: Unknown City');
    });

    it('should handle API errors gracefully', () => {
      // Force the legacy API to throw an error
      legacyAPI.fetchTemperature.mockImplementation(() => {
        throw new Error('Network timeout');
      });

      expect(() => {
        adapter.getCurrentTemperature('New York');
      }).toThrow('Failed to get temperature for New York: Network timeout');
    });
  });

  describe('Comparison between implementations', () => {
    it('should produce identical results from both adapter implementations', () => {
      // Setup
      const legacyAPI = new LegacyWeatherAPI();
      vi.spyOn(legacyAPI, 'fetchTemperature').mockReturnValue(mockTempResponse);
      vi.spyOn(legacyAPI, 'fetchForecastByZip').mockReturnValue(mockForecastResponse);

      const classAdapter = new LegacyWeatherAdapter(legacyAPI, testZipCodeMap);
      const funcAdapter = createWeatherAdapter(legacyAPI, testZipCodeMap);

      // Test temperature results
      const classTemp = classAdapter.getCurrentTemperature('New York');
      const funcTemp = funcAdapter.getCurrentTemperature('New York');

      expect(classTemp).toEqual(funcTemp);

      // Test forecast results
      const classForecast = classAdapter.getWeatherForecast('Chicago');
      const funcForecast = funcAdapter.getWeatherForecast('Chicago');

      expect(classForecast).toEqual(funcForecast);
    });
  });

  describe('Real-world error scenarios', () => {
    let legacyAPI;
    let classAdapter;
    let funcAdapter;

    beforeEach(() => {
      legacyAPI = new LegacyWeatherAPI();
      classAdapter = new LegacyWeatherAdapter(legacyAPI, testZipCodeMap);
      funcAdapter = createWeatherAdapter(legacyAPI, testZipCodeMap);
    });

    it('should handle null data from legacy API in class adapter', () => {
      vi.spyOn(legacyAPI, 'fetchTemperature').mockReturnValue(null);

      expect(() => {
        classAdapter.getCurrentTemperature('New York');
      }).toThrow();
    });

    it('should handle null data from legacy API in functional adapter', () => {
      vi.spyOn(legacyAPI, 'fetchTemperature').mockReturnValue(null);

      expect(() => {
        funcAdapter.getCurrentTemperature('New York');
      }).toThrow();
    });

    it('should handle malformed data from legacy API', () => {
      vi.spyOn(legacyAPI, 'fetchTemperature').mockReturnValue({
        wrongProperty: 'wrong value',
      });

      expect(() => {
        classAdapter.getCurrentTemperature('New York');
      }).not.toThrow();

      // The result will have NaN for celsius since the temperature conversion failed
      const result = classAdapter.getCurrentTemperature('New York');
      expect(result.celsius).toBeNaN();
    });
  });
});
