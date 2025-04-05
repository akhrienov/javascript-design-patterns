/**
 * Creates a subject/observable
 * @returns {Object} An object with methods to manage observers and state
 */
function createSubject() {
  const observers = new Set();
  let state = null;

  return {
    /**
     * Method to subscribe an observer
     * @param {Function} observer - The observer function
     * @returns {Object} An object with an unsubscribe method
     */
    subscribe: function (observer) {
      observers.add(observer);

      return {
        unsubscribe: () => {
          observers.delete(observer);
        },
      };
    },

    /**
     * Method to notify all observers
     * @param {any} data - The data to send to observers
     */
    notify: function (data) {
      observers.forEach((observer) => {
        observer(data);
      });
    },

    /**
     * Method to change state and notify observers
     * @param {any} newState - The new state
     */
    setState: function (newState) {
      state = newState;
      this.notify(state);
    },

    /**
     * Method to get current state
     * @returns {any} The current state
     */
    getState: function () {
      return state;
    },

    /**
     * Method to get the count of observers
     * @returns {number} The number of observers
     */
    observerCount: function () {
      return observers.size;
    },
  };
}

/**
 * Creates an observer
 * @param {string} name - The name of the observer
 * @param {Function} handler - Function to handle data updates
 * @returns {Function} The observer function
 */
function createObserver(name, handler) {
  return function (data) {
    console.log(`${name} received update with data:`, data);
    if (handler) handler(data);
  };
}

export { createSubject, createObserver };
