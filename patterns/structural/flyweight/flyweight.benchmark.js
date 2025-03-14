/**
 * Benchmark script for comparing memory usage with and without the Flyweight pattern
 * This script creates large product catalogs and measures the difference in memory consumption
 */

import { ProductCatalog } from './flyweight.implementation.js';
import { createProductCatalog } from './flyweight.functional.js';

// Helper function to generate random product data
function generateRandomProduct(id, useRandomCategory = true) {
  const categories = [
    'Electronics',
    'Furniture',
    'Decor',
    'Kitchen',
    'Bathroom',
    'Outdoor',
    'Toys',
  ];
  const manufacturers = [
    'TechVision',
    'HomeStyles',
    'ArtisanCrafts',
    'KitchenPro',
    'BathLuxe',
    'OutdoorLiving',
    'ToyMakers',
  ];
  const materials = [
    'Electronics',
    'Wood',
    'Metal',
    'Glass',
    'Ceramic',
    'Plastic',
    'Fabric',
    'Leather',
    'Paper',
    'Composite',
  ];
  const warranties = ['30 days', '90 days', '1 year', '2 years', '5 years', 'Lifetime'];

  // If useRandomCategory is true, we'll assign random category/manufacturer/material
  // Otherwise, we'll assign based on the id to create more repetition (better for flyweight)
  const categoryIndex = useRandomCategory
    ? Math.floor(Math.random() * categories.length)
    : id % categories.length;
  const manufacturerIndex = useRandomCategory
    ? Math.floor(Math.random() * manufacturers.length)
    : Math.floor(id / 100) % manufacturers.length;
  const materialIndex = useRandomCategory
    ? Math.floor(Math.random() * materials.length)
    : Math.floor(id / 50) % materials.length;
  const warrantyIndex = useRandomCategory
    ? Math.floor(Math.random() * warranties.length)
    : Math.floor(id / 200) % warranties.length;

  return {
    id: `prod-${id}`,
    name: `Product ${id}`,
    price: Math.round(((id % 100) + 9.99) * 100) / 100,
    description: `Description for product ${id}`,
    sku: `SKU-${categoryIndex}-${id}`,
    inStock: id % 10 !== 0, // 90% of products in stock
    imageUrl: `/images/product-${id % 50}.jpg`,
    category: categories[categoryIndex],
    manufacturer: manufacturers[manufacturerIndex],
    material: materials[materialIndex],
    defaultWarranty: warranties[warrantyIndex],
    dimensions: {
      length: Math.round((5 + (id % 50)) * 10) / 10,
      width: Math.round((3 + (id % 30)) * 10) / 10,
      height: Math.round((2 + (id % 20)) * 10) / 10,
    },
  };
}

// Naive implementation without flyweight pattern
class ProductCatalogNoFlyweight {
  constructor() {
    this.products = [];
  }

  addProduct(productData) {
    // Store a complete copy of all data for each product
    this.products.push({ ...productData });
    return productData.id;
  }

  getProduct(id) {
    return this.products.find((p) => p.id === id) || null;
  }

  getProductsByCategory(category) {
    return this.products.filter((p) => p.category === category);
  }

  calculateShipping(id, quantity = 1) {
    const product = this.getProduct(id);

    if (!product || !product.dimensions) {
      throw new Error(`Product with ID ${id} not found or has no dimensions`);
    }

    // Duplicate the calculation logic from the flyweight implementation
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

    const density = densityFactors[product.material.toLowerCase()] || 1.0;
    const volume = product.dimensions.length * product.dimensions.width * product.dimensions.height;
    const weight = volume * density * quantity;

    return {
      weight,
      material: product.material,
      requiresSpecialHandling: product.material === 'glass' || weight > 25,
      insuranceRecommended: product.material === 'ceramic' || product.material === 'glass',
      estimatedShippingCost: this._calculateShippingCost(weight, product.material),
    };
  }

  _calculateShippingCost(weight, material) {
    const baseCost = 5;
    const weightFactor = 0.7;

    const materialFactors = {
      glass: 1.5,
      ceramic: 1.3,
      electronics: 1.2,
    };

    const materialFactor = materialFactors[material.toLowerCase()] || 1;

    return Math.round((baseCost + weight * weightFactor) * materialFactor * 100) / 100;
  }

  getTotalProductCount() {
    return this.products.length;
  }

  getMemoryEstimate() {
    // Rough estimate based on typical object sizes
    return this.products.length * 500; // ~500 bytes per product
  }
}

// Benchmark function
function runBenchmark({
  productCount = 10000,
  useRandomAttributes = false,
  displayInterval = 1000,
}) {
  console.log(`\nRunning benchmark with ${productCount} products:`);
  console.log(`- Using ${useRandomAttributes ? 'random' : 'repeating'} attribute combinations`);
  console.log('='.repeat(50));

  // Create instances of each implementation
  const flyweightCatalog = new ProductCatalog();
  const functionaFlyweightCatalog = createProductCatalog();
  const noFlyweightCatalog = new ProductCatalogNoFlyweight();

  console.log('1. Adding products to catalogs...');

  const startTime = process.hrtime();

  for (let i = 1; i <= productCount; i++) {
    const product = generateRandomProduct(i, useRandomAttributes);

    // Add to all catalogs
    flyweightCatalog.addProduct(product);
    functionaFlyweightCatalog.addProduct(product);
    noFlyweightCatalog.addProduct(product);

    // Show progress
    if (i % displayInterval === 0 || i === productCount) {
      process.stdout.write(
        `\r   Added ${i.toLocaleString()} of ${productCount.toLocaleString()} products (${Math.round((i / productCount) * 100)}%)`
      );
    }
  }

  const endTime = process.hrtime(startTime);
  const totalTimeMs = endTime[0] * 1000 + endTime[1] / 1000000;

  console.log('\n\n2. Benchmarking results:');

  // Class-based flyweight stats
  const flyweightStats = flyweightCatalog.getMemoryStatistics();
  console.log('\nClass-based Flyweight implementation:');
  console.log(`- Total products: ${flyweightStats.totalProducts.toLocaleString()}`);
  console.log(`- Total flyweights: ${flyweightStats.totalFlyweights.toLocaleString()}`);
  console.log(
    `- Memory saved: ~${Math.round((flyweightStats.estimatedMemorySaved / 1024 / 1024) * 100) / 100} MB (${Math.round(flyweightStats.percentSaved)}%)`
  );

  // Functional flyweight stats
  const functionalStats = functionaFlyweightCatalog.getMemoryStatistics();
  console.log('\nFunctional Flyweight implementation:');
  console.log(`- Total products: ${functionalStats.totalProducts.toLocaleString()}`);
  console.log(`- Total flyweights: ${functionalStats.totalFlyweights.toLocaleString()}`);
  console.log(
    `- Memory saved: ~${Math.round((functionalStats.estimatedMemorySaved / 1024 / 1024) * 100) / 100} MB (${Math.round(functionalStats.percentSaved)}%)`
  );

  // No-flyweight stats
  const noFlyweightMemory = noFlyweightCatalog.getMemoryEstimate();
  console.log('\nNo Flyweight implementation:');
  console.log(`- Total products: ${noFlyweightCatalog.getTotalProductCount().toLocaleString()}`);
  console.log(
    `- Estimated memory usage: ~${Math.round((noFlyweightMemory / 1024 / 1024) * 100) / 100} MB`
  );

  console.log(
    `\nTime to create ${productCount.toLocaleString()} products: ${Math.round(totalTimeMs)}ms`
  );

  // Run memory-intensive operations
  console.log('\n3. Testing operations on large catalogs...');

  // Test retrieving products by category
  const categoryStartTime = process.hrtime();
  const categoryProducts = flyweightCatalog.getProductsByCategory('Electronics');
  const categoryEndTime = process.hrtime(categoryStartTime);
  const categoryTimeMs = categoryEndTime[0] * 1000 + categoryEndTime[1] / 1000000;

  console.log(
    `- Found ${categoryProducts.length.toLocaleString()} 'Electronics' products in ${Math.round(categoryTimeMs)}ms`
  );

  // Test retrieving 1000 random products
  const randomRetrievalStartTime = process.hrtime();
  const totalRetrievals = 1000;
  let successfulRetrievals = 0;

  for (let i = 0; i < totalRetrievals; i++) {
    const randomId = Math.floor(Math.random() * productCount) + 1;
    const product = flyweightCatalog.getProduct(`prod-${randomId}`);
    if (product) successfulRetrievals++;
  }

  const randomRetrievalEndTime = process.hrtime(randomRetrievalStartTime);
  const randomRetrievalTimeMs =
    randomRetrievalEndTime[0] * 1000 + randomRetrievalEndTime[1] / 1000000;

  console.log(
    `- Retrieved ${successfulRetrievals.toLocaleString()} random products in ${Math.round(randomRetrievalTimeMs)}ms`
  );
  console.log(
    `- Average retrieval time: ${Math.round((randomRetrievalTimeMs / totalRetrievals) * 1000) / 1000}ms per product`
  );

  console.log('\nBenchmark complete!');
}

// Run benchmark with different configurations
console.log('===== FLYWEIGHT PATTERN BENCHMARK =====');

// Config 1: 10,000 products with repeating attributes (optimal for flyweight)
runBenchmark({
  productCount: 10000,
  useRandomAttributes: false,
});

// Config 2: 10,000 products with random attributes (suboptimal for flyweight)
runBenchmark({
  productCount: 10000,
  useRandomAttributes: true,
});

runBenchmark({
  productCount: 100000,
  useRandomAttributes: false,
  displayInterval: 10000,
});
