/**
 * Examples of using the Interpreter Pattern implementations
 * for template rendering
 */

// Import both implementations
import { TemplateEngine } from './interpreter.implementation.js';
import { createTemplateEngine } from './interpreter.functional.js';

// Example data for rendering
const userData = {
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    isAdmin: true,
    isActive: true
  },
  products: [
    { id: 1, name: 'Laptop', price: 999, inStock: true },
    { id: 2, name: 'Phone', price: 699, inStock: true },
    { id: 3, name: 'Tablet', price: 399, inStock: false },
    { id: 4, name: 'Headphones', price: 149, inStock: true }
  ],
  company: 'Acme Inc.',
  year: 2023
};

// Example 1: Basic template with variable substitution
const basicTemplate = `
<h1>Welcome to {{ company }}</h1>
<p>Hello, {{ user.name }}!</p>
<p>Your email: {{ user.email }}</p>
<p>Copyright © {{ year }}</p>
`;

// Example 2: Template with conditionals
const conditionalTemplate = `
<div class="user-card">
  <h2>{{ user.name }}</h2>
  <p>{{ user.email }}</p>
  
  {% if user.isAdmin %}
    <span class="badge admin-badge">Administrator</span>
  {% else %}
    <span class="badge user-badge">Regular User</span>
  {% endif %}
  
  {% if user.isActive %}
    <span class="status active">Active</span>
  {% else %}
    <span class="status inactive">Inactive</span>
  {% endif %}
</div>
`;

// Example 3: Template with loops
const loopTemplate = `
<h2>Products</h2>
<ul class="product-list">
  {% for product in products %}
    <li class="product-item">
      <span class="product-name">{{ product.name }}</span>
      <span class="product-price">{{ product.price }}</span>
      
      {% if product.inStock %}
        <span class="in-stock">In Stock</span>
      {% else %}
        <span class="out-of-stock">Out of Stock</span>
      {% endif %}
    </li>
  {% endfor %}
</ul>
`;

// Example 4: Complex template with loops and conditionals
const complexTemplate = `
<div class="dashboard">
  <h1>{{ company }} Dashboard</h1>
  <p>Welcome, {{ user.name }}!</p>
  
  {% if user.isAdmin %}
    <div class="admin-panel">
      <h2>Admin Panel</h2>
      <p>You have access to all products.</p>
    </div>
  {% endif %}
  
  <div class="product-dashboard">
    <h2>Available Products</h2>
    
    {% if products %}
      <ul class="product-list">
        {% for product in products %}
          {% if product.inStock %}
            <li class="available-product">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-price">{{ product.price }}</span>
            </li>
          {% endif %}
        {% endfor %}
      </ul>
    {% else %}
      <p>No products available.</p>
    {% endif %}
  </div>
  
  <footer>
    <p>Copyright © {{ year }} {{ company }}</p>
  </footer>
</div>
`;

// Create instances of both template engines
const classBasedEngine = new TemplateEngine();
const functionalEngine = createTemplateEngine();

// Example usage of the class-based implementation
console.log('CLASS-BASED IMPLEMENTATION EXAMPLES');
console.log('=========================================\n');

console.log('Example 1: Basic Template');
console.log(classBasedEngine.render(basicTemplate, userData));
console.log('\n-----------------------------------------\n');

console.log('Example 2: Conditional Template');
console.log(classBasedEngine.render(conditionalTemplate, userData));
console.log('\n-----------------------------------------\n');

console.log('Example 3: Loop Template');
console.log(classBasedEngine.render(loopTemplate, userData));
console.log('\n-----------------------------------------\n');

console.log('Example 4: Complex Template');
console.log(classBasedEngine.render(complexTemplate, userData));
console.log('\n=========================================\n');

// Example usage of the functional implementation
console.log('FUNCTIONAL IMPLEMENTATION EXAMPLES');
console.log('=========================================\n');

console.log('Example 1: Basic Template');
console.log(functionalEngine.render(basicTemplate, userData));
console.log('\n-----------------------------------------\n');

console.log('Example 2: Conditional Template');
console.log(functionalEngine.render(conditionalTemplate, userData));
console.log('\n-----------------------------------------\n');

console.log('Example 3: Loop Template');
console.log(functionalEngine.render(loopTemplate, userData));
console.log('\n-----------------------------------------\n');

console.log('Example 4: Complex Template');
console.log(functionalEngine.render(complexTemplate, userData));
console.log('\n=========================================\n');

// Simple performance comparison
console.log('PERFORMANCE COMPARISON');
console.log('=========================================\n');

const iterations = 1000;
console.log(`Rendering all templates ${iterations} times...\n`);

console.time('Class-based implementation');
for (let i = 0; i < iterations; i++) {
  classBasedEngine.render(basicTemplate, userData);
  classBasedEngine.render(conditionalTemplate, userData);
  classBasedEngine.render(loopTemplate, userData);
  classBasedEngine.render(complexTemplate, userData);
}
console.timeEnd('Class-based implementation');

console.time('Functional implementation');
for (let i = 0; i < iterations; i++) {
  functionalEngine.render(basicTemplate, userData);
  functionalEngine.render(conditionalTemplate, userData);
  functionalEngine.render(loopTemplate, userData);
  functionalEngine.render(complexTemplate, userData);
}
console.timeEnd('Functional implementation');