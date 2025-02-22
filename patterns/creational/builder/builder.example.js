import { ProductBuilder, createProductBuilder } from './builder.implementation.js';

// Example using class-based builder
const classBuilder = new ProductBuilder();

const laptop = classBuilder
  .setName('MacBook Pro')
  .setPrice(1299.99)
  .setDescription('Powerful laptop for professionals')
  .setCategory('Electronics')
  .addFeature('M2 Chip')
  .addFeature('16GB RAM')
  .addFeature('512GB SSD')
  .setMetadata('manufacturer', 'Apple')
  .setMetadata('warranty', '1 year')
  .build();

console.log('Class-based builder result:', laptop);

// Example using functional builder
const functionalBuilder = createProductBuilder();

const smartphone = functionalBuilder
  .setName('iPhone 15 Pro')
  .setPrice(999.99)
  .setDescription('Latest flagship smartphone')
  .setCategory('Mobile Phones')
  .addFeature('A17 Pro chip')
  .addFeature('48MP camera')
  .addFeature('Face ID')
  .setMetadata('manufacturer', 'Apple')
  .setMetadata('color', 'Natural Titanium')
  .build();

console.log('Functional builder result:', smartphone);

// Example of reusing the same builder
const basicLaptop = classBuilder
  .setName('MacBook Air')
  .setPrice(999.99)
  .setCategory('Electronics')
  .build();

console.log('Reused builder result:', basicLaptop);

// Example of validation error
try {
  classBuilder
    .setName('Invalid Product')
    .setPrice(-100) // This will throw an error
    .build();
} catch (error) {
  console.error('Validation error:', error.message);
}

// Example with async operations
async function createProductWithAsync() {
  // Simulate async operations
  const fetchPrice = async () => 1499.99;
  const fetchFeatures = async () => ['5G', 'Wi-Fi 6E', 'Bluetooth 5.3'];

  const price = await fetchPrice();
  const features = await fetchFeatures();

  return functionalBuilder
    .setName('Galaxy S24 Ultra')
    .setPrice(price)
    .setCategory('Mobile Phones')
    .setDescription('Ultimate flagship experience')
    .addFeature(...features)
    .build();
}

// Usage of async example
createProductWithAsync()
  .then((product) => console.log('Async builder result:', product))
  .catch((error) => console.error('Async error:', error));
