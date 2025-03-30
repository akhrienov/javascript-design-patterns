/**
 * Mediator class for coordinating communication between components
 */
class Mediator {
  constructor() {
    this.components = new Map();
    this.events = new Map();
  }

  /**
   * Register a component with the mediator
   * @param {Object} component - Component to register
   * @returns {Mediator} - For method chaining
   */
  register(component) {
    if (!component.name) {
      throw new Error('Component must have a name property');
    }

    this.components.set(component.name, component);
    if (typeof component.setMediator === 'function') component.setMediator(this);
    return this;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {Object} context - Context to bind callback to
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback, context = null) {
    if (!this.events.has(event)) this.events.set(event, []);

    const subscribers = this.events.get(event);
    const subscriber = { callback, context };

    subscribers.push(subscriber);

    // Return unsubscribe function
    return () => {
      const subscribers = this.events.get(event);
      const index = subscribers.findIndex((s) => s.callback === callback && s.context === context);

      if (index !== -1) subscribers.splice(index, 1);
    };
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Mediator} - For method chaining
   */
  notify(event, data) {
    if (!this.events.has(event)) return this;

    const subscribers = this.events.get(event);

    for (const { callback, context } of subscribers) {
      try {
        callback.call(context || this, data);
      } catch (err) {
        console.error(`Error in event handler for "${event}":`, err);
      }
    }

    return this;
  }

  /**
   * Send a message to a specific component
   * @param {string} componentName - Target component name
   * @param {*} message - Message to send
   * @returns {Mediator} - For method chaining
   */
  send(componentName, message) {
    if (!this.components.has(componentName)) {
      console.warn(`Component not found: ${componentName}`);
      return this;
    }

    const component = this.components.get(componentName);

    if (typeof component.receive !== 'function') {
      console.warn(`Component ${componentName} does not implement receive()`);
      return this;
    }

    try {
      component.receive(message);
    } catch (err) {
      console.error(`Error sending message to "${componentName}":`, err);
    }

    return this;
  }

  /**
   * Get a component by name
   * @param {string} name - Component name
   * @returns {Object|null} - Component or null if not found
   */
  getComponent(name) {
    return this.components.get(name) || null;
  }
}

/**
 * Base Component class
 */
class Component {
  /**
   * @param {string} name - Component name
   */
  constructor(name) {
    this.name = name;
    this.mediator = null;
  }

  /**
   * Set the mediator for this component
   * @param {Mediator} mediator - Mediator instance
   * @returns {Component} - For method chaining
   */
  setMediator(mediator) {
    this.mediator = mediator;
    return this;
  }

  /**
   * Send a message to another component
   * @param {string} componentName - Target component name
   * @param {*} message - Message to send
   * @returns {Component} - For method chaining
   */
  send(componentName, message) {
    if (!this.mediator) {
      throw new Error(`Component ${this.name} not connected to a mediator`);
    }

    this.mediator.send(componentName, message);
    return this;
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Component} - For method chaining
   */
  notify(event, data) {
    if (!this.mediator) {
      throw new Error(`Component ${this.name} not connected to a mediator`);
    }

    this.mediator.notify(event, data);
    return this;
  }

  /**
   * Handle incoming messages
   * @param {*} message - Received message
   * @returns {Component} - For method chaining
   */
  receive(message) {
    console.log(`${this.name} received:`, message);
    return this;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event to subscribe to
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.mediator) {
      throw new Error(`Component ${this.name} not connected to a mediator`);
    }

    return this.mediator.on(event, callback, this);
  }
}

export { Mediator, Component };
