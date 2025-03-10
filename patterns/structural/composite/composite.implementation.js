/**
 * Composite Pattern Implementation - Class-based approach
 *
 * This file provides a robust implementation of the Composite Pattern
 * for building hierarchical tree structures where individual objects
 * and compositions are treated uniformly.
 */

/**
 * Component - The abstract base class for all components in the tree structure
 * This serves as the common interface for both leaf nodes and composites
 */
class Component {
  /**
   * Creates a new component with the given name
   * @param {string} name - The name of the component
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Gets the name of the component
   * @returns {string} The component name
   */
  getName() {
    return this.name;
  }

  /**
   * Gets the path to this component
   * @returns {string} The path as a string
   */
  getPath() {
    return this.name;
  }

  /**
   * Displays the component in the console
   * @param {number} indent - Number of spaces to indent (for tree visualization)
   */
  display(indent = 0) {
    console.log(' '.repeat(indent) + this.getName());
  }

  /**
   * Adds a child component - default implementation throws an error
   * @param {Component} component - The component to add as a child
   * @throws {Error} Always throws error in the base Component class
   */
  add(component) {
    throw new Error(`Cannot add to a non-composite component: ${this.name}`);
  }

  /**
   * Removes a child component - default implementation throws an error
   * @param {Component} component - The component to remove
   * @throws {Error} Always throws error in the base Component class
   */
  remove(component) {
    throw new Error(`Cannot remove from a non-composite component: ${this.name}`);
  }

  /**
   * Gets a child at the specified index - default implementation throws an error
   * @param {number} index - The index of the child to retrieve
   * @throws {Error} Always throws error in the base Component class
   */
  getChild(index) {
    throw new Error(`Cannot get child from a non-composite component: ${this.name}`);
  }

  /**
   * Gets all children - default implementation throws an error
   * @throws {Error} Always throws error in the base Component class
   */
  getChildren() {
    throw new Error(`Cannot get children from a non-composite component: ${this.name}`);
  }

  /**
   * Checks if this component is a composite (can have children)
   * @returns {boolean} Always false for the base Component class
   */
  isComposite() {
    return false;
  }

  /**
   * Counts this component and all its descendants
   * @returns {number} Always 1 for the base Component class
   */
  count() {
    return 1; // A single node counts as 1
  }

  /**
   * Finds a component by name
   * @param {string} targetName - The name of the component to find
   * @returns {Component|null} The found component or null if not found
   */
  find(targetName) {
    return this.name === targetName ? this : null;
  }
}

/**
 * Leaf - Represents end nodes in the tree that cannot have children
 * @extends Component
 */
class Leaf extends Component {
  /**
   * Creates a new leaf node
   * @param {string} name - The name of the leaf
   * @param {Object} metadata - Additional data associated with this leaf
   */
  constructor(name, metadata = {}) {
    super(name);
    this.metadata = metadata;
  }

  /**
   * Gets the metadata associated with this leaf
   * @returns {Object} The metadata object
   */
  getMetadata() {
    return this.metadata;
  }

  /**
   * Displays the leaf node with its metadata
   * @param {number} indent - Number of spaces to indent
   * @override
   */
  display(indent = 0) {
    console.log(' '.repeat(indent) + `- ${this.name} ${JSON.stringify(this.metadata)}`);
  }
}

/**
 * Composite - Represents container nodes that can have children
 * @extends Component
 */
class Composite extends Component {
  /**
   * Creates a new composite node
   * @param {string} name - The name of the composite
   * @param {Object} metadata - Additional data associated with this composite
   */
  constructor(name, metadata = {}) {
    super(name);
    this.children = [];
    this.metadata = metadata;
  }

  /**
   * Adds a child component to this composite
   * @param {Component} component - The component to add as a child
   * @returns {Composite} This composite instance (for method chaining)
   * @override
   */
  add(component) {
    this.children.push(component);
    return this; // For method chaining
  }

  /**
   * Removes a child component from this composite
   * @param {Component} component - The component to remove
   * @returns {Composite} This composite instance (for method chaining)
   * @override
   */
  remove(component) {
    const index = this.children.indexOf(component);
    if (index !== -1) this.children.splice(index, 1);
    return this;
  }

  /**
   * Gets a child at the specified index
   * @param {number} index - The index of the child to retrieve
   * @returns {Component} The child component at the specified index
   * @override
   */
  getChild(index) {
    return this.children[index];
  }

  /**
   * Gets all children of this composite
   * @returns {Component[]} Array of all child components
   * @override
   */
  getChildren() {
    return [...this.children];
  }

  /**
   * Gets the metadata associated with this composite
   * @returns {Object} The metadata object
   */
  getMetadata() {
    return this.metadata;
  }

  /**
   * Checks if this component is a composite
   * @returns {boolean} Always true for Composite instances
   * @override
   */
  isComposite() {
    return true;
  }

  /**
   * Displays the composite and all its children recursively
   * @param {number} indent - Number of spaces to indent
   * @override
   */
  display(indent = 0) {
    console.log(' '.repeat(indent) + `+ ${this.name} ${JSON.stringify(this.metadata)}`);

    this.children.forEach((child) => {
      child.display(indent + 2);
    });
  }

  /**
   * Counts this composite and all its descendants
   * @returns {number} The total count of nodes in this subtree
   * @override
   */
  count() {
    return 1 + this.children.reduce((sum, child) => sum + child.count(), 0);
  }

  /**
   * Gets the path to this composite
   * @returns {string} The path ending with a slash
   * @override
   */
  getPath() {
    return this.name + '/';
  }

  /**
   * Finds a component by name recursively in this subtree
   * @param {string} targetName - The name of the component to find
   * @returns {Component|null} The found component or null if not found
   * @override
   */
  find(targetName) {
    // Check if this is the target
    if (this.name === targetName) return this;

    // Search children
    for (const child of this.children) {
      const found = child.find(targetName);
      if (found) return found;
    }

    return null;
  }

  /**
   * Implements the iterator protocol to make composites iterable
   * @yields {Component} Each component in the subtree in depth-first order
   */
  *[Symbol.iterator]() {
    // Yield self first
    yield this;

    // Then yield all children
    for (const child of this.children) {
      if (child.isComposite()) {
        yield* child; // Delegate to child's iterator if composite
      } else {
        yield child;
      }
    }
  }

  /**
   * Filters components in this subtree based on a predicate function
   * @param {Function} predicate - Function that takes a component and returns boolean
   * @returns {Component[]} Array of components that match the predicate
   */
  filter(predicate) {
    const results = [];

    // Check self
    if (predicate(this)) results.push(this);

    // Check children recursively
    this.children.forEach((child) => {
      if (child.isComposite()) {
        results.push(...child.filter(predicate));
      } else if (predicate(child)) {
        results.push(child);
      }
    });

    return results;
  }

  /**
   * Executes a function on each component in the subtree
   * @param {Function} callback - Function to execute on each component
   */
  forEach(callback) {
    // Execute on self
    callback(this);

    // Execute on all children
    this.children.forEach((child) => {
      if (child.isComposite()) {
        child.forEach(callback);
      } else {
        callback(child);
      }
    });
  }
}

export { Component, Leaf, Composite };
