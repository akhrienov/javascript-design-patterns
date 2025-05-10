/**
 * Enterprise Data Processing System using the Visitor Pattern (Class-based implementation)
 *
 * This implementation demonstrates a practical application of the Visitor Pattern
 * for processing different types of business entities with various operations.
 */

// -------------------- ENTITY CLASSES -------------------- //

/**
 * Base Entity class that all business entities must extend
 */
class Entity {
  /**
   * Accept a visitor to process this entity
   * @param {EntityVisitor} visitor - The visitor to accept
   * @returns {*} The result of the visitor's operation
   */
  accept(visitor) {
    throw new Error('Accept method must be implemented by subclasses');
  }
}

/**
 * User entity representing a system user
 */
class User extends Entity {
  /**
   * @param {Object} data - User data
   * @param {string} data.id - User ID
   * @param {string} data.name - User's full name
   * @param {string} data.email - User's email
   * @param {string} data.role - User's role in the system
   * @param {Date} data.createdAt - User creation date
   */
  constructor({ id, name, email, role = 'user', createdAt = new Date() }) {
    super();
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt;
  }

  /**
   * Accept a visitor to process this user entity
   * @param {EntityVisitor} visitor - The visitor to accept
   * @returns {*} The result of the visitor's operation
   */
  accept(visitor) {
    return visitor.visitUser(this);
  }
}

/**
 * Product entity representing a product in the system
 */
class Product extends Entity {
  /**
   * @param {Object} data - Product data
   * @param {string} data.id - Product ID
   * @param {string} data.name - Product name
   * @param {string} data.description - Product description
   * @param {number} data.price - Product price
   * @param {string[]} data.categories - Product categories
   * @param {number} data.inventory - Current inventory count
   */
  constructor({ id, name, description, price, categories = [], inventory = 0 }) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.categories = categories;
    this.inventory = inventory;
  }

  /**
   * Accept a visitor to process this product entity
   * @param {EntityVisitor} visitor - The visitor to accept
   * @returns {*} The result of the visitor's operation
   */
  accept(visitor) {
    return visitor.visitProduct(this);
  }
}

/**
 * Order entity representing a customer order
 */
class Order extends Entity {
  /**
   * @param {Object} data - Order data
   * @param {string} data.id - Order ID
   * @param {string} data.userId - Customer user ID
   * @param {Array} data.items - Order line items
   * @param {string} data.status - Order status
   * @param {Date} data.createdAt - Order creation date
   */
  constructor({ id, userId, items = [], status = 'pending', createdAt = new Date() }) {
    super();
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.status = status;
    this.createdAt = createdAt;
  }

  /**
   * Accept a visitor to process this order entity
   * @param {EntityVisitor} visitor - The visitor to accept
   * @returns {*} The result of the visitor's operation
   */
  accept(visitor) {
    return visitor.visitOrder(this);
  }
}

/**
 * OrderItem entity representing a line item in an order
 */
class OrderItem extends Entity {
  /**
   * @param {Object} data - Order item data
   * @param {string} data.productId - Product ID
   * @param {number} data.quantity - Quantity ordered
   * @param {number} data.price - Price at time of order
   */
  constructor({ productId, quantity, price }) {
    super();
    this.productId = productId;
    this.quantity = quantity;
    this.price = price;
  }

  /**
   * Accept a visitor to process this order item entity
   * @param {EntityVisitor} visitor - The visitor to accept
   * @returns {*} The result of the visitor's operation
   */
  accept(visitor) {
    return visitor.visitOrderItem(this);
  }
}

// -------------------- VISITOR CLASSES -------------------- //

/**
 * Base EntityVisitor class that all entity visitors must extend
 */
class EntityVisitor {
  /**
   * Visit a User entity
   * @param {User} user - The user to visit
   * @returns {*} The result of visiting the user
   */
  visitUser(user) {
    throw new Error('visitUser method must be implemented by subclasses');
  }

  /**
   * Visit a Product entity
   * @param {Product} product - The product to visit
   * @returns {*} The result of visiting the product
   */
  visitProduct(product) {
    throw new Error('visitProduct method must be implemented by subclasses');
  }

  /**
   * Visit an Order entity
   * @param {Order} order - The order to visit
   * @returns {*} The result of visiting the order
   */
  visitOrder(order) {
    throw new Error('visitOrder method must be implemented by subclasses');
  }

  /**
   * Visit an OrderItem entity
   * @param {OrderItem} orderItem - The order item to visit
   * @returns {*} The result of visiting the order item
   */
  visitOrderItem(orderItem) {
    throw new Error('visitOrderItem method must be implemented by subclasses');
  }
}

/**
 * ValidationVisitor that validates entities according to business rules
 */
class ValidationVisitor extends EntityVisitor {
  constructor() {
    super();
    this.errors = [];
  }

  /**
   * Validate a User entity
   * @param {User} user - The user to validate
   * @returns {boolean} True if valid, false otherwise
   */
  visitUser(user) {
    this.errors = [];

    // Check required fields
    if (!user.id) this.errors.push('User ID is required');
    if (!user.name) this.errors.push('User name is required');

    // Validate email format
    if (!user.email) {
      this.errors.push('Email is required');
    } else if (!this.isValidEmail(user.email)) {
      this.errors.push('Email format is invalid');
    }

    // Validate role
    const validRoles = ['user', 'admin', 'manager'];
    if (!validRoles.includes(user.role)) {
      this.errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }

    return this.errors.length === 0;
  }

  /**
   * Validate a Product entity
   * @param {Product} product - The product to validate
   * @returns {boolean} True if valid, false otherwise
   */
  visitProduct(product) {
    this.errors = [];

    // Check required fields
    if (!product.id) this.errors.push('Product ID is required');
    if (!product.name) this.errors.push('Product name is required');

    // Validate price
    if (typeof product.price !== 'number' || product.price <= 0) {
      this.errors.push('Product price must be a positive number');
    }

    // Validate inventory
    if (typeof product.inventory !== 'number' || product.inventory < 0) {
      this.errors.push('Product inventory must be a non-negative number');
    }

    // Validate categories
    if (!Array.isArray(product.categories)) {
      this.errors.push('Product categories must be an array');
    }

    return this.errors.length === 0;
  }

  /**
   * Validate an Order entity
   * @param {Order} order - The order to validate
   * @returns {boolean} True if valid, false otherwise
   */
  visitOrder(order) {
    this.errors = [];

    // Check required fields
    if (!order.id) this.errors.push('Order ID is required');
    if (!order.userId) this.errors.push('User ID is required');

    // Validate items
    if (!Array.isArray(order.items) || order.items.length === 0) {
      this.errors.push('Order must have at least one item');
    } else {
      // Validate each order item
      order.items.forEach((item, index) => {
        if (!(item instanceof OrderItem)) {
          this.errors.push(`Item at index ${index} is not a valid OrderItem`);
        } else {
          const itemValid = item.accept(this);
          if (!itemValid && this.errors.length > 0) {
            // Prefix the error messages with the item index
            const itemErrors = [...this.errors];
            this.errors = [];
            itemErrors.forEach((error) => {
              this.errors.push(`Item ${index}: ${error}`);
            });
          }
        }
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order.status)) {
      this.errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return this.errors.length === 0;
  }

  /**
   * Validate an OrderItem entity
   * @param {OrderItem} item - The order item to validate
   * @returns {boolean} True if valid, false otherwise
   */
  visitOrderItem(item) {
    this.errors = [];

    // Check required fields
    if (!item.productId) this.errors.push('Product ID is required');

    // Validate quantity
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      this.errors.push('Quantity must be a positive number');
    }

    // Validate price
    if (typeof item.price !== 'number' || item.price <= 0) {
      this.errors.push('Price must be a positive number');
    }

    return this.errors.length === 0;
  }

  /**
   * Validate an email address
   * @param {string} email - The email to validate
   * @returns {boolean} True if valid, false otherwise
   * @private
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get all validation errors
   * @returns {string[]} Array of error messages
   */
  getErrors() {
    return [...this.errors];
  }
}

/**
 * SerializationVisitor that converts entities to different formats
 */
class SerializationVisitor extends EntityVisitor {
  /**
   * @param {string} format - The output format ('json', 'xml', etc.)
   */
  constructor(format = 'json') {
    super();
    this.format = format.toLowerCase();
  }

  /**
   * Serialize a User entity
   * @param {User} user - The user to serialize
   * @returns {string} Serialized representation of the user
   */
  visitUser(user) {
    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    };

    return this.formatData(data, 'user');
  }

  /**
   * Serialize a Product entity
   * @param {Product} product - The product to serialize
   * @returns {string} Serialized representation of the product
   */
  visitProduct(product) {
    const data = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categories: product.categories,
      inventory: product.inventory,
    };

    return this.formatData(data, 'product');
  }

  /**
   * Serialize an Order entity
   * @param {Order} order - The order to serialize
   * @returns {string} Serialized representation of the order
   */
  visitOrder(order) {
    // Serialize each order item
    const serializedItems = order.items.map((item) => {
      // Extract the data from the serialized item (removing tags for XML)
      let serializedItem = item.accept(this);
      if (this.format === 'xml') {
        // Parse the XML to get just the item data
        serializedItem = serializedItem.replace(/<\/?orderItem>|<\?xml.*\?>/g, '').trim();
      } else if (this.format === 'json') {
        // Parse the JSON to get just the item data
        serializedItem = JSON.parse(serializedItem);
      }
      return serializedItem;
    });

    const data = {
      id: order.id,
      userId: order.userId,
      items: serializedItems,
      status: order.status,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    };

    return this.formatData(data, 'order');
  }

  /**
   * Serialize an OrderItem entity
   * @param {OrderItem} item - The order item to serialize
   * @returns {string} Serialized representation of the order item
   */
  visitOrderItem(item) {
    const data = {
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    };

    return this.formatData(data, 'orderItem');
  }

  /**
   * Format data according to the specified format
   * @param {Object} data - The data to format
   * @param {string} entityType - The type of entity
   * @returns {string} Formatted data
   * @private
   */
  formatData(data, entityType) {
    switch (this.format) {
      case 'json':
        return JSON.stringify(data);
      case 'xml':
        return this.toXml(data, entityType);
      case 'csv':
        return this.toCsv(data);
      default:
        return JSON.stringify(data);
    }
  }

  /**
   * Convert data to XML format
   * @param {Object} data - The data to convert
   * @param {string} rootTag - The root XML tag
   * @returns {string} XML representation
   * @private
   */
  toXml(data, rootTag) {
    const xmlParts = [`<?xml version="1.0" encoding="UTF-8"?>`, `<${rootTag}>`];

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) {
        // Skip null/undefined values
        continue;
      } else if (Array.isArray(value)) {
        xmlParts.push(`<${key}>`);
        for (const item of value) {
          if (typeof item === 'object') {
            // If it's an already formatted XML string (from a nested entity)
            if (typeof item === 'string' && item.includes('<?xml')) {
              // Extract content between root tags
              const match = item.match(/<(\w+)>([\s\S]*)<\/\1>/);
              if (match) {
                xmlParts.push(match[2]);
              } else {
                xmlParts.push(item);
              }
            } else {
              // Otherwise, create a nested element
              xmlParts.push(`<item>${JSON.stringify(item)}</item>`);
            }
          } else {
            xmlParts.push(`<item>${this.escapeXml(String(item))}</item>`);
          }
        }
        xmlParts.push(`</${key}>`);
      } else if (typeof value === 'object') {
        xmlParts.push(`<${key}>`);
        xmlParts.push(this.toXml(value, 'nested').replace(/^<\?xml.*\?><nested>|<\/nested>$/g, ''));
        xmlParts.push(`</${key}>`);
      } else {
        xmlParts.push(`<${key}>${this.escapeXml(String(value))}</${key}>`);
      }
    }

    xmlParts.push(`</${rootTag}>`);
    return xmlParts.join('');
  }

  /**
   * Escape special characters for XML
   * @param {string} str - The string to escape
   * @returns {string} Escaped string
   * @private
   */
  escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convert data to CSV format
   * @param {Object} data - The data to convert
   * @returns {string} CSV representation
   * @private
   */
  toCsv(data) {
    // Get all keys as header row
    const headers = Object.keys(data);
    const headerRow = headers.join(',');

    // Create the data row, handling special cases
    const dataRow = headers
      .map((key) => {
        const value = data[key];
        if (value === null || value === undefined) {
          return '';
        } else if (Array.isArray(value)) {
          // Join arrays with semicolons
          return `"${value
            .map((item) => {
              if (typeof item === 'object') {
                return JSON.stringify(item).replace(/"/g, '""');
              }
              return String(item).replace(/"/g, '""');
            })
            .join(';')}"`;
        } else if (typeof value === 'object') {
          // Stringify objects
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"') || value.includes('\n'))
        ) {
          // Quote and escape strings with special chars
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      })
      .join(',');

    return `${headerRow}\n${dataRow}`;
  }
}

/**
 * TransformationVisitor that transforms entities for various purposes
 */
class TransformationVisitor extends EntityVisitor {
  /**
   * @param {string} transformationType - The type of transformation to apply
   * @param {Object} options - Additional options for the transformation
   */
  constructor(transformationType = 'normalize', options = {}) {
    super();
    this.transformationType = transformationType;
    this.options = options;
  }

  /**
   * Transform a User entity
   * @param {User} user - The user to transform
   * @returns {User} Transformed user
   */
  visitUser(user) {
    switch (this.transformationType) {
      case 'normalize':
        return this.normalizeUser(user);
      case 'anonymize':
        return this.anonymizeUser(user);
      case 'enrich':
        return this.enrichUser(user);
      default:
        return user;
    }
  }

  /**
   * Transform a Product entity
   * @param {Product} product - The product to transform
   * @returns {Product} Transformed product
   */
  visitProduct(product) {
    switch (this.transformationType) {
      case 'normalize':
        return this.normalizeProduct(product);
      case 'discount':
        return this.discountProduct(product);
      case 'enrich':
        return this.enrichProduct(product);
      default:
        return product;
    }
  }

  /**
   * Transform an Order entity
   * @param {Order} order - The order to transform
   * @returns {Order} Transformed order
   */
  visitOrder(order) {
    switch (this.transformationType) {
      case 'normalize':
        return this.normalizeOrder(order);
      case 'calculateTotals':
        return this.calculateOrderTotals(order);
      default:
        return order;
    }
  }

  /**
   * Transform an OrderItem entity
   * @param {OrderItem} item - The order item to transform
   * @returns {OrderItem} Transformed order item
   */
  visitOrderItem(item) {
    switch (this.transformationType) {
      case 'normalize':
        return this.normalizeOrderItem(item);
      case 'applyTax':
        return this.applyTaxToOrderItem(item);
      default:
        return item;
    }
  }

  // -------------------- TRANSFORMATION IMPLEMENTATIONS -------------------- //

  /**
   * Normalize a user entity
   * @param {User} user - The user to normalize
   * @returns {User} Normalized user
   * @private
   */
  normalizeUser(user) {
    // Create a new user to avoid modifying the original
    return new User({
      ...user,
      // Trim whitespace from string fields
      name: typeof user.name === 'string' ? user.name.trim() : user.name,
      email: typeof user.email === 'string' ? user.email.trim().toLowerCase() : user.email,
      // Ensure role is lowercase
      role: typeof user.role === 'string' ? user.role.toLowerCase() : user.role,
      // Ensure createdAt is a Date object
      createdAt:
        user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt || Date.now()),
    });
  }

  /**
   * Anonymize a user entity (for GDPR, etc.)
   * @param {User} user - The user to anonymize
   * @returns {User} Anonymized user
   * @private
   */
  anonymizeUser(user) {
    // Create a new user with anonymized personal data
    return new User({
      ...user,
      name: `User ${user.id.substring(0, 8)}`,
      email: `user-${user.id.substring(0, 8)}@example.com`,
      // Keep role and createdAt as they're not personal identifiable information
    });
  }

  /**
   * Enrich a user with additional information
   * @param {User} user - The user to enrich
   * @returns {User} Enriched user
   * @private
   */
  enrichUser(user) {
    // This would typically call external services or use additional data sources
    // For this example, we'll just add some dummy enriched fields
    const enrichedUser = new User(user);

    // Add additional properties that weren't in the original User constructor
    enrichedUser.lastLoginAt = this.options.lastLoginAt || new Date();
    enrichedUser.fullName = user.name; // Just copying for the example
    enrichedUser.emailVerified = this.options.emailVerified || false;

    return enrichedUser;
  }

  /**
   * Normalize a product entity
   * @param {Product} product - The product to normalize
   * @returns {Product} Normalized product
   * @private
   */
  normalizeProduct(product) {
    // Create a new product to avoid modifying the original
    return new Product({
      ...product,
      // Trim whitespace from string fields
      name: typeof product.name === 'string' ? product.name.trim() : product.name,
      description:
        typeof product.description === 'string' ? product.description.trim() : product.description,
      // Round price to 2 decimal places
      price:
        typeof product.price === 'number' ? Math.round(product.price * 100) / 100 : product.price,
      // Ensure categories are lowercase and unique
      categories: Array.isArray(product.categories)
        ? [
            ...new Set(
              product.categories.map((c) => (typeof c === 'string' ? c.trim().toLowerCase() : c))
            ),
          ]
        : product.categories,
      // Ensure inventory is an integer
      inventory:
        typeof product.inventory === 'number' ? Math.floor(product.inventory) : product.inventory,
    });
  }

  /**
   * Apply a discount to a product
   * @param {Product} product - The product to discount
   * @returns {Product} Discounted product
   * @private
   */
  discountProduct(product) {
    const discountPercent = this.options.discountPercent || 10;
    const discountFactor = (100 - discountPercent) / 100;

    // Create a new product with the discounted price
    return new Product({
      ...product,
      price:
        typeof product.price === 'number'
          ? Math.round(product.price * discountFactor * 100) / 100
          : product.price,
      // Add a category to indicate this product is discounted
      categories: Array.isArray(product.categories)
        ? [...product.categories, 'discounted']
        : product.categories,
    });
  }

  /**
   * Enrich a product with additional information
   * @param {Product} product - The product to enrich
   * @returns {Product} Enriched product
   * @private
   */
  enrichProduct(product) {
    // This would typically add data from other sources
    const enrichedProduct = new Product(product);

    // Add additional properties
    enrichedProduct.isInStock = product.inventory > 0;
    enrichedProduct.tags = this.options.tags || [];
    enrichedProduct.averageRating = this.options.averageRating || 0;

    return enrichedProduct;
  }

  /**
   * Normalize an order entity
   * @param {Order} order - The order to normalize
   * @returns {Order} Normalized order
   * @private
   */
  normalizeOrder(order) {
    // Normalize each order item
    const normalizedItems = order.items.map((item) => {
      if (item instanceof OrderItem) {
        return item.accept(this);
      }
      return item;
    });

    // Create a new order to avoid modifying the original
    return new Order({
      ...order,
      items: normalizedItems,
      // Ensure status is lowercase
      status: typeof order.status === 'string' ? order.status.toLowerCase() : order.status,
      // Ensure createdAt is a Date object
      createdAt:
        order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt || Date.now()),
    });
  }

  /**
   * Calculate totals for an order
   * @param {Order} order - The order to calculate totals for
   * @returns {Order} Order with calculated totals
   * @private
   */
  calculateOrderTotals(order) {
    const calculatedOrder = new Order(order);

    // Calculate subtotal from items
    calculatedOrder.subtotal = order.items.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    // Apply tax rate if specified in options
    const taxRate = this.options.taxRate || 0;
    calculatedOrder.tax = Math.round(calculatedOrder.subtotal * taxRate * 100) / 100;

    // Apply shipping cost if specified in options
    calculatedOrder.shipping = this.options.shippingCost || 0;

    // Calculate total
    calculatedOrder.total =
      calculatedOrder.subtotal + calculatedOrder.tax + calculatedOrder.shipping;

    return calculatedOrder;
  }

  /**
   * Normalize an order item
   * @param {OrderItem} item - The order item to normalize
   * @returns {OrderItem} Normalized order item
   * @private
   */
  normalizeOrderItem(item) {
    // Create a new order item to avoid modifying the original
    return new OrderItem({
      ...item,
      // Round price to 2 decimal places
      price: typeof item.price === 'number' ? Math.round(item.price * 100) / 100 : item.price,
      // Ensure quantity is a positive integer
      quantity:
        typeof item.quantity === 'number' ? Math.max(1, Math.floor(item.quantity)) : item.quantity,
    });
  }

  /**
   * Apply tax to an order item
   * @param {OrderItem} item - The order item to apply tax to
   * @returns {OrderItem} Order item with tax applied
   * @private
   */
  applyTaxToOrderItem(item) {
    const taxRate = this.options.taxRate || 0;

    // Create a new order item with tax applied to the price
    const itemWithTax = new OrderItem({
      ...item,
      price:
        typeof item.price === 'number'
          ? Math.round(item.price * (1 + taxRate) * 100) / 100
          : item.price,
    });

    // Add a taxRate property for reference
    itemWithTax.taxRate = taxRate;
    itemWithTax.preTaxPrice = item.price;

    return itemWithTax;
  }
}

// -------------------- COMPOSITE ENTITY CLASS -------------------- //

/**
 * EntityCollection that can hold multiple entities and process them together
 */
class EntityCollection extends Entity {
  /**
   * @param {Entity[]} entities - Array of entities to include in the collection
   */
  constructor(entities = []) {
    super();
    this.entities = entities;
  }

  /**
   * Add an entity to the collection
   * @param {Entity} entity - The entity to add
   * @returns {EntityCollection} This collection for chaining
   */
  add(entity) {
    if (entity instanceof Entity) {
      this.entities.push(entity);
    } else {
      throw new Error('Only Entity instances can be added to EntityCollection');
    }
    return this;
  }

  /**
   * Remove an entity from the collection
   * @param {Entity} entity - The entity to remove
   * @returns {EntityCollection} This collection for chaining
   */
  remove(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
    return this;
  }

  /**
   * Get all entities of a specific type
   * @param {Function} type - The entity class to filter by
   * @returns {Entity[]} Filtered entities
   */
  getByType(type) {
    return this.entities.filter((entity) => entity instanceof type);
  }

  /**
   * Accept a visitor for each entity in the collection
   * @param {EntityVisitor} visitor - The visitor to accept
   * @returns {Array} Array of results from each entity
   */
  accept(visitor) {
    return this.entities.map((entity) => entity.accept(visitor));
  }
}

export {
  // Entity classes
  Entity,
  User,
  Product,
  Order,
  OrderItem,
  EntityCollection,

  // Visitor classes
  EntityVisitor,
  ValidationVisitor,
  SerializationVisitor,
  TransformationVisitor,
};
