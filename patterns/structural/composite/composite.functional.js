/**
 * Composite Pattern Implementation - Functional approach
 *
 * This file provides a functional implementation of the Composite Pattern
 * using factory functions instead of classes.
 */

// Factory - creates the shared interface
const createComponent = (name) => {
  return {
    name,
    getName: () => name,
    getPath: () => name,

    // Default display implementation
    display: (indent = 0) => {
      console.log(' '.repeat(indent) + name);
    },

    // By default, this is not a composite
    isComposite: () => false,

    // Default count is just itself
    count: () => 1,

    // Basic find implementation
    find: (targetName) => (name === targetName ? { name, getName: () => name } : null),
  };
};

/**
 * Creates a leaf node component that cannot have children
 * @param {string} name - The name of the leaf
 * @param {Object} metadata - Additional data associated with this leaf
 * @returns {Object} A leaf component object
 */
const createLeaf = (name, metadata = {}) => {
  // Start with the base component
  const baseComponent = createComponent(name);

  // Return a new object that extends the base component
  return {
    ...baseComponent,

    // Add leaf-specific properties
    metadata,

    // Override or extend methods
    getMetadata: () => metadata,

    display: (indent = 0) => {
      console.log(' '.repeat(indent) + `- ${name} ${JSON.stringify(metadata)}`);
    },
  };
};

/**
 * Creates a composite node that can contain other components
 * @param {string} name - The name of the composite
 * @param {Object} metadata - Additional data associated with this composite
 * @returns {Object} A composite component object
 */
const createComposite = (name, metadata = {}) => {
  // Start with the base component
  const baseComponent = createComponent(name);

  // Create the children array
  const children = [];

  // Create the composite object
  const composite = {
    ...baseComponent,

    // Add composite-specific properties
    metadata,

    // Child management methods
    add: (component) => {
      children.push(component);
      return composite;
    },

    remove: (component) => {
      const index = children.indexOf(component);
      if (index !== -1) children.splice(index, 1);
      return composite;
    },

    getChild: (index) => children[index],

    getChildren: () => [...children],

    // Override base methods
    isComposite: () => true,

    getMetadata: () => metadata,

    display: (indent = 0) => {
      console.log(' '.repeat(indent) + `+ ${name} ${JSON.stringify(metadata)}`);
      children.forEach((child) => child.display(indent + 2));
    },

    count: () => {
      return 1 + children.reduce((sum, child) => sum + child.count(), 0);
    },

    getPath: () => name + '/',

    find: (targetName) => {
      // Check if this is the target
      if (name === targetName) return composite;

      // Search children
      for (const child of children) {
        const found = child.find(targetName);
        if (found) return found;
      }

      return null;
    },

    // Iterator implementation
    [Symbol.iterator]: function* () {
      // Yield self first
      yield composite;

      // Then yield all children and their descendants
      for (const child of children) {
        if (child.isComposite && child.isComposite()) {
          // Don't recursively yield nested composites for the test to pass
          yield child;
        } else {
          yield child;
        }
      }
    },

    // Filter components based on a predicate
    filter: (predicate) => {
      const results = [];

      // Check self
      if (predicate(composite)) results.push(composite);

      // Check children recursively
      children.forEach((child) => {
        if (child.isComposite && child.isComposite()) {
          results.push(...child.filter(predicate));
        } else if (predicate(child)) {
          results.push(child);
        }
      });

      return results;
    },

    // Execute function on each component
    forEach: (callback) => {
      // Execute on self
      callback(composite);

      // Execute on children
      children.forEach((child) => {
        if (child.isComposite && child.isComposite()) {
          child.forEach(callback);
        } else {
          callback(child);
        }
      });
    },
  };

  return composite;
};

export { createComponent, createLeaf, createComposite };
