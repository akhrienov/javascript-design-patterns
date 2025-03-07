/**
 * @fileoverview Examples of using the Adapter Pattern
 *
 * This file demonstrates how to use both the class-based and functional
 * implementations of the Adapter Pattern from adapter.implementation.js.
 */

import {
  ModernWeatherService,
  LegacyWeatherAPI,
  LegacyWeatherAdapter,
  createWeatherAdapter,
} from './adapter.implementation.js';

/**
 * Example 1: Using the Modern Weather Service directly
 * This represents how our application would use the service if we didn't need adaptation
 */
function useModernWeatherService() {
  console.log('\n--- Using Modern Weather Service Directly ---');

  const weatherService = new ModernWeatherService();

  // Get current temperature
  const temperature = weatherService.getCurrentTemperature('New York');
  console.log('Current temperature:', temperature);

  // Get forecast
  const forecast = weatherService.getWeatherForecast('New York');
  console.log('Weather forecast:', forecast);
}

/**
 * Example 2: Using the Legacy API with Class-based Adapter
 * This demonstrates how we can adapt the legacy API to work with our application
 */
function useLegacyAPIWithClassAdapter() {
  console.log('\n--- Using Legacy API with Class-based Adapter ---');

  // Set up the legacy API
  const legacyAPI = new LegacyWeatherAPI();

  // Create a mapping from city names to zip codes
  const zipCodeMap = {
    'New York': '10001',
    'Los Angeles': '90001',
    Chicago: '60601',
    'San Francisco': '94105',
  };

  // Create the adapter
  const weatherAdapter = new LegacyWeatherAdapter(legacyAPI, zipCodeMap);

  // Now use the adapter just like we would use the modern service
  try {
    const temperature = weatherAdapter.getCurrentTemperature('New York');
    console.log('Current temperature via adapter:', temperature);

    const forecast = weatherAdapter.getWeatherForecast('Chicago');
    console.log('Weather forecast via adapter:', forecast);

    // This will throw an error because Miami is not in our zipCodeMap
    try {
      const miamiTemp = weatherAdapter.getCurrentTemperature('Miami');
    } catch (error) {
      console.error('Expected error:', error.message);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Example 3: Using the Legacy API with Functional Adapter
 * This demonstrates the functional approach to adaptation
 */
function useLegacyAPIWithFunctionalAdapter() {
  console.log('\n--- Using Legacy API with Functional Adapter ---');

  // Set up the legacy API
  const legacyAPI = new LegacyWeatherAPI();

  // Create a mapping from city names to zip codes
  const zipCodeMap = {
    'New York': '10001',
    'Los Angeles': '90001',
    Chicago: '60601',
    'San Francisco': '94105',
  };

  // Create the adapter using the functional approach
  const weatherAdapter = createWeatherAdapter(legacyAPI, zipCodeMap);

  // Now use the adapter just like we would use the modern service
  try {
    const temperature = weatherAdapter.getCurrentTemperature('New York');
    console.log('Current temperature via functional adapter:', temperature);

    const forecast = weatherAdapter.getWeatherForecast('Chicago');
    console.log('Weather forecast via functional adapter:', forecast);

    // This will throw an error because Miami is not in our zipCodeMap
    try {
      const miamiTemp = weatherAdapter.getCurrentTemperature('Miami');
    } catch (error) {
      console.error('Expected error:', error.message);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Compare the results of both adapter implementations
 * They should produce identical results
 */
function compareAdapters() {
  console.log('\n--- Comparing Both Adapter Implementations ---');

  const legacyAPI = new LegacyWeatherAPI();
  const zipCodeMap = {
    'New York': '10001',
  };

  // Create both types of adapters
  const classAdapter = new LegacyWeatherAdapter(legacyAPI, zipCodeMap);
  const funcAdapter = createWeatherAdapter(legacyAPI, zipCodeMap);

  // Get temperature from both
  const classTemp = classAdapter.getCurrentTemperature('New York');
  const funcTemp = funcAdapter.getCurrentTemperature('New York');

  console.log('Class adapter temperature:', classTemp);
  console.log('Functional adapter temperature:', funcTemp);
  console.log('Results are identical:', JSON.stringify(classTemp) === JSON.stringify(funcTemp));

  // Get forecast from both
  const classForecast = classAdapter.getWeatherForecast('New York');
  const funcForecast = funcAdapter.getWeatherForecast('New York');

  console.log(
    'Class adapter forecast is equivalent to functional adapter forecast:',
    JSON.stringify(classForecast) === JSON.stringify(funcForecast)
  );
}

/**
 * In a real-world application, you might want to create a factory that decides
 * which weather service implementation to use based on configuration
 */
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

/**
 * Main function to run all examples
 */
function runExamples() {
  useModernWeatherService();
  useLegacyAPIWithClassAdapter();
  useLegacyAPIWithFunctionalAdapter();
  compareAdapters();

  // Example of using the factory
  console.log('\n--- Using Weather Service Factory ---');

  const config = {
    useLegacyAPI: true,
    useClassBasedAdapter: false,
    zipCodeMap: {
      'New York': '10001',
      'Los Angeles': '90001',
    },
  };

  const weatherService = createWeatherServiceFactory(config);
  console.log('Factory created weather service:', weatherService.getCurrentTemperature('New York'));
}

runExamples();
