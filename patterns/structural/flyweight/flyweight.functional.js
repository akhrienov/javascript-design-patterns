/**
 * Creates a product flyweight using functional approach
 */
const createProductFlyweight = (category, manufacturer, material, defaultWarranty) => {
  // Return the flyweight object with intrinsic state and methods
  return {
    // Intrinsic state (shared among products)
    category,
    manufacturer,
    material,
    defaultWarranty,

    /**
     * Get product details by combining intrinsic state with extrinsic state
     * @param {Object} extrinsicData - Unique data for each product
     * @returns {Object} Combined product details
     */
    getProductDetails: (extrinsicData) => {
      return {
        // Intrinsic state (shared)
        category,
        manufacturer,
        material,
        warranty: extrinsicData.customWarranty || defaultWarranty,

        // Extrinsic state (unique per product)
        id: extrinsicData.id,
        name: extrinsicData.name,
        price: extrinsicData.price,
        description: extrinsicData.description,
        sku: extrinsicData.sku,
        inStock: extrinsicData.inStock,
        imageUrl: extrinsicData.imageUrl,
      };
    },

    /**
     * Calculate shipping properties based on shared material properties
     * and extrinsic product dimensions
     */
    calculateShippingProperties: (dimensions, quantity) => {
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

      const density = densityFactors[material.toLowerCase()] || 1.0;
      const volume = dimensions.length * dimensions.width * dimensions.height;
      const weight = volume * density * quantity;

      return {
        weight,
        material,
        requiresSpecialHandling: material === 'glass' || weight > 25,
        insuranceRecommended: material === 'ceramic' || material === 'glass',
        estimatedShippingCost: calculateShippingCost(weight, material),
      };
    },
  };
};

/**
 * Helper function to calculate shipping cost
 */
const calculateShippingCost = (weight, material) => {
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
};

/**
 * Creates a product flyweight factory
 * @returns {Object} Factory with methods for managing flyweights
 */
const createProductFlyweightFactory = () => {
  // Private state
  const flyweights = {};
  let flyweightCount = 0;

  // Create a unique key for a flyweight
  const createKey = (category, manufacturer, material, defaultWarranty) =>
    `${category}|${manufacturer}|${material}|${defaultWarranty}`;

  // Return the factory API
  return {
    /**
     * Get flyweight for specified attributes, creating a new one if needed
     */
    getFlyweight: (category, manufacturer, material, defaultWarranty) => {
      const key = createKey(category, manufacturer, material, defaultWarranty);

      if (!flyweights[key]) {
        flyweights[key] = createProductFlyweight(category, manufacturer, material, defaultWarranty);
        flyweightCount++;
      }

      return flyweights[key];
    },

    /**
     * Get the total count of unique flyweights created
     */
    getFlyweightCount: () => flyweightCount,

    /**
     * Get memory usage statistics
     */
    getMemoryStatistics: (totalProducts) => {
      const estimatedFlyweightSize = 200; // bytes per flyweight object
      const estimatedProductRefSize = 50; // bytes per product reference

      const withoutFlyweightSize = totalProducts * estimatedFlyweightSize;
      const withFlyweightSize =
        flyweightCount * estimatedFlyweightSize + totalProducts * estimatedProductRefSize;

      return {
        totalFlyweights: flyweightCount,
        totalProducts: totalProducts,
        estimatedMemorySaved: withoutFlyweightSize - withFlyweightSize,
        percentSaved: (1 - withFlyweightSize / withoutFlyweightSize) * 100,
      };
    },
  };
};

/**
 * Creates a product catalog using the flyweight pattern
 */
const createProductCatalog = () => {
  // Private state
  const products = [];
  const factory = createProductFlyweightFactory();

  // Return the catalog API
  return {
    /**
     * Add a product to the catalog
     */
    addProduct: ({
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
    }) => {
      // Get the appropriate flyweight with shared properties
      const flyweight = factory.getFlyweight(category, manufacturer, material, defaultWarranty);

      // Store only the extrinsic (unique) state and a reference to the flyweight
      products.push({
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
    },

    /**
     * Get product by ID
     */
    getProduct: (id) => {
      const product = products.find((p) => p.extrinsicData.id === id);

      if (!product) {
        return null;
      }

      // Combine the intrinsic (shared) and extrinsic (unique) states
      return product.flyweight.getProductDetails(product.extrinsicData);
    },

    /**
     * Calculate shipping details for a product
     */
    calculateShipping: (id, quantity = 1) => {
      const product = products.find((p) => p.extrinsicData.id === id);

      if (!product || !product.extrinsicData.dimensions) {
        throw new Error(`Product with ID ${id} not found or has no dimensions`);
      }

      return product.flyweight.calculateShippingProperties(
        product.extrinsicData.dimensions,
        quantity
      );
    },

    /**
     * Get products by category
     */
    getProductsByCategory: (category) => {
      return products
        .filter((product) => product.flyweight.category === category)
        .map((product) => product.flyweight.getProductDetails(product.extrinsicData));
    },

    /**
     * Get all products
     */
    getAllProducts: () => {
      return products.map((product) => product.flyweight.getProductDetails(product.extrinsicData));
    },

    /**
     * Get system memory statistics
     */
    getMemoryStatistics: () => {
      return factory.getMemoryStatistics(products.length);
    },
  };
};

export { createProductFlyweight, createProductFlyweightFactory, createProductCatalog };
