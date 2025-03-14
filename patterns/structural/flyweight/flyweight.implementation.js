/**
 * ProductFlyweight class represents shared product attribute data
 * Acting as a flyweight to store intrinsic state for product attributes
 */
class ProductFlyweight {
  constructor(category, manufacturer, material, defaultWarranty) {
    this.category = category;
    this.manufacturer = manufacturer;
    this.material = material;
    this.defaultWarranty = defaultWarranty;
  }

  /**
   * Get product details by combining intrinsic state with extrinsic state
   * @param {Object} extrinsicData - Unique data for each product
   * @returns {Object} Combined product details
   */
  getProductDetails(extrinsicData) {
    return {
      // Intrinsic state (shared)
      category: this.category,
      manufacturer: this.manufacturer,
      material: this.material,
      warranty: extrinsicData.customWarranty || this.defaultWarranty,

      // Extrinsic state (unique per product)
      id: extrinsicData.id,
      name: extrinsicData.name,
      price: extrinsicData.price,
      description: extrinsicData.description,
      sku: extrinsicData.sku,
      inStock: extrinsicData.inStock,
      imageUrl: extrinsicData.imageUrl,
    };
  }

  /**
   * Calculate shipping properties based on shared material properties
   * and extrinsic product dimensions
   */
  calculateShippingProperties(dimensions, quantity) {
    // Material density factors (would typically come from a database)
    const densityFactors = {
      wood: 0.8,
      metal: 7.8,
      plastic: 1.2,
      glass: 2.5,
      ceramic: 2.2,
      fabric: 0.3,
      leather: 0.9,
      paper: 1.1,
    };

    const density = densityFactors[this.material.toLowerCase()] || 1.0;
    const volume = dimensions.length * dimensions.width * dimensions.height;
    const weight = volume * density * quantity;

    return {
      weight,
      material: this.material,
      requiresSpecialHandling: this.material === 'glass' || weight > 25,
      insuranceRecommended: this.material === 'ceramic' || this.material === 'glass',
      estimatedShippingCost: this._calculateShippingCost(weight, this.material),
    };
  }

  /**
   * Private method to calculate shipping cost
   */
  _calculateShippingCost(weight, material) {
    const baseCost = 5;
    const weightFactor = 0.7;

    // Materials that require special handling cost more to ship
    const materialFactors = {
      glass: 1.5,
      ceramic: 1.3,
      electronics: 1.2,
    };

    const materialFactor = materialFactors[material.toLowerCase()] || 1;

    return Math.round((baseCost + weight * weightFactor) * materialFactor * 100) / 100;
  }
}

/**
 * Factory class for managing product flyweights
 */
class ProductFlyweightFactory {
  constructor() {
    this.flyweights = {};
    this.flyweightCount = 0;
  }

  /**
   * Get flyweight for specified attributes, creating a new one if needed
   */
  getFlyweight(category, manufacturer, material, defaultWarranty) {
    // Create a key based on the intrinsic properties
    const key = this._createKey(category, manufacturer, material, defaultWarranty);

    // Return existing flyweight if one with the same intrinsic state exists
    if (!this.flyweights[key]) {
      this.flyweights[key] = new ProductFlyweight(
        category,
        manufacturer,
        material,
        defaultWarranty
      );
      this.flyweightCount++;
    }

    return this.flyweights[key];
  }

  /**
   * Create a unique key based on the intrinsic state
   */
  _createKey(category, manufacturer, material, defaultWarranty) {
    return `${category}|${manufacturer}|${material}|${defaultWarranty}`;
  }

  /**
   * Get the total count of unique flyweights created
   */
  getFlyweightCount() {
    return this.flyweightCount;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStatistics(totalProducts) {
    const estimatedFlyweightSize = 200; // bytes per flyweight object
    const estimatedProductRefSize = 50; // bytes per product reference

    const withoutFlyweightSize = totalProducts * estimatedFlyweightSize;
    const withFlyweightSize =
      this.flyweightCount * estimatedFlyweightSize + totalProducts * estimatedProductRefSize;

    return {
      totalFlyweights: this.flyweightCount,
      totalProducts: totalProducts,
      estimatedMemorySaved: withoutFlyweightSize - withFlyweightSize,
      percentSaved: (1 - withFlyweightSize / withoutFlyweightSize) * 100,
    };
  }
}

/**
 * Product catalog that uses the flyweight pattern for efficient memory usage
 */
class ProductCatalog {
  constructor() {
    this.products = [];
    this.factory = new ProductFlyweightFactory();
  }

  /**
   * Add a product to the catalog
   */
  addProduct({
    id,
    name,
    price,
    description,
    sku,
    inStock,
    imageUrl,
    category,
    manufacturer,
    material,
    defaultWarranty = '1 year',
    customWarranty,
    dimensions,
  }) {
    // Get the appropriate flyweight with shared properties
    const flyweight = this.factory.getFlyweight(category, manufacturer, material, defaultWarranty);

    // Store only the extrinsic (unique) state and a reference to the flyweight
    this.products.push({
      flyweight,
      extrinsicData: {
        id,
        name,
        price,
        description,
        sku,
        inStock,
        imageUrl,
        customWarranty,
        dimensions,
      },
    });

    return id;
  }

  /**
   * Get product by ID
   */
  getProduct(id) {
    const product = this.products.find((p) => p.extrinsicData.id === id);

    if (!product) {
      return null;
    }

    // Combine the intrinsic (shared) and extrinsic (unique) states
    return product.flyweight.getProductDetails(product.extrinsicData);
  }

  /**
   * Calculate shipping details for a product
   */
  calculateShipping(id, quantity = 1) {
    const product = this.products.find((p) => p.extrinsicData.id === id);

    if (!product || !product.extrinsicData.dimensions) {
      throw new Error(`Product with ID ${id} not found or has no dimensions`);
    }

    return product.flyweight.calculateShippingProperties(
      product.extrinsicData.dimensions,
      quantity
    );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category) {
    return this.products
      .filter((product) => product.flyweight.category === category)
      .map((product) => product.flyweight.getProductDetails(product.extrinsicData));
  }

  /**
   * Get system memory statistics
   */
  getMemoryStatistics() {
    return this.factory.getMemoryStatistics(this.products.length);
  }
}

export { ProductFlyweight, ProductFlyweightFactory, ProductCatalog };
