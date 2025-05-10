/**
 * Example usage of the Visitor Pattern for an e-commerce order processing system
 *
 * This demonstrates how the Visitor Pattern can be used to process orders
 * with different operations such as validation, serialization, and transformation.
 */

import {
  User,
  Product,
  Order,
  OrderItem,
  EntityCollection,
  ValidationVisitor,
  SerializationVisitor,
  TransformationVisitor,
} from './visitor.implementation.js';

/**
 * Example of an order processing system using the Visitor Pattern
 */
function processOrder() {
  // Create sample entities
  console.log('Creating sample entities...');

  // Create a sample product
  const laptop = new Product({
    id: 'prod-123',
    name: 'Premium Laptop',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    categories: ['electronics', 'computers'],
    inventory: 50,
  });

  // Create another sample product
  const monitor = new Product({
    id: 'prod-456',
    name: 'UltraWide Monitor',
    description: '34" curved monitor for immersive experience',
    price: 499.95,
    categories: ['electronics', 'monitors'],
    inventory: 25,
  });

  // Create a sample user
  const user = new User({
    id: 'user-789',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
  });

  // Create a sample order with items
  const order = new Order({
    id: 'order-abc',
    userId: user.id,
    status: 'pending',
    items: [
      new OrderItem({
        productId: laptop.id,
        quantity: 1,
        price: laptop.price,
      }),
      new OrderItem({
        productId: monitor.id,
        quantity: 2,
        price: monitor.price,
      }),
    ],
  });

  // Create an entity collection to process all entities together
  const collection = new EntityCollection([laptop, monitor, user, order]);

  // Step 1: Validate all entities
  console.log('\n--- VALIDATION ---');
  const validator = new ValidationVisitor();

  // Validate each entity type
  console.log('Validating user...');
  const userValid = user.accept(validator);
  console.log(`User valid: ${userValid}`);
  if (!userValid) {
    console.log(`Validation errors: ${validator.getErrors().join(', ')}`);
  }

  console.log('Validating products...');
  const laptopValid = laptop.accept(validator);
  console.log(`Laptop valid: ${laptopValid}`);
  if (!laptopValid) {
    console.log(`Validation errors: ${validator.getErrors().join(', ')}`);
  }

  console.log('Validating order...');
  const orderValid = order.accept(validator);
  console.log(`Order valid: ${orderValid}`);
  if (!orderValid) {
    console.log(`Validation errors: ${validator.getErrors().join(', ')}`);
  }

  // Step 2: Transform entities
  console.log('\n--- TRANSFORMATION ---');

  // Normalize entities
  console.log('Normalizing entities...');
  const normalizer = new TransformationVisitor('normalize');
  const normalizedUser = user.accept(normalizer);
  const normalizedOrder = order.accept(normalizer);

  // Apply discount to products
  console.log('Applying discounts to products...');
  const discounter = new TransformationVisitor('discount', { discountPercent: 15 });
  const discountedLaptop = laptop.accept(discounter);
  console.log(`Original laptop price: $${laptop.price.toFixed(2)}`);
  console.log(`Discounted laptop price: $${discountedLaptop.price.toFixed(2)}`);

  // Calculate order totals
  console.log('Calculating order totals...');
  const calculator = new TransformationVisitor('calculateTotals', {
    taxRate: 0.08,
    shippingCost: 25,
  });
  const calculatedOrder = order.accept(calculator);
  console.log(`Subtotal: $${calculatedOrder.subtotal.toFixed(2)}`);
  console.log(`Tax: $${calculatedOrder.tax.toFixed(2)}`);
  console.log(`Shipping: $${calculatedOrder.shipping.toFixed(2)}`);
  console.log(`Total: $${calculatedOrder.total.toFixed(2)}`);

  // Step 3: Serialize entities to different formats
  console.log('\n--- SERIALIZATION ---');

  // JSON serialization
  console.log('Serializing to JSON...');
  const jsonSerializer = new SerializationVisitor('json');
  const orderJson = order.accept(jsonSerializer);
  console.log(`Order JSON: ${orderJson.substring(0, 100)}...`);

  // XML serialization
  console.log('Serializing to XML...');
  const xmlSerializer = new SerializationVisitor('xml');
  const userXml = user.accept(xmlSerializer);
  console.log(`User XML: ${userXml.substring(0, 100)}...`);

  // CSV serialization
  console.log('Serializing to CSV...');
  const csvSerializer = new SerializationVisitor('csv');
  const productCsv = laptop.accept(csvSerializer);
  console.log(`Product CSV:\n${productCsv}`);

  // Step 4: Batch processing with EntityCollection
  console.log('\n--- BATCH PROCESSING ---');
  console.log('Validating all entities...');
  const validationResults = collection.accept(validator);
  const allValid = validationResults.every((result) => result === true);
  console.log(`All entities valid: ${allValid}`);

  console.log('Serializing all entities to JSON...');
  const allJson = collection.accept(jsonSerializer);
  console.log(`Serialized ${allJson.length} entities`);
}

// Run the example
processOrder();

/**
 * Example of using the Visitor Pattern in a real-world scenario:
 * An export system that prepares product data for different channels
 */
function exportProductsForChannels() {
  console.log('\n=== REAL-WORLD EXAMPLE: MULTI-CHANNEL PRODUCT EXPORT ===');

  // Create sample products
  const products = [
    new Product({
      id: 'prod-101',
      name: '  Premium Bluetooth Headphones  ', // Note the extra spaces
      description: 'Noise-cancelling wireless headphones with premium sound',
      price: 199.99,
      categories: ['Electronics', 'Audio', 'HEADPHONES'], // Mixed case
      inventory: 120,
    }),
    new Product({
      id: 'prod-102',
      name: 'Fitness Smartwatch',
      description: 'Track your fitness goals with this advanced smartwatch',
      price: 249.5, // Price not rounded
      categories: ['electronics', 'wearables', 'fitness'],
      inventory: 85.5, // Inventory not an integer
    }),
    new Product({
      id: 'prod-103',
      name: 'Wireless Charging Pad',
      description: 'Fast wireless charging for all Qi-compatible devices',
      price: 39.99,
      categories: ['electronics', 'accessories', 'charging'],
      inventory: 200,
    }),
  ];

  // Create a collection for batch processing
  const productCollection = new EntityCollection(products);

  // CASE 1: Prepare products for Amazon marketplace
  console.log('\n--- PREPARING FOR AMAZON ---');

  // Step 1: Normalize product data
  console.log('Normalizing product data...');
  const normalizer = new TransformationVisitor('normalize');
  const normalizedProducts = productCollection.accept(normalizer);

  // Step 2: Validate products for Amazon requirements
  console.log('Validating products for Amazon...');
  const validator = new ValidationVisitor();
  const validationResults = normalizedProducts.map((product) => product.accept(validator));
  const allValid = validationResults.every((result) => result === true);
  console.log(`All products valid for Amazon: ${allValid}`);

  // Step 3: Export products in Amazon-specific XML format
  console.log('Exporting products for Amazon (XML)...');
  const amazonExporter = new SerializationVisitor('xml');
  const amazonExport = normalizedProducts.map((product) => product.accept(amazonExporter));
  console.log(`Exported ${amazonExport.length} products for Amazon`);
  console.log(`Sample export: ${amazonExport[0].substring(0, 150)}...`);

  // CASE 2: Prepare products for a marketing campaign with discounts
  console.log('\n--- PREPARING FOR MARKETING CAMPAIGN ---');

  // Step 1: Apply discounts
  console.log('Applying campaign discounts...');
  const discounter = new TransformationVisitor('discount', { discountPercent: 20 });
  const discountedProducts = productCollection.accept(discounter);

  // Step 2: Enrich products with marketing data
  console.log('Enriching products with marketing data...');
  const enricher = new TransformationVisitor('enrich', {
    tags: ['summer_sale', 'limited_time', 'best_deals'],
    averageRating: 4.5,
  });
  const enrichedProducts = discountedProducts.map((product) => product.accept(enricher));

  // Step 3: Export products for marketing team
  console.log('Exporting products for marketing (JSON)...');
  const marketingExporter = new SerializationVisitor('json');
  const marketingExport = enrichedProducts.map((product) => product.accept(marketingExporter));
  console.log(`Exported ${marketingExport.length} products for marketing`);
  console.log(`Sample export: ${marketingExport[0].substring(0, 150)}...`);

  // CASE 3: Prepare products for internal inventory report
  console.log('\n--- PREPARING INVENTORY REPORT ---');

  // Export product inventory data in CSV format
  console.log('Generating inventory report (CSV)...');
  const csvExporter = new SerializationVisitor('csv');
  const inventoryReport = productCollection.accept(csvExporter);

  console.log(`Generated inventory report for ${inventoryReport.length} products`);
  console.log(`Sample report:\n${inventoryReport[0]}`);

  // Demonstrate how to combine multiple visitors for a complex operation
  console.log('\n--- COMPLEX OPERATION WITH MULTIPLE VISITORS ---');

  // 1. Normalize products
  // 2. Apply tax based on product category
  // 3. Export as JSON

  const processedProducts = products.map((product) => {
    // Step 1: Normalize
    const normalized = product.accept(normalizer);

    // Step 2: Apply different tax rates based on category
    const taxRate = normalized.categories.includes('electronics') ? 0.08 : 0.06;
    const taxApplier = new TransformationVisitor('applyTax', { taxRate });
    const withTax = normalized.accept(taxApplier);

    // Step 3: Serialize to JSON
    return withTax.accept(marketingExporter);
  });

  console.log(`Complex processing complete for ${processedProducts.length} products`);
  console.log(`Sample result: ${processedProducts[0].substring(0, 150)}...`);
}

// Run the real-world example
exportProductsForChannels();

// Export examples for testing
export { processOrder, exportProductsForChannels };
