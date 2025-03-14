// Example usage for the class-based approach
import { ProductCatalog } from './flyweight.implementation.js';

// Create a new product catalog instance
const catalog = new ProductCatalog();

console.log('Class-based Flyweight Pattern Example:');
console.log('=====================================');

// Add products with shared attributes
console.log('Adding products to catalog...');

// Electronics category with same manufacturer
catalog.addProduct({
  id: 'e1',
  name: 'Ultra HD Smart TV',
  price: 799.99,
  description: '55-inch 4K Ultra HD Smart TV with voice control',
  sku: 'TV-55-UHD-2023',
  inStock: true,
  imageUrl: '/images/tv-ultra-hd.jpg',
  category: 'Electronics',
  manufacturer: 'TechVision',
  material: 'Electronics',
  defaultWarranty: '2 years',
  dimensions: { length: 48.5, width: 3.0, height: 28.2 },
});

catalog.addProduct({
  id: 'e2',
  name: 'Bluetooth Soundbar',
  price: 199.99,
  description: 'Wireless soundbar with Bluetooth connectivity',
  sku: 'SB-BT100-2023',
  inStock: true,
  imageUrl: '/images/soundbar.jpg',
  category: 'Electronics',
  manufacturer: 'TechVision',
  material: 'Electronics',
  defaultWarranty: '2 years',
  dimensions: { length: 36, width: 4.5, height: 3.25 },
});

catalog.addProduct({
  id: 'e3',
  name: 'Wireless Headphones',
  price: 149.99,
  description: 'Over-ear noise cancelling wireless headphones',
  sku: 'HP-NC200-2023',
  inStock: false,
  imageUrl: '/images/headphones.jpg',
  category: 'Electronics',
  manufacturer: 'TechVision',
  material: 'Electronics',
  defaultWarranty: '2 years',
  dimensions: { length: 7.5, width: 6.75, height: 3.5 },
});

// Furniture category with same manufacturer and material
catalog.addProduct({
  id: 'f1',
  name: 'Modern Coffee Table',
  price: 249.99,
  description: 'Sleek modern coffee table with storage',
  sku: 'FUR-CT100-2023',
  inStock: true,
  imageUrl: '/images/coffee-table.jpg',
  category: 'Furniture',
  manufacturer: 'HomeStyles',
  material: 'Wood',
  defaultWarranty: '5 years',
  dimensions: { length: 48, width: 24, height: 18 },
});

catalog.addProduct({
  id: 'f2',
  name: 'Bookshelf',
  price: 179.99,
  description: '5-tier bookshelf with adjustable shelves',
  sku: 'FUR-BS500-2023',
  inStock: true,
  imageUrl: '/images/bookshelf.jpg',
  category: 'Furniture',
  manufacturer: 'HomeStyles',
  material: 'Wood',
  defaultWarranty: '5 years',
  dimensions: { length: 30, width: 12, height: 72 },
});

// Decor category with unique properties
catalog.addProduct({
  id: 'd1',
  name: 'Ceramic Vase',
  price: 39.99,
  description: 'Hand-crafted decorative ceramic vase',
  sku: 'DEC-VA100-2023',
  inStock: true,
  imageUrl: '/images/vase.jpg',
  category: 'Decor',
  manufacturer: 'ArtisanCrafts',
  material: 'Ceramic',
  defaultWarranty: '30 days',
  dimensions: { length: 6, width: 6, height: 12 },
});

catalog.addProduct({
  id: 'd2',
  name: 'Glass Sculpture',
  price: 129.99,
  description: 'Handblown glass art sculpture',
  sku: 'DEC-SC200-2023',
  inStock: true,
  imageUrl: '/images/glass-sculpture.jpg',
  category: 'Decor',
  manufacturer: 'ArtisanCrafts',
  material: 'Glass',
  defaultWarranty: '30 days',
  customWarranty: '90 days',
  dimensions: { length: 8, width: 8, height: 14 },
});

// Demonstrate fetching product details
console.log('\nFetching product details:');
const product = catalog.getProduct('e1');
console.log(JSON.stringify(product, null, 2));

// Demonstrate retrieving products by category
console.log('\nFetching products by category (Electronics):');
const electronicsProducts = catalog.getProductsByCategory('Electronics');
console.log(`Found ${electronicsProducts.length} electronics products`);

// Calculate shipping for a product
console.log('\nCalculating shipping for Glass Sculpture:');
const shippingDetails = catalog.calculateShipping('d2', 2);
console.log(JSON.stringify(shippingDetails, null, 2));

// Output memory usage statistics
console.log('\nMemory usage statistics:');
const memoryStats = catalog.getMemoryStatistics();
console.log(JSON.stringify(memoryStats, null, 2));
console.log(
  `Memory saved: ~${Math.round((memoryStats.estimatedMemorySaved / 1024) * 100) / 100} KB (${Math.round(memoryStats.percentSaved)}%)`
);

// Example usage for the functional approach
import { createProductCatalog } from './flyweight.functional.js';

// Create a new product catalog instance
const catalogFunc = createProductCatalog();

console.log('\n\nFunctional Flyweight Pattern Example:');
console.log('=====================================');

// Add the same products as in the class example
console.log('Adding products to catalog...');

// Add the same products (code omitted for brevity - would be the same as above)
catalogFunc.addProduct({
  id: 'e1',
  name: 'Ultra HD Smart TV',
  price: 799.99,
  description: '55-inch 4K Ultra HD Smart TV with voice control',
  sku: 'TV-55-UHD-2023',
  inStock: true,
  imageUrl: '/images/tv-ultra-hd.jpg',
  category: 'Electronics',
  manufacturer: 'TechVision',
  material: 'Electronics',
  defaultWarranty: '2 years',
  dimensions: { length: 48.5, width: 3.0, height: 28.2 },
});

// More products would be added here, same as class example

// Demonstrate memory statistics
console.log('\nMemory usage statistics (functional approach):');
const memoryStatsFunc = catalogFunc.getMemoryStatistics();
console.log(JSON.stringify(memoryStatsFunc, null, 2));

// Example of a real-world application: E-commerce product catalog with 10,000 products
function simulateLargeProductCatalog() {
  const largeCatalog = new ProductCatalog();

  // Common product attributes that can be shared via flyweights
  const categories = ['Electronics', 'Furniture', 'Decor', 'Kitchen', 'Bathroom'];
  const manufacturers = ['TechVision', 'HomeStyles', 'ArtisanCrafts', 'KitchenPro', 'BathLuxe'];
  const materials = ['Electronics', 'Wood', 'Metal', 'Glass', 'Ceramic', 'Plastic', 'Fabric'];
  const warranties = ['30 days', '90 days', '1 year', '2 years', '5 years'];

  console.log('\n\nSimulating Large E-commerce Catalog:');
  console.log('====================================');
  console.log('Adding 10,000 products...');

  // Add 10,000 products with similar attributes
  for (let i = 1; i <= 10000; i++) {
    const categoryIndex = i % categories.length;
    const manufacturerIndex = Math.floor(i / 100) % manufacturers.length;
    const materialIndex = Math.floor(i / 50) % materials.length;
    const warrantyIndex = Math.floor(i / 200) % warranties.length;

    largeCatalog.addProduct({
      id: `prod-${i}`,
      name: `Product ${i}`,
      price: Math.round(((i % 100) + 9.99) * 100) / 100,
      description: `Description for product ${i}`,
      sku: `SKU-${categoryIndex}-${i}`,
      inStock: i % 10 !== 0, // 90% of products in stock
      imageUrl: `/images/product-${i % 50}.jpg`,
      category: categories[categoryIndex],
      manufacturer: manufacturers[manufacturerIndex],
      material: materials[materialIndex],
      defaultWarranty: warranties[warrantyIndex],
      dimensions: {
        length: Math.round((5 + (i % 50)) * 10) / 10,
        width: Math.round((3 + (i % 30)) * 10) / 10,
        height: Math.round((2 + (i % 20)) * 10) / 10,
      },
    });
  }

  // Output memory usage statistics
  const memStats = largeCatalog.getMemoryStatistics();
  console.log(
    `Created ${memStats.totalProducts} products with ${memStats.totalFlyweights} flyweights`
  );
  console.log(
    `Memory saved: ~${Math.round((memStats.estimatedMemorySaved / 1024 / 1024) * 100) / 100} MB (${Math.round(memStats.percentSaved)}%)`
  );

  return {
    totalProducts: memStats.totalProducts,
    totalFlyweights: memStats.totalFlyweights,
    memorySaved: memStats.estimatedMemorySaved,
    percentSaved: memStats.percentSaved,
  };
}

// Run the large catalog simulation
const largeStats = simulateLargeProductCatalog();

// Summary of benefits
console.log('\nSummary of Flyweight Pattern Benefits:');
console.log('=====================================');
console.log(
  `1. Memory Efficiency: Saved ${Math.round(largeStats.percentSaved)}% memory in a catalog of ${largeStats.totalProducts} products`
);
console.log(
  `2. Object Reuse: Used only ${largeStats.totalFlyweights} flyweight objects for all products`
);
console.log('3. Performance: Reduced garbage collection overhead by creating fewer objects');
console.log('4. Scalability: Can handle large product catalogs with minimal memory impact');
console.log('5. Flexibility: Supports shared and unique properties for products');
console.log(
  '6. Maintainability: Separates intrinsic and extrinsic properties for easier maintenance'
);
console.log('7. Extensibility: Easily add new product categories, manufacturers, materials, etc.');
