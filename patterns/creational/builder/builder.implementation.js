/**
 * Class-based approach to implement the Builder pattern
 */
export class ProductBuilder {
  constructor() {
    this.reset();
  }

  /**
   * Resets the builder to its initial state
   */
  reset() {
    this.product = {
      name: '',
      price: 0,
      description: '',
      category: '',
      features: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this;
  }

  /**
   * Sets the name of the product
   * @param name
   */
  setName(name) {
    this.product.name = name;
    return this;
  }

  /**
   * Sets the price of the product
   * @param price
   */
  setPrice(price) {
    if (typeof price !== 'number' || price < 0) {
      throw new Error('Price must be a non-negative number');
    }

    this.product.price = price;
    return this;
  }

  /**
   * Sets the description of the product
   * @param description
   */
  setDescription(description) {
    this.product.description = description;
    return this;
  }

  /**
   * Sets the category of the product
   * @param category
   */
  setCategory(category) {
    this.product.category = category;
    return this;
  }

  /**
   * Adds a feature to the product features list
   * @param feature
   */
  addFeature(feature) {
    this.product.features.push(feature);
    return this;
  }

  /**
   * Sets a metadata key-value pair for the product
   * @param key
   * @param value
   */
  setMetadata(key, value) {
    this.product.metadata[key] = value;
    return this;
  }

  /**
   * Builds the product object
   */
  build() {
    const result = this.product;
    this.reset();
    return result;
  }
}

/**
 * Function-based approach to implement the Builder pattern
 */
export const createProductBuilder = () => {
  let product = {
    name: '',
    price: 0,
    description: '',
    category: '',
    features: [],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const builder = {
    reset: () => {
      product = {
        name: '',
        price: 0,
        description: '',
        category: '',
        features: [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return builder;
    },

    /**
     * Sets the name of the product
     * @param name
     */
    setName: (name) => {
      product.name = name;
      return builder;
    },

    /**
     * Sets the price of the product
     * @param price
     */
    setPrice: (price) => {
      if (typeof price !== 'number' || price < 0) {
        throw new Error('Price must be a non-negative number');
      }

      product.price = price;
      return builder;
    },
    /**
     * Sets the description of the product
     * @param description
     */
    setDescription: (description) => {
      product.description = description;
      return builder;
    },

    /**
     * Sets the category of the product
     * @param category
     */
    setCategory: (category) => {
      product.category = category;
      return builder;
    },

    /**
     * Adds a feature to the product features list
     * @param feature
     */
    addFeature: (feature) => {
      product.features.push(feature);
      return builder;
    },

    /**
     * Sets a metadata key-value pair for the product
     * @param key
     * @param value
     */
    setMetadata: (key, value) => {
      product.metadata[key] = value;
      return builder;
    },

    /**
     * Builds the product object
     */
    build: () => {
      const result = { ...product };
      builder.reset();
      return result;
    },
  };

  return builder;
};
