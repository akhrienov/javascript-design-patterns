/**
 * This example shows how the Memento pattern can be used in an enterprise setting
 * to manage application configuration with audit trail and rollback capabilities.
 */

// Import both implementations
import { ConfigurationManager, ConfigurationHistory } from './memento.implementation.js';
import { createConfigurationManager, createConfigurationHistory } from './memento.functional.js';

/**
 * Example using the class-based implementation
 */
function demoClassBasedImplementation() {
  console.log('==== CLASS-BASED IMPLEMENTATION DEMO ====');

  // Initialize with default settings
  const configManager = new ConfigurationManager({
    theme: 'light',
    language: 'en',
    notifications: true,
    performanceMode: false,
    refreshRate: 60,
    dataRetention: 30,
    maxConcurrentConnections: 5,
  });

  // Create a history manager
  const history = new ConfigurationHistory(10);

  // Add a change listener to log all configuration changes
  configManager.addChangeListener(({ key, oldValue, newValue, source }) => {
    console.log(
      `Setting changed: ${key} from ${oldValue} to ${newValue} ${source ? `(via ${source})` : ''}`
    );
  });

  // Save initial state
  console.log('Initial configuration:', configManager.getConfiguration());
  history.addMemento(configManager.save('Initial configuration'));

  // Simulate user changing theme preference
  console.log('\nSimulating user changing theme to dark...');
  configManager.updateSetting('theme', 'dark');
  history.addMemento(configManager.save('User changed theme to dark'));

  // Simulate system detected lower performance and adjusts settings
  console.log('\nSimulating system performance optimization...');
  configManager.updateSettings({
    performanceMode: true,
    refreshRate: 30,
    maxConcurrentConnections: 3,
  });
  history.addMemento(configManager.save('System performance optimization'));

  // Simulate user changing language
  console.log('\nSimulating user changing language to fr...');
  configManager.updateSetting('language', 'fr');
  history.addMemento(configManager.save('User changed language to French'));

  // View the current state
  console.log('\nCurrent configuration:', configManager.getConfiguration());

  // View the history with metadata
  console.log('\nConfiguration history:');
  const historyItems = history.getHistory();
  historyItems.forEach((item, index) => {
    console.log(
      `${index}: ${item.description} (${item.timestamp.toISOString()})${item.isCurrent ? ' *CURRENT*' : ''}`
    );
  });

  // Undo the last change (language change)
  console.log('\nUndo last change (language change)...');
  const previousState = history.undo();
  if (previousState) {
    configManager.restore(previousState);
    console.log('Restored configuration:', configManager.getConfiguration());
  }

  // Undo again (performance changes)
  console.log('\nUndo again (performance changes)...');
  const earlierState = history.undo();
  if (earlierState) {
    configManager.restore(earlierState);
    console.log('Restored configuration:', configManager.getConfiguration());
  }

  // Redo (back to performance changes)
  console.log('\nRedo (back to performance changes)...');
  const nextState = history.redo();
  if (nextState) {
    configManager.restore(nextState);
    console.log('Restored configuration:', configManager.getConfiguration());
  }

  // Show final history
  console.log('\nFinal history state:');
  history.getHistory().forEach((item, index) => {
    console.log(`${index}: ${item.description}${item.isCurrent ? ' *CURRENT*' : ''}`);
  });
}

/**
 * Example using the functional implementation
 */
function demoFunctionalImplementation() {
  console.log('\n\n==== FUNCTIONAL IMPLEMENTATION DEMO ====');

  // Initialize with the same default settings
  const configManager = createConfigurationManager({
    theme: 'light',
    language: 'en',
    notifications: true,
    performanceMode: false,
    refreshRate: 60,
    dataRetention: 30,
    maxConcurrentConnections: 5,
  });

  // Create a history manager
  const history = createConfigurationHistory(10);

  // Add a change listener to log all configuration changes
  configManager.addChangeListener(({ key, oldValue, newValue, source }) => {
    console.log(
      `Setting changed: ${key} from ${oldValue} to ${newValue} ${source ? `(via ${source})` : ''}`
    );
  });

  // Save initial state
  console.log('Initial configuration:', configManager.getConfiguration());
  history.addMemento(configManager.save('Initial configuration'));

  // Simulate a multi-step configuration wizard
  console.log('\nSimulating configuration wizard - Step 1: User preferences...');
  configManager.updateSettings({
    theme: 'dark',
    language: 'fr',
  });
  history.addMemento(configManager.save('Configuration wizard - User preferences'));

  console.log('\nSimulating configuration wizard - Step 2: Performance settings...');
  configManager.updateSettings({
    performanceMode: true,
    refreshRate: 30,
  });
  history.addMemento(configManager.save('Configuration wizard - Performance settings'));

  console.log('\nSimulating configuration wizard - Step 3: Data settings...');
  configManager.updateSettings({
    dataRetention: 60,
    maxConcurrentConnections: 2,
  });
  history.addMemento(configManager.save('Configuration wizard - Data settings'));

  // View the current state
  console.log('\nConfiguration after wizard:', configManager.getConfiguration());

  // Go back to beginning of wizard
  console.log('\nUser cancels wizard, reverting to initial state...');
  // Jump directly to a specific state (first state in history)
  const initialState = history.getMementoAt(0);
  if (initialState) {
    configManager.restore(initialState);
    console.log('Reverted configuration:', configManager.getConfiguration());
  }

  // Start a new workflow - admin override
  console.log('\nAdmin performs emergency performance optimization...');
  configManager.updateSettings({
    performanceMode: true,
    refreshRate: 15,
    maxConcurrentConnections: 1,
    dataRetention: 15,
  });
  history.addMemento(configManager.save('Emergency performance optimization'));

  // View the history
  console.log('\nConfiguration history:');
  history.getHistory().forEach((item, index) => {
    console.log(`${index}: ${item.description}${item.isCurrent ? ' *CURRENT*' : ''}`);
  });
}

demoClassBasedImplementation();
demoFunctionalImplementation();
