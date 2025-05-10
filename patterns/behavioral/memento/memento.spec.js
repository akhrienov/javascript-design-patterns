import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  ConfigurationMemento,
  ConfigurationManager,
  ConfigurationHistory,
} from './memento.implementation.js';
import {
  createConfigurationMemento,
  createConfigurationManager,
  createConfigurationHistory,
} from './memento.functional.js';

describe('Class-based Memento Pattern Implementation', () => {
  describe('ConfigurationMemento', () => {
    it('should store the state correctly', () => {
      const state = { theme: 'dark', language: 'en' };
      const memento = new ConfigurationMemento(state);
      expect(memento.getState()).toEqual(state);
    });

    it('should create a deep copy of the state', () => {
      const state = { theme: 'dark', nested: { value: 42 } };
      const memento = new ConfigurationMemento(state);

      // Modify the original state
      state.theme = 'light';
      state.nested.value = 100;

      // The memento's state should not change
      const retrievedState = memento.getState();
      expect(retrievedState.theme).toBe('dark');
      expect(retrievedState.nested.value).toBe(42);
    });

    it('should return correct metadata', () => {
      const state = { theme: 'dark' };
      const timestamp = new Date();
      const description = 'Test state';
      const memento = new ConfigurationMemento(state, timestamp, description);

      const metadata = memento.getMetadata();
      expect(metadata.timestamp).toEqual(timestamp);
      expect(metadata.description).toBe(description);
      expect(metadata.hash).toBeDefined();
    });

    it('should validate state correctly', () => {
      const state = { theme: 'dark', language: 'en' };
      const memento = new ConfigurationMemento(state);

      // Same state should validate
      expect(memento.validateState({ ...state })).toBe(true);

      // Different state should not validate
      expect(memento.validateState({ ...state, theme: 'light' })).toBe(false);
    });

    it('should throw error for invalid state', () => {
      expect(() => new ConfigurationMemento(null)).toThrow('Invalid state');
      expect(() => new ConfigurationMemento('not an object')).toThrow('Invalid state');
    });
  });

  describe('ConfigurationManager', () => {
    let manager;
    let initialConfig;

    beforeEach(() => {
      initialConfig = {
        theme: 'light',
        language: 'en',
        notifications: true,
      };
      manager = new ConfigurationManager(initialConfig);
    });

    it('should initialize with default values and provided values', () => {
      const config = manager.getConfiguration();
      expect(config.theme).toBe('light');
      expect(config.language).toBe('en');
      expect(config.notifications).toBe(true);
      expect(config.performanceMode).toBe(false); // Default value
    });

    it('should update a setting correctly', () => {
      manager.updateSetting('theme', 'dark');
      const config = manager.getConfiguration();
      expect(config.theme).toBe('dark');
    });

    it('should throw error when updating invalid setting', () => {
      expect(() => manager.updateSetting('invalidKey', 'value')).toThrow(
        'Invalid configuration key'
      );
    });

    it('should throw error when setting invalid value', () => {
      expect(() => manager.updateSetting('theme', 'invalid')).toThrow('Invalid value');
    });

    it('should update multiple settings at once', () => {
      manager.updateSettings({
        theme: 'dark',
        language: 'fr',
      });

      const config = manager.getConfiguration();
      expect(config.theme).toBe('dark');
      expect(config.language).toBe('fr');
    });

    it('should create a memento with the current state', () => {
      const memento = manager.save('Test save');
      expect(memento).toBeInstanceOf(ConfigurationMemento);
      expect(memento.getState()).toEqual(manager.getConfiguration());
      expect(memento.getMetadata().description).toBe('Test save');
    });

    it('should restore state from a memento', () => {
      // Change the initial state
      manager.updateSetting('theme', 'dark');
      expect(manager.getConfiguration().theme).toBe('dark');

      // Save the initial state before changes
      const initialMemento = new ConfigurationMemento(initialConfig);

      // Restore to initial state
      manager.restore(initialMemento);
      expect(manager.getConfiguration().theme).toBe('light');
    });

    it('should throw when restoring from invalid memento', () => {
      expect(() => manager.restore({})).toThrow('Invalid memento object');
      expect(() => manager.restore(null)).toThrow('Invalid memento object');
    });

    it('should notify listeners of changes', () => {
      const listener = vi.fn();
      manager.addChangeListener(listener);

      manager.updateSetting('theme', 'dark');

      expect(listener).toHaveBeenCalledWith({
        key: 'theme',
        oldValue: 'light',
        newValue: 'dark',
      });
    });

    it('should allow removing listeners', () => {
      const listener = vi.fn();
      const removeListener = manager.addChangeListener(listener);

      // Remove the listener
      removeListener();

      // Update should not trigger the listener
      manager.updateSetting('theme', 'dark');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('ConfigurationHistory', () => {
    let history;
    let manager;
    let initialState;

    beforeEach(() => {
      history = new ConfigurationHistory(5); // Max 5 states
      manager = new ConfigurationManager();
      initialState = manager.save('Initial state');
      history.addMemento(initialState);
    });

    it('should add mementos correctly', () => {
      manager.updateSetting('theme', 'dark');
      const secondState = manager.save('Dark theme');
      history.addMemento(secondState);

      expect(history.getHistory().length).toBe(2);
    });

    it('should enforce maximum size', () => {
      // Add 5 more states (6 total with the initial state)
      for (let i = 1; i <= 5; i++) {
        manager.updateSetting('theme', i % 2 === 0 ? 'dark' : 'light');
        history.addMemento(manager.save(`State ${i}`));
      }

      // Should have 5 states (max size), with the oldest removed
      expect(history.getHistory().length).toBe(5);
      expect(history.getHistory()[0].description).not.toBe('Initial state');
    });

    it('should handle undo correctly', () => {
      manager.updateSetting('theme', 'dark');
      history.addMemento(manager.save('Dark theme'));

      const prevMemento = history.undo();
      expect(prevMemento).toBe(initialState);
      expect(history.canUndo()).toBe(false); // At the beginning
    });

    it('should handle redo correctly', () => {
      manager.updateSetting('theme', 'dark');
      const darkThemeState = manager.save('Dark theme');
      history.addMemento(darkThemeState);

      history.undo(); // Go back to initial
      const redoMemento = history.redo();

      expect(redoMemento).toBe(darkThemeState);
      expect(history.canRedo()).toBe(false); // At the end
    });

    it('should clear future states when adding after undo', () => {
      // Add three states
      manager.updateSetting('theme', 'dark');
      history.addMemento(manager.save('Dark theme'));

      manager.updateSetting('language', 'fr');
      const frenchState = manager.save('French language');
      history.addMemento(frenchState);

      // Go back to first state
      history.undo();
      history.undo();

      // Add a new state - should remove the "future" states
      manager.updateSetting('notifications', false);
      history.addMemento(manager.save('Notifications off'));

      // Should have 2 states now (initial and notifications off)
      expect(history.getHistory().length).toBe(2);
      expect(history.canRedo()).toBe(false);
    });

    it('should provide correct metadata in history', () => {
      manager.updateSetting('theme', 'dark');
      history.addMemento(manager.save('Dark theme'));

      const historyItems = history.getHistory();
      expect(historyItems.length).toBe(2);
      expect(historyItems[0].description).toBe('Initial state');
      expect(historyItems[1].description).toBe('Dark theme');
      expect(historyItems[1].isCurrent).toBe(true);
    });

    it('should get memento at specific index', () => {
      manager.updateSetting('theme', 'dark');
      const darkThemeState = manager.save('Dark theme');
      history.addMemento(darkThemeState);

      const retrievedMemento = history.getMementoAt(0);
      expect(retrievedMemento).toBe(initialState);
    });

    it('should clear history', () => {
      history.clear();
      expect(history.getHistory().length).toBe(0);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });
});

describe('Functional Memento Pattern Implementation', () => {
  describe('createConfigurationMemento', () => {
    it('should store the state correctly', () => {
      const state = { theme: 'dark', language: 'en' };
      const memento = createConfigurationMemento(state);
      expect(memento.getState()).toEqual(state);
    });

    it('should create a deep copy of the state', () => {
      const state = { theme: 'dark', nested: { value: 42 } };
      const memento = createConfigurationMemento(state);

      // Modify the original state
      state.theme = 'light';
      state.nested.value = 100;

      // The memento's state should not change
      const retrievedState = memento.getState();
      expect(retrievedState.theme).toBe('dark');
      expect(retrievedState.nested.value).toBe(42);
    });

    it('should return correct metadata', () => {
      const state = { theme: 'dark' };
      const timestamp = new Date();
      const description = 'Test state';
      const memento = createConfigurationMemento(state, timestamp, description);

      const metadata = memento.getMetadata();
      expect(metadata.timestamp).toEqual(timestamp);
      expect(metadata.description).toBe(description);
      expect(metadata.hash).toBeDefined();
    });

    it('should validate state correctly', () => {
      const state = { theme: 'dark', language: 'en' };
      const memento = createConfigurationMemento(state);

      // Same state should validate
      expect(memento.validateState({ ...state })).toBe(true);

      // Different state should not validate
      expect(memento.validateState({ ...state, theme: 'light' })).toBe(false);
    });

    it('should throw error for invalid state', () => {
      expect(() => createConfigurationMemento(null)).toThrow('Invalid state');
      expect(() => createConfigurationMemento('not an object')).toThrow('Invalid state');
    });
  });

  describe('createConfigurationManager', () => {
    let manager;
    let initialConfig;

    beforeEach(() => {
      initialConfig = {
        theme: 'light',
        language: 'en',
        notifications: true,
      };
      manager = createConfigurationManager(initialConfig);
    });

    it('should initialize with default values and provided values', () => {
      const config = manager.getConfiguration();
      expect(config.theme).toBe('light');
      expect(config.language).toBe('en');
      expect(config.notifications).toBe(true);
      expect(config.performanceMode).toBe(false); // Default value
    });

    it('should update a setting correctly', () => {
      manager.updateSetting('theme', 'dark');
      const config = manager.getConfiguration();
      expect(config.theme).toBe('dark');
    });

    it('should throw error when updating invalid setting', () => {
      expect(() => manager.updateSetting('invalidKey', 'value')).toThrow(
        'Invalid configuration key'
      );
    });

    it('should throw error when setting invalid value', () => {
      expect(() => manager.updateSetting('theme', 'invalid')).toThrow('Invalid value');
    });

    it('should update multiple settings at once', () => {
      manager.updateSettings({
        theme: 'dark',
        language: 'fr',
      });

      const config = manager.getConfiguration();
      expect(config.theme).toBe('dark');
      expect(config.language).toBe('fr');
    });

    it('should create a memento with the current state', () => {
      const memento = manager.save('Test save');
      expect(memento.getState).toBeDefined();
      expect(memento.getState()).toEqual(manager.getConfiguration());
      expect(memento.getMetadata().description).toBe('Test save');
    });

    it('should restore state from a memento', () => {
      // Change the initial state
      manager.updateSetting('theme', 'dark');
      expect(manager.getConfiguration().theme).toBe('dark');

      // Save the initial state before changes
      const initialMemento = createConfigurationMemento(initialConfig);

      // Restore to initial state
      manager.restore(initialMemento);
      expect(manager.getConfiguration().theme).toBe('light');
    });

    it('should throw when restoring from invalid memento', () => {
      expect(() => manager.restore({})).toThrow('Invalid memento object');
      expect(() => manager.restore(null)).toThrow('Invalid memento object');
    });

    it('should notify listeners of changes', () => {
      const listener = vi.fn();
      manager.addChangeListener(listener);

      manager.updateSetting('theme', 'dark');

      expect(listener).toHaveBeenCalledWith({
        key: 'theme',
        oldValue: 'light',
        newValue: 'dark',
      });
    });

    it('should allow removing listeners', () => {
      const listener = vi.fn();
      const removeListener = manager.addChangeListener(listener);

      // Remove the listener
      removeListener();

      // Update should not trigger the listener
      manager.updateSetting('theme', 'dark');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('createConfigurationHistory', () => {
    let history;
    let manager;
    let initialState;

    beforeEach(() => {
      history = createConfigurationHistory(5); // Max 5 states
      manager = createConfigurationManager();
      initialState = manager.save('Initial state');
      history.addMemento(initialState);
    });

    it('should add mementos correctly', () => {
      manager.updateSetting('theme', 'dark');
      const secondState = manager.save('Dark theme');
      history.addMemento(secondState);

      expect(history.getHistory().length).toBe(2);
    });

    it('should enforce maximum size', () => {
      // Add 5 more states (6 total with the initial state)
      for (let i = 1; i <= 5; i++) {
        manager.updateSetting('theme', i % 2 === 0 ? 'dark' : 'light');
        history.addMemento(manager.save(`State ${i}`));
      }

      // Should have 5 states (max size), with the oldest removed
      expect(history.getHistory().length).toBe(5);
      expect(history.getHistory()[0].description).not.toBe('Initial state');
    });

    it('should handle undo correctly', () => {
      manager.updateSetting('theme', 'dark');
      history.addMemento(manager.save('Dark theme'));

      const prevMemento = history.undo();
      expect(prevMemento).toBe(initialState);
      expect(history.canUndo()).toBe(false); // At the beginning
    });

    it('should handle redo correctly', () => {
      manager.updateSetting('theme', 'dark');
      const darkThemeState = manager.save('Dark theme');
      history.addMemento(darkThemeState);

      history.undo(); // Go back to initial
      const redoMemento = history.redo();

      expect(redoMemento).toBe(darkThemeState);
      expect(history.canRedo()).toBe(false); // At the end
    });

    it('should clear future states when adding after undo', () => {
      // Add three states
      manager.updateSetting('theme', 'dark');
      history.addMemento(manager.save('Dark theme'));

      manager.updateSetting('language', 'fr');
      history.addMemento(manager.save('French language'));

      // Go back to first state
      history.undo();
      history.undo();

      // Add a new state - should remove the "future" states
      manager.updateSetting('notifications', false);
      history.addMemento(manager.save('Notifications off'));

      // Should have 2 states now (initial and notifications off)
      expect(history.getHistory().length).toBe(2);
      expect(history.canRedo()).toBe(false);
    });

    it('should get memento at specific index', () => {
      manager.updateSetting('theme', 'dark');
      const darkThemeState = manager.save('Dark theme');
      history.addMemento(darkThemeState);

      const retrievedMemento = history.getMementoAt(0);
      expect(retrievedMemento).toBe(initialState);
    });

    it('should clear history', () => {
      history.clear();
      expect(history.getHistory().length).toBe(0);
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });
});
