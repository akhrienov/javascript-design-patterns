/**
 * Create a mediator
 * @returns {Object} - Mediator API
 */
function createMediator() {
  const components = new Map();
  const events = new Map();

  return {
    /**
     * Register a component
     * @param {string} name - Component name
     * @param {Object} component - Component to register
     * @returns {Object} - Mediator API for chaining
     */
    register(name, component) {
      components.set(name, component);
      component.mediator = this;
      return this;
    },

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {Object} context - Context to bind callback to
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback, context = null) {
      if (!events.has(event)) events.set(event, []);

      const subscribers = events.get(event);
      const subscriber = { callback, context };

      subscribers.push(subscriber);

      // Return unsubscribe function
      return () => {
        const subscribers = events.get(event);
        const index = subscribers.findIndex(
          (s) => s.callback === callback && s.context === context
        );

        if (index !== -1) subscribers.splice(index, 1);
      };
    },

    /**
     * Publish an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {Object} - Mediator API for chaining
     */
    notify(event, data) {
      if (!events.has(event)) return this;

      const subscribers = events.get(event);

      for (const { callback, context } of subscribers) {
        try {
          callback.call(context || null, data);
        } catch (err) {
          console.error(`Error in event handler for "${event}":`, err);
        }
      }

      return this;
    },

    /**
     * Send a message to a specific component
     * @param {string} componentName - Target component name
     * @param {*} message - Message to send
     * @returns {Object} - Mediator API for chaining
     */
    send(componentName, message) {
      if (!components.has(componentName)) {
        console.warn(`Component not found: ${componentName}`);
        return this;
      }

      const component = components.get(componentName);

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
    },

    /**
     * Get a component by name
     * @param {string} name - Component name
     * @returns {Object|null} - Component or null if not found
     */
    getComponent(name) {
      return components.get(name) || null;
    },
  };
}

/**
 * Create a component
 * @param {string} name - Component name
 * @returns {Object} - Component API
 */
function createComponent(name) {
  return {
    name,
    mediator: null,

    /**
     * Send a message to another component
     * @param {string} componentName - Target component name
     * @param {*} message - Message to send
     * @returns {Object} - Component for chaining
     */
    send(componentName, message) {
      if (!this.mediator) {
        throw new Error(`Component ${this.name} not connected to a mediator`);
      }

      this.mediator.send(componentName, message);
      return this;
    },

    /**
     * Publish an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {Object} - Component for chaining
     */
    notify(event, data) {
      if (!this.mediator) {
        throw new Error(`Component ${this.name} not connected to a mediator`);
      }

      this.mediator.notify(event, data);
      return this;
    },

    /**
     * Handle incoming messages
     * @param {*} message - Received message
     * @returns {Object} - Component for chaining
     */
    receive(message) {
      console.log(`${this.name} received:`, message);
      return this;
    },

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
    },
  };
}

export { createMediator, createComponent };
