/**
 * Enterprise Data Processing System using the Visitor Pattern (Functional implementation)
 *
 * This implementation demonstrates a functional approach to the Visitor Pattern
 * for processing different types of business entities with various operations.
 */

// -------------------- ENTITY FACTORIES -------------------- //

/**
 * Create a base entity with the accept method
 * @returns {Object} Base entity
 * @private
 */
const createBaseEntity = () => ({
  accept: (visitor) => {
    throw new Error('Accept method must be implemented by entity factories');
  },
});

/**
 * Create a user entity
 * @param {Object} data - User data
 * @param {string} data.id - User ID
 * @param {string} data.name - User's full name
 * @param {string} data.email - User's email
 * @param {string} [data.role='user'] - User's role in the system
 * @param {Date|string} [data.createdAt=new Date()] - User creation date
 * @returns {Object} User entity
 */
const createUser = ({ id, name, email, role = 'user', createdAt = new Date() }) => ({
  ...createBaseEntity(),
  type: 'user',
  id,
  name,
  email,
  role,
  createdAt,
  accept: (visitor) => visitor.user(id, name, email, role, createdAt),
});

/**
 * Create a product entity
 * @param {Object} data - Product data
 * @param {string} data.id - Product ID
 * @param {string} data.name - Product name
 * @param {string} data.description - Product description
 * @param {number} data.price - Product price
 * @param {string[]} [data.categories=[]] - Product categories
 * @param {number} [data.inventory=0] - Current inventory count
 * @returns {Object} Product entity
 */
const createProduct = ({ id, name, description, price, categories = [], inventory = 0 }) => ({
  ...createBaseEntity(),
  type: 'product',
  id,
  name,
  description,
  price,
  categories,
  inventory,
  accept: (visitor) => visitor.product(id, name, description, price, categories, inventory),
});

/**
 * Create an order item entity
 * @param {Object} data - Order item data
 * @param {string} data.productId - Product ID
 * @param {number} data.quantity - Quantity ordered
 * @param {number} data.price - Price at time of order
 * @returns {Object} Order item entity
 */
const createOrderItem = ({ productId, quantity, price }) => ({
  ...createBaseEntity(),
  type: 'orderItem',
  productId,
  quantity,
  price,
  accept: (visitor) => visitor.orderItem(productId, quantity, price),
});

/**
 * Create an order entity
 * @param {Object} data - Order data
 * @param {string} data.id - Order ID
 * @param {string} data.userId - Customer user ID
 * @param {Array} [data.items=[]] - Order line items
 * @param {string} [data.status='pending'] - Order status
 * @param {Date|string} [data.createdAt=new Date()] - Order creation date
 * @returns {Object} Order entity
 */
const createOrder = ({ id, userId, items = [], status = 'pending', createdAt = new Date() }) => ({
  ...createBaseEntity(),
  type: 'order',
  id,
  userId,
  items,
  status,
  createdAt,
  accept: (visitor) => visitor.order(id, userId, items, status, createdAt),
});

/**
 * Create an entity collection for processing multiple entities together
 * @param {Array} [entities=[]] - Initial entities in the collection
 * @returns {Object} Entity collection
 */
const createEntityCollection = (entities = []) => {
  let _entities = [...entities];

  return {
    ...createBaseEntity(),
    type: 'entityCollection',

    // Add an entity to the collection
    add: (entity) => {
      _entities.push(entity);
      return this;
    },

    // Remove an entity from the collection
    remove: (entity) => {
      _entities = _entities.filter((e) => e !== entity);
      return this;
    },

    // Get all entities
    getEntities: () => [..._entities],

    // Filter entities by type
    getByType: (type) => _entities.filter((entity) => entity.type === type),

    // Accept a visitor for each entity in the collection
    accept: (visitor) => _entities.map((entity) => entity.accept(visitor)),
  };
};

// -------------------- VISITOR FACTORIES -------------------- //

/**
 * Create a validation visitor that validates entities according to business rules
 * @returns {Object} Validation visitor
 */
const createValidationVisitor = () => {
  let errors = [];

  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    // Validation functions for each entity type
    user: (id, name, email, role, createdAt) => {
      errors = [];

      // Check required fields
      if (!id) errors.push('User ID is required');
      if (!name) errors.push('User name is required');

      // Validate email
      if (!email) {
        errors.push('Email is required');
      } else if (!isValidEmail(email)) {
        errors.push('Email format is invalid');
      }

      // Validate role
      const validRoles = ['user', 'admin', 'manager'];
      if (!validRoles.includes(role)) {
        errors.push(`Role must be one of: ${validRoles.join(', ')}`);
      }

      return errors.length === 0;
    },

    product: (id, name, description, price, categories, inventory) => {
      errors = [];

      // Check required fields
      if (!id) errors.push('Product ID is required');
      if (!name) errors.push('Product name is required');

      // Validate price
      if (typeof price !== 'number' || price <= 0) {
        errors.push('Product price must be a positive number');
      }

      // Validate inventory
      if (typeof inventory !== 'number' || inventory < 0) {
        errors.push('Product inventory must be a non-negative number');
      }

      // Validate categories
      if (!Array.isArray(categories)) {
        errors.push('Product categories must be an array');
      }

      return errors.length === 0;
    },

    orderItem: (productId, quantity, price) => {
      errors = [];

      // Check required fields
      if (!productId) errors.push('Product ID is required');

      // Validate quantity
      if (typeof quantity !== 'number' || quantity <= 0) {
        errors.push('Quantity must be a positive number');
      }

      // Validate price
      if (typeof price !== 'number' || price <= 0) {
        errors.push('Price must be a positive number');
      }

      return errors.length === 0;
    },

    order: (id, userId, items, status, createdAt) => {
      errors = [];

      // Check required fields
      if (!id) errors.push('Order ID is required');
      if (!userId) errors.push('User ID is required');

      // Validate items
      if (!Array.isArray(items) || items.length === 0) {
        errors.push('Order must have at least one item');
      } else {
        // Validate each order item
        items.forEach((item, index) => {
          if (!item || typeof item !== 'object' || item.type !== 'orderItem') {
            errors.push(`Item at index ${index} is not a valid OrderItem`);
          } else {
            const itemErrors = [];
            const prevErrors = [...errors];
            errors = [];

            const itemValid = item.accept(this);

            if (!itemValid) {
              // Prefix the error messages with the item index
              errors.forEach((error) => {
                itemErrors.push(`Item ${index}: ${error}`);
              });
            }

            errors = [...prevErrors, ...itemErrors];
          }
        });
      }

      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      return errors.length === 0;
    },

    // Get all validation errors
    getErrors: () => [...errors],
  };
};

/**
 * Create a serialization visitor that converts entities to different formats
 * @param {string} [format='json'] - The output format ('json', 'xml', etc.)
 * @returns {Object} Serialization visitor
 */
const createSerializationVisitor = (format = 'json') => {
  // Helper function to escape XML special characters
  const escapeXml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Convert object to XML
  const toXml = (data, rootTag) => {
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
            xmlParts.push(`<item>${escapeXml(String(item))}</item>`);
          }
        }
        xmlParts.push(`</${key}>`);
      } else if (typeof value === 'object') {
        xmlParts.push(`<${key}>`);
        xmlParts.push(toXml(value, 'nested').replace(/^<\?xml.*\?><nested>|<\/nested>$/g, ''));
        xmlParts.push(`</${key}>`);
      } else {
        xmlParts.push(`<${key}>${escapeXml(String(value))}</${key}>`);
      }
    }

    xmlParts.push(`</${rootTag}>`);
    return xmlParts.join('');
  };

  // Convert object to CSV
  const toCsv = (data) => {
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
  };

  // Format data according to the specified format
  const formatData = (data, entityType) => {
    const _format = format.toLowerCase();

    switch (_format) {
      case 'json':
        return JSON.stringify(data);
      case 'xml':
        return toXml(data, entityType);
      case 'csv':
        return toCsv(data);
      default:
        return JSON.stringify(data);
    }
  };

  return {
    user: (id, name, email, role, createdAt) => {
      const data = {
        id,
        name,
        email,
        role,
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
      };

      return formatData(data, 'user');
    },

    product: (id, name, description, price, categories, inventory) => {
      const data = {
        id,
        name,
        description,
        price,
        categories,
        inventory,
      };

      return formatData(data, 'product');
    },

    orderItem: (productId, quantity, price) => {
      const data = {
        productId,
        quantity,
        price,
        total: quantity * price,
      };

      return formatData(data, 'orderItem');
    },

    order: (id, userId, items, status, createdAt) => {
      // Serialize each order item
      const serializedItems = items.map((item) => {
        // Extract the data from the serialized item (removing tags for XML)
        let serializedItem = item.accept(this);

        if (format === 'xml') {
          // Parse the XML to get just the item data
          serializedItem = serializedItem.replace(/<\/?orderItem>|<\?xml.*\?>/g, '').trim();
        } else if (format === 'json') {
          // Parse the JSON to get just the item data
          serializedItem = JSON.parse(serializedItem);
        }

        return serializedItem;
      });

      const data = {
        id,
        userId,
        items: serializedItems,
        status,
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
      };

      return formatData(data, 'order');
    },
  };
};

/**
 * Create a transformation visitor that transforms entities for various purposes
 * @param {string} [transformationType='normalize'] - The type of transformation to apply
 * @param {Object} [options={}] - Additional options for the transformation
 * @returns {Object} Transformation visitor
 */
const createTransformationVisitor = (transformationType = 'normalize', options = {}) => {
  return {
    user: (id, name, email, role, createdAt) => {
      switch (transformationType) {
        case 'normalize':
          return createUser({
            id,
            // Trim whitespace from string fields
            name: typeof name === 'string' ? name.trim() : name,
            email: typeof email === 'string' ? email.trim().toLowerCase() : email,
            // Ensure role is lowercase
            role: typeof role === 'string' ? role.toLowerCase() : role,
            // Ensure createdAt is a Date object
            createdAt: createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now()),
          });

        case 'anonymize':
          return createUser({
            id,
            name: `User ${id.substring(0, 8)}`,
            email: `user-${id.substring(0, 8)}@example.com`,
            role,
            createdAt,
          });

        case 'enrich':
          const enrichedUser = createUser({ id, name, email, role, createdAt });

          // Add additional properties
          enrichedUser.lastLoginAt = options.lastLoginAt || new Date();
          enrichedUser.fullName = name; // Just copying for the example
          enrichedUser.emailVerified = options.emailVerified || false;

          return enrichedUser;

        default:
          return createUser({ id, name, email, role, createdAt });
      }
    },

    product: (id, name, description, price, categories, inventory) => {
      switch (transformationType) {
        case 'normalize':
          return createProduct({
            id,
            // Trim whitespace from string fields
            name: typeof name === 'string' ? name.trim() : name,
            description: typeof description === 'string' ? description.trim() : description,
            // Round price to 2 decimal places
            price: typeof price === 'number' ? Math.round(price * 100) / 100 : price,
            // Ensure categories are lowercase and unique
            categories: Array.isArray(categories)
              ? [
                  ...new Set(
                    categories.map((c) => (typeof c === 'string' ? c.trim().toLowerCase() : c))
                  ),
                ]
              : categories,
            // Ensure inventory is an integer
            inventory: typeof inventory === 'number' ? Math.floor(inventory) : inventory,
          });

        case 'discount':
          const discountPercent = options.discountPercent || 10;
          const discountFactor = (100 - discountPercent) / 100;

          return createProduct({
            id,
            name,
            description,
            // Apply discount to price
            price:
              typeof price === 'number' ? Math.round(price * discountFactor * 100) / 100 : price,
            // Add a category to indicate this product is discounted
            categories: Array.isArray(categories) ? [...categories, 'discounted'] : categories,
            inventory,
          });

        case 'enrich':
          const enrichedProduct = createProduct({
            id,
            name,
            description,
            price,
            categories,
            inventory,
          });

          // Add additional properties
          enrichedProduct.isInStock = inventory > 0;
          enrichedProduct.tags = options.tags || [];
          enrichedProduct.averageRating = options.averageRating || 0;

          return enrichedProduct;

        default:
          return createProduct({ id, name, description, price, categories, inventory });
      }
    },

    orderItem: (productId, quantity, price) => {
      switch (transformationType) {
        case 'normalize':
          return createOrderItem({
            productId,
            // Ensure quantity is a positive integer
            quantity: typeof quantity === 'number' ? Math.max(1, Math.floor(quantity)) : quantity,
            // Round price to 2 decimal places
            price: typeof price === 'number' ? Math.round(price * 100) / 100 : price,
          });

        case 'applyTax':
          const taxRate = options.taxRate || 0;
          const itemWithTax = createOrderItem({
            productId,
            quantity,
            // Apply tax to price
            price:
              typeof price === 'number' ? Math.round(price * (1 + taxRate) * 100) / 100 : price,
          });

          // Add additional properties
          itemWithTax.taxRate = taxRate;
          itemWithTax.preTaxPrice = price;

          return itemWithTax;

        default:
          return createOrderItem({ productId, quantity, price });
      }
    },

    order: (id, userId, items, status, createdAt) => {
      switch (transformationType) {
        case 'normalize':
          // Normalize each order item
          const normalizedItems = items.map((item) => {
            if (item && typeof item === 'object' && item.type === 'orderItem') {
              return item.accept(this);
            }
            return item;
          });

          return createOrder({
            id,
            userId,
            items: normalizedItems,
            // Ensure status is lowercase
            status: typeof status === 'string' ? status.toLowerCase() : status,
            // Ensure createdAt is a Date object
            createdAt: createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now()),
          });

        case 'calculateTotals':
          const calculatedOrder = createOrder({ id, userId, items, status, createdAt });

          // Calculate subtotal from items
          calculatedOrder.subtotal = items.reduce((sum, item) => {
            return sum + item.quantity * item.price;
          }, 0);

          // Apply tax rate if specified in options
          const taxRate = options.taxRate || 0;
          calculatedOrder.tax = Math.round(calculatedOrder.subtotal * taxRate * 100) / 100;

          // Apply shipping cost if specified in options
          calculatedOrder.shipping = options.shippingCost || 0;

          // Calculate total
          calculatedOrder.total =
            calculatedOrder.subtotal + calculatedOrder.tax + calculatedOrder.shipping;

          return calculatedOrder;

        default:
          return createOrder({ id, userId, items, status, createdAt });
      }
    },
  };
};

export {
  // Entity factories
  createUser,
  createProduct,
  createOrder,
  createOrderItem,
  createEntityCollection,

  // Visitor factories
  createValidationVisitor,
  createSerializationVisitor,
  createTransformationVisitor,
};
