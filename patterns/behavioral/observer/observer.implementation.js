/**
 * Subject (Observable) class
 * Maintains a list of observers and notifies them of state changes
 */
class Subject {
  constructor() {
    this.observers = [];
    this.state = null;
  }

  /**
   * Method to register a new observer
   * @param {Observer} observer - The observer to register
   * @returns {Subject} - Returns this to enable method chaining
   */
  subscribe(observer) {
    if (!this.observers.includes(observer)) this.observers.push(observer);
    return this;
  }

  /**
   * Method to remove an observer
   * @param {Observer} observer - The observer to remove
   * @returns {Subject} - Returns this to enable method chaining
   */
  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);

    if (index !== -1) this.observers.splice(index, 1);
    return this;
  }

  /**
   * Method to notify all observers of state change
   * @param {any} data - The data to send to observers
   */
  notify(data) {
    if (this.observers.length === 0) return;
    this.observers.forEach((observer) => {
      observer.update(data);
    });
  }

  /**
   * Method to change state and notify observers
   * @param {any} state - The new state
   */
  setState(state) {
    this.state = state;
    this.notify(this.state);
  }

  /**
   * Method to get current state
   * @returns {any} - The current state
   */
  getState() {
    return this.state;
  }
}

/**
 * Observer interface (implemented as a class)
 * Defines the interface that concrete observers must implement
 */
class Observer {
  constructor(name) {
    this.name = name;
  }

  /**
   * Update method called by the subject
   * @param {any} data - The data received from the subject
   */
  update(data) {
    console.log(`${this.name} received update with data:`, data);
  }
}

/**
 * ConcreteObserver implementation
 * A specific implementation of the Observer interface
 */
class ConcreteObserver extends Observer {
  /**
   * @param {string} name - The name of the observer
   * @param {Function} customAction - Custom action to perform when updated
   */
  constructor(name, customAction) {
    super(name);
    this.customAction = customAction;
  }

  /**
   * Implementation of the update method
   * @param {any} data - The data received from the subject
   */
  update(data) {
    console.log(`${this.name} received:`, data);
    if (this.customAction) this.customAction(data);
  }
}

export { Subject, Observer, ConcreteObserver };
